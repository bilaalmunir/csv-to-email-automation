'use client';

import { useState, useCallback } from 'react';
import { Upload, Mail, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Papa from 'papaparse';

interface EmailData {
  emails: string[];
  fileName: string;
  totalRows: number;
}

export default function Home() {
  const [csvData, setCsvData] = useState<EmailData | null>(null);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const extractEmailsFromCSV = useCallback((csvText: string) => {
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emails = new Set<string>();
    
    Papa.parse(csvText, {
      complete: (results) => {
        results.data.forEach((row: any) => {
          if (Array.isArray(row)) {
            row.forEach((cell: any) => {
              if (typeof cell === 'string') {
                const matches = cell.match(emailRegex);
                if (matches) {
                  matches.forEach(email => emails.add(email.toLowerCase()));
                }
              }
            });
          }
        });
      },
      skipEmptyLines: true,
    });
    
    return Array.from(emails);
  }, []);

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setSuccess(null);

    try {
      const text = await file.text();
      const emails = extractEmailsFromCSV(text);
      
      if (emails.length === 0) {
        setError('No email addresses found in the CSV file');
        setCsvData(null);
      } else {
        setCsvData({
          emails,
          fileName: file.name,
          totalRows: text.split('\n').length - 1,
        });
        setSuccess(`Successfully extracted ${emails.length} unique email addresses`);
      }
    } catch (err) {
      setError('Error parsing CSV file. Please check the format.');
    } finally {
      setIsUploading(false);
    }
  }, [extractEmailsFromCSV]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  }, [handleFileUpload]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  }, [handleFileUpload]);

  const handleSendEmails = async () => {
    if (!csvData || !subject.trim() || !body.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emails: csvData.emails,
          subject: subject.trim(),
          body: body.trim(),
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Successfully sent emails to ${csvData.emails.length} recipients`);
        setSubject('');
        setBody('');
      } else {
        setError(result.error || 'Failed to send emails');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">CSV Email Sender</h1>
          <p className="text-gray-600">Upload a CSV file and send personalized emails to all extracted addresses</p>
        </div>

        {/* CSV Upload Section */}
        <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload CSV File
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="mb-2 text-gray-600">
                Drag and drop your CSV file here, or click to select
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload">
                <Button variant="outline" className="cursor-pointer" disabled={isUploading}>
                  {isUploading ? 'Processing...' : 'Choose File'}
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Alerts */}
        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">{success}</AlertDescription>
          </Alert>
        )}

        {/* Email Preview Section */}
        {csvData && (
          <Card className="mb-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Extracted Emails
              </CardTitle>
              <div className="flex gap-2 text-sm text-gray-600">
                <Badge variant="secondary">{csvData.fileName}</Badge>
                <Badge variant="outline">{csvData.emails.length} emails</Badge>
                <Badge variant="outline">{csvData.totalRows} rows</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {csvData.emails.map((email, index) => (
                    <div key={index} className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                      {email}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Email Form Section */}
        {csvData && (
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="w-5 h-5" />
                Compose Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Enter email subject"
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="body">Message Body *</Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Enter your email message here..."
                  rows={8}
                  className="transition-all duration-200 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Separator />

              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="text-sm text-gray-600">
                  Ready to send to <span className="font-semibold">{csvData.emails.length}</span> recipients
                </div>
                <Button
                  onClick={handleSendEmails}
                  disabled={isSending || !subject.trim() || !body.trim()}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 transition-all duration-200"
                >
                  {isSending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Send Emails
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}