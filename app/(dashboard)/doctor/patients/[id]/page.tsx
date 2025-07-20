"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  AlertTriangle,
  FileText,
  Activity,
  Clock,
  Edit,
  Download,
  Share,
  Plus,
  Stethoscope,
  Pill,
  TestTube,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Calendar as CalendarIcon,
  UserCheck,
  Shield,
  Info
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { PatientProfile, BloodType, MedicalRecord, LabResult, Prescription } from '@/app/types';

export default function PatientDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [activeTab, setActiveTab] = useState('overview');

  const patientId = params.id as string;

  useEffect(() => {
    if (user?.id && patientId) {
      loadPatientData();
    }
  }, [user, patientId]);

  const loadPatientData = async () => {
    if (!user?.id || !patientId) return;

    try {
      setLoading(true);
      setError(null);

      // Load patient profile
      const patientResponse = await DoctorService.getDoctorPatients(user.id, {
        filter: { patientId }
      });

      if (patientResponse.error) {
        setError(patientResponse.error.message);
        return;
      }

      if (patientResponse.data && patientResponse.data.length > 0) {
        const patientData = patientResponse.data[0];
        setPatient(patientData);

        // Load additional data
        await Promise.all([
          loadLabResults(patientId),
          // loadMedicalRecords(patientId),
          // loadPrescriptions(patientId)
        ]);
      } else {
        setError('Patient not found or you do not have access to this patient.');
      }
    } catch (error) {
      console.error('Error loading patient data:', error);
      setError('Failed to load patient data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadLabResults = async (patientId: string) => {
    try {
      const response = await DoctorService.getPatientLabResults(patientId, user!.id, {
        pagination: { page: 1, limit: 10 }
      });
      if (response.data) {
        setLabResults(response.data);
      }
    } catch (error) {
      console.error('Error loading lab results:', error);
    }
  };

  const calculateAge = (dateOfBirth?: Date): number => {
    if (!dateOfBirth) return 0;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getBloodTypeColor = (bloodType?: BloodType) => {
    if (!bloodType) return 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
    const colors = {
      'A+': 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      'A-': 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-200 dark:border-red-700',
      'B+': 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
      'B-': 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700',
      'AB+': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
      'AB-': 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-200 dark:border-purple-700',
      'O+': 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      'O-': 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-200 dark:border-green-700',
    };
    return colors[bloodType] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300';
  };

  const hasChronicConditions = (patient: PatientProfile): boolean => {
    return patient.medicalHistory?.conditions?.some(condition => condition.isCurrent) || false;
  };

  const hasAllergies = (patient: PatientProfile): boolean => {
    return (patient.allergies?.length || 0) > 0;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-red-600 mx-auto mb-4 animate-spin" />
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">Loading patient data...</p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">Please wait while we fetch patient information</p>
        </div>
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Patient Details
            </h1>
          </div>
        </div>
        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Patient not found'}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button 
            onClick={loadPatientData}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              'Try Again'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Patient Details
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">
              Comprehensive patient information and medical history
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button
            variant="outline"
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button
            onClick={() => router.push(`/doctor/patients/${patientId}/edit`)}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Patient
          </Button>
        </div>
      </div>

      {/* Patient Profile Card */}
      <Card className="border-zinc-200 dark:border-zinc-700">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={patient.profileImageUrl} />
              <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300 text-2xl">
                {patient.firstName[0]}{patient.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                  {patient.firstName} {patient.lastName}
                </h2>
                <Badge className={getBloodTypeColor(patient.bloodType)}>
                  {patient.bloodType || 'Unknown'}
                </Badge>
              </div>
              <div className="flex items-center space-x-4 mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  ID: {patient.id.slice(0, 8)}...
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {calculateAge(patient.dateOfBirth)} years old
                </div>
                <div className="flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  {patient.gender}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {hasChronicConditions(patient) && (
                <Badge variant="outline" className="text-orange-600 border-orange-300 dark:text-orange-300 dark:border-orange-700">
                  <Heart className="h-3 w-3 mr-1" />
                  Chronic
                </Badge>
              )}
              {hasAllergies(patient) && (
                <Badge variant="outline" className="text-yellow-600 border-yellow-300 dark:text-yellow-300 dark:border-yellow-700">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Allergies
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contact Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
              <User className="h-5 w-5 mr-2 text-red-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <Mail className="h-4 w-4 text-zinc-500" />
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Email</p>
                <p className="text-zinc-900 dark:text-zinc-100">{patient.email}</p>
              </div>
            </div>
            {patient.phone && (
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Phone</p>
                  <p className="text-zinc-900 dark:text-zinc-100">{patient.phone}</p>
                </div>
              </div>
            )}
            {patient.address && (
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-zinc-500" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Address</p>
                  <p className="text-zinc-900 dark:text-zinc-100">
                    {patient.address.street}, {patient.address.city}, {patient.address.state} {patient.address.postalCode}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
              <Info className="h-5 w-5 mr-2 text-red-600" />
              Medical Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Blood Type</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">{patient.bloodType || 'Unknown'}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Date of Birth</p>
                <p className="text-zinc-900 dark:text-zinc-100 font-medium">
                  {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'Unknown'}
                </p>
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Known Allergies</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {patient.allergies && patient.allergies.length > 0 ? (
                  patient.allergies.map((allergy, index) => (
                    <Badge key={index} variant="outline" className="text-yellow-600 border-yellow-300 dark:text-yellow-300 dark:border-yellow-700">
                      {allergy.name}
                    </Badge>
                  ))
                ) : (
                  <p className="text-zinc-500 dark:text-zinc-500 italic">No known allergies</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="lab-results">Lab Results</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
                  <Activity className="h-5 w-5 mr-2 text-red-600" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">Last visit</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(patient.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <p className="text-sm text-zinc-900 dark:text-zinc-100">Patient since</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">
                        {new Date(patient.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardHeader>
                <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
                  <CalendarIcon className="h-5 w-5 mr-2 text-red-600" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button variant="outline" className="w-full justify-start hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    Schedule Appointment
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <Pill className="h-4 w-4 mr-2" />
                    New Prescription
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:bg-zinc-50 dark:hover:bg-zinc-800">
                    <TestTube className="h-4 w-4 mr-2" />
                    Order Lab Tests
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
                <FileText className="h-5 w-5 mr-2 text-red-600" />
                Medical History
              </CardTitle>
            </CardHeader>
            <CardContent>
              {patient.medicalHistory?.conditions && patient.medicalHistory.conditions.length > 0 ? (
                <div className="space-y-4">
                  {patient.medicalHistory.conditions.map((condition, index) => (
                    <div key={index} className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{condition.name}</h4>
                        <Badge variant={condition.isCurrent ? "default" : "outline"}>
                          {condition.isCurrent ? "Current" : "Past"}
                        </Badge>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">{condition.notes || 'No additional notes'}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        <span>Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    No medical history recorded
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Medical history will appear here once it's been documented.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lab-results" className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
                <TestTube className="h-5 w-5 mr-2 text-red-600" />
                Lab Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {labResults.length > 0 ? (
                <div className="space-y-4">
                  {labResults.map((result) => (
                    <div key={result.id} className="p-4 border border-zinc-200 dark:border-zinc-700 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{result.testName}</h4>
                        <Badge variant="outline">
                          {result.resultDate ? new Date(result.resultDate).toLocaleDateString() : 'Pending'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-zinc-600 dark:text-zinc-400">Laboratory</p>
                          <p className="text-zinc-900 dark:text-zinc-100">{result.laboratoryName}</p>
                        </div>
                        <div>
                          <p className="text-zinc-600 dark:text-zinc-400">Technician</p>
                          <p className="text-zinc-900 dark:text-zinc-100">{result.technicianName || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <TestTube className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    No lab results available
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Lab results will appear here once they're available.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <Card className="border-zinc-200 dark:border-zinc-700">
            <CardHeader>
              <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
                <Pill className="h-5 w-5 mr-2 text-red-600" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Pill className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  No prescriptions available
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Prescriptions will appear here once they're created.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
