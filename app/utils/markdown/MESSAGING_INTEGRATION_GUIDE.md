# HealthSphere Messaging System Integration Guide

## Overview

The HealthSphere messaging system is designed as a modular, role-based communication platform that seamlessly integrates with existing healthcare workflows. This guide provides integration mappings and implementation strategies for connecting the messaging system with other HealthSphere modules.

## Architecture Summary

The messaging system follows a microservice-like architecture with clean separation of concerns:

- **Frontend Components**: Reusable UI components with healthcare-specific design patterns
- **Backend Services**: Firestore-based services with role-based access control
- **Real-time Updates**: WebSocket-like subscriptions for live messaging
- **Integration Layer**: Standardized APIs for connecting with other modules

## Core Components

### 1. Message Service (`message-services.ts`)

```typescript
// Primary service for message operations
MessageService.createConversation();
MessageService.sendMessage();
MessageService.getUserConversations();
MessageService.getConversationMessages();
```

### 2. Real-time Service (`ConversationRealtimeService`)

```typescript
// Real-time updates and subscriptions
ConversationRealtimeService.subscribeToConversation();
ConversationRealtimeService.unsubscribeFromConversation();
```

### 3. UI Components (`messages/page.tsx`)

- Conversation sidebar with role-based filtering
- Real-time message display
- Professional healthcare design system
- Dark/light mode support

## Integration Mappings

### 1. User Management Integration

**Connection Points:**

- `User` type from main types system
- Role-based conversation filtering
- Profile image and status integration

**Implementation:**

```typescript
// Integrate with existing user service
import { UserService } from "@/lib/firestore/user-services";

// Example integration in message component
const users = await UserService.getUsersByRole("doctor");
```

**Required Interfaces:**

- `User` type compatibility
- `UserRole` enumeration
- Authentication context integration

### 2. Notification System Integration

**Connection Points:**

- Message notifications creation
- Real-time notification delivery
- Role-based notification preferences

**Implementation:**

```typescript
// Auto-create notifications for new messages
await MessageService.createMessageNotifications(
  conversationId,
  senderId,
  messageContent
);
```

**Required Services:**

- Notification service for delivery
- User preference management
- Push notification handling

### 3. Patient Management Integration

**Connection Points:**

- Patient-doctor conversations
- Medical record context in messages
- Appointment-related discussions

**Implementation:**

```typescript
// Link conversations to patient records
const conversation = await MessageService.createConversation(
  [doctorId, patientId],
  doctorId,
  `Patient Consultation - ${patient.firstName} ${patient.lastName}`
);
```

**Data Flow:**

```
Patient Record → Conversation Creation → Message Context → Medical History
```

### 4. Appointment System Integration

**Connection Points:**

- Appointment confirmation messages
- Scheduling discussions
- Pre/post appointment communication

**Implementation:**

```typescript
// Create appointment-specific conversations
const appointmentConversation = await MessageService.createConversation(
  [doctorId, patientId],
  doctorId,
  `Appointment Discussion - ${appointmentDate}`,
  false,
  { appointmentId, type: "appointment" }
);
```

### 5. Emergency Alert Integration

**Connection Points:**

- Emergency broadcast messages
- Critical patient alerts
- Staff coordination during emergencies

**Implementation:**

```typescript
// Emergency broadcast to all available staff
const emergencyConversation = await MessageService.createConversation(
  availableStaffIds,
  emergencyInitiatorId,
  `EMERGENCY - ${emergencyType}`,
  true,
  { priority: "emergency", broadcast: true }
);
```

### 6. Department Management Integration

**Connection Points:**

- Department-specific conversations
- Shift handover communications
- Resource coordination messages

**Implementation:**

```typescript
// Department communication channels
const departmentConversation = await MessageService.createConversation(
  departmentStaffIds,
  headDoctorId,
  `${departmentName} - Daily Coordination`,
  true,
  { departmentId, persistent: true }
);
```

## Role-Based Access Control

### Permission Matrix

| Role         | Create Conversation | Message Patients | Message Staff | Emergency Broadcast | Archive Messages |
| ------------ | ------------------- | ---------------- | ------------- | ------------------- | ---------------- |
| Patient      | ✓ (Limited)         | ✗                | ✓ (Assigned)  | ✗                   | ✓ (Own)          |
| Doctor       | ✓                   | ✓                | ✓             | ✓                   | ✓                |
| Nurse        | ✓                   | ✓ (Assigned)     | ✓             | ✓ (Department)      | ✓                |
| Admin        | ✓                   | ✓                | ✓             | ✓                   | ✓                |
| Receptionist | ✓ (Limited)         | ✓ (Scheduling)   | ✓ (Limited)   | ✗                   | ✓ (Limited)      |

### Implementation Example

```typescript
// Role-based message filtering
const canMessageUser = (
  currentUserRole: UserRole,
  targetUserRole: UserRole
) => {
  const permissions = {
    patient: ["doctor", "nurse", "receptionist"],
    doctor: ["patient", "doctor", "nurse", "admin", "receptionist"],
    nurse: ["patient", "doctor", "nurse", "admin"],
    admin: ["patient", "doctor", "nurse", "admin", "receptionist"],
    receptionist: ["patient", "doctor", "nurse", "admin"],
  };

  return permissions[currentUserRole]?.includes(targetUserRole) || false;
};
```

## Database Schema Integration

### Firestore Collections

```
/conversations
  /{conversationId}
    - participants: string[]
    - title: string
    - lastMessageAt: timestamp
    - isGroupConversation: boolean
    - metadata: object

/messages
  /{messageId}
    - conversationId: string
    - senderId: string
    - content: string
    - attachments: array
    - createdAt: timestamp
    - isRead: boolean

/users (Existing)
  /{userId}
    - role: UserRole
    - firstName: string
    - lastName: string
    - profileImageUrl: string
```

### Security Rules

```javascript
// Firestore security rules for messages
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /conversations/{conversationId} {
      allow read, write: if request.auth.uid in resource.data.participants;
    }

    match /messages/{messageId} {
      allow read: if request.auth.uid in get(/databases/$(database)/documents/conversations/$(resource.data.conversationId)).data.participants;
      allow create: if request.auth.uid == resource.data.senderId;
    }
  }
}
```

## API Endpoints for Integration

### REST API Compatibility

```typescript
// Express.js style endpoints for external integration
app.post("/api/conversations", createConversation);
app.get("/api/conversations/:userId", getUserConversations);
app.post("/api/messages", sendMessage);
app.get("/api/messages/:conversationId", getMessages);

// Webhook endpoints for external systems
app.post("/api/webhooks/appointment-created", handleAppointmentCreated);
app.post("/api/webhooks/emergency-alert", handleEmergencyAlert);
```

### GraphQL Schema (Optional)

```graphql
type Conversation {
  id: ID!
  participants: [User!]!
  title: String
  messages: [Message!]!
  lastMessageAt: DateTime!
}

type Message {
  id: ID!
  sender: User!
  content: String!
  createdAt: DateTime!
  attachments: [Attachment!]!
}

type Mutation {
  createConversation(input: CreateConversationInput!): Conversation!
  sendMessage(input: SendMessageInput!): Message!
}
```

## Frontend Integration Patterns

### 1. Component Composition

```typescript
// Embed messaging in other modules
import { MessageWidget } from "@/components/messages/message-widget";

const PatientDashboard = () => (
  <div>
    <PatientInfo />
    <MessageWidget patientId={patientId} />
    <AppointmentScheduler />
  </div>
);
```

### 2. Context Providers

```typescript
// Message context for global state
import { MessageProvider, useMessages } from "@/contexts/message-context";

const App = () => (
  <MessageProvider>
    <Dashboard />
  </MessageProvider>
);
```

### 3. Hook-based Integration

```typescript
// Custom hooks for message functionality
const usePatientMessages = (patientId: string) => {
  // Implementation
};

const useEmergencyBroadcast = () => {
  // Implementation
};
```

## Performance Considerations

### 1. Message Pagination

- Implement virtual scrolling for large conversation histories
- Lazy load older messages on demand
- Cache frequently accessed conversations

### 2. Real-time Optimization

- Use connection pooling for WebSocket connections
- Implement message batching for high-frequency updates
- Add offline message queuing

### 3. Media Handling

- Compress images and files before sending
- Use CDN for media storage and delivery
- Implement progressive media loading

## Security Integration

### 1. Medical Data Protection

- Encrypt sensitive message content
- Implement automatic message expiration for sensitive data
- Add audit trails for all message access

### 2. Compliance Features

- HIPAA-compliant message handling
- Message retention policies
- Data anonymization for research purposes

## Testing Strategy

### 1. Unit Tests

```typescript
// Example test for message service
describe("MessageService", () => {
  test("should create conversation with proper participants", async () => {
    const conversationId = await MessageService.createConversation(
      ["user1", "user2"],
      "user1"
    );
    expect(conversationId).toBeDefined();
  });
});
```

### 2. Integration Tests

- Test message flow between different roles
- Verify real-time update functionality
- Test notification delivery integration

### 3. E2E Tests

- Complete conversation workflows
- Cross-module integration scenarios
- Performance under load

## Deployment and Monitoring

### 1. Monitoring Points

- Message delivery success rates
- Real-time connection stability
- Database query performance
- User engagement metrics

### 2. Error Handling

- Graceful degradation for offline scenarios
- Message retry mechanisms
- Connection recovery strategies

### 3. Scaling Considerations

- Horizontal scaling for high message volumes
- Database sharding strategies
- CDN configuration for global access

## Future Integration Possibilities

### 1. AI Integration

- Smart message routing based on content
- Automated response suggestions
- Sentiment analysis for patient communications

### 2. Voice/Video Integration

- WebRTC integration for voice/video calls
- Voice message transcription
- Screen sharing for consultations

### 3. IoT Device Integration

- Patient monitoring device alerts
- Medication reminder integration
- Emergency device notifications

## Support and Maintenance

### 1. Version Management

- Semantic versioning for API changes
- Backward compatibility strategies
- Migration guides for updates

### 2. Documentation

- API documentation with examples
- Integration guides for each module
- Troubleshooting guides

### 3. Community Support

- Developer forums for integration questions
- Code examples repository
- Regular webinars for new features

---

This integration guide provides a comprehensive roadmap for implementing and extending the HealthSphere messaging system. The modular design ensures that new features can be added without disrupting existing functionality, while the role-based architecture maintains appropriate access controls for healthcare environments.

For specific implementation questions or custom integration requirements, please refer to the detailed API documentation or contact the development team.
