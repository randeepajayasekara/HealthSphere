/**
 * Doctor Profile Demo Data Seeding Script
 * This script creates demo data for doctor profiles, appointments, and analytics
 */

import { DoctorProfile, User, Education, Experience, AvailabilitySchedule } from '@/app/types';

// Mock doctor users
const mockDoctorUsers: User[] = [
  {
    id: 'doctor_1',
    email: 'john.smith@healthsphere.com',
    firstName: 'John',
    lastName: 'Smith',
    role: 'doctor',
    phone: '+1-555-0123',
    dateOfBirth: new Date('1980-05-15'),
    gender: 'male',
    address: {
      street: '123 Medical Drive',
      city: 'New York',
      state: 'NY',
      postalCode: '10001',
      country: 'USA'
    },
    profileImageUrl: '/api/placeholder/150/150',
    createdAt: new Date('2020-01-15'),
    updatedAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-15'),
    isActive: true,
    isEmailVerified: true,
    emergencyContact: {
      name: 'Jane Smith',
      relationship: 'spouse',
      phone: '+1-555-0124',
      email: 'jane.smith@email.com'
    },
    twoFactorEnabled: true,
    accountLocked: false,
    failedLoginAttempts: 0,
    passwordLastChanged: new Date('2024-01-01'),
    sessionTokens: [],
    accessibilitySettings: {
      oversizedWidget: false,
      screenReader: false,
      contrast: false,
      smartContrast: false,
      highlightLinks: false,
      biggerText: false,
      textSpacing: false,
      pauseAnimations: false,
      hideImages: false,
      dyslexiaFriendly: false,
      cursor: false,
      tooltips: false,
      pageStructure: false,
      lineHeight: 1.5,
      textAlign: 'left',
      dictionary: false
    }
  },
  {
    id: 'doctor_2',
    email: 'sarah.johnson@healthsphere.com',
    firstName: 'Sarah',
    lastName: 'Johnson',
    role: 'doctor',
    phone: '+1-555-0125',
    dateOfBirth: new Date('1985-03-22'),
    gender: 'female',
    address: {
      street: '456 Healthcare Blvd',
      city: 'Los Angeles',
      state: 'CA',
      postalCode: '90001',
      country: 'USA'
    },
    profileImageUrl: '/api/placeholder/150/150',
    createdAt: new Date('2021-03-10'),
    updatedAt: new Date('2024-01-15'),
    lastLogin: new Date('2024-01-15'),
    isActive: true,
    isEmailVerified: true,
    emergencyContact: {
      name: 'Mike Johnson',
      relationship: 'spouse',
      phone: '+1-555-0126',
      email: 'mike.johnson@email.com'
    },
    twoFactorEnabled: true,
    accountLocked: false,
    failedLoginAttempts: 0,
    passwordLastChanged: new Date('2024-01-01'),
    sessionTokens: [],
    accessibilitySettings: {
      oversizedWidget: false,
      screenReader: false,
      contrast: false,
      smartContrast: false,
      highlightLinks: false,
      biggerText: false,
      textSpacing: false,
      pauseAnimations: false,
      hideImages: false,
      dyslexiaFriendly: false,
      cursor: false,
      tooltips: false,
      pageStructure: false,
      lineHeight: 1.5,
      textAlign: 'left',
      dictionary: false
    }
  }
];

// Mock education data
const mockEducation: Education[] = [
  {
    institution: 'Harvard Medical School',
    degree: 'Doctor of Medicine (MD)',
    year: 2004,
    description: 'Graduated Summa Cum Laude with specialization in Internal Medicine'
  },
  {
    institution: 'Johns Hopkins University',
    degree: 'Bachelor of Science in Biology',
    year: 2000,
    description: 'Magna Cum Laude, Pre-Med track with research in molecular biology'
  }
];

// Mock experience data
const mockExperience: Experience[] = [
  {
    position: 'Senior Attending Physician',
    organization: 'Mount Sinai Hospital',
    startDate: new Date('2010-07-01'),
    endDate: new Date('2024-01-01'),
    description: 'Lead attending physician in Internal Medicine department. Supervised resident physicians and managed complex cases. Specialized in cardiovascular diseases and diabetes management.'
  },
  {
    position: 'Resident Physician',
    organization: 'Massachusetts General Hospital',
    startDate: new Date('2004-07-01'),
    endDate: new Date('2007-06-30'),
    description: 'Internal Medicine residency program. Rotated through various departments including cardiology, gastroenterology, and emergency medicine.'
  },
  {
    position: 'Medical Intern',
    organization: 'Brigham and Women\'s Hospital',
    startDate: new Date('2007-07-01'),
    endDate: new Date('2010-06-30'),
    description: 'Fellowship in Cardiology. Specialized training in interventional cardiology and cardiac catheterization.'
  }
];

// Mock availability schedule
const mockAvailabilitySchedule: AvailabilitySchedule = {
  monday: [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  tuesday: [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  wednesday: [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  thursday: [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '17:00' }
  ],
  friday: [
    { startTime: '09:00', endTime: '12:00' },
    { startTime: '14:00', endTime: '16:00' }
  ],
  saturday: [
    { startTime: '09:00', endTime: '12:00' }
  ],
  sunday: []
};

// Mock doctor profiles
const mockDoctorProfiles: DoctorProfile[] = [
  {
    ...mockDoctorUsers[0],
    role: 'doctor',
    specialization: 'Cardiology',
    licenseNumber: 'MD-NY-123456',
    education: mockEducation,
    experience: mockExperience,
    department: 'Cardiology',
    consultationFee: 250,
    availabilitySchedule: mockAvailabilitySchedule,
    patients: [],
    rating: 4.8,
    reviews: [
      {
        id: 'review_1',
        patientId: 'patient_1',
        patientName: 'John Doe',
        rating: 5,
        comment: 'Dr. Smith is excellent! Very thorough and caring.',
        createdAt: new Date('2024-01-10')
      },
      {
        id: 'review_2',
        patientId: 'patient_2',
        patientName: 'Jane Williams',
        rating: 4,
        comment: 'Great doctor, explained everything clearly.',
        createdAt: new Date('2024-01-05')
      }
    ]
  },
  {
    ...mockDoctorUsers[1],
    role: 'doctor',
    specialization: 'Pediatrics',
    licenseNumber: 'MD-CA-789012',
    education: [
      {
        institution: 'Stanford University School of Medicine',
        degree: 'Doctor of Medicine (MD)',
        year: 2007,
        description: 'Specialized in Pediatric Medicine'
      },
      {
        institution: 'UCLA',
        degree: 'Bachelor of Science in Chemistry',
        year: 2003,
        description: 'Graduated with honors'
      }
    ],
    experience: [
      {
        position: 'Pediatric Attending Physician',
        organization: 'Children\'s Hospital Los Angeles',
        startDate: new Date('2013-07-01'),
        endDate: new Date('2024-01-01'),
        description: 'Specialized in pediatric cardiology and neonatal care'
      },
      {
        position: 'Pediatric Resident',
        organization: 'UCSF Children\'s Hospital',
        startDate: new Date('2007-07-01'),
        endDate: new Date('2010-06-30'),
        description: 'Pediatric residency program'
      }
    ],
    department: 'Pediatrics',
    consultationFee: 200,
    availabilitySchedule: {
      monday: [{ startTime: '08:00', endTime: '16:00' }],
      tuesday: [{ startTime: '08:00', endTime: '16:00' }],
      wednesday: [{ startTime: '08:00', endTime: '16:00' }],
      thursday: [{ startTime: '08:00', endTime: '16:00' }],
      friday: [{ startTime: '08:00', endTime: '14:00' }],
      saturday: [],
      sunday: []
    },
    patients: [],
    rating: 4.9,
    reviews: [
      {
        id: 'review_3',
        patientId: 'patient_3',
        patientName: 'Mary Johnson',
        rating: 5,
        comment: 'Dr. Johnson is amazing with children!',
        createdAt: new Date('2024-01-08')
      }
    ]
  }
];

// Mock analytics data
const mockAnalyticsData = {
  totalPatients: 247,
  appointmentsCompleted: 189,
  appointmentsCancelled: 23,
  appointmentsNoShow: 15,
  averageRating: 4.7,
  totalReviews: 142,
  revenue: 28500,
  consultationTime: 25,
  patientSatisfaction: 92,
  weeklyGrowth: 12,
  monthlyGrowth: 18,
  monthlyMetrics: [
    { month: 'Jan', patients: 45, revenue: 11250 },
    { month: 'Feb', patients: 52, revenue: 13000 },
    { month: 'Mar', patients: 48, revenue: 12000 },
    { month: 'Apr', patients: 55, revenue: 13750 },
    { month: 'May', patients: 47, revenue: 11750 }
  ],
  appointmentsByType: {
    consultation: 125,
    followUp: 45,
    emergency: 12,
    routine: 67
  }
};

// Mock chatbot configurations
const mockChatbotConfigurations = {
  doctor_1: {
    id: 'doctor_1_chatbot',
    name: 'Dr. Smith Assistant',
    description: 'AI-powered cardiology assistant for patient inquiries',
    isActive: true,
    personality: 'professional' as const,
    responseTime: 'normal' as const,
    language: 'en',
    specialty: 'Cardiology',
    knowledgeBase: [
      'Heart disease information',
      'Appointment scheduling',
      'Cardiac symptoms',
      'Medication management',
      'Lifestyle recommendations'
    ],
    autoResponses: {
      greeting: 'Hello! I\'m Dr. Smith\'s AI assistant. How can I help you with your cardiac health today?',
      farewell: 'Thank you for contacting Dr. Smith\'s practice. Take care of your heart!',
      confusion: 'I\'m sorry, I didn\'t understand that. Could you please rephrase your question about your cardiac health?',
      emergency: 'If you\'re experiencing chest pain or cardiac emergency, please call 911 immediately!'
    },
    restrictions: {
      noMedicalAdvice: true,
      requireDoctorApproval: false,
      businessHoursOnly: false,
      maxConversationLength: 15
    },
    integrations: {
      appointmentBooking: true,
      prescriptionRefills: false,
      labResults: false,
      emergencyAlerts: true
    },
    analytics: {
      totalConversations: 342,
      satisfactionScore: 4.6,
      resolvedQueries: 289,
      escalatedToDoctor: 53
    }
  },
  doctor_2: {
    id: 'doctor_2_chatbot',
    name: 'Dr. Johnson Assistant',
    description: 'AI-powered pediatric assistant for parents and children',
    isActive: true,
    personality: 'friendly' as const,
    responseTime: 'quick' as const,
    language: 'en',
    specialty: 'Pediatrics',
    knowledgeBase: [
      'Child development',
      'Vaccination schedules',
      'Common childhood illnesses',
      'Parenting tips',
      'Emergency pediatric care'
    ],
    autoResponses: {
      greeting: 'Hi there! I\'m Dr. Johnson\'s friendly assistant. How can I help you with your child\'s health?',
      farewell: 'Thanks for visiting! Remember, keeping kids healthy is our top priority!',
      confusion: 'Oops! I didn\'t quite get that. Can you tell me more about your child\'s health concern?',
      emergency: 'If your child is having a medical emergency, please call 911 or go to the nearest emergency room!'
    },
    restrictions: {
      noMedicalAdvice: true,
      requireDoctorApproval: true,
      businessHoursOnly: true,
      maxConversationLength: 12
    },
    integrations: {
      appointmentBooking: true,
      prescriptionRefills: false,
      labResults: false,
      emergencyAlerts: true
    },
    analytics: {
      totalConversations: 198,
      satisfactionScore: 4.8,
      resolvedQueries: 165,
      escalatedToDoctor: 33
    }
  }
};

// Function to seed demo data
export const seedDoctorDemoData = async () => {
  console.log('Starting doctor demo data seeding...');
  
  try {
    // In a real application, this would save to Firestore
    // For demo purposes, we'll just log the data
    console.log('Mock Doctor Profiles:', mockDoctorProfiles);
    console.log('Mock Analytics Data:', mockAnalyticsData);
    console.log('Mock Chatbot Configurations:', mockChatbotConfigurations);
    
    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('Doctor demo data seeding completed successfully!');
    return {
      success: true,
      message: 'Demo data seeded successfully',
      data: {
        doctors: mockDoctorProfiles.length,
        analytics: Object.keys(mockAnalyticsData).length,
        chatbots: Object.keys(mockChatbotConfigurations).length
      }
    };
  } catch (error) {
    console.error('Error seeding doctor demo data:', error);
    return {
      success: false,
      message: 'Failed to seed demo data',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Export all mock data for use in components
export {
  mockDoctorUsers,
  mockEducation,
  mockExperience,
  mockAvailabilitySchedule,
  mockDoctorProfiles,
  mockAnalyticsData,
  mockChatbotConfigurations
};
