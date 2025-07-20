"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  Search,
  Filter,
  UserPlus,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  TrendingUp,
  Eye,
  Edit,
  RefreshCw,
  Download,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { PatientProfile, BloodType } from '@/app/types';

export default function DoctorPatientsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientProfile[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<PatientProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('all');
  const [ageFilter, setAgeFilter] = useState<string>('all');
  const [conditionFilter, setConditionFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  useEffect(() => {
    if (user?.id) {
      loadPatients();
    }
  }, [user]);

  useEffect(() => {
    filterAndSortPatients();
  }, [patients, searchTerm, bloodTypeFilter, ageFilter, conditionFilter, sortBy]);

  const loadPatients = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      setError(null);
      
      const response = await DoctorService.getDoctorPatients(user.id, {
        pagination: { page: 1, limit: 100 },
        sort: { field: 'lastName', direction: 'asc' }
      });

      if (response.error) {
        setError(response.error.message);
        return;
      }

      if (response.data) {
        setPatients(response.data);
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      setError('Failed to load patients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const refreshPatients = async () => {
    setRefreshing(true);
    await loadPatients();
    setRefreshing(false);
  };

  const filterAndSortPatients = () => {
    let filtered = [...patients];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(patient =>
        `${patient.firstName} ${patient.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.phone?.includes(searchTerm)
      );
    }

    // Apply blood type filter
    if (bloodTypeFilter !== 'all') {
      filtered = filtered.filter(patient => patient.bloodType === bloodTypeFilter);
    }

    // Apply age filter
    if (ageFilter !== 'all') {
      filtered = filtered.filter(patient => {
        const age = calculateAge(patient.dateOfBirth);
        switch (ageFilter) {
          case 'child': return age < 18;
          case 'adult': return age >= 18 && age < 65;
          case 'senior': return age >= 65;
          default: return true;
        }
      });
    }

    // Apply condition filter
    if (conditionFilter !== 'all') {
      filtered = filtered.filter(patient => {
        switch (conditionFilter) {
          case 'chronic': return hasChronicConditions(patient);
          case 'allergies': return hasAllergies(patient);
          case 'healthy': return !hasChronicConditions(patient) && !hasAllergies(patient);
          default: return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`);
        case 'age':
          const ageA = calculateAge(a.dateOfBirth);
          const ageB = calculateAge(b.dateOfBirth);
          return ageB - ageA;
        case 'lastVisit':
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        case 'bloodType':
          return (a.bloodType || '').localeCompare(b.bloodType || '');
        default:
          return 0;
      }
    });

    setFilteredPatients(filtered);
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

  const getPatientStatusColor = (patient: PatientProfile) => {
    const hasConditions = hasChronicConditions(patient);
    const hasAllergiesFlag = hasAllergies(patient);
    
    if (hasConditions && hasAllergiesFlag) {
      return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
    } else if (hasConditions) {
      return 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300 dark:border-orange-800';
    } else if (hasAllergiesFlag) {
      return 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800';
    } else {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
    }
  };

  const renderPatientCard = (patient: PatientProfile) => (
    <Card key={patient.id} className="hover:shadow-lg transition-all duration-200 border-zinc-200 dark:border-zinc-700">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={patient.profileImageUrl} />
              <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                {patient.firstName[0]}{patient.lastName[0]}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                {patient.firstName} {patient.lastName}
              </h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                ID: {patient.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge className={getPatientStatusColor(patient)}>
              {hasChronicConditions(patient) && hasAllergies(patient) ? 'High Risk' :
               hasChronicConditions(patient) ? 'Chronic' :
               hasAllergies(patient) ? 'Allergies' : 'Healthy'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center text-zinc-600 dark:text-zinc-400">
              <Mail className="h-4 w-4 mr-2" />
              {patient.email}
            </div>
            {patient.phone && (
              <div className="flex items-center text-zinc-600 dark:text-zinc-400">
                <Phone className="h-4 w-4 mr-2" />
                {patient.phone}
              </div>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Age:</span>
              <span className="font-medium text-zinc-900 dark:text-zinc-100">
                {calculateAge(patient.dateOfBirth)} years
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-zinc-600 dark:text-zinc-400">Blood Type:</span>
              <Badge className={getBloodTypeColor(patient.bloodType)}>
                {patient.bloodType || 'N/A'}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-700">
          <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
            <Clock className="h-4 w-4 mr-1" />
            Last visit: {new Date(patient.updatedAt).toLocaleDateString()}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/doctor/patients/${patient.id}`)}
              className="hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
            >
              <Eye className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/doctor/patients/${patient.id}/edit`)}
              className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

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
          <p className="text-zinc-600 dark:text-zinc-400 text-lg">Loading patients...</p>
          <p className="text-zinc-500 dark:text-zinc-500 text-sm mt-2">Please wait while we fetch your patient data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              My Patients
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              Manage your patient roster and medical records
            </p>
          </div>
        </div>
        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-300">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button 
            onClick={loadPatients}
            className="bg-red-600 hover:bg-red-700 text-white"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </>
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
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            My Patients
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400 mt-1">
            Manage your patient roster and medical records
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={refreshPatients}
            disabled={refreshing}
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button
            variant="outline"
            className="hover:bg-zinc-50 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <UserPlus className="h-4 w-4 mr-2" />
            Add Patient
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="border-zinc-200 dark:border-zinc-700">
        <CardHeader>
          <CardTitle className="flex items-center text-zinc-900 dark:text-zinc-100">
            <Filter className="h-5 w-5 mr-2 text-red-600" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {/* Search Input */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Search patients by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-zinc-300 dark:border-zinc-600 focus:ring-red-500 focus:border-red-500"
                />
              </div>
            </div>

            {/* Blood Type Filter */}
            <Select value={bloodTypeFilter} onValueChange={setBloodTypeFilter}>
              <SelectTrigger className="border-zinc-300 dark:border-zinc-600">
                <SelectValue placeholder="Blood Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Blood Types</SelectItem>
                <SelectItem value="A+">A+</SelectItem>
                <SelectItem value="A-">A-</SelectItem>
                <SelectItem value="B+">B+</SelectItem>
                <SelectItem value="B-">B-</SelectItem>
                <SelectItem value="AB+">AB+</SelectItem>
                <SelectItem value="AB-">AB-</SelectItem>
                <SelectItem value="O+">O+</SelectItem>
                <SelectItem value="O-">O-</SelectItem>
              </SelectContent>
            </Select>

            {/* Age Filter */}
            <Select value={ageFilter} onValueChange={setAgeFilter}>
              <SelectTrigger className="border-zinc-300 dark:border-zinc-600">
                <SelectValue placeholder="Age Group" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ages</SelectItem>
                <SelectItem value="child">Child (&lt;18)</SelectItem>
                <SelectItem value="adult">Adult (18-64)</SelectItem>
                <SelectItem value="senior">Senior (65+)</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort By */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="border-zinc-300 dark:border-zinc-600">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="age">Age</SelectItem>
                <SelectItem value="lastVisit">Last Visit</SelectItem>
                <SelectItem value="bloodType">Blood Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Additional Filters */}
          <div className="flex flex-wrap gap-2 mt-4">
            <Select value={conditionFilter} onValueChange={setConditionFilter}>
              <SelectTrigger className="w-auto min-w-[150px] border-zinc-300 dark:border-zinc-600">
                <SelectValue placeholder="Health Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Patients</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="chronic">Chronic Conditions</SelectItem>
                <SelectItem value="allergies">With Allergies</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center space-x-2 ml-auto">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className={viewMode === 'table' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}
              >
                <FileText className="h-4 w-4 mr-1" />
                Table
              </Button>
              <Button
                variant={viewMode === 'cards' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('cards')}
                className={viewMode === 'cards' ? 'bg-red-600 hover:bg-red-700' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800'}
              >
                <Users className="h-4 w-4 mr-1" />
                Cards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{patients.length}</div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {filteredPatients.length} shown
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Chronic Conditions</CardTitle>
            <Heart className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {patients.filter(hasChronicConditions).length}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {((patients.filter(hasChronicConditions).length / patients.length) * 100).toFixed(1)}% of patients
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">With Allergies</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {patients.filter(hasAllergies).length}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              {((patients.filter(hasAllergies).length / patients.length) * 100).toFixed(1)}% of patients
            </p>
          </CardContent>
        </Card>
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Recent Activity</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {patients.filter(patient => {
                const lastVisit = new Date(patient.updatedAt);
                const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                return lastVisit > weekAgo;
              }).length}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Patients Content */}
      {viewMode === 'table' ? (
        <Card className="border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="text-zinc-900 dark:text-zinc-100">Patient List</CardTitle>
            <CardDescription className="text-zinc-600 dark:text-zinc-400">
              {filteredPatients.length} of {patients.length} patients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-200 dark:border-zinc-700">
                      <TableHead className="text-zinc-700 dark:text-zinc-300">Patient</TableHead>
                      <TableHead className="text-zinc-700 dark:text-zinc-300">Contact</TableHead>
                      <TableHead className="text-zinc-700 dark:text-zinc-300">Blood Type</TableHead>
                      <TableHead className="text-zinc-700 dark:text-zinc-300">Age</TableHead>
                      <TableHead className="text-zinc-700 dark:text-zinc-300">Medical Status</TableHead>
                      <TableHead className="text-zinc-700 dark:text-zinc-300">Last Visit</TableHead>
                      <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPatients.map((patient) => (
                      <TableRow key={patient.id} className="border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={patient.profileImageUrl} />
                              <AvatarFallback className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300">
                                {patient.firstName[0]}{patient.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-zinc-900 dark:text-zinc-100">
                                {patient.firstName} {patient.lastName}
                              </div>
                              <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                ID: {patient.id.slice(0, 8)}...
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                              <Mail className="h-3 w-3 mr-1" />
                              <span className="truncate max-w-[150px]">{patient.email}</span>
                            </div>
                            {patient.phone && (
                              <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                                <Phone className="h-3 w-3 mr-1" />
                                {patient.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          {patient.bloodType ? (
                            <Badge className={getBloodTypeColor(patient.bloodType)}>
                              {patient.bloodType}
                            </Badge>
                          ) : (
                            <span className="text-zinc-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {patient.dateOfBirth ? (
                            <span className="text-zinc-900 dark:text-zinc-100">
                              {calculateAge(patient.dateOfBirth)} years
                            </span>
                          ) : (
                            <span className="text-zinc-400">N/A</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {hasChronicConditions(patient) && (
                              <Badge variant="outline" className="text-xs text-orange-600 border-orange-300 dark:text-orange-300 dark:border-orange-700">
                                Chronic
                              </Badge>
                            )}
                            {hasAllergies(patient) && (
                              <Badge variant="outline" className="text-xs text-yellow-600 border-yellow-300 dark:text-yellow-300 dark:border-yellow-700">
                                Allergies
                              </Badge>
                            )}
                            {!hasChronicConditions(patient) && !hasAllergies(patient) && (
                              <Badge variant="outline" className="text-xs text-green-600 border-green-300 dark:text-green-300 dark:border-green-700">
                                Healthy
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm text-zinc-600 dark:text-zinc-400">
                            <Clock className="h-3 w-3 mr-1" />
                            {new Date(patient.updatedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/doctor/patients/${patient.id}`)}
                              className="hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-900/20 dark:hover:text-red-300"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => router.push(`/doctor/patients/${patient.id}/edit`)}
                              className="hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-900/20 dark:hover:text-blue-300"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {filteredPatients.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                  No patients found
                </h3>
                <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                  {searchTerm || bloodTypeFilter !== 'all' || ageFilter !== 'all' || conditionFilter !== 'all'
                    ? "Try adjusting your search and filter criteria"
                    : "You haven't added any patients yet"
                  }
                </p>
                {!searchTerm && bloodTypeFilter === 'all' && ageFilter === 'all' && conditionFilter === 'all' && (
                  <Button className="bg-red-600 hover:bg-red-700 text-white">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Your First Patient
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {filteredPatients.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredPatients.map(renderPatientCard)}
            </div>
          ) : (
            <Card className="border-zinc-200 dark:border-zinc-700">
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="h-16 w-16 text-zinc-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
                    No patients found
                  </h3>
                  <p className="text-zinc-600 dark:text-zinc-400 mb-6">
                    {searchTerm || bloodTypeFilter !== 'all' || ageFilter !== 'all' || conditionFilter !== 'all'
                      ? "Try adjusting your search and filter criteria"
                      : "You haven't added any patients yet"
                    }
                  </p>
                  {!searchTerm && bloodTypeFilter === 'all' && ageFilter === 'all' && conditionFilter === 'all' && (
                    <Button className="bg-red-600 hover:bg-red-700 text-white">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Your First Patient
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
