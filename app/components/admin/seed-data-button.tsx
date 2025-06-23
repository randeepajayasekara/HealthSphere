"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { runSeeding } from '@/app/utils/seed-data';
import { motion } from 'framer-motion';

export function SeedDataButton() {
    const [isSeeding, setIsSeeding] = useState(false);
    const [seedingStatus, setSeedingStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const handleSeedData = async () => {
        setIsSeeding(true);
        setSeedingStatus('idle');
        setErrorMessage('');

        try {
            await runSeeding();
            setSeedingStatus('success');
        } catch (error: any) {
            setSeedingStatus('error');
            setErrorMessage(error.message || 'An error occurred during seeding');
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="w-5 h-5" />
                    Database Seeding
                </CardTitle>
                <CardDescription>
                    Populate the database with sample users, departments, and appointments for testing purposes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {seedingStatus === 'success' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Alert className="border-green-200 bg-green-50">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <AlertDescription className="text-green-800">
                                Database seeded successfully! Check the console for login credentials.
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {seedingStatus === 'error' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Alert className="border-red-200 bg-red-50">
                            <AlertTriangle className="h-4 w-4 text-red-600" />
                            <AlertDescription className="text-red-800">
                                Seeding failed: {errorMessage}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                <div className="bg-muted p-4 rounded-lg">
                    <h4 className="font-medium mb-2">What will be created:</h4>
                    <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Sample users for all roles (doctors, nurses, admin, etc.)</li>
                        <li>• Department data with contact information</li>
                        <li>• Sample appointments and medical records</li>
                        <li>• Authentication accounts with secure passwords</li>
                    </ul>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Warning</h4>
                    <p className="text-sm text-yellow-700">
                        This will create multiple user accounts in Firebase Auth and Firestore. 
                        Only run this in development or testing environments.
                    </p>
                </div>

                <Button 
                    onClick={handleSeedData}
                    disabled={isSeeding}
                    className="w-full"
                >
                    {isSeeding ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Seeding Database...
                        </>
                    ) : (
                        <>
                            <Database className="mr-2 h-4 w-4" />
                            Seed Database
                        </>
                    )}
                </Button>
            </CardContent>
        </Card>
    );
}