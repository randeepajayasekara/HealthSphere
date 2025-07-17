/**
 * Contact Data Seeding Component
 * Development/Admin tool for seeding contact and FAQ data
 */

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import seedContactData from '@/app/utils/seed-contact-data';
import { motion } from 'framer-motion';

type SeedingStatus = 'idle' | 'seeding' | 'success' | 'error';

export function ContactSeedingButton() {
  const [seedingStatus, setSeedingStatus] = useState<SeedingStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSeedContactData = async () => {
    setSeedingStatus('seeding');
    setErrorMessage('');

    try {
      await seedContactData();
      setSeedingStatus('success');
    } catch (error) {
      console.error('Contact seeding error:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setSeedingStatus('error');
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Contact & FAQ Data Seeding
        </CardTitle>
        <CardDescription>
          Initialize the database with FAQ categories, items, and sample contact data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {seedingStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-300">
                Contact data seeded successfully! FAQ categories and items are now available.
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        {seedingStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-300">
                Seeding failed: {errorMessage}
              </AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="bg-muted p-4 rounded-lg">
          <h4 className="font-medium mb-2">What will be created:</h4>
          <ul className="text-sm space-y-1 text-muted-foreground">
            <li>• 10 FAQ categories (Getting Started, Account & Profile, etc.)</li>
            <li>• 20+ FAQ items with questions and answers</li>
            <li>• Healthcare-focused support categories</li>
            <li>• Sample data optimized for healthcare industry</li>
          </ul>
        </div>

        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
          <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">ℹ️ Information</h4>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            This will create FAQ data in your Firestore database. The operation is safe to run 
            multiple times and will not duplicate existing data.
          </p>
        </div>

        <Button
          onClick={handleSeedContactData}
          disabled={seedingStatus === 'seeding'}
          className="w-full"
          size="lg"
        >
          {seedingStatus === 'seeding' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Seeding Contact Data...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Seed Contact & FAQ Data
            </>
          )}
        </Button>

        {seedingStatus === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              You can now visit the contact page to see the FAQ categories and items in action.
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

export default ContactSeedingButton;
