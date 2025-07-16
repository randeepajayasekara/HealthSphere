'use client';

import React, { useState } from 'react';
import { 
  Plus,
  Pill,
  Clock,
  Calendar,
  AlertTriangle,
  Check,
  X,
  ChevronDown,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { useMedicationForm } from '@/hooks/use-medication-schedule';
import { MedicationUtils } from '@/lib/firestore/medication-services';
import { cn } from '@/lib/utils';

interface AddMedicationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (medicationData: any) => Promise<void>;
}

export function AddMedicationDialog({ isOpen, onOpenChange, onSubmit }: AddMedicationDialogProps) {
  const { formData, errors, updateField, validateForm, resetForm } = useMedicationForm();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  const steps = [
    { id: 1, title: 'Basic Info', description: 'Medication details' },
    { id: 2, title: 'Dosage', description: 'Amount and frequency' },
    { id: 3, title: 'Schedule', description: 'Timing and duration' },
    { id: 4, title: 'Instructions', description: 'Special notes' },
  ];

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFrequencyChange = (frequency: string) => {
    updateField('schedule.frequency', frequency);
    
    // Auto-generate times based on frequency
    const times = MedicationUtils.generateMedicationTimes(frequency);
    updateField('schedule.times', times);
  };

  const addCustomTime = () => {
    const newTime = { time: '08:00', label: 'Custom' };
    updateField('schedule.times', [...formData.schedule.times, newTime]);
  };

  const removeTime = (index: number) => {
    const updatedTimes = formData.schedule.times.filter((_, i) => i !== index);
    updateField('schedule.times', updatedTimes);
  };

  const updateTime = (index: number, field: string, value: string | undefined) => {
    const updatedTimes = formData.schedule.times.map((time: any, i: number) => 
      i === index ? { ...time, [field]: value } : time
    );
    updateField('schedule.times', updatedTimes);
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(formData);
      resetForm();
      setCurrentStep(1);
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting medication:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="medicationName">Medication Name *</Label>
                <Input
                  id="medicationName"
                  placeholder="Enter medication name"
                  value={formData.medicationName}
                  onChange={(e) => updateField('medicationName', e.target.value)}
                  className={cn(errors.medicationName && "border-red-500")}
                />
                {errors.medicationName && (
                  <p className="text-sm text-red-500">{errors.medicationName}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    placeholder="e.g., Tylenol"
                    value={formData.brandName}
                    onChange={(e) => updateField('brandName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genericName">Generic Name</Label>
                  <Input
                    id="genericName"
                    placeholder="e.g., Acetaminophen"
                    value={formData.genericName}
                    onChange={(e) => updateField('genericName', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="strength">Strength *</Label>
                  <Input
                    id="strength"
                    placeholder="e.g., 500mg"
                    value={formData.strength}
                    onChange={(e) => updateField('strength', e.target.value)}
                    className={cn(errors.strength && "border-red-500")}
                  />
                  {errors.strength && (
                    <p className="text-sm text-red-500">{errors.strength}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="formulation">Form</Label>
                  <Select 
                    value={formData.formulation} 
                    onValueChange={(value) => updateField('formulation', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tablet">Tablet</SelectItem>
                      <SelectItem value="capsule">Capsule</SelectItem>
                      <SelectItem value="liquid">Liquid</SelectItem>
                      <SelectItem value="injection">Injection</SelectItem>
                      <SelectItem value="topical">Topical</SelectItem>
                      <SelectItem value="inhaler">Inhaler</SelectItem>
                      <SelectItem value="drops">Drops</SelectItem>
                      <SelectItem value="patch">Patch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <Card className="bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Pill className="h-5 w-5 text-blue-600" />
                  Dosage Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dosageAmount">Amount *</Label>
                    <Input
                      id="dosageAmount"
                      type="number"
                      min="0.1"
                      step="0.1"
                      placeholder="1"
                      value={formData.dosage.amount}
                      onChange={(e) => updateField('dosage.amount', parseFloat(e.target.value) || 0)}
                      className={cn(errors['dosage.amount'] && "border-red-500")}
                    />
                    {errors['dosage.amount'] && (
                      <p className="text-sm text-red-500">{errors['dosage.amount']}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="dosageUnit">Unit</Label>
                    <Select 
                      value={formData.dosage.unit} 
                      onValueChange={(value) => updateField('dosage.unit', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tablets">Tablets</SelectItem>
                        <SelectItem value="capsules">Capsules</SelectItem>
                        <SelectItem value="ml">ml</SelectItem>
                        <SelectItem value="mg">mg</SelectItem>
                        <SelectItem value="drops">Drops</SelectItem>
                        <SelectItem value="puffs">Puffs</SelectItem>
                        <SelectItem value="patches">Patches</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dosageRoute">Route</Label>
                    <Select 
                      value={formData.dosage.route} 
                      onValueChange={(value) => updateField('dosage.route', value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                        <SelectItem value="injection">Injection</SelectItem>
                        <SelectItem value="inhalation">Inhalation</SelectItem>
                        <SelectItem value="sublingual">Sublingual</SelectItem>
                        <SelectItem value="rectal">Rectal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Dosage Summary</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Take <strong>{formData.dosage.amount} {formData.dosage.unit}</strong> by <strong>{formData.dosage.route}</strong> route
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <Card className="bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-emerald-600" />
                  Schedule & Timing
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="frequency">Frequency *</Label>
                  <Select 
                    value={formData.schedule.frequency} 
                    onValueChange={handleFrequencyChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once_daily">Once Daily</SelectItem>
                      <SelectItem value="twice_daily">Twice Daily</SelectItem>
                      <SelectItem value="three_times_daily">Three Times Daily</SelectItem>
                      <SelectItem value="four_times_daily">Four Times Daily</SelectItem>
                      <SelectItem value="every_x_hours">Every X Hours</SelectItem>
                      <SelectItem value="as_needed">As Needed</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>Dosage Times</Label>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addCustomTime}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Time
                    </Button>
                  </div>
                  
                  {formData.schedule.times.length === 0 && (
                    <div className="text-center py-4 text-slate-500 dark:text-slate-400 text-sm">
                      No dosage times set. Please add at least one time.
                    </div>
                  )}

                  <div className="space-y-2">
                    {formData.schedule.times.map((time: any, index: number) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-lg border">
                        <Input
                          type="time"
                          value={time.time}
                          onChange={(e) => updateTime(index, 'time', e.target.value)}
                          className="w-32"
                        />
                        <Input
                          placeholder="Label (e.g., Morning)"
                          value={time.label || ''}
                          onChange={(e) => updateTime(index, 'label', e.target.value)}
                          className="flex-1"
                        />
                        <Select 
                          value={time.mealRelation || 'none'} 
                          onValueChange={(value) => updateTime(index, 'mealRelation', value === 'none' ? undefined : value)}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">No preference</SelectItem>
                            <SelectItem value="before_meal">Before meal</SelectItem>
                            <SelectItem value="with_meal">With meal</SelectItem>
                            <SelectItem value="after_meal">After meal</SelectItem>
                            <SelectItem value="empty_stomach">Empty stomach</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeTime(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  {errors['schedule.times'] && (
                    <p className="text-sm text-red-500">{errors['schedule.times']}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Duration</Label>
                  <Select 
                    value={formData.duration.type} 
                    onValueChange={(value) => updateField('duration.type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="indefinite">Ongoing / Indefinite</SelectItem>
                      <SelectItem value="until_date">Until specific date</SelectItem>
                      <SelectItem value="for_days">For specific number of days</SelectItem>
                      <SelectItem value="until_finished">Until bottle is finished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <Card className="bg-amber-50/50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                  Instructions & Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="generalInstructions">General Instructions</Label>
                  <Textarea
                    id="generalInstructions"
                    placeholder="General instructions for taking this medication..."
                    value={formData.instructions.generalInstructions}
                    onChange={(e) => updateField('instructions.generalInstructions', e.target.value)}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border">
                    <div>
                      <Label htmlFor="isActive">Active Medication</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enable reminders and tracking for this medication
                      </p>
                    </div>
                    <Switch
                      id="isActive"
                      checked={formData.isActive}
                      onCheckedChange={(checked) => updateField('isActive', checked)}
                    />
                  </div>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Summary</h4>
                  <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                    <p><strong>Medication:</strong> {formData.medicationName || 'Not specified'}</p>
                    <p><strong>Dosage:</strong> {formData.dosage.amount} {formData.dosage.unit}</p>
                    <p><strong>Frequency:</strong> {formData.schedule.frequency.replace('_', ' ')}</p>
                    <p><strong>Times:</strong> {formData.schedule.times.map((t: any) => t.time).join(', ') || 'None set'}</p>
                    <p><strong>Duration:</strong> {formData.duration.type.replace('_', ' ')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Plus className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            Add New Medication
          </DialogTitle>
          <DialogDescription>
            Set up a new medication schedule with reminders and tracking.
          </DialogDescription>
        </DialogHeader>

        {/* Progress Steps */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div 
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
                  currentStep >= step.id
                    ? "bg-blue-600 text-white"
                    : "bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400"
                )}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              {index < steps.length - 1 && (
                <div 
                  className={cn(
                    "w-8 h-0.5 mx-2",
                    currentStep > step.id 
                      ? "bg-blue-600" 
                      : "bg-slate-200 dark:bg-slate-700"
                  )} 
                />
              )}
            </div>
          ))}
        </div>

        {/* Current Step Title */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {steps[currentStep - 1].title}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            {steps[currentStep - 1].description}
          </p>
        </div>

        {/* Step Content */}
        <div className="mb-6">
          {renderStepContent()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          <div className="flex items-center gap-2">
            {currentStep < steps.length ? (
              <Button type="button" onClick={handleNext}>
                Next
              </Button>
            ) : (
              <Button 
                type="button" 
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                {submitting ? 'Creating...' : 'Create Medication'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
