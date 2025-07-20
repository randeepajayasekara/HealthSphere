/**
 * HealthSphere - UMID Access Scanner Component
 * Component for scanning and accessing Universal Medical ID
 */

"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    Scan, 
    QrCode, 
    Shield, 
    AlertTriangle, 
    Clock, 
    User, 
    Heart, 
    Pill,
    Phone,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import { UMIDService } from '@/lib/firestore/umid-services';
import { 
    UMIDAuthenticationRequest, 
    UMIDAuthenticationResponse, 
    LinkedMedicalData,
    DeviceInfo 
} from '@/app/types';

interface UMIDAccessScannerProps {
    staffId: string;
    staffRole: string;
    onAccessSuccess?: (medicalData: LinkedMedicalData) => void;
    onAccessFailed?: (error: string) => void;
}

export default function UMIDAccessScanner({
    staffId,
    staffRole,
    onAccessSuccess,
    onAccessFailed
}: UMIDAccessScannerProps) {
    const [umidNumber, setUmidNumber] = useState('');
    const [totpCode, setTotpCode] = useState('');
    const [purpose, setPurpose] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [accessResult, setAccessResult] = useState<UMIDAuthenticationResponse | null>(null);
    const [emergencyMode, setEmergencyMode] = useState(false);
    const [scanMode, setScanMode] = useState<'manual' | 'qr' | 'emergency'>('manual');

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getDeviceInfo = (): DeviceInfo => {
        return {
            deviceId: 'web-' + Math.random().toString(36).substr(2, 9),
            deviceType: 'desktop',
            browserInfo: navigator.userAgent,
            osInfo: navigator.platform,
            appVersion: '1.0.0'
        };
    };

    const handleAccessRequest = async (emergencyOverride: boolean = false) => {
        if (!umidNumber || (!totpCode && !emergencyOverride) || !purpose) {
            setAccessResult({
                success: false,
                accessLevel: 'basic',
                expiresAt: new Date(),
                errorMessage: 'Please fill in all required fields'
            });
            return;
        }

        setIsLoading(true);
        
        try {
            const request: UMIDAuthenticationRequest = {
                umidNumber: umidNumber.toUpperCase(),
                totpCode,
                staffId,
                deviceInfo: getDeviceInfo(),
                accessPurpose: purpose,
                emergencyOverride
            };

            const response = await UMIDService.authenticateUMID(request);
            setAccessResult(response);

            if (response.success && response.medicalData) {
                onAccessSuccess?.(response.medicalData);
            } else {
                onAccessFailed?.(response.errorMessage || 'Access denied');
            }
        } catch (error) {
            const errorMessage = 'Failed to authenticate UMID';
            setAccessResult({
                success: false,
                accessLevel: 'basic',
                expiresAt: new Date(),
                errorMessage
            });
            onAccessFailed?.(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const startQRScanner = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    };

    const stopQRScanner = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };

    useEffect(() => {
        if (scanMode === 'qr') {
            startQRScanner();
        } else {
            stopQRScanner();
        }

        return () => stopQRScanner();
    }, [scanMode]);

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <Card className="border-emerald-200 dark:border-emerald-800">
                <CardHeader className="bg-gradient-to-r from-emerald-50 to-cyan-50 dark:from-emerald-900/20 dark:to-cyan-900/20">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-800 rounded-lg">
                            <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <CardTitle className="text-emerald-800 dark:text-emerald-200">
                                Universal Medical ID Access
                            </CardTitle>
                            <CardDescription className="text-emerald-600 dark:text-emerald-400">
                                Secure access to patient medical information
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Access Methods */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <Scan className="w-5 h-5" />
                        <span>Access Method</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Tabs value={scanMode} onValueChange={(value) => setScanMode(value as any)}>
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="manual" className="flex items-center space-x-2">
                                <User className="w-4 h-4" />
                                <span>Manual Entry</span>
                            </TabsTrigger>
                            <TabsTrigger value="qr" className="flex items-center space-x-2">
                                <QrCode className="w-4 h-4" />
                                <span>QR Scanner</span>
                            </TabsTrigger>
                            <TabsTrigger value="emergency" className="flex items-center space-x-2">
                                <AlertTriangle className="w-4 h-4" />
                                <span>Emergency</span>
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="manual" className="space-y-4 mt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="umid-number">UMID Number</Label>
                                    <Input
                                        id="umid-number"
                                        placeholder="HS..."
                                        value={umidNumber}
                                        onChange={(e) => setUmidNumber(e.target.value.toUpperCase())}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="totp-code">Authentication Code</Label>
                                    <Input
                                        id="totp-code"
                                        placeholder="6-digit code"
                                        value={totpCode}
                                        onChange={(e) => setTotpCode(e.target.value)}
                                        maxLength={6}
                                        className="font-mono text-center text-lg"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2">
                                <Label htmlFor="purpose">Access Purpose</Label>
                                <Input
                                    id="purpose"
                                    placeholder="Reason for accessing medical data..."
                                    value={purpose}
                                    onChange={(e) => setPurpose(e.target.value)}
                                />
                            </div>

                            <Button 
                                onClick={() => handleAccessRequest(false)}
                                disabled={isLoading || !umidNumber || !totpCode || !purpose}
                                className="w-full"
                            >
                                {isLoading ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center space-x-2">
                                        <Shield className="w-4 h-4" />
                                        <span>Access Medical Data</span>
                                    </div>
                                )}
                            </Button>
                        </TabsContent>

                        <TabsContent value="qr" className="space-y-4 mt-6">
                            <div className="text-center space-y-4">
                                <div className="relative bg-black rounded-lg overflow-hidden mx-auto w-full max-w-md aspect-square">
                                    <video
                                        ref={videoRef}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        playsInline
                                        muted
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                    <div className="absolute inset-0 border-2 border-white border-dashed opacity-50" />
                                    <div className="absolute inset-4 border-2 border-emerald-400" />
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Position the QR code within the frame
                                </p>
                            </div>
                        </TabsContent>

                        <TabsContent value="emergency" className="space-y-4 mt-6">
                            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10">
                                <AlertTriangle className="w-4 h-4 text-red-600" />
                                <AlertDescription className="text-red-800 dark:text-red-200">
                                    Emergency access bypasses normal authentication. Use only in critical situations.
                                    All emergency access attempts are logged and reviewed.
                                </AlertDescription>
                            </Alert>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-umid">UMID Number</Label>
                                    <Input
                                        id="emergency-umid"
                                        placeholder="HS..."
                                        value={umidNumber}
                                        onChange={(e) => setUmidNumber(e.target.value.toUpperCase())}
                                        className="font-mono"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-purpose">Emergency Justification</Label>
                                    <Input
                                        id="emergency-purpose"
                                        placeholder="Critical medical emergency requiring immediate access..."
                                        value={purpose}
                                        onChange={(e) => setPurpose(e.target.value)}
                                    />
                                </div>

                                <Button 
                                    onClick={() => handleAccessRequest(true)}
                                    disabled={isLoading || !umidNumber || !purpose}
                                    variant="destructive"
                                    className="w-full"
                                >
                                    {isLoading ? (
                                        <div className="flex items-center space-x-2">
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                            <span>Processing Emergency Access...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <AlertTriangle className="w-4 h-4" />
                                            <span>Emergency Access</span>
                                        </div>
                                    )}
                                </Button>
                            </div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Access Result */}
            {accessResult && (
                <Card className={`border-2 ${
                    accessResult.success 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10' 
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/10'
                }`}>
                    <CardHeader>
                        <CardTitle className={`flex items-center space-x-2 ${
                            accessResult.success ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'
                        }`}>
                            {accessResult.success ? (
                                <CheckCircle className="w-5 h-5" />
                            ) : (
                                <XCircle className="w-5 h-5" />
                            )}
                            <span>
                                {accessResult.success ? 'Access Granted' : 'Access Denied'}
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {accessResult.success && accessResult.medicalData ? (
                            <MedicalDataDisplay medicalData={accessResult.medicalData} />
                        ) : (
                            <p className="text-red-700 dark:text-red-300">
                                {accessResult.errorMessage}
                            </p>
                        )}
                        
                        {accessResult.success && (
                            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                <Badge variant="outline">
                                    Access Level: {accessResult.accessLevel}
                                </Badge>
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Expires: {accessResult.expiresAt ? accessResult.expiresAt.toLocaleTimeString() : 'N/A'}</span>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

// Medical Data Display Component
function MedicalDataDisplay({ medicalData }: { medicalData: LinkedMedicalData }) {
    return (
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className="border-blue-200 dark:border-blue-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <User className="w-5 h-5 text-blue-600" />
                            <span>Patient Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="font-semibold text-lg">{medicalData.basicInfo.name}</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                DOB: {medicalData.basicInfo.dateOfBirth ? medicalData.basicInfo.dateOfBirth.toLocaleDateString() : 'N/A'}
                            </p>
                            {medicalData.basicInfo.bloodType && (
                                <p className="text-gray-600 dark:text-gray-400">
                                    Blood Type: <span className="font-medium text-red-600">{medicalData.basicInfo.bloodType}</span>
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-purple-200 dark:border-purple-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <Phone className="w-5 h-5 text-purple-600" />
                            <span>Emergency Contact</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <div>
                            <p className="font-semibold">{medicalData.basicInfo.emergencyContact.name}</p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {medicalData.basicInfo.emergencyContact.relationship}
                            </p>
                            <p className="text-gray-600 dark:text-gray-400">
                                {medicalData.basicInfo.emergencyContact.phone}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Critical Allergies */}
            {medicalData.criticalAllergies.length > 0 && (
                <Card className="border-red-200 dark:border-red-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <AlertCircle className="w-5 h-5 text-red-600" />
                            <span>Critical Allergies</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {medicalData.criticalAllergies.map((allergy, index) => (
                                <Badge key={index} variant="destructive">
                                    {allergy}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Current Medications */}
            {medicalData.currentMedications.length > 0 && (
                <Card className="border-green-200 dark:border-green-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <Pill className="w-5 h-5 text-green-600" />
                            <span>Current Medications</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {medicalData.currentMedications.map((medication, index) => (
                                <div key={index} className="p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                    <p className="font-medium">{medication}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Chronic Conditions */}
            {medicalData.chronicConditions.length > 0 && (
                <Card className="border-orange-200 dark:border-orange-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <Heart className="w-5 h-5 text-orange-600" />
                            <span>Chronic Conditions</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-2">
                            {medicalData.chronicConditions.map((condition, index) => (
                                <div key={index} className="p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
                                    <p className="font-medium">{condition}</p>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Medical Alerts */}
            {medicalData.medicalAlerts && medicalData.medicalAlerts.length > 0 && (
                <Card className="border-yellow-200 dark:border-yellow-800">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center space-x-2">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <span>Medical Alerts</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {medicalData.medicalAlerts.map((alert, index) => (
                            <div key={index} className={`p-3 rounded-lg border-l-4 ${
                                alert.severity === 'critical' ? 'bg-red-50 border-red-500 dark:bg-red-900/20' :
                                alert.severity === 'high' ? 'bg-orange-50 border-orange-500 dark:bg-orange-900/20' :
                                alert.severity === 'medium' ? 'bg-yellow-50 border-yellow-500 dark:bg-yellow-900/20' :
                                'bg-blue-50 border-blue-500 dark:bg-blue-900/20'
                            }`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="font-semibold">{alert.description}</p>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            Type: {alert.type} | Severity: {alert.severity}
                                        </p>
                                    </div>
                                    <Badge variant={
                                        alert.severity === 'critical' ? 'destructive' :
                                        alert.severity === 'high' ? 'secondary' : 'outline'
                                    }>
                                        {alert.severity}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
