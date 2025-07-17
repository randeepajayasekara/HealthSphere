import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, collection, writeBatch } from 'firebase/firestore';
import { auth, db } from '@/backend/config';
import { User, UserRole } from '@/app/types';
import seedContactData from './seed-contact-data';

interface SeedUser {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    phone?: string;
    specialization?: string;
    licenseNumber?: string;
    department?: string;
}

const sampleUsers: SeedUser[] = [
    // Doctors
    {
        email: 'dr.smith@healthsphere.com',
        password: 'Doctor123!',
        firstName: 'John',
        lastName: 'Smith',
        role: 'doctor',
        phone: '+94771234567',
        specialization: 'Cardiology',
        licenseNumber: 'MD001',
        department: 'Cardiology'
    },
    {
        email: 'dr.patel@healthsphere.com',
        password: 'Doctor123!',
        firstName: 'Priya',
        lastName: 'Patel',
        role: 'doctor',
        phone: '+94771234568',
        specialization: 'Dermatology',
        licenseNumber: 'MD002',
        department: 'Dermatology'
    },
    {
        email: 'dr.fernando@healthsphere.com',
        password: 'Doctor123!',
        firstName: 'Carlos',
        lastName: 'Fernando',
        role: 'doctor',
        phone: '+94771234569',
        specialization: 'Orthopedics',
        licenseNumber: 'MD003',
        department: 'Orthopedics'
    },
    
    // Nurses
    {
        email: 'nurse.silva@healthsphere.com',
        password: 'Nurse123!',
        firstName: 'Maria',
        lastName: 'Silva',
        role: 'nurse',
        phone: '+94771234570',
        licenseNumber: 'RN001',
        department: 'Emergency'
    },
    {
        email: 'nurse.johnson@healthsphere.com',
        password: 'Nurse123!',
        firstName: 'Sarah',
        lastName: 'Johnson',
        role: 'nurse',
        phone: '+94771234571',
        licenseNumber: 'RN002',
        department: 'ICU'
    },
    
    // Admin
    {
        email: 'admin@healthsphere.com',
        password: 'Admin123!',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        phone: '+94771234572',
        department: 'Administration'
    },
    
    // Receptionist
    {
        email: 'reception@healthsphere.com',
        password: 'Reception123!',
        firstName: 'Lisa',
        lastName: 'Wong',
        role: 'receptionist',
        phone: '+94771234573',
        department: 'Reception'
    },
    
    // Pharmacist
    {
        email: 'pharmacist@healthsphere.com',
        password: 'Pharmacy123!',
        firstName: 'David',
        lastName: 'Lee',
        role: 'pharmacist',
        phone: '+94771234574',
        licenseNumber: 'PH001',
        department: 'Pharmacy'
    },
    
    // Lab Technician
    {
        email: 'lab@healthsphere.com',
        password: 'Lab123!',
        firstName: 'Emma',
        lastName: 'Davis',
        role: 'lab_technician',
        phone: '+94771234575',
        licenseNumber: 'LT001',
        department: 'Laboratory'
    },
    
    // Hospital Management
    {
        email: 'management@healthsphere.com',
        password: 'Management123!',
        firstName: 'Robert',
        lastName: 'Wilson',
        role: 'hospital_management',
        phone: '+94771234576',
        department: 'Hospital Management'
    },
    
    // Sample Patient (for testing)
    {
        email: 'patient.test@example.com',
        password: 'Patient123!',
        firstName: 'Test',
        lastName: 'Patient',
        role: 'patient',
        phone: '+94771234577'
    }
];

export async function seedUsers(): Promise<void> {
    console.log('Starting user seeding...');
    
    const batch = writeBatch(db);
    const createdUsers: string[] = [];
    
    try {
        for (const userData of sampleUsers) {
            try {
                console.log(`Creating user: ${userData.email}`);
                
                // Create Firebase Auth user
                const userCredential = await createUserWithEmailAndPassword(
                    auth,
                    userData.email,
                    userData.password
                );
                
                // Update Firebase Auth profile
                await updateProfile(userCredential.user, {
                    displayName: `${userData.firstName} ${userData.lastName}`,
                    photoURL: getDefaultProfileImage(userData.role)
                });
                
                // Create user document data
                const userDoc: User = {
                    id: userCredential.user.uid,
                    email: userData.email,
                    firstName: userData.firstName,
                    lastName: userData.lastName,
                    role: userData.role,
                    phone: userData.phone,
                    profileImageUrl: getDefaultProfileImage(userData.role),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                    isActive: true,
                    isEmailVerified: true, // Set to true for seed data
                    twoFactorEnabled: false,
                    accountLocked: false,
                    failedLoginAttempts: 0,
                    passwordLastChanged: new Date()
                };
                
                // Add role-specific data
                if (userData.role === 'doctor') {
                    Object.assign(userDoc, {
                        specialization: userData.specialization,
                        licenseNumber: userData.licenseNumber,
                        department: userData.department,
                        education: [
                            {
                                degree: 'MBBS',
                                institution: 'University of Colombo',
                                year: 2015,
                                country: 'Sri Lanka'
                            },
                            {
                                degree: 'MD ' + userData.specialization,
                                institution: 'Postgraduate Institute of Medicine',
                                year: 2019,
                                country: 'Sri Lanka'
                            }
                        ],
                        experience: [
                            {
                                position: 'Junior Doctor',
                                hospital: 'National Hospital of Sri Lanka',
                                startDate: new Date('2015-01-01'),
                                endDate: new Date('2019-12-31'),
                                description: 'General practice and emergency medicine'
                            },
                            {
                                position: 'Specialist Doctor',
                                hospital: 'HealthSphere Medical Center',
                                startDate: new Date('2020-01-01'),
                                description: 'Specialized in ' + userData.specialization
                            }
                        ],
                        consultationFee: Math.floor(Math.random() * 5000) + 3000, // Random fee between 3000-8000
                        rating: Math.floor(Math.random() * 2) + 4 // Random rating between 4-5
                    });
                }
                
                if (userData.role === 'nurse') {
                    Object.assign(userDoc, {
                        licenseNumber: userData.licenseNumber,
                        department: userData.department,
                        specialization: userData.department + ' Nursing'
                    });
                }
                
                if (userData.role === 'admin') {
                    Object.assign(userDoc, {
                        department: userData.department,
                        permissions: [
                            {
                                resource: 'users',
                                actions: ['create', 'read', 'update', 'delete']
                            },
                            {
                                resource: 'appointments',
                                actions: ['create', 'read', 'update', 'delete']
                            },
                            {
                                resource: 'medical_records',
                                actions: ['read', 'update']
                            }
                        ]
                    });
                }
                
                if (userData.role === 'pharmacist') {
                    Object.assign(userDoc, {
                        licenseNumber: userData.licenseNumber,
                        department: userData.department
                    });
                }
                
                if (userData.role === 'lab_technician') {
                    Object.assign(userDoc, {
                        licenseNumber: userData.licenseNumber,
                        department: userData.department
                    });
                }
                
                if (userData.role === 'hospital_management') {
                    Object.assign(userDoc, {
                        managedDepartments: ['General', 'Emergency', 'ICU'],
                        managementLevel: 'senior' as const,
                        permissions: [
                            {
                                resource: 'staff',
                                actions: ['create', 'read', 'update', 'delete']
                            },
                            {
                                resource: 'departments',
                                actions: ['create', 'read', 'update', 'delete']
                            },
                            {
                                resource: 'reports',
                                actions: ['read', 'create']
                            }
                        ],
                        schedulingAuthority: true,
                        budgetAuthority: true,
                        hiringAuthority: true
                    });
                }
                
                // Add to batch
                batch.set(doc(db, 'users', userCredential.user.uid), userDoc);
                createdUsers.push(userData.email);
                
                console.log(`✓ Created user: ${userData.email} with role: ${userData.role}`);
                
            } catch (error: any) {
                if (error.code === 'auth/email-already-in-use') {
                    console.log(`⚠ User ${userData.email} already exists, skipping...`);
                } else {
                    console.error(`✗ Failed to create user ${userData.email}:`, error.message);
                }
            }
        }
        
        // Commit the batch
        if (createdUsers.length > 0) {
            await batch.commit();
            console.log(`✓ Successfully seeded ${createdUsers.length} users to Firestore`);
        }
        
        // Seed additional sample data
        await seedSampleDepartments();
        await seedSampleAppointments();
        
        console.log('✓ User seeding completed successfully!');
        console.log('\nSample login credentials:');
        console.log('================================');
        sampleUsers.forEach(user => {
            console.log(`${user.role.toUpperCase()}: ${user.email} / ${user.password}`);
        });
        
    } catch (error) {
        console.error('✗ Error during seeding:', error);
        throw error;
    }
}

function getDefaultProfileImage(role: UserRole): string {
    const baseUrl = 'https://api.dicebear.com/7.x/avataaars/svg?seed=';
    const seed = role + Math.random().toString(36).substring(7);
    
    const styleOptions = {
        doctor: '&backgroundColor=b6e3f4&clothingColor=3c4646&topColor=724133',
        nurse: '&backgroundColor=c0aede&clothingColor=e6e6fa&topColor=d2691e',
        admin: '&backgroundColor=ffdfba&clothingColor=40466e&topColor=4a4a4a',
        patient: '&backgroundColor=d1e7dd&clothingColor=6c757d&topColor=8b4513',
        receptionist: '&backgroundColor=f8d7da&clothingColor=495057&topColor=a0522d',
        pharmacist: '&backgroundColor=fff3cd&clothingColor=28a745&topColor=654321',
        lab_technician: '&backgroundColor=cce5ff&clothingColor=007bff&topColor=2f4f4f',
        hospital_management: '&backgroundColor=f0f0f0&clothingColor=343a40&topColor=708090'
    };
    
    return baseUrl + seed + (styleOptions[role] || '');
}

async function seedSampleDepartments(): Promise<void> {
    console.log('Seeding sample departments...');
    
    const departments = [
        {
            id: 'cardiology',
            name: 'Cardiology',
            description: 'Heart and cardiovascular system care',
            headOfDepartment: 'dr.smith@healthsphere.com',
            location: 'Building A, Floor 2',
            contactNumber: '+94112345678',
            emergencyNumber: '+94112345679'
        },
        {
            id: 'dermatology',
            name: 'Dermatology',
            description: 'Skin, hair, and nail conditions',
            headOfDepartment: 'dr.patel@healthsphere.com',
            location: 'Building B, Floor 1',
            contactNumber: '+94112345680',
            emergencyNumber: '+94112345681'
        },
        {
            id: 'orthopedics',
            name: 'Orthopedics',
            description: 'Bone, joint, and muscle care',
            headOfDepartment: 'dr.fernando@healthsphere.com',
            location: 'Building C, Floor 3',
            contactNumber: '+94112345682',
            emergencyNumber: '+94112345683'
        },
        {
            id: 'emergency',
            name: 'Emergency',
            description: '24/7 emergency medical care',
            headOfDepartment: 'nurse.silva@healthsphere.com',
            location: 'Building A, Ground Floor',
            contactNumber: '+94112345684',
            emergencyNumber: '+94112345685'
        },
        {
            id: 'pharmacy',
            name: 'Pharmacy',
            description: 'Medication dispensing and consultation',
            headOfDepartment: 'pharmacist@healthsphere.com',
            location: 'Building A, Ground Floor',
            contactNumber: '+94112345686'
        },
        {
            id: 'laboratory',
            name: 'Laboratory',
            description: 'Diagnostic tests and analysis',
            headOfDepartment: 'lab@healthsphere.com',
            location: 'Building B, Basement',
            contactNumber: '+94112345687'
        }
    ];
    
    const batch = writeBatch(db);
    
    departments.forEach(dept => {
        batch.set(doc(db, 'departments', dept.id), {
            ...dept,
            createdAt: new Date(),
            updatedAt: new Date(),
            isActive: true
        });
    });
    
    await batch.commit();
    console.log('✓ Sample departments seeded successfully');
}

async function seedSampleAppointments(): Promise<void> {
    console.log('Seeding sample appointments...');
    
    const appointments = [
        {
            patientEmail: 'patient.test@example.com',
            doctorEmail: 'dr.smith@healthsphere.com',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
            time: '10:00',
            type: 'regular_checkup',
            status: 'scheduled',
            reason: 'Routine cardiac checkup'
        },
        {
            patientEmail: 'patient.test@example.com',
            doctorEmail: 'dr.patel@healthsphere.com',
            date: new Date(Date.now() + 48 * 60 * 60 * 1000), // Day after tomorrow
            time: '14:30',
            type: 'specialist_consultation',
            status: 'scheduled',
            reason: 'Skin rash consultation'
        }
    ];
    
    const batch = writeBatch(db);
    
    appointments.forEach((appointment, index) => {
        batch.set(doc(collection(db, 'appointments')), {
            ...appointment,
            id: `appointment_${index + 1}`,
            createdAt: new Date(),
            updatedAt: new Date(),
            duration: 30, // 30 minutes
            notes: '',
            paymentStatus: 'pending'
        });
    });
    
    await batch.commit();
    console.log('✓ Sample appointments seeded successfully');
}

// Utility function to run seeding (can be called from admin panel or development tool)
export async function runSeeding(): Promise<void> {
    try {
        console.log('🌱 Starting HealthSphere data seeding...');
        console.log('====================================');
        
        await seedUsers();
        await seedContactData();
        
        console.log('\n✅ All seeding completed successfully!');
        console.log('\nYou can now use the following credentials to test different roles:');
        console.log('================================================================');
        
        const roleCredentials = {
            'Doctor': 'dr.smith@healthsphere.com / Doctor123!',
            'Nurse': 'nurse.silva@healthsphere.com / Nurse123!',
            'Admin': 'admin@healthsphere.com / Admin123!',
            'Receptionist': 'reception@healthsphere.com / Reception123!',
            'Pharmacist': 'pharmacist@healthsphere.com / Pharmacy123!',
            'Lab Technician': 'lab@healthsphere.com / Lab123!',
            'Hospital Management': 'management@healthsphere.com / Management123!',
            'Patient': 'patient.test@example.com / Patient123!'
        };
        
        Object.entries(roleCredentials).forEach(([role, credentials]) => {
            console.log(`${role.padEnd(20)}: ${credentials}`);
        });
        
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    }
}