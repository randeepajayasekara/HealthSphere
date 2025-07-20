"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Scan,
  QrCode,
  User,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  Upload,
  Search,
  Eye,
  EyeOff,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Activity,
  Heart,
  FileText,
  Stethoscope,
  Pill,
  FlaskConical,
  History,
  Lock,
  Key,
  AlertCircle,
  Download,
  Printer,
  Share2,
  Copy,
  Loader2,
  RefreshCw,
  Database,
  Smartphone,
  Tablet,
  Monitor,
  Wifi,
  WifiOff
} from 'lucide-react';
import { ProtectedRoute } from '@/app/components/auth/protected-route';
import { useAuth } from '@/app/contexts/auth-context';
import { DoctorUMIDService } from '@/lib/firestore/doctor-umid-service';
import { UniversalMedicalID, User as UserType, PatientProfile, MedicalRecord } from '@/app/types';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';

interface UMIDScanResult {
  umid: UniversalMedicalID;
  patient: PatientProfile;
  medicalRecords: MedicalRecord[];
  lastAccessed: Date;
  accessAuthorized: boolean;
  emergencyAccess: boolean;
}

interface ScanHistory {
  id: string;
  umidId: string;
  patientId: string;
  patientName: string;
  scannedAt: Date;
  scanMethod: 'qr' | 'manual' | 'nfc';
  accessType: 'authorized' | 'emergency' | 'denied';
  doctorId: string;
  notes?: string;
}

interface DeviceInfo {
  id: string;
  type: 'mobile' | 'tablet' | 'desktop';
  name: string;
  isOnline: boolean;
  lastSeen: Date;
  capabilities: string[];
}

export default function DoctorUMIDScannerPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<UMIDScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [manualUMID, setManualUMID] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'pending'>('pending');
  const [activeTab, setActiveTab] = useState('scanner');
  const [devices, setDevices] = useState<DeviceInfo[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting'>('online');
  const [showPatientDetails, setShowPatientDetails] = useState(false);
  const [emergencyAccess, setEmergencyAccess] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    if (user?.id) {
      loadScanHistory();
      loadDevices();
      checkCameraPermission();
    }
  }, [user]);

  const checkCameraPermission = async () => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      setCameraPermission(result.state as 'granted' | 'denied' | 'pending');
      
      result.addEventListener('change', () => {
        setCameraPermission(result.state as 'granted' | 'denied' | 'pending');
      });
    } catch (error) {
      console.error('Error checking camera permission:', error);
    }
  };

  const loadScanHistory = async () => {
    if (!user?.id) return;
    
    try {
      const response = await DoctorUMIDService.getScanHistory(user.id);
      if (response.data) {
        setScanHistory(response.data);
      }
    } catch (error) {
      console.error('Error loading scan history:', error);
    }
  };

  const loadDevices = async () => {
    if (!user?.id) return;
    
    try {
      const response = await DoctorUMIDService.getConnectedDevices(user.id);
      if (response.data) {
        setDevices(response.data);
      }
    } catch (error) {
      console.error('Error loading devices:', error);
    }
  };

  const startCamera = async () => {
    try {
      setScanning(true);
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setShowScanner(true);
    } catch (error) {
      console.error('Error starting camera:', error);
      toast.error('Unable to access camera. Please check permissions.');
      setScanning(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setShowScanner(false);
    setScanning(false);
  };

  const handleQRCodeScan = async (qrData: string) => {
    try {
      setLoading(true);
      stopCamera();
      
      const response = await DoctorUMIDService.scanUMID(qrData, user?.id!, {
        scanMethod: 'qr',
        emergencyAccess
      });
      
      if (response.data) {
        setScanResult(response.data);
        setShowPatientDetails(true);
        loadScanHistory(); // Refresh history
        toast.success('UMID scanned successfully');
      } else {
        toast.error(response.error?.message || 'Failed to scan UMID');
      }
    } catch (error) {
      console.error('Error scanning QR code:', error);
      toast.error('Failed to scan QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleManualUMIDScan = async () => {
    if (!manualUMID.trim() || !user?.id) return;
    
    try {
      setLoading(true);
      
      const response = await DoctorUMIDService.scanUMID(manualUMID, user.id, {
        scanMethod: 'manual',
        emergencyAccess
      });
      
      if (response.data) {
        setScanResult(response.data);
        setShowPatientDetails(true);
        setManualUMID('');
        loadScanHistory();
        toast.success('UMID retrieved successfully');
      } else {
        toast.error(response.error?.message || 'Failed to retrieve UMID');
      }
    } catch (error) {
      console.error('Error scanning manual UMID:', error);
      toast.error('Failed to retrieve UMID');
    } finally {
      setLoading(false);
    }
  };

  const handleEmergencyAccess = async (umidId: string) => {
    try {
      setLoading(true);
      
      const response = await DoctorUMIDService.requestEmergencyAccess(umidId, user?.id!, {
        reason: 'Medical emergency - immediate access required',
        urgency: 'critical'
      });
      
      if (response.data) {
        setScanResult(response.data);
        setShowPatientDetails(true);
        loadScanHistory();
        toast.success('Emergency access granted');
      } else {
        toast.error(response.error?.message || 'Emergency access denied');
      }
    } catch (error) {
      console.error('Error requesting emergency access:', error);
      toast.error('Failed to request emergency access');
    } finally {
      setLoading(false);
    }
  };

  const handleAuditLog = async (umidId: string) => {
    try {
      const response = await DoctorUMIDService.getAuditLog(umidId);
      if (response.data) {
        // Show audit log in a dialog or navigate to detailed view
        console.log('Audit log:', response.data);
      }
    } catch (error) {
      console.error('Error fetching audit log:', error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getMedicalPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  const getScanStatusColor = (status: string) => {
    switch (status) {
      case 'authorized': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400';
      case 'emergency': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      case 'denied': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-zinc-100 text-zinc-800 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute allowedRoles={['doctor']}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
            <p className="text-zinc-600 dark:text-zinc-400 text-lg">Loading UMID scanner...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute allowedRoles={['doctor']}>
      <div className="min-h-screen bg-zinc-50 dark:bg-black p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">UMID Scanner</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-1">
                Scan and verify Universal Medical IDs for secure patient data access
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm ${
                connectionStatus === 'online' ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400' :
                connectionStatus === 'offline' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400' :
                'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
              }`}>
                {connectionStatus === 'online' ? <Wifi className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEmergencyAccess(!emergencyAccess)}
                className={emergencyAccess ? 'bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800' : ''}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Emergency Access
              </Button>
            </div>
          </motion.div>

          {/* Scanner Interface */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="scanner">Scanner</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
              <TabsTrigger value="devices">Devices</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            {/* Scanner Tab */}
            <TabsContent value="scanner" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* QR Code Scanner */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <QrCode className="h-5 w-5 mr-2 text-red-600" />
                      QR Code Scanner
                    </CardTitle>
                    <CardDescription>
                      Scan patient's UMID QR code for instant access
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {!showScanner ? (
                      <div className="text-center py-8">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                          <Camera className="h-10 w-10 text-red-600" />
                        </div>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                          Click to start scanning QR codes
                        </p>
                        <Button 
                          onClick={startCamera}
                          disabled={cameraPermission === 'denied' || scanning}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {scanning ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Starting Camera...
                            </>
                          ) : (
                            <>
                              <Scan className="h-4 w-4 mr-2" />
                              Start Scanning
                            </>
                          )}
                        </Button>
                        
                        {cameraPermission === 'denied' && (
                          <Alert className="mt-4">
                            <AlertTriangle className="h-4 w-4" />
                            <AlertDescription>
                              Camera access is required for QR code scanning. Please enable camera permissions.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-64 object-cover rounded-lg border-2 border-red-200 dark:border-red-800"
                          />
                          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <div className="w-48 h-48 border-2 border-red-600 rounded-lg relative">
                              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-red-600 rounded-tl-lg"></div>
                              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-red-600 rounded-tr-lg"></div>
                              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-red-600 rounded-bl-lg"></div>
                              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-red-600 rounded-br-lg"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-center space-x-2">
                          <Button 
                            onClick={stopCamera}
                            variant="outline"
                          >
                            Stop Scanner
                          </Button>
                          <Button 
                            onClick={() => handleQRCodeScan('demo-umid-12345')}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            <Scan className="h-4 w-4 mr-2" />
                            Demo Scan
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Manual Entry */}
                <Card className="border-zinc-200 dark:border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Key className="h-5 w-5 mr-2 text-red-600" />
                      Manual Entry
                    </CardTitle>
                    <CardDescription>
                      Enter UMID code manually if QR code is not available
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">UMID Code</label>
                      <Input
                        placeholder="Enter UMID code (e.g., UMID-12345-67890)"
                        value={manualUMID}
                        onChange={(e) => setManualUMID(e.target.value)}
                        className="font-mono"
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        onClick={handleManualUMIDScan}
                        disabled={!manualUMID.trim() || loading}
                        className="bg-red-600 hover:bg-red-700 flex-1"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Scanning...
                          </>
                        ) : (
                          <>
                            <Search className="h-4 w-4 mr-2" />
                            Scan UMID
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => setManualUMID('UMID-12345-67890')}
                      >
                        Demo
                      </Button>
                    </div>

                    <Alert>
                      <Shield className="h-4 w-4" />
                      <AlertDescription>
                        All UMID scans are logged and monitored for security compliance.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <History className="h-5 w-5 mr-2 text-red-600" />
                    Scan History
                  </CardTitle>
                  <CardDescription>
                    Recent UMID scans and access logs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {scanHistory.length > 0 ? (
                    <ScrollArea className="h-[400px]">
                      <div className="space-y-3">
                        {scanHistory.map((scan) => (
                          <motion.div
                            key={scan.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                scan.accessType === 'authorized' ? 'bg-green-500' :
                                scan.accessType === 'emergency' ? 'bg-red-500' : 'bg-zinc-400'
                              }`}></div>
                              <div>
                                <p className="font-medium">{scan.patientName}</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                  {scan.umidId} • {format(scan.scannedAt, 'MMM d, h:mm a')}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Badge className={getScanStatusColor(scan.accessType)}>
                                {scan.accessType}
                              </Badge>
                              <Badge variant="outline">
                                {scan.scanMethod}
                              </Badge>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleAuditLog(scan.umidId)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="text-center py-8">
                      <History className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                      <p className="text-zinc-600 dark:text-zinc-400">No scan history available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Devices Tab */}
            <TabsContent value="devices" className="space-y-4">
              <Card className="border-zinc-200 dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Smartphone className="h-5 w-5 mr-2 text-red-600" />
                    Connected Devices
                  </CardTitle>
                  <CardDescription>
                    Manage devices with UMID scanner access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {devices.map((device) => (
                      <Card key={device.id} className="border-zinc-200 dark:border-zinc-800">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-2">
                              {device.type === 'mobile' && <Smartphone className="h-4 w-4 text-red-600" />}
                              {device.type === 'tablet' && <Tablet className="h-4 w-4 text-red-600" />}
                              {device.type === 'desktop' && <Monitor className="h-4 w-4 text-red-600" />}
                              <span className="font-medium">{device.name}</span>
                            </div>
                            <div className={`w-2 h-2 rounded-full ${
                              device.isOnline ? 'bg-green-500' : 'bg-zinc-400'
                            }`}></div>
                          </div>
                          <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
                            Last seen: {format(device.lastSeen, 'MMM d, h:mm a')}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {device.capabilities.map((capability) => (
                              <Badge key={capability} variant="outline" className="text-xs">
                                {capability}
                              </Badge>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Emergency Tab */}
            <TabsContent value="emergency" className="space-y-4">
              <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-700 dark:text-red-400">
                    <AlertTriangle className="h-5 w-5 mr-2" />
                    Emergency Access
                  </CardTitle>
                  <CardDescription className="text-red-600 dark:text-red-400">
                    Override normal access controls for critical medical situations
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert className="border-red-200 dark:border-red-800">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Emergency access bypasses normal authorization but creates detailed audit logs.
                      Use only in life-threatening situations.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Emergency Protocols</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2 text-sm">
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            Immediate access to critical medical data
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            Automatic notification to patient
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            Comprehensive audit trail
                          </li>
                          <li className="flex items-center">
                            <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                            Time-limited access window
                          </li>
                        </ul>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          onClick={() => handleEmergencyAccess('demo-umid-emergency')}
                          className="w-full bg-red-600 hover:bg-red-700"
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Request Emergency Access
                        </Button>
                        <Button 
                          variant="outline"
                          className="w-full"
                          onClick={() => toast.success('Emergency services contacted')}
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Emergency Services
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Patient Details Dialog */}
          {scanResult && (
            <Dialog open={showPatientDetails} onOpenChange={setShowPatientDetails}>
              <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2 text-red-600" />
                    Patient Medical Information
                  </DialogTitle>
                  <DialogDescription>
                    Secure access to patient data via UMID: {scanResult.umid.id}
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6">
                  {/* Patient Basic Info */}
                  <div className="flex items-center space-x-4 p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={scanResult.patient.profileImageUrl} />
                      <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                        {scanResult.patient.firstName[0]}{scanResult.patient.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">
                        {scanResult.patient.firstName} {scanResult.patient.lastName}
                      </h3>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {scanResult.patient.dateOfBirth && format(scanResult.patient.dateOfBirth, 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" />
                          {scanResult.patient.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {scanResult.emergencyAccess && (
                        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                          Emergency Access
                        </Badge>
                      )}
                      {scanResult.accessAuthorized && (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                          Authorized
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Medical Summary */}
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Heart className="h-4 w-4 mr-2 text-red-600" />
                          Vital Information
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Blood Type:</span>
                          <span className="text-sm">{scanResult.patient.bloodType || 'Not specified'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Allergies:</span>
                          <span className="text-sm">{scanResult.patient.allergies?.length || 0} known</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Medical Conditions:</span>
                          <span className="text-sm">{scanResult.patient.medicalHistory?.conditions?.length || 0} active</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Activity className="h-4 w-4 mr-2 text-red-600" />
                          Recent Activity
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Last Visit:</span>
                          <span className="text-sm">{format(scanResult.lastAccessed, 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Records:</span>
                          <span className="text-sm">{scanResult.medicalRecords.length} available</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Access Level:</span>
                          <span className="text-sm">{scanResult.emergencyAccess ? 'Emergency' : 'Standard'}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline"
                      onClick={() => router.push(`/doctor/patients/${scanResult.patient.id}`)}
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      View Full Records
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => copyToClipboard(scanResult.umid.id)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy UMID
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={() => handleAuditLog(scanResult.umid.id)}
                    >
                      <History className="h-4 w-4 mr-2" />
                      Audit Log
                    </Button>
                  </div>
                </div>

                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowPatientDetails(false)}
                  >
                    Close
                  </Button>
                  <Button 
                    onClick={() => router.push(`/doctor/patients/${scanResult.patient.id}`)}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    View Patient
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
