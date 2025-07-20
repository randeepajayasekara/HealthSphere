# Medication Schedule Integration Guide

## Overview

The Medication Schedule module is designed as a modular, role-based system that integrates seamlessly with the HealthSphere ecosystem. This guide outlines how to integrate with existing and future modules.

## Architecture Overview

### Core Components

```
medication-schedule/
├── services/
│   ├── medication-services.ts     # Firestore data layer
│   ├── reminder-services.ts       # Notification management
│   └── analytics-services.ts      # Adherence analytics
├── hooks/
│   ├── use-medication-schedule.ts # Main hook for data management
│   └── use-medication-form.ts     # Form state management
├── components/
│   ├── schedule-list.tsx          # Medication list display
│   ├── adherence-tracker.tsx      # Adherence monitoring
│   ├── reminder-panel.tsx         # Reminder management
│   └── analytics-dashboard.tsx    # Statistics and insights
└── types/
    └── medication-types.ts        # Type definitions
```

## Database Schema

### Firestore Collections

#### `medicationSchedules`

```typescript
{
  id: string;
  patientId: string;
  prescriptionId?: string;          // Links to prescriptions module
  medicationName: string;
  dosage: MedicationDosage;
  schedule: DosageSchedule;
  adherence: MedicationAdherence;
  isActive: boolean;
  createdBy: UserRole;
  createdAt: Timestamp;
  lastModified: Timestamp;
  modifiedBy: string;
}
```

#### `medicationReminders`

```typescript
{
  id: string;
  scheduleId: string;
  reminderType: 'push_notification' | 'sms' | 'email';
  scheduledTime: Timestamp;
  status: 'pending' | 'sent' | 'delivered' | 'dismissed';
  patientId: string;
  deliveryAttempts: ReminderDeliveryAttempt[];
}
```

#### `adherenceRecords`

```typescript
{
  id: string;
  scheduleId: string;
  patientId: string;
  date: Timestamp;
  scheduledTime: string;
  actualTime?: Timestamp;
  status: 'taken' | 'missed' | 'late' | 'skipped';
  notes?: string;
  sideEffects?: string[];
  effectiveness?: number;
}
```

## Role-Based Access Control

### Patient Role

- **Full Access**: Own medication schedules
- **Actions**: Create, read, update personal schedules
- **Restrictions**: Cannot access other patients' data

### Doctor Role

- **Access**: Patients under their care
- **Actions**: Create, read, update medication schedules
- **Special**: Can prescribe and modify dosages

### Nurse Role

- **Access**: Assigned patients/departments
- **Actions**: Read, update adherence records
- **Special**: Can administer medications and record adherence

### Pharmacist Role

- **Access**: All active prescriptions
- **Actions**: Read, validate, provide alternatives
- **Special**: Integration with prescription analyzer

### Admin/Hospital Management

- **Access**: System-wide with privacy controls
- **Actions**: All operations, analytics, reporting
- **Special**: Performance metrics and resource planning

## Integration Points

### 1. Prescriptions Module

```typescript
// Auto-create medication schedule from prescription
interface PrescriptionIntegration {
  createScheduleFromPrescription(prescriptionId: string): Promise<string>;
  linkPrescriptionToSchedule(
    prescriptionId: string,
    scheduleId: string
  ): Promise<void>;
  syncDosageChanges(prescriptionId: string): Promise<void>;
}
```

### 2. Notifications System

```typescript
// Reminder delivery integration
interface NotificationIntegration {
  scheduleReminder(reminder: MedicationReminder): Promise<void>;
  sendAdherenceAlert(patientId: string, alert: AdherenceAlert): Promise<void>;
  notifyHealthcareProvider(
    providerId: string,
    concern: HealthConcern
  ): Promise<void>;
}
```

### 3. Patient Dashboard

```typescript
// Dashboard widget integration
interface DashboardIntegration {
  getTodaysMedications(patientId: string): Promise<TodayMedication[]>;
  getAdherenceOverview(patientId: string): Promise<AdherenceStats>;
  getUpcomingReminders(patientId: string): Promise<MedicationReminder[]>;
}
```

### 4. Telemedicine Module

```typescript
// Virtual consultation integration
interface TelemedicineIntegration {
  shareScheduleDuringConsult(
    consultId: string,
    scheduleIds: string[]
  ): Promise<void>;
  updateScheduleFromConsult(
    consultId: string,
    updates: ScheduleUpdate[]
  ): Promise<void>;
  recordConsultationNotes(scheduleId: string, notes: string): Promise<void>;
}
```

### 5. Lab Results Module

```typescript
// Medication effectiveness correlation
interface LabResultsIntegration {
  correlateMedicationWithResults(
    patientId: string,
    timeframe: TimeRange
  ): Promise<Correlation[]>;
  flagAbnormalResultsWithMedications(
    labResultId: string
  ): Promise<MedicationAlert[]>;
  adjustDosageBasedOnResults(
    scheduleId: string,
    labData: LabData
  ): Promise<DosageRecommendation>;
}
```

### 6. Billing Module

```typescript
// Medication cost tracking
interface BillingIntegration {
  trackMedicationCosts(patientId: string): Promise<MedicationCost[]>;
  generateInsuranceClaims(scheduleIds: string[]): Promise<InsuranceClaim[]>;
  calculateAdherenceSavings(patientId: string): Promise<CostSavings>;
}
```

## API Endpoints

### RESTful API Design

```typescript
// Medication Schedules
GET    /api/medications/schedules              // List schedules (role-based)
POST   /api/medications/schedules              // Create schedule
GET    /api/medications/schedules/:id          // Get specific schedule
PUT    /api/medications/schedules/:id          // Update schedule
DELETE /api/medications/schedules/:id          // Deactivate schedule

// Adherence Tracking
POST   /api/medications/adherence              // Record adherence
GET    /api/medications/adherence/:scheduleId  // Get adherence history
GET    /api/medications/analytics/:patientId   // Get adherence analytics

// Reminders
GET    /api/medications/reminders              // Get pending reminders
PUT    /api/medications/reminders/:id          // Update reminder status
POST   /api/medications/reminders/snooze       // Snooze reminder
```

## Event System

### Event Types

```typescript
type MedicationEvent =
  | "medication_schedule_created"
  | "medication_taken"
  | "medication_missed"
  | "adherence_goal_reached"
  | "reminder_sent"
  | "schedule_modified";

interface EventHandler {
  onMedicationTaken(event: MedicationTakenEvent): Promise<void>;
  onMedicationMissed(event: MedicationMissedEvent): Promise<void>;
  onAdherenceGoalReached(event: AdherenceGoalEvent): Promise<void>;
}
```

### Example Integrations

```typescript
// Notify doctor when patient misses multiple doses
eventBus.on("medication_missed", async (event) => {
  const consecutiveMisses = await getConsecutiveMissedDoses(event.scheduleId);
  if (consecutiveMisses >= 3) {
    await notificationService.notifyProvider(event.doctorId, {
      type: "adherence_concern",
      patientId: event.patientId,
      medicationName: event.medicationName,
      consecutiveMisses,
    });
  }
});

// Update health score when adherence improves
eventBus.on("adherence_goal_reached", async (event) => {
  await healthScoreService.updateScore(event.patientId, {
    category: "medication_adherence",
    improvement: event.improvementPercentage,
  });
});
```

## Security Considerations

### Data Encryption

- All medication data encrypted at rest
- PII fields use field-level encryption
- Secure key management for UMID integration

### Access Control

- Role-based permissions enforced at API level
- Audit logging for all medication-related actions
- Patient consent tracking for data sharing

### HIPAA Compliance

- Minimal data exposure principle
- Secure data transmission (TLS 1.3)
- Regular access log reviews
- Data retention policies

## Performance Optimization

### Caching Strategy

```typescript
// Cache frequently accessed data
const cacheConfig = {
  patientSchedules: { ttl: "5m", strategy: "lru" },
  adherenceStats: { ttl: "1h", strategy: "lru" },
  reminderQueue: { ttl: "1m", strategy: "fifo" },
};
```

### Database Indexing

```javascript
// Firestore composite indexes
db.collection("medicationSchedules").createIndex({
  patientId: 1,
  isActive: 1,
  lastModified: -1,
});

db.collection("adherenceRecords").createIndex({ scheduleId: 1, date: -1 });

db.collection("medicationReminders").createIndex({
  patientId: 1,
  status: 1,
  scheduledTime: 1,
});
```

## Future Integrations

### Planned Modules

1. **Wearable Device Integration**

   - Automatic adherence detection
   - Vital sign correlation
   - Smart reminder timing

2. **AI Health Assistant**

   - Medication interaction checking
   - Side effect monitoring
   - Dosage optimization suggestions

3. **Pharmacy Network**

   - Prescription fulfillment
   - Cost comparison
   - Home delivery integration

4. **Insurance Integration**
   - Real-time coverage verification
   - Prior authorization automation
   - Cost optimization

## Testing Strategy

### Unit Tests

```typescript
// Service layer testing
describe("MedicationScheduleService", () => {
  test("creates schedule with proper validation", async () => {
    const schedule = createMockSchedule();
    const scheduleId = await MedicationScheduleService.createSchedule(schedule);
    expect(scheduleId).toBeDefined();
  });
});
```

### Integration Tests

```typescript
// Cross-module integration
describe("Prescription to Schedule Integration", () => {
  test("creates schedule from prescription", async () => {
    const prescription = await createTestPrescription();
    const scheduleId = await createScheduleFromPrescription(prescription.id);
    const schedule = await getSchedule(scheduleId);
    expect(schedule.prescriptionId).toBe(prescription.id);
  });
});
```

## Deployment Considerations

### Environment Configuration

```typescript
const config = {
  development: {
    reminderFrequency: "1m",
    batchSize: 10,
    enableTestReminders: true,
  },
  production: {
    reminderFrequency: "5m",
    batchSize: 100,
    enableTestReminders: false,
  },
};
```

### Monitoring & Alerts

- Adherence rate monitoring
- Reminder delivery tracking
- System performance metrics
- Error rate alerts

This modular design ensures the medication schedule system can grow with the HealthSphere platform while maintaining security, performance, and user experience standards.
