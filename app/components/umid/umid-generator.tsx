/**
 * HealthSphere - UMID Generator Component
 * Component for generating new Universal Medical IDs
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
    QrCode, 
    User, 
    Shield, 
    Heart, 
    Pill, 
    Phone, 
    Calendar,
    Download,
    Copy,
    Check,
    AlertTriangle,
    Settings,
    Lock,
    Fingerprint
} from 'lucide-react';
import { UMIDService } from '@/lib/firestore/umid-services';
import { 
    UniversalMedicalID,
    LinkedMedicalData,
    UMIDSecuritySettings,
    EmergencyContact,
    BloodType
} from '@/app/types';

interface UMIDGeneratorProps {
    onGenerated?: (umid: UniversalMedicalID) => void;
    initialPatientId?: string;
}

interface PatientFormData {
    patientId: string;
    name: string;
    dateOfBirth: string;
    bloodType: BloodType | '';
    criticalAllergies: string[];
    chronicConditions: string[];
    currentMedications: string[];
    emergencyMedicalInfo: string[];
    emergencyContact: EmergencyContact;
    dnrStatus: boolean;
    organDonorStatus: boolean;
}

export default function UMIDGenerator({ onGenerated, initialPatientId }: UMIDGeneratorProps) {
    const [currentStep, setCurrentStep] = useState(1);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUMID, setGeneratedUMID] = useState<UniversalMedicalID | null>(null);
    const [copied, setCopied] = useState(false);

    const [patientData, setPatientData] = useState<PatientFormData>({
        patientId: initialPatientId || '',
        name: '',
        dateOfBirth: '',
        bloodType: '',
        criticalAllergies: [],
        chronicConditions: [],
        currentMedications: [],
        emergencyMedicalInfo: [],
        emergencyContact: {
            name: '',
            relationship: '',
            phone: '',
            email: ''
        },
        dnrStatus: false,
        organDonorStatus: false
    });

    const [securitySettings, setSecuritySettings] = useState<UMIDSecuritySettings>({
        maxFailedAttempts: 3,
        lockoutDuration: 30,
        requireBiometric: false,
        allowOfflineAccess: false,
        encryptionLevel: 'high',
        accessControlLevel: 'enhanced'
    });

    const [newAllergy, setNewAllergy] = useState('');
    const [newCondition, setNewCondition] = useState('');
    const [newMedication, setNewMedication] = useState('');
    const [newEmergencyInfo, setNewEmergencyInfo] = useState('');

    const bloodTypes: BloodType[] = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

    const addToList = (list: string[], item: string, setter: (value: string[]) => void) => {
        if (item.trim() && !list.includes(item.trim())) {
            setter([...list, item.trim()]);
        }
    };

    const removeFromList = (list: string[], index: number, setter: (value: string[]) => void) => {
        setter(list.filter((_, i) => i !== index));
    };

    const handleGenerate = async () => {
        if (!patientData.patientId || !patientData.name || !patientData.dateOfBirth) {
            alert('Please fill in all required fields');
            return;
        }

        setIsGenerating(true);

        try {
            const linkedMedicalData: LinkedMedicalData = {
                basicInfo: {
                    name: patientData.name,
                    dateOfBirth: new Date(patientData.dateOfBirth),
                    bloodType: patientData.bloodType as BloodType,
                    emergencyContact: patientData.emergencyContact
                },
                criticalAllergies: patientData.criticalAllergies,
                chronicConditions: patientData.chronicConditions,
                currentMedications: patientData.currentMedications,
                emergencyMedicalInfo: patientData.emergencyMedicalInfo,
                dnrStatus: patientData.dnrStatus,
                organDonorStatus: patientData.organDonorStatus,
                medicalAlerts: []
            };

            const umid = await UMIDService.generateUMID(
                patientData.patientId,
                linkedMedicalData,
                securitySettings
            );

            setGeneratedUMID(umid);
            setCurrentStep(4);
            onGenerated?.(umid);
        } catch (error) {
            console.error('Error generating UMID:', error);
            alert('Failed to generate UMID. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Failed to copy to clipboard:', error);
        }
    };

    const downloadQRCode = () => {
        if (!generatedUMID) return;
        
        // Create QR code data URL (simplified - use proper QR library in production)
        const qrData = generatedUMID.qrCodeData;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
            canvas.width = 300;
            canvas.height = 300;
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, 300, 300);
            ctx.fillStyle = '#000000';
            ctx.font = '12px monospace';
            ctx.fillText('QR Code Placeholder', 50, 150);
            ctx.fillText(generatedUMID.umidNumber, 50, 170);
            
            // Download
            const link = document.createElement('a');
            link.download = `UMID_${generatedUMID.umidNumber}.png`;
            link.href = canvas.toDataURL();
            link.click();
        }
    };

    const steps = [
        { number: 1, title: 'Patient Information', description: 'Basic patient details' },
        { number: 2, title: 'Medical Data', description: 'Medical history and conditions' },
        { number: 3, title: 'Security Settings', description: 'Configure access controls' },
        { number: 4, title: 'Generated UMID', description: 'Review and download' }
    ];

    return (
        <div className="w-full max-w-4xl mx-auto space-y-6">
            {/* Progress Steps */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                        <QrCode className="w-5 h-5" />
                        <span>Generate Universal Medical ID</span>
                    </CardTitle>
                    <CardDescription>
                        Create a secure UMID for patient medical data access
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between mb-6">
                        {steps.map((step, index) => (
                            <div key={step.number} className="flex items-center">
                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
                                    currentStep >= step.number 
                                        ? 'bg-emerald-500 border-emerald-500 text-white' 
                                        : 'border-gray-300 text-gray-500'
                                }`}>
                                    {currentStep > step.number ? (
                                        <Check className="w-4 h-4" />
                                    ) : (
                                        <span className="text-sm font-semibold">{step.number}</span>
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={`w-16 h-0.5 mx-2 ${
                                        currentStep > step.number ? 'bg-emerald-500' : 'bg-gray-300'
                                    }`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="text-center">
                        <h3 className="font-semibold text-lg">{steps[currentStep - 1].title}</h3>
                        <p className="text-gray-600 dark:text-gray-400">{steps[currentStep - 1].description}</p>
                    </div>
                </CardContent>
            </Card>

            {/* Step Content */}
            {currentStep === 1 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <User className="w-5 h-5" />
                            <span>Patient Information</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="patient-id">Patient ID *</Label>
                                <Input
                                    id="patient-id"
                                    value={patientData.patientId}
                                    onChange={(e) => setPatientData(prev => ({ ...prev, patientId: e.target.value }))}
                                    placeholder="Enter patient ID"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="patient-name">Full Name *</Label>
                                <Input
                                    id="patient-name"
                                    value={patientData.name}
                                    onChange={(e) => setPatientData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="Enter full name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="date-of-birth">Date of Birth *</Label>
                                <Input
                                    id="date-of-birth"
                                    type="date"
                                    value={patientData.dateOfBirth}
                                    onChange={(e) => setPatientData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="blood-type">Blood Type</Label>
                                <Select 
                                    value={patientData.bloodType} 
                                    onValueChange={(value) => setPatientData(prev => ({ ...prev, bloodType: value as BloodType }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select blood type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {bloodTypes.map(type => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-semibold flex items-center space-x-2">
                                <Phone className="w-4 h-4" />
                                <span>Emergency Contact</span>
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-name">Name</Label>
                                    <Input
                                        id="emergency-name"
                                        value={patientData.emergencyContact.name}
                                        onChange={(e) => setPatientData(prev => ({
                                            ...prev,
                                            emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                                        }))}
                                        placeholder="Contact name"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-relationship">Relationship</Label>
                                    <Input
                                        id="emergency-relationship"
                                        value={patientData.emergencyContact.relationship}
                                        onChange={(e) => setPatientData(prev => ({
                                            ...prev,
                                            emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                                        }))}
                                        placeholder="Relationship"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-phone">Phone</Label>
                                    <Input
                                        id="emergency-phone"
                                        value={patientData.emergencyContact.phone}
                                        onChange={(e) => setPatientData(prev => ({
                                            ...prev,
                                            emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                                        }))}
                                        placeholder="Phone number"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="emergency-email">Email (Optional)</Label>
                                    <Input
                                        id="emergency-email"
                                        type="email"
                                        value={patientData.emergencyContact.email || ''}
                                        onChange={(e) => setPatientData(prev => ({
                                            ...prev,
                                            emergencyContact: { ...prev.emergencyContact, email: e.target.value }
                                        }))}
                                        placeholder="Email address"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end">
                            <Button 
                                onClick={() => setCurrentStep(2)}
                                disabled={!patientData.patientId || !patientData.name || !patientData.dateOfBirth}
                            >
                                Next: Medical Data
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 2 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Heart className="w-5 h-5" />
                            <span>Medical Data</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Critical Allergies */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-red-600">Critical Allergies</Label>
                            <div className="flex space-x-2">
                                <Input
                                    value={newAllergy}
                                    onChange={(e) => setNewAllergy(e.target.value)}
                                    placeholder="Enter allergy"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            addToList(patientData.criticalAllergies, newAllergy, (list) => 
                                                setPatientData(prev => ({ ...prev, criticalAllergies: list }))
                                            );
                                            setNewAllergy('');
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        addToList(patientData.criticalAllergies, newAllergy, (list) => 
                                            setPatientData(prev => ({ ...prev, criticalAllergies: list }))
                                        );
                                        setNewAllergy('');
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {patientData.criticalAllergies.map((allergy, index) => (
                                    <Badge key={index} variant="destructive" className="cursor-pointer"
                                           onClick={() => removeFromList(patientData.criticalAllergies, index, (list) =>
                                               setPatientData(prev => ({ ...prev, criticalAllergies: list }))
                                           )}>
                                        {allergy} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Chronic Conditions */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-orange-600">Chronic Conditions</Label>
                            <div className="flex space-x-2">
                                <Input
                                    value={newCondition}
                                    onChange={(e) => setNewCondition(e.target.value)}
                                    placeholder="Enter condition"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            addToList(patientData.chronicConditions, newCondition, (list) => 
                                                setPatientData(prev => ({ ...prev, chronicConditions: list }))
                                            );
                                            setNewCondition('');
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        addToList(patientData.chronicConditions, newCondition, (list) => 
                                            setPatientData(prev => ({ ...prev, chronicConditions: list }))
                                        );
                                        setNewCondition('');
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {patientData.chronicConditions.map((condition, index) => (
                                    <Badge key={index} variant="secondary" className="cursor-pointer"
                                           onClick={() => removeFromList(patientData.chronicConditions, index, (list) =>
                                               setPatientData(prev => ({ ...prev, chronicConditions: list }))
                                           )}>
                                        {condition} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Current Medications */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-green-600">Current Medications</Label>
                            <div className="flex space-x-2">
                                <Input
                                    value={newMedication}
                                    onChange={(e) => setNewMedication(e.target.value)}
                                    placeholder="Enter medication"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            addToList(patientData.currentMedications, newMedication, (list) => 
                                                setPatientData(prev => ({ ...prev, currentMedications: list }))
                                            );
                                            setNewMedication('');
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        addToList(patientData.currentMedications, newMedication, (list) => 
                                            setPatientData(prev => ({ ...prev, currentMedications: list }))
                                        );
                                        setNewMedication('');
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {patientData.currentMedications.map((medication, index) => (
                                    <Badge key={index} variant="outline" className="cursor-pointer"
                                           onClick={() => removeFromList(patientData.currentMedications, index, (list) =>
                                               setPatientData(prev => ({ ...prev, currentMedications: list }))
                                           )}>
                                        {medication} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Emergency Medical Info */}
                        <div className="space-y-3">
                            <Label className="text-base font-semibold text-blue-600">Emergency Medical Information</Label>
                            <div className="flex space-x-2">
                                <Input
                                    value={newEmergencyInfo}
                                    onChange={(e) => setNewEmergencyInfo(e.target.value)}
                                    placeholder="Enter emergency info"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            addToList(patientData.emergencyMedicalInfo, newEmergencyInfo, (list) => 
                                                setPatientData(prev => ({ ...prev, emergencyMedicalInfo: list }))
                                            );
                                            setNewEmergencyInfo('');
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    onClick={() => {
                                        addToList(patientData.emergencyMedicalInfo, newEmergencyInfo, (list) => 
                                            setPatientData(prev => ({ ...prev, emergencyMedicalInfo: list }))
                                        );
                                        setNewEmergencyInfo('');
                                    }}
                                >
                                    Add
                                </Button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {patientData.emergencyMedicalInfo.map((info, index) => (
                                    <Badge key={index} variant="outline" className="cursor-pointer"
                                           onClick={() => removeFromList(patientData.emergencyMedicalInfo, index, (list) =>
                                               setPatientData(prev => ({ ...prev, emergencyMedicalInfo: list }))
                                           )}>
                                        {info} ×
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Special Status */}
                        <div className="space-y-4">
                            <Label className="text-base font-semibold">Special Medical Status</Label>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="dnr-status">Do Not Resuscitate (DNR)</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Patient has a DNR order on file
                                        </p>
                                    </div>
                                    <Switch
                                        id="dnr-status"
                                        checked={patientData.dnrStatus}
                                        onCheckedChange={(checked) => 
                                            setPatientData(prev => ({ ...prev, dnrStatus: checked }))
                                        }
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <div>
                                        <Label htmlFor="organ-donor">Organ Donor</Label>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Patient is an organ donor
                                        </p>
                                    </div>
                                    <Switch
                                        id="organ-donor"
                                        checked={patientData.organDonorStatus}
                                        onCheckedChange={(checked) => 
                                            setPatientData(prev => ({ ...prev, organDonorStatus: checked }))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(1)}>
                                Back
                            </Button>
                            <Button onClick={() => setCurrentStep(3)}>
                                Next: Security Settings
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 3 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                            <Shield className="w-5 h-5" />
                            <span>Security Settings</span>
                        </CardTitle>
                        <CardDescription>
                            Configure access controls and security preferences for this UMID
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Maximum Failed Attempts</Label>
                                    <Select 
                                        value={securitySettings.maxFailedAttempts.toString()} 
                                        onValueChange={(value) => 
                                            setSecuritySettings(prev => ({ ...prev, maxFailedAttempts: parseInt(value) }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="3">3 attempts</SelectItem>
                                            <SelectItem value="5">5 attempts</SelectItem>
                                            <SelectItem value="10">10 attempts</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Lockout Duration (minutes)</Label>
                                    <Select 
                                        value={securitySettings.lockoutDuration.toString()} 
                                        onValueChange={(value) => 
                                            setSecuritySettings(prev => ({ ...prev, lockoutDuration: parseInt(value) }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="15">15 minutes</SelectItem>
                                            <SelectItem value="30">30 minutes</SelectItem>
                                            <SelectItem value="60">1 hour</SelectItem>
                                            <SelectItem value="120">2 hours</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Encryption Level</Label>
                                    <Select 
                                        value={securitySettings.encryptionLevel} 
                                        onValueChange={(value) => 
                                            setSecuritySettings(prev => ({ ...prev, encryptionLevel: value as any }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="standard">Standard</SelectItem>
                                            <SelectItem value="high">High</SelectItem>
                                            <SelectItem value="military">Military Grade</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label>Access Control Level</Label>
                                    <Select 
                                        value={securitySettings.accessControlLevel} 
                                        onValueChange={(value) => 
                                            setSecuritySettings(prev => ({ ...prev, accessControlLevel: value as any }))
                                        }
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="basic">Basic</SelectItem>
                                            <SelectItem value="enhanced">Enhanced</SelectItem>
                                            <SelectItem value="strict">Strict</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Require Biometric</Label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Require fingerprint or face recognition
                                            </p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.requireBiometric}
                                            onCheckedChange={(checked) => 
                                                setSecuritySettings(prev => ({ ...prev, requireBiometric: checked }))
                                            }
                                        />
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div>
                                            <Label>Allow Offline Access</Label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Allow access without internet connection
                                            </p>
                                        </div>
                                        <Switch
                                            checked={securitySettings.allowOfflineAccess}
                                            onCheckedChange={(checked) => 
                                                setSecuritySettings(prev => ({ ...prev, allowOfflineAccess: checked }))
                                            }
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={() => setCurrentStep(2)}>
                                Back
                            </Button>
                            <Button onClick={handleGenerate} disabled={isGenerating}>
                                {isGenerating ? (
                                    <div className="flex items-center space-x-2">
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        <span>Generating UMID...</span>
                                    </div>
                                ) : (
                                    'Generate UMID'
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {currentStep === 4 && generatedUMID && (
                <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/10">
                    <CardHeader>
                        <CardTitle className="flex items-center space-x-2 text-green-800 dark:text-green-200">
                            <Check className="w-5 h-5" />
                            <span>UMID Generated Successfully</span>
                        </CardTitle>
                        <CardDescription className="text-green-600 dark:text-green-400">
                            Your Universal Medical ID has been created and is ready for use
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="text-center space-y-4">
                            <div className="inline-block p-6 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-200 dark:border-green-800">
                                <QrCode className="w-32 h-32 mx-auto mb-4 text-gray-600" />
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">QR Code Placeholder</p>
                                <p className="text-lg font-mono font-bold">{generatedUMID.umidNumber}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">UMID Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">UMID Number:</span>
                                        <div className="flex items-center space-x-2">
                                            <span className="font-mono">{generatedUMID.umidNumber}</span>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => copyToClipboard(generatedUMID.umidNumber)}
                                            >
                                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Patient:</span>
                                        <span>{generatedUMID.linkedMedicalData.basicInfo.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Issue Date:</span>
                                        <span>{generatedUMID.issueDate.toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Status:</span>
                                        <Badge variant="default" className="bg-green-100 text-green-800">
                                            Active
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-lg">Security Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Encryption:</span>
                                        <Badge variant="outline">{generatedUMID.securitySettings.encryptionLevel}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Access Control:</span>
                                        <Badge variant="outline">{generatedUMID.securitySettings.accessControlLevel}</Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Biometric:</span>
                                        <Badge variant={generatedUMID.securitySettings.requireBiometric ? "default" : "secondary"}>
                                            {generatedUMID.securitySettings.requireBiometric ? "Required" : "Optional"}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 dark:text-gray-400">Offline Access:</span>
                                        <Badge variant={generatedUMID.securitySettings.allowOfflineAccess ? "default" : "secondary"}>
                                            {generatedUMID.securitySettings.allowOfflineAccess ? "Allowed" : "Disabled"}
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <Button onClick={downloadQRCode} variant="outline">
                                <Download className="w-4 h-4 mr-2" />
                                Download QR Code
                            </Button>
                            <Button onClick={() => copyToClipboard(generatedUMID.umidNumber)}>
                                {copied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                                Copy UMID Number
                            </Button>
                        </div>

                        <Alert>
                            <AlertTriangle className="w-4 h-4" />
                            <AlertDescription>
                                Store the QR code and UMID number securely. The patient should keep the QR code 
                                with them for emergency medical situations. Healthcare providers can use this 
                                to access critical medical information quickly.
                            </AlertDescription>
                        </Alert>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
