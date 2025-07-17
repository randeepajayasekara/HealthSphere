/**
 * HealthSphere Contact & FAQ Data Seeding
 * Seeds the database with initial FAQ categories and items
 */

import { collection, doc, setDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from '@/backend/config';
import type { FAQCategory, FAQItem, ContactCategory } from '@/lib/firestore/contact-services';

/**
 * Seed FAQ categories and items
 */
export async function seedContactData(): Promise<void> {
  try {
    console.log('🌱 Starting contact data seeding...');
    
    await seedFAQCategories();
    await seedFAQItems();
    
    console.log('✅ Contact data seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding contact data:', error);
    throw error;
  }
}

/**
 * Seed FAQ categories
 */
async function seedFAQCategories(): Promise<void> {
  const categories: Omit<FAQCategory, 'id' | 'createdAt' | 'updatedAt'>[] = [
    {
      name: 'Getting Started',
      description: 'Learn the basics of using HealthSphere',
      icon: 'PlayCircle',
      order: 1,
      isActive: true
    },
    {
      name: 'Account & Profile',
      description: 'Manage your account settings and profile information',
      icon: 'User',
      order: 2,
      isActive: true
    },
    {
      name: 'Appointments',
      description: 'Schedule, modify, and manage your medical appointments',
      icon: 'Calendar',
      order: 3,
      isActive: true
    },
    {
      name: 'Medical Records',
      description: 'Access and understand your medical records',
      icon: 'FileText',
      order: 4,
      isActive: true
    },
    {
      name: 'Billing & Insurance',
      description: 'Payment methods, insurance claims, and billing questions',
      icon: 'CreditCard',
      order: 5,
      isActive: true
    },
    {
      name: 'UMID & Security',
      description: 'Universal Medical ID and security features',
      icon: 'Shield',
      order: 6,
      isActive: true
    },
    {
      name: 'Telemedicine',
      description: 'Virtual consultations and remote healthcare',
      icon: 'Video',
      order: 7,
      isActive: true
    },
    {
      name: 'Medications',
      description: 'Prescription management and medication schedules',
      icon: 'Pill',
      order: 8,
      isActive: true
    },
    {
      name: 'Privacy & Data',
      description: 'Data protection, privacy settings, and HIPAA compliance',
      icon: 'Lock',
      order: 9,
      isActive: true
    },
    {
      name: 'Technical Support',
      description: 'Troubleshooting and technical assistance',
      icon: 'Settings',
      order: 10,
      isActive: true
    }
  ];

  const batch = writeBatch(db);
  
  categories.forEach((category, index) => {
    const docRef = doc(collection(db, 'faqCategories'));
    batch.set(docRef, {
      ...category,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`✓ Seeded ${categories.length} FAQ categories`);
}

/**
 * Seed FAQ items
 */
async function seedFAQItems(): Promise<void> {
  const faqItems: Omit<FAQItem, 'id' | 'createdAt' | 'updatedAt' | 'categoryId'>[] = [
    // Getting Started
    {
      question: 'How do I create a new account on HealthSphere?',
      answer: 'To create a new account, click the "Register" button on the login page. Fill in your personal information, including your name, email, date of birth, and contact details. You\'ll also need to provide emergency contact information. After completing the registration form, verify your email address to activate your account.',
      tags: ['registration', 'account', 'signup', 'new user'],
      order: 1,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'What information do I need to register?',
      answer: 'You\'ll need to provide: personal information (name, date of birth, address), contact details (email, phone number), emergency contact information, and a secure password. You may also optionally upload a profile picture to help healthcare providers identify you.',
      tags: ['registration', 'required information', 'personal data'],
      order: 2,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'How do I navigate the dashboard?',
      answer: 'The HealthSphere dashboard is organized into sections: appointments, medical records, medications, and messaging. Use the navigation menu on the left to access different features. The main dashboard shows an overview of your recent activity, upcoming appointments, and important notifications.',
      tags: ['dashboard', 'navigation', 'interface'],
      order: 3,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },

    // Account & Profile
    {
      question: 'How do I update my profile information?',
      answer: 'Go to your Profile settings by clicking your avatar in the top right corner, then select "Profile Settings." You can update your personal information, contact details, emergency contacts, and upload a new profile picture. Remember to save your changes.',
      tags: ['profile', 'update', 'personal information'],
      order: 1,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'How do I change my password?',
      answer: 'Navigate to Account Settings > Security. Click "Change Password" and enter your current password followed by your new password. Make sure your new password is strong and unique. You\'ll receive an email confirmation once the password is successfully changed.',
      tags: ['password', 'security', 'account settings'],
      order: 2,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can request account deletion by contacting our support team. Please note that deleting your account will permanently remove all your data and cannot be undone. We recommend downloading your medical records before requesting deletion.',
      tags: ['account deletion', 'data removal', 'support'],
      order: 3,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },

    // Appointments
    {
      question: 'How do I schedule an appointment?',
      answer: 'Click on "Appointments" in the main menu, then select "Schedule New Appointment." Choose your preferred doctor, select an available date and time, specify the appointment type, and add any special notes. You\'ll receive a confirmation email once the appointment is booked.',
      tags: ['appointment', 'scheduling', 'booking'],
      order: 1,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'Can I reschedule or cancel an appointment?',
      answer: 'Yes, you can reschedule or cancel appointments up to 24 hours before the scheduled time. Go to your appointments list, find the appointment, and click "Reschedule" or "Cancel." Please note our cancellation policy to avoid fees.',
      tags: ['reschedule', 'cancel', 'appointment management'],
      order: 2,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'What types of appointments are available?',
      answer: 'We offer in-person consultations, telemedicine video calls, phone consultations, routine check-ups, specialist referrals, and follow-up appointments. The availability depends on your healthcare provider and the nature of your medical needs.',
      tags: ['appointment types', 'consultation', 'telemedicine'],
      order: 3,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },

    // Medical Records
    {
      question: 'How do I access my medical records?',
      answer: 'Navigate to "Medical Records" from the main menu. Here you can view all your medical history, including consultation notes, lab results, imaging reports, and prescriptions. Use the filters to find specific records by date, type, or healthcare provider.',
      tags: ['medical records', 'access', 'history'],
      order: 1,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'Can I download my medical records?',
      answer: 'Yes, you can download individual records or request a complete medical history export. Click the download icon next to any record, or use the "Export All Records" feature in the Medical Records settings. Files are available in PDF format.',
      tags: ['download', 'export', 'medical records'],
      order: 2,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'How do I share medical records with another doctor?',
      answer: 'Use the "Share" feature in your medical records section. Select the records you want to share, enter the doctor\'s information or healthcare facility details, and set access permissions. You can also generate a secure access link with expiration date.',
      tags: ['sharing', 'medical records', 'doctor access'],
      order: 3,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },

    // Billing & Insurance
    {
      question: 'How do I add my insurance information?',
      answer: 'Go to "Billing & Insurance" in your account settings. Click "Add Insurance Plan" and enter your insurance carrier details, policy number, group number, and upload a photo of your insurance card. This information will be used for appointment billing.',
      tags: ['insurance', 'billing', 'payment'],
      order: 1,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'How do I view my billing history?',
      answer: 'Navigate to "Billing & Insurance" and select "Billing History." You can view all past bills, payment status, insurance claims, and outstanding balances. Use filters to search by date range, service type, or payment status.',
      tags: ['billing', 'payment history', 'claims'],
      order: 2,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'What payment methods are accepted?',
      answer: 'We accept credit cards (Visa, MasterCard, American Express), debit cards, HSA/FSA cards, bank transfers, and online payment platforms. You can save multiple payment methods for convenience.',
      tags: ['payment methods', 'credit card', 'HSA', 'FSA'],
      order: 3,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },

    // UMID & Security
    {
      question: 'What is a Universal Medical ID (UMID)?',
      answer: 'UMID is a secure digital identity that contains your essential medical information. It includes emergency contacts, allergies, current medications, and critical health data. Healthcare providers can access this information quickly during emergencies using a QR code.',
      tags: ['UMID', 'medical ID', 'emergency', 'QR code'],
      order: 1,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'How do I create my UMID?',
      answer: 'Click on "Create UMID" in your dashboard or profile settings. Complete your medical profile including allergies, current medications, emergency contacts, and medical conditions. Your UMID will be generated with a secure QR code that you can save to your phone or print.',
      tags: ['UMID creation', 'setup', 'medical profile'],
      order: 2,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'How secure is my medical data?',
      answer: 'HealthSphere uses end-to-end encryption, multi-factor authentication, and HIPAA-compliant security measures. Your data is encrypted both in transit and at rest. We conduct regular security audits and follow strict access controls to protect your privacy.',
      tags: ['security', 'encryption', 'HIPAA', 'privacy'],
      order: 3,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },

    // Technical Support
    {
      question: 'The app is running slowly. What can I do?',
      answer: 'Try refreshing your browser, clearing your browser cache, or restarting the app. Check your internet connection and make sure you\'re using a supported browser (Chrome, Firefox, Safari, Edge). If problems persist, contact our technical support team.',
      tags: ['performance', 'slow', 'troubleshooting', 'browser'],
      order: 1,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'I\'m having trouble logging in. What should I do?',
      answer: 'Verify your email and password are correct. Try resetting your password using the "Forgot Password" link. Clear your browser cache and cookies. If you\'re still having issues, check if your account is locked due to multiple failed attempts.',
      tags: ['login', 'password', 'account access', 'troubleshooting'],
      order: 2,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    },
    {
      question: 'Which browsers are supported?',
      answer: 'HealthSphere supports the latest versions of Google Chrome, Mozilla Firefox, Safari, and Microsoft Edge. For the best experience, we recommend using Chrome or Firefox. Internet Explorer is not supported.',
      tags: ['browser', 'compatibility', 'requirements'],
      order: 3,
      isActive: true,
      viewCount: 0,
      helpfulVotes: 0,
      unhelpfulVotes: 0
    }
  ];

  // We'll need to get category IDs first to properly assign FAQ items
  // For now, we'll create a simplified version
  const batch = writeBatch(db);
  
  faqItems.forEach((item, index) => {
    const docRef = doc(collection(db, 'faqItems'));
    batch.set(docRef, {
      ...item,
      categoryId: 'general', // This would be replaced with actual category IDs
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
  });

  await batch.commit();
  console.log(`✓ Seeded ${faqItems.length} FAQ items`);
}

export default seedContactData;
