# HealthSphere Contact & Help System

A comprehensive contact and help system designed specifically for healthcare applications, featuring modern UI, FAQ management, and robust backend services.

## Features

### 📧 Contact Form

- **Healthcare-focused categories**: Medical records, appointment scheduling, billing & insurance, etc.
- **Priority levels**: Low, medium, high, urgent with automated ticket creation for high-priority items
- **User context awareness**: Pre-fills user information for authenticated users
- **Rich metadata**: Captures user agent, IP address, and source tracking
- **Real-time validation**: Client-side validation with detailed error messages

### ❓ FAQ System

- **Categorized FAQs**: 10+ healthcare-specific categories
- **Search functionality**: Full-text search across questions, answers, and tags
- **Analytics tracking**: View counts and helpfulness ratings
- **Dynamic filtering**: Filter by category and search terms
- **Interactive UI**: Expandable accordions with smooth animations

### 🎯 Support Options

- **Multiple contact methods**: Phone, email, live chat, video support
- **24/7 emergency support**: Dedicated emergency contact information
- **Response time tracking**: SLA monitoring and display
- **Support hours**: Clear display of availability and response times

### 🎨 UI/UX Features

- **Healthcare color scheme**: Professional red-based theme with dark mode support
- **Smooth animations**: Framer Motion animations throughout
- **Responsive design**: Mobile-first approach with adaptive layouts
- **Accessibility**: WCAG compliant with proper ARIA labels
- **Loading states**: Skeleton loaders and progress indicators

## Technical Architecture

### Frontend Components

``` typescript
app/(global)/contact/page.tsx          # Main contact page
hooks/use-contact.ts                   # Custom hook for contact functionality
components/admin/contact-seeding-button.tsx  # Admin seeding component
```

### Backend Services

``` typescript
lib/firestore/contact-services.ts     # Firestore service layer
app/utils/seed-contact-data.ts        # Data seeding utilities
```

### Data Models

- **ContactSubmission**: User inquiries with categorization and priority
- **SupportTicket**: Internal ticket management for high-priority items
- **FAQCategory**: Organized FAQ sections with icons and descriptions
- **FAQItem**: Individual FAQ entries with analytics
- **ContactAnalytics**: Performance metrics and reporting

## Installation & Setup

### 1. Install Dependencies

The required dependencies are already included in the main project:

- `framer-motion` for animations
- `lucide-react` for icons
- `react-hot-toast` for notifications
- `firebase` for backend services

### 2. Database Setup

Seed the initial FAQ data:

```typescript
import seedContactData from "@/app/utils/seed-contact-data";

// Run seeding (typically in admin panel or development setup)
await seedContactData();
```

Or use the admin component:

```tsx
import ContactSeedingButton from "@/app/components/admin/contact-seeding-button";

// In your admin panel
<ContactSeedingButton />;
```

### 3. Configuration

The system uses the existing Firebase configuration from `@/backend/config`.

## Usage Examples

### Basic Contact Form

```tsx
import ContactPage from "@/app/(global)/contact/page";

function App() {
  return <ContactPage />;
}
```

### Custom Contact Hook

```tsx
import { useContact } from "@/hooks/use-contact";

function MyComponent() {
  const { isSubmitting, submitSuccess, faqCategories, submitContactForm } =
    useContact({
      onSuccess: (submissionId) => {
        console.log("Form submitted:", submissionId);
      },
    });

  // Use the hook data and functions
}
```

### Real-time Submissions (Admin)

```tsx
import { useContactSubmissionsRealtime } from "@/hooks/use-contact";

function AdminDashboard() {
  const { submissions } = useContactSubmissionsRealtime({
    status: "submitted",
  });

  return (
    <div>
      {submissions.map((submission) => (
        <div key={submission.id}>
          {submission.subject} - {submission.priority}
        </div>
      ))}
    </div>
  );
}
```

## Data Structure

### Contact Categories

- `general_inquiry` - General questions and information
- `technical_support` - Technical issues and troubleshooting
- `billing_insurance` - Payment and insurance related queries
- `medical_records` - Medical record access and management
- `appointment_scheduling` - Appointment booking and modifications
- `emergency_assistance` - Urgent medical or technical issues
- `feature_request` - Suggestions for new features
- `bug_report` - Software bug reports
- `account_access` - Login and account issues
- `privacy_security` - Data protection and security concerns
- `other` - Miscellaneous inquiries

### Priority Levels

- `low` - General questions, low urgency
- `medium` - Standard support requests
- `high` - Important issues requiring prompt attention
- `urgent` - Critical issues requiring immediate response

## Security Features

### Data Protection

- **Input sanitization**: All user inputs are sanitized before storage
- **Medical data compliance**: HIPAA-compliant data handling
- **Access logging**: Comprehensive audit trails for all operations
- **Rate limiting**: Built-in protection against spam and abuse

### Authentication Integration

- **User context**: Leverages existing authentication system
- **Role-based access**: Different features for different user roles
- **Permission checking**: Validates user permissions for sensitive operations

## Analytics & Reporting

### FAQ Analytics

- **View tracking**: Monitors which FAQs are most accessed
- **Helpfulness ratings**: Collects user feedback on FAQ quality
- **Search analytics**: Tracks search terms and patterns

### Contact Metrics

- **Response time tracking**: Monitors SLA compliance
- **Category analysis**: Identifies common issue types
- **Resolution rates**: Tracks successful issue resolution
- **Satisfaction scoring**: Measures customer satisfaction

## Customization

### Styling

The system uses Tailwind CSS with healthcare-appropriate colors:

- **Primary**: Red-based color scheme (`red-600`, `red-700`, `red-800`)
- **Dark mode**: Zinc-based backgrounds (`zinc-900`, `zinc-950`)
- **Accents**: Green for success, yellow for warnings, red for errors

### Content Management

FAQ content can be managed through:

1. **Database seeding**: Initial content setup
2. **Admin interface**: Runtime content management
3. **API integration**: Programmatic content updates

### Internationalization

The system is designed to support multiple languages:

- **Text externalization**: All user-facing text can be externalized
- **RTL support**: Layout supports right-to-left languages
- **Date/time localization**: Proper locale-aware formatting

## Performance Optimizations

### Frontend

- **Code splitting**: Lazy loading of FAQ data
- **Debounced search**: Optimized search performance
- **Memoized components**: Reduced re-renders
- **Optimistic updates**: Immediate UI feedback

### Backend

- **Indexed queries**: Optimized Firestore queries
- **Pagination**: Efficient data loading
- **Caching**: Smart caching strategies
- **Batch operations**: Bulk data operations

## Integration with HealthSphere

### Existing Systems

- **Authentication**: Uses existing user authentication
- **Navigation**: Integrates with global navigation
- **Theming**: Follows established design system
- **Analytics**: Connects to existing analytics pipeline

### Data Relationships

- **User profiles**: Links to user account data
- **Medical records**: Can reference medical data (with permissions)
- **Appointments**: Integrates with appointment system
- **Billing**: Connects to billing and insurance systems

## Deployment Checklist

- [ ] Firebase configuration verified
- [ ] FAQ data seeded
- [ ] Email notifications configured
- [ ] Analytics tracking enabled
- [ ] Security rules updated
- [ ] Performance monitoring active
- [ ] Error tracking configured
- [ ] User permissions verified

## Support & Maintenance

### Regular Tasks

- **Content updates**: Keep FAQ content current
- **Performance monitoring**: Track response times and user satisfaction
- **Security audits**: Regular security reviews
- **Data cleanup**: Archive old submissions and optimize storage

### Troubleshooting

Common issues and solutions:

- **Missing FAQ data**: Run seeding script
- **Slow performance**: Check Firestore indexes
- **Authentication errors**: Verify user permissions
- **Form submission failures**: Check network connectivity and validation

## Contributing

When contributing to the contact system:

1. Follow the established code patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure accessibility compliance
5. Test across different devices and browsers

## License

This contact system is part of the HealthSphere platform and follows the same licensing terms.
