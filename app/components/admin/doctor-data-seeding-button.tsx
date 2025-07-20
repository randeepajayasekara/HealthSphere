"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Database, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import { seedDoctorData, clearDoctorData } from '@/app/utils/seed-doctor-data';

export default function DoctorDataSeedingButton() {
    const { user } = useAuth();
    const [isSeeding, setIsSeeding] = useState(false);
    const [isClearing, setIsClearing] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState<string>('');

    const handleSeedData = async () => {
        if (!user?.id || user.role !== 'doctor') {
            setStatus('error');
            setMessage('Only doctors can seed medical data');
            return;
        }

        setIsSeeding(true);
        setStatus('idle');
        setMessage('');

        try {
            await seedDoctorData(user.id);
            setStatus('success');
            setMessage('Successfully seeded medical records and telemedicine sessions!');
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Failed to seed data');
        } finally {
            setIsSeeding(false);
        }
    };

    const handleClearData = async () => {
        if (!user?.id || user.role !== 'doctor') {
            setStatus('error');
            setMessage('Only doctors can clear medical data');
            return;
        }

        if (!confirm('Are you sure you want to clear all your medical data? This action cannot be undone.')) {
            return;
        }

        setIsClearing(true);
        setStatus('idle');
        setMessage('');

        try {
            await clearDoctorData(user.id);
            setStatus('success');
            setMessage('Successfully cleared all medical data!');
        } catch (error) {
            setStatus('error');
            setMessage(error instanceof Error ? error.message : 'Failed to clear data');
        } finally {
            setIsClearing(false);
        }
    };

    if (user?.role !== 'doctor') {
        return null;
    }

    return (
        <Card className="w-full max-w-2xl">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Doctor Data Seeding
                </CardTitle>
                <CardDescription>
                    Seed sample medical records and telemedicine sessions for testing purposes
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                    <Badge variant="outline">
                        Doctor: {user.firstName} {user.lastName}
                    </Badge>
                    <Badge variant="outline">
                        ID: {user.id}
                    </Badge>
                </div>

                {status !== 'idle' && (
                    <Alert variant={status === 'error' ? 'destructive' : 'default'}>
                        {status === 'success' ? (
                            <CheckCircle className="h-4 w-4" />
                        ) : (
                            <AlertCircle className="h-4 w-4" />
                        )}
                        <AlertDescription>{message}</AlertDescription>
                    </Alert>
                )}

                <div className="flex gap-2">
                    <Button
                        onClick={handleSeedData}
                        disabled={isSeeding || isClearing}
                        className="bg-red-600 hover:bg-red-700"
                    >
                        {isSeeding ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Seeding Data...
                            </>
                        ) : (
                            <>
                                <Database className="h-4 w-4 mr-2" />
                                Seed Sample Data
                            </>
                        )}
                    </Button>

                    <Button
                        onClick={handleClearData}
                        disabled={isSeeding || isClearing}
                        variant="destructive"
                    >
                        {isClearing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Clearing Data...
                            </>
                        ) : (
                            <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                Clear Data
                            </>
                        )}
                    </Button>
                </div>

                <div className="text-sm text-zinc-600 dark:text-zinc-400">
                    <p><strong>Sample data includes:</strong></p>
                    <ul className="list-disc ml-4 mt-2 space-y-1">
                        <li>6 medical records (consultations, lab results, procedures, etc.)</li>
                        <li>4 telemedicine sessions (completed and scheduled)</li>
                        <li>Various record types and statuses for comprehensive testing</li>
                    </ul>
                </div>
            </CardContent>
        </Card>
    );
}
