# Profile System Integration Guide

## Overview

The HealthSphere Profile System is designed as a modular, role-based architecture that can be easily extended and integrated with future features. This document outlines the integration patterns and interfaces for seamless component development.

## Architecture Overview

``` bash
Profile System
├── Core Context Layer (profile-context.tsx)
├── UI Components Layer (profile sections)
├── Data Access Layer (Firestore collections)
└── Integration Layer (hooks and utilities)
```

## Core Components

### 1. ProfileContext (`profile-context.tsx`)

**Purpose**: Centralized state management for profile data across all user roles.

**Key Features**:

- Role-agnostic data loading
- Modular collection-based architecture
- Automatic data synchronization
- Error handling and loading states

**Integration Points**:

```typescript
// Easy integration for new features
const { profileData, updatePersonalInfo, isLoading } = useProfile();
```

### 2. Section Components

Each profile section is a standalone component that can be integrated independently:

- `PersonalInfoSection` - Basic user information
- `ContactInfoSection` - Contact details and emergency contacts
- `MedicalInfoSection` - Health information (role-restricted)
- `SecuritySection` - Account security and authentication
- `AccessibilitySection` - Accessibility preferences
- `PreferencesSection` - Application preferences
- `ActivitySection` - Account activity and sessions

## Database Schema Integration

### Collection Structure

``` typescript
users/{userId}                    // Main user document
patients/{userId}                 // Patient-specific data
doctors/{userId}                  // Doctor-specific data
nurses/{userId}                   // Nurse-specific data
admins/{userId}                   // Admin-specific data
receptionists/{userId}            // Receptionist-specific data
pharmacists/{userId}              // Pharmacist-specific data
labTechnicians/{userId}           // Lab technician-specific data
hospitalManagement/{userId}       // Hospital management-specific data
userPreferences/{userId}          // User preferences
accessibilitySettings/{userId}    // Accessibility settings
```

### Adding New Collections

To add a new role or data collection:

1. **Update Types** (`types/index.ts`):

```typescript
export interface NewRoleProfile extends User {
  role: "new_role";
  specificField: string;
  // Add role-specific fields
}
```

2. **Update ProfileContext**:

```typescript
// Add loading function in profile-context.tsx
const loadNewRoleData = async (userId: string, profile: ProfileData) => {
  try {
    const newRoleDocRef = doc(db, "newRoles", userId);
    const newRoleDoc = await getDoc(newRoleDocRef);

    if (newRoleDoc.exists()) {
      const newRoleData = newRoleDoc.data();
      profile.personalInfo = {
        ...profile.personalInfo,
        ...newRoleData,
      };
    }
  } catch (err) {
    console.error("Error loading new role data:", err);
  }
};
```

3. **Update Role Collection Map**:

```typescript
const roleCollectionMap = {
  // existing roles...
  new_role: "newRoles",
};
```

## Feature Integration Patterns

### 1. Adding New Profile Sections

```typescript
// 1. Create section component
export function NewFeatureSection({ user }: { user: User }) {
  const { updateSectionData, isLoading } = useProfile();

  // Component implementation
  return <Card>{/* Section content */}</Card>;
}

// 2. Add to navigation (profile-navigation.tsx)
const navigationItems: NavigationItem[] = [
  // existing items...
  {
    id: "new_feature",
    label: "New Feature",
    icon: NewIcon,
    description: "New feature description",
    roles: ["patient", "doctor"], // Specify allowed roles
  },
];

// 3. Add to main profile page
const sectionComponents = {
  // existing sections...
  new_feature: NewFeatureSection,
};
```

### 2. Role-Based Access Control

```typescript
// Component-level access control
if (!["patient", "doctor", "nurse"].includes(user.role)) {
  return <AccessDeniedComponent />;
}

// Navigation-level filtering
const availableItems = navigationItems.filter((item) =>
  item.roles.includes(userRole)
);
```

### 3. Data Validation Hooks

```typescript
// Custom validation hook
export const useProfileValidation = () => {
  const validatePersonalInfo = (data: Partial<User>) => {
    const errors: Record<string, string> = {};

    if (!data.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    return { isValid: Object.keys(errors).length === 0, errors };
  };

  return { validatePersonalInfo };
};
```

## Theme and Styling Integration

### Color Scheme

```css
/* Healthcare-focused color palette */
:root {
  --healthcare-primary: #10b981; /* Emerald */
  --healthcare-secondary: #06b6d4; /* Cyan */
  --healthcare-accent: #8b5cf6; /* Violet */
  --healthcare-warning: #f59e0b; /* Amber */
  --healthcare-error: #ef4444; /* Red */
  --healthcare-success: #22c55e; /* Green */
}
```

### Component Styling Pattern

```typescript
// Consistent styling pattern across components
<Card className="border-zinc-200 dark:border-zinc-800">
  <CardHeader>
    <div className="flex items-center space-x-2">
      <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      <CardTitle className="text-lg">Section Title</CardTitle>
    </div>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

## Future Feature Hooks

### 1. UMID Integration

```typescript
// Reserved hook for UMID system
export const useUMIDIntegration = () => {
  // Future implementation
  return {
    generateUMID: () => {},
    validateUMID: () => {},
    linkMedicalData: () => {},
  };
};
```

### 2. Health Assistant Integration

```typescript
// Reserved hook for AI health assistant
export const useHealthAssistant = () => {
  // Future implementation
  return {
    analyzeProfile: () => {},
    generateRecommendations: () => {},
    processHealthQuery: () => {},
  };
};
```

### 3. Medication Scheduler Integration

```typescript
// Reserved hook for medication management
export const useMedicationScheduler = () => {
  // Future implementation
  return {
    createSchedule: () => {},
    updateReminders: () => {},
    trackAdherence: () => {},
  };
};
```

## Integration Checklist

When adding new features to the profile system:

- [ ] Update type definitions in `types/index.ts`
- [ ] Add Firestore collection schema
- [ ] Create/update context providers
- [ ] Implement role-based access control
- [ ] Add navigation menu items
- [ ] Create section components
- [ ] Follow consistent styling patterns
- [ ] Add proper error handling
- [ ] Include loading states
- [ ] Write integration tests
- [ ] Update documentation

## Error Handling Patterns

```typescript
// Consistent error handling across components
try {
  await updateFunction(data);
  toast.success("Update successful");
} catch (error) {
  console.error("Error updating:", error);
  toast.error("Failed to update. Please try again.");
  // Revert state if necessary
}
```

## Performance Considerations

1. **Lazy Loading**: Section components are loaded on-demand
2. **Data Caching**: Profile context caches data to minimize API calls
3. **Optimistic Updates**: UI updates immediately with rollback on error
4. **Role-based Loading**: Only load data relevant to user role

## Testing Integration

```typescript
// Mock profile context for testing
export const MockProfileProvider = ({ children, mockData }) => {
  return (
    <ProfileContext.Provider value={mockData}>
      {children}
    </ProfileContext.Provider>
  );
};
```

## Conclusion

This modular architecture ensures that:

- New features can be added without breaking existing functionality
- Role-based access is consistently enforced
- UI components are reusable and maintainable
- Data flow is predictable and debuggable
- Future integrations follow established patterns

The profile system serves as a foundation for the entire HealthSphere application, providing a robust and scalable user management experience.
