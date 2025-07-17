"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Pill,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Download,
  Printer,
  MoreHorizontal
} from 'lucide-react';
import { DoctorService } from '@/lib/firestore/doctor-service';
import { useAuth } from '@/app/contexts/auth-context';
import { Prescription, Medication } from '@/app/types';

interface NewPrescriptionForm {
  patientId: string;
  diagnosis: string;
  instructions: string;
  medications: Medication[];
  isRefillable: boolean;
  refillsRemaining: number;
  expiryDate: Date;
}

export default function DoctorPrescriptionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewPrescriptionDialog, setShowNewPrescriptionDialog] = useState(false);
  const [newPrescription, setNewPrescription] = useState<NewPrescriptionForm>({
    patientId: '',
    diagnosis: '',
    instructions: '',
    medications: [],
    isRefillable: false,
    refillsRemaining: 0,
    expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
  });

  useEffect(() => {
    if (user?.id) {
      loadPrescriptions();
    }
  }, [user]);

  useEffect(() => {
    filterPrescriptions();
  }, [prescriptions, searchTerm, statusFilter]);

  const loadPrescriptions = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      // This would be implemented in the DoctorService
      // const response = await DoctorService.getDoctorPrescriptions(user.id);
      // For now, we'll use mock data
      const mockPrescriptions: Prescription[] = [
        {
          id: '1',
          patientId: 'patient1',
          doctorId: user.id,
          date: new Date(),
          medications: [
            {
              id: 'med1',
              name: 'Lisinopril',
              dosage: '10mg',
              frequency: 'Once daily',
              duration: '30 days',
              quantity: 30,
              notes: 'Take with food'
            }
          ],
          diagnosis: 'Hypertension',
          instructions: 'Take as directed. Monitor blood pressure daily.',
          isRefillable: true,
          refillsRemaining: 2,
          expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: '2',
          patientId: 'patient2',
          doctorId: user.id,
          date: new Date(),
          medications: [
            {
              id: 'med2',
              name: 'Amoxicillin',
              dosage: '500mg',
              frequency: 'Three times daily',
              duration: '7 days',
              quantity: 21,
              notes: 'Complete full course'
            }
          ],
          diagnosis: 'Bacterial infection',
          instructions: 'Complete the full course of antibiotics.',
          isRefillable: false,
          refillsRemaining: 0,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];
      
      setPrescriptions(mockPrescriptions);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPrescriptions = () => {
    let filtered = [...prescriptions];

    if (searchTerm) {
      filtered = filtered.filter(prescription =>
        prescription.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
        prescription.medications.some(med => 
          med.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(prescription => prescription.status === statusFilter);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    setFilteredPrescriptions(filtered);
  };

  const handleCreatePrescription = async () => {
    if (!user?.id) return;

    try {
      const prescriptionData = {
        ...newPrescription,
        doctorId: user.id,
        date: new Date(),
        status: 'active' as const
      };

      await DoctorService.createPrescription(prescriptionData);
      setShowNewPrescriptionDialog(false);
      setNewPrescription({
        patientId: '',
        diagnosis: '',
        instructions: '',
        medications: [],
        isRefillable: false,
        refillsRemaining: 0,
        expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
      });
      loadPrescriptions();
    } catch (error) {
      console.error('Error creating prescription:', error);
    }
  };

  const addMedication = () => {
    const newMedication: Medication = {
      id: `med_${Date.now()}`,
      name: '',
      dosage: '',
      frequency: '',
      duration: '',
      quantity: 0,
      notes: ''
    };
    setNewPrescription(prev => ({
      ...prev,
      medications: [...prev.medications, newMedication]
    }));
  };

  const updateMedication = (index: number, field: keyof Medication, value: any) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.map((med, i) => 
        i === index ? { ...med, [field]: value } : med
      )
    }));
  };

  const removeMedication = (index: number) => {
    setNewPrescription(prev => ({
      ...prev,
      medications: prev.medications.filter((_, i) => i !== index)
    }));
  };

  const getStatusColor = (status: Prescription['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'expired': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getPrescriptionStats = () => {
    const active = prescriptions.filter(p => p.status === 'active').length;
    const completed = prescriptions.filter(p => p.status === 'completed').length;
    const refillable = prescriptions.filter(p => p.isRefillable && (p.refillsRemaining ?? 0) > 0).length;
    const expiringSoon = prescriptions.filter(p => {
      const daysUntilExpiry = Math.ceil((new Date(p.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      return daysUntilExpiry <= 7 && p.status === 'active';
    }).length;

    return { active, completed, refillable, expiringSoon };
  };

  const stats = getPrescriptionStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Prescriptions
          </h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Manage patient prescriptions and medications
          </p>
        </div>
        <Dialog open={showNewPrescriptionDialog} onOpenChange={setShowNewPrescriptionDialog}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="h-4 w-4 mr-2" />
              New Prescription
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Prescription</DialogTitle>
              <DialogDescription>
                Add a new prescription for your patient
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Patient Selection */}
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="patientId">Patient ID</Label>
                  <Input
                    id="patientId"
                    value={newPrescription.patientId}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, patientId: e.target.value }))}
                    placeholder="Enter patient ID"
                  />
                </div>
                <div>
                  <Label htmlFor="diagnosis">Diagnosis</Label>
                  <Input
                    id="diagnosis"
                    value={newPrescription.diagnosis}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, diagnosis: e.target.value }))}
                    placeholder="Primary diagnosis"
                  />
                </div>
              </div>

              {/* Medications */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>Medications</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addMedication}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Medication
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {newPrescription.medications.map((medication, index) => (
                    <Card key={index}>
                      <CardContent className="pt-4">
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <div>
                            <Label>Medication Name</Label>
                            <Input
                              value={medication.name}
                              onChange={(e) => updateMedication(index, 'name', e.target.value)}
                              placeholder="e.g., Lisinopril"
                            />
                          </div>
                          <div>
                            <Label>Dosage</Label>
                            <Input
                              value={medication.dosage}
                              onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                              placeholder="e.g., 10mg"
                            />
                          </div>
                          <div>
                            <Label>Frequency</Label>
                            <Select
                              value={medication.frequency}
                              onValueChange={(value) => updateMedication(index, 'frequency', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Once daily">Once daily</SelectItem>
                                <SelectItem value="Twice daily">Twice daily</SelectItem>
                                <SelectItem value="Three times daily">Three times daily</SelectItem>
                                <SelectItem value="Four times daily">Four times daily</SelectItem>
                                <SelectItem value="As needed">As needed</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label>Duration</Label>
                            <Input
                              value={medication.duration}
                              onChange={(e) => updateMedication(index, 'duration', e.target.value)}
                              placeholder="e.g., 30 days"
                            />
                          </div>
                          <div>
                            <Label>Quantity</Label>
                            <Input
                              type="number"
                              value={medication.quantity}
                              onChange={(e) => updateMedication(index, 'quantity', parseInt(e.target.value) || 0)}
                              placeholder="0"
                            />
                          </div>
                          <div className="flex items-end">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMedication(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              Remove
                            </Button>
                          </div>
                        </div>
                        <div className="mt-4">
                          <Label>Notes</Label>
                          <Input
                            value={medication.notes}
                            onChange={(e) => updateMedication(index, 'notes', e.target.value)}
                            placeholder="Special instructions"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Instructions and Settings */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="instructions">Instructions</Label>
                  <Textarea
                    id="instructions"
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription(prev => ({ ...prev, instructions: e.target.value }))}
                    placeholder="General instructions for the patient"
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isRefillable"
                      checked={newPrescription.isRefillable}
                      onChange={(e) => setNewPrescription(prev => ({ ...prev, isRefillable: e.target.checked }))}
                      className="rounded border-zinc-300"
                    />
                    <Label htmlFor="isRefillable">Allow Refills</Label>
                  </div>
                  {newPrescription.isRefillable && (
                    <div>
                      <Label htmlFor="refillsRemaining">Refills Remaining</Label>
                      <Input
                        type="number"
                        id="refillsRemaining"
                        value={newPrescription.refillsRemaining}
                        onChange={(e) => setNewPrescription(prev => ({ ...prev, refillsRemaining: parseInt(e.target.value) || 0 }))}
                        min="0"
                        max="5"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowNewPrescriptionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreatePrescription}
                className="bg-red-600 hover:bg-red-700"
                disabled={!newPrescription.patientId || !newPrescription.diagnosis || newPrescription.medications.length === 0}
              >
                Create Prescription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Refillable</CardTitle>
            <Pill className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.refillable}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.expiringSoon}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 h-4 w-4" />
                <Input
                  placeholder="Search prescriptions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Prescriptions List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <Pill className="h-8 w-8 text-zinc-400 mx-auto mb-4 animate-pulse" />
            <p className="text-zinc-600 dark:text-zinc-400">Loading prescriptions...</p>
          </div>
        ) : filteredPrescriptions.length > 0 ? (
          filteredPrescriptions.map((prescription) => (
            <Card key={prescription.id}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold text-lg">Patient ID: {prescription.patientId}</h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Diagnosis: {prescription.diagnosis}
                        </p>
                        <p className="text-xs text-zinc-500">
                          Prescribed on {prescription.date.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-medium">Medications:</h4>
                      {prescription.medications.map((medication, index) => (
                        <div key={index} className="bg-zinc-50 dark:bg-zinc-800 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="font-medium">{medication.name}</span>
                              <span className="text-zinc-600 dark:text-zinc-400 ml-2">
                                {medication.dosage} • {medication.frequency} • {medication.duration}
                              </span>
                            </div>
                            <Badge variant="outline">Qty: {medication.quantity}</Badge>
                          </div>
                          {medication.notes && (
                            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                              Note: {medication.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>

                    {prescription.instructions && (
                      <div>
                        <h4 className="font-medium">Instructions:</h4>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          {prescription.instructions}
                        </p>
                      </div>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-zinc-600 dark:text-zinc-400">
                      {prescription.isRefillable && (
                        <span>Refills: {prescription.refillsRemaining} remaining</span>
                      )}
                      <span>Expires: {prescription.expiryDate.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status}
                    </Badge>
                    
                    <div className="flex items-center space-x-1">
                      <Button size="sm" variant="outline">
                        <Printer className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-12">
            <Pill className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">
              No prescriptions found
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 mb-4">
              {searchTerm || statusFilter !== 'all'
                ? "Try adjusting your search criteria"
                : "You haven't created any prescriptions yet"
              }
            </p>
            {!searchTerm && statusFilter === 'all' && (
              <Button 
                className="bg-red-600 hover:bg-red-700"
                onClick={() => setShowNewPrescriptionDialog(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Prescription
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
