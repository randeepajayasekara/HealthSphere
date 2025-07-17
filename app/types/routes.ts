/**
 * HealthSphere - Routing Definitions
 * This file contains route configurations for the HealthSphere application.
 */

// Define user roles
export type UserRole = 'patient' | 'doctor' | 'nurse' | 'admin' | 'receptionist' | 'pharmacist' | 'lab_technician' | 'hospital_management';


// Base route configuration interface
export interface Route {
    path: string;
    name: string;
    description?: string;
    icon?: string;
    protected?: boolean;
    roles?: UserRole[];
}

// Nested route with children
export interface RouteWithChildren extends Route {
    children?: Route[];
}

// Specific dashboard routes based on user roles
export interface DashboardRoute extends Route {
    role: UserRole;
}

// Public routes accessible to all users
export const publicRoutes: Route[] = [
    {
        path: '/',
        name: 'Home',
        description: 'HealthSphere landing page',
    },
    {
        path: '/forum',
        name: 'Forum',
        description: 'Join the discussion on HealthSphere',
    },
    {
        path: '/contact',
        name: 'Contact',
        description: 'Get in touch with us',
    },
    {
        path: '/blog',
        name: 'Blog',
        description: 'Read our latest articles and insights',
    },
    {
        path: '/guide',
        name: 'Guide',
        description: 'Explore our comprehensive guide to HealthSphere',
    },
    {
        path: '/login',
        name: 'Login',
        description: 'Sign in to your account',
    },
    {
        path: '/register',
        name: 'Register',
        description: 'Create a new account',
    },
    {
        path: '/terms',
        name: 'Terms of Service',
        description: 'Read our terms of service',
    },
    {
        path: '/privacy',
        name: 'Privacy Policy',
        description: 'Read our privacy policy',
    },
];

// Authentication related routes
export const authRoutes: Route[] = [
    {
        path: '/login',
        name: 'Login',
    },
    {
        path: '/register',
        name: 'Register',
    },
];

// Doctor role specific routes
export const doctorRoutes: DoctorRoute[] = [
    {
        path: '/doctor',
        name: 'Dashboard',
        description: 'Doctor dashboard overview',
        role: 'doctor',
        icon: 'LayoutDashboard'
    },
    {
        path: '/doctor/patients',
        name: 'My Patients',
        description: 'Manage patient roster and medical records',
        role: 'doctor',
        icon: 'Users'
    },
    {
        path: '/doctor/appointments',
        name: 'Appointments',
        description: 'Schedule and manage appointments',
        role: 'doctor',
        icon: 'Calendar'
    },
    {
        path: '/doctor/consultations',
        name: 'Consultations',
        description: 'Active and scheduled consultations',
        role: 'doctor',
        icon: 'Stethoscope'
    },
    {
        path: '/doctor/prescriptions',
        name: 'Prescriptions',
        description: 'Manage and track prescriptions',
        role: 'doctor',
        icon: 'Pill'
    },
    {
        path: '/doctor/lab-results',
        name: 'Lab Results',
        description: 'Review and analyze patient lab results',
        role: 'doctor',
        icon: 'FlaskConical'
    },
    {
        path: '/doctor/medical-records',
        name: 'Medical Records',
        description: 'Patient medical history and documentation',
        role: 'doctor',
        icon: 'FileText'
    },
    {
        path: '/doctor/telemedicine',
        name: 'Telemedicine',
        description: 'Virtual consultations and remote care',
        role: 'doctor',
        icon: 'Video'
    },
    {
        path: '/doctor/schedule',
        name: 'My Schedule',
        description: 'Personal schedule and availability',
        role: 'doctor',
        icon: 'Clock'
    },
    {
        path: '/doctor/analytics',
        name: 'Analytics',
        description: 'Patient outcomes and performance metrics',
        role: 'doctor',
        icon: 'BarChart3'
    }
];

// Enhanced route interface for role-based access
export interface DoctorRoute extends DashboardRoute {
    role: 'doctor';
    icon?: string;
}

// Dashboard routes for each user role
export const dashboardRoutes: Record<UserRole, RouteWithChildren[]> = {
    patient: [
        {
            path: '/dashboard',
            name: 'Dashboard',
            description: 'Patient dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['patient'],
            children: [
                {
                    path: '/dashboard/appointments',
                    name: 'My Appointments',
                    description: 'View and manage appointments',
                    icon: 'calendar',
                },
                {
                    path: '/dashboard/telemedicine',
                    name: 'Virtual Consultations',
                    description: 'Join and manage virtual appointments',
                    icon: 'video',
                },
                {
                    path: '/dashboard/medical-records',
                    name: 'Medical Records',
                    description: 'Access your medical history',
                    icon: 'file-text',
                },
                {
                    path: '/dashboard/prescriptions',
                    name: 'Prescriptions',
                    description: 'View your prescriptions',
                    icon: 'clipboard-list',
                },
                {
                    path: '/dashboard/lab-results',
                    name: 'Lab Results',
                    description: 'View your lab test results',
                    icon: 'flask-conical',
                },
                {
                    path: '/dashboard/billing',
                    name: 'Billing & Insurance',
                    description: 'Manage payments and insurance',
                    icon: 'credit-card',
                },
                {
                    path: '/dashboard/messages',
                    name: 'Messages',
                    description: 'Communicate with your healthcare providers',
                    icon: 'message-square',
                },
                {
                    path: '/dashboard/umid',
                    name: 'Universal Medical ID',
                    description: 'Access your Universal Medical ID and QR code',
                    icon: 'qr-code',
                },
                {
                    path: '/dashboard/medication-schedule',
                    name: 'Medication Schedule',
                    description: 'Manage your medication schedule and reminders',
                    icon: 'alarm-clock',
                },
                {
                    path: '/dashboard/health-assistant',
                    name: 'Health Assistant',
                    description: 'AI-powered health inquiry assistant',
                    icon: 'bot',
                },
            ],
        },
        {
            path: '/dashboard/profile',
            name: 'Profile',
            description: 'Manage your profile',
            icon: 'user',
            protected: true,
            roles: ['patient'],
        },
    ],
    
    doctor: [
        {
            path: '/doctor',
            name: 'Dashboard',
            description: 'Doctor dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['doctor'],
            children: [
                {
                    path: '/doctor/appointments',
                    name: 'Appointments',
                    description: 'View and manage patient appointments',
                    icon: 'calendar',
                },
                {
                    path: '/doctor/telemedicine',
                    name: 'Virtual Consultations',
                    description: 'Conduct and manage video consultations',
                    icon: 'video',
                },
                {
                    path: '/doctor/virtual-waiting-room',
                    name: 'Virtual Waiting Room',
                    description: 'Manage patients waiting for virtual consultations',
                    icon: 'users-round',
                },
                {
                    path: '/doctor/patients',
                    name: 'Patients',
                    description: 'Manage your patients',
                    icon: 'users',
                },
                {
                    path: '/doctor/prescriptions',
                    name: 'Prescriptions',
                    description: 'Create and manage prescriptions',
                    icon: 'clipboard-list',
                },
                {
                    path: '/doctor/medical-records',
                    name: 'Medical Records',
                    description: 'Access patient medical records',
                    icon: 'file-text',
                },
                {
                    path: '/doctor/schedule',
                    name: 'Schedule',
                    description: 'Manage your availability',
                    icon: 'clock',
                },
                {
                    path: '/doctor/messages',
                    name: 'Messages',
                    description: 'Communicate with patients and staff',
                    icon: 'message-square',
                },
                {
                    path: '/doctor/umid-scanner',
                    name: 'UMID Scanner',
                    description: 'Scan and verify Universal Medical IDs',
                    icon: 'scan',
                },
                {
                    path: '/doctor/health-assistant',
                    name: 'Health Assistant',
                    description: 'AI-powered medical consultation assistant',
                    icon: 'stethoscope',
                },
            ],
        },
        {
            path: '/doctor/profile',
            name: 'Profile',
            description: 'Manage your profile',
            icon: 'user',
            protected: true,
            roles: ['doctor'],
        },
        {
            path: '/doctor/chatbot',
            name: 'Chatbot Management',
            description: 'Configure medical chatbot responses and knowledge base',
            icon: 'bot',
            protected: true,
            roles: ['doctor'],
        },
    ],
    
    nurse: [
        {
            path: '/nurse',
            name: 'Dashboard',
            description: 'Nurse dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['nurse'],
            children: [
                {
                    path: '/nurse/patients',
                    name: 'Patients',
                    description: 'Manage patient care',
                    icon: 'users',
                },
                {
                    path: '/nurse/telemedicine-support',
                    name: 'Telemedicine Support',
                    description: 'Assist with virtual consultations',
                    icon: 'video',
                },
                {
                    path: '/nurse/vitals',
                    name: 'Vitals',
                    description: 'Record patient vital signs',
                    icon: 'heart-pulse',
                },
                {
                    path: '/nurse/medications',
                    name: 'Medications',
                    description: 'Administer medications',
                    icon: 'pill',
                },
                {
                    path: '/nurse/schedule',
                    name: 'Schedule',
                    description: 'View your shift schedule',
                    icon: 'clock',
                },
                {
                    path: '/nurse/messages',
                    name: 'Messages',
                    description: 'Communicate with doctors and staff',
                    icon: 'message-square',
                },
                {
                    path: '/nurse/umid-scanner',
                    name: 'UMID Scanner',
                    description: 'Scan and verify Universal Medical IDs',
                    icon: 'scan',
                },
            ],
        },
        {
            path: '/nurse/profile',
            name: 'Profile',
            description: 'Manage your profile',
            icon: 'user',
            protected: true,
            roles: ['nurse'],
        },
        {
            path: '/nurse/chatbot',
            name: 'Chatbot Management',
            description: 'Update nursing protocols and care instructions for chatbot',
            icon: 'bot',
            protected: true,
            roles: ['nurse'],
        },
    ],
    
    admin: [
        {
            path: '/admin',
            name: 'Dashboard',
            description: 'Admin dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['admin'],
            children: [
                {
                    path: '/admin/users',
                    name: 'User Management',
                    description: 'Manage system users',
                    icon: 'users',
                },
                {
                    path: '/admin/telemedicine',
                    name: 'Telemedicine Settings',
                    description: 'Configure virtual consultation platform',
                    icon: 'video',
                },
                {
                    path: '/admin/departments',
                    name: 'Departments',
                    description: 'Manage hospital departments',
                    icon: 'building',
                },
                {
                    path: '/admin/facilities',
                    name: 'Facilities',
                    description: 'Manage hospital facilities',
                    icon: 'building-2',
                },
                {
                    path: '/admin/reports',
                    name: 'Reports',
                    description: 'Generate system reports',
                    icon: 'bar-chart',
                },
                {
                    path: '/admin/settings',
                    name: 'Settings',
                    description: 'System configuration',
                    icon: 'settings',
                },
                {
                    path: '/admin/audit-logs',
                    name: 'Audit Logs',
                    description: 'View system activity',
                    icon: 'history',
                },
                {
                    path: '/admin/blog',
                    name: 'Blog',
                    description: 'Manage blog posts',
                    icon: 'file-text',
                },
                {
                    path: '/admin/chatbot-statistics',
                    name: 'Chatbot Statistics',
                    description: 'View chatbot usage analytics and performance metrics',
                    icon: 'activity',
                },
                {
                    path: '/admin/umid-management',
                    name: 'UMID Management',
                    description: 'Manage Universal Medical ID system',
                    icon: 'id-card',
                },
                {
                    path: '/admin/health-assistant',
                    name: 'Health Assistant Config',
                    description: 'Configure AI Health Assistant system',
                    icon: 'brain',
                },
            ],
        },
        {
            path: '/admin/chatbot',
            name: 'Chatbot Management',
            description: 'Configure and manage AI chatbot system',
            icon: 'bot',
            protected: true,
            roles: ['admin'],
        },
    ],
    
    receptionist: [
        {
            path: '/receptionist',
            name: 'Dashboard',
            description: 'Receptionist dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['receptionist'],
            children: [
                {
                    path: '/receptionist/appointments',
                    name: 'Appointments',
                    description: 'Manage patient appointments',
                    icon: 'calendar',
                },
                {
                    path: '/receptionist/virtual-appointments',
                    name: 'Virtual Appointments',
                    description: 'Schedule and manage telemedicine consultations',
                    icon: 'video',
                },
                {
                    path: '/receptionist/patients',
                    name: 'Patients',
                    description: 'Register and manage patients',
                    icon: 'users',
                },
                {
                    path: '/receptionist/check-in',
                    name: 'Check-in',
                    description: 'Patient check-in process',
                    icon: 'clipboard-check',
                },
                {
                    path: '/receptionist/virtual-check-in',
                    name: 'Virtual Check-in',
                    description: 'Manage virtual waiting room',
                    icon: 'laptop',
                },
                {
                    path: '/receptionist/billing',
                    name: 'Billing',
                    description: 'Process payments',
                    icon: 'credit-card',
                },
                {
                    path: '/receptionist/messages',
                    name: 'Messages',
                    description: 'Communicate with staff',
                    icon: 'message-square',
                },
            ],
        },
        {
            path: '/receptionist/profile',
            name: 'Profile',
            description: 'Manage your profile',
            icon: 'user',
            protected: true,
            roles: ['receptionist'],
        },
        {
            path: '/receptionist/chatbot',
            name: 'Chatbot Management',
            description: 'Update appointment booking and FAQ responses',
            icon: 'bot',
            protected: true,
            roles: ['receptionist'],
        },
    ],
    
    pharmacist: [
        {
            path: '/pharmacist',
            name: 'Dashboard',
            description: 'Pharmacist dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['pharmacist'],
            children: [
                {
                    path: '/pharmacist/prescriptions',
                    name: 'Prescriptions',
                    description: 'Process prescriptions',
                    icon: 'clipboard-list',
                },
                {
                    path: '/pharmacist/e-prescriptions',
                    name: 'E-Prescriptions',
                    description: 'Process electronic prescriptions from telemedicine',
                    icon: 'file-text',
                },
                {
                    path: '/pharmacist/inventory',
                    name: 'Inventory',
                    description: 'Manage medication inventory',
                    icon: 'box',
                },
                {
                    path: '/pharmacist/orders',
                    name: 'Orders',
                    description: 'Manage medication orders',
                    icon: 'shopping-cart',
                },
                {
                    path: '/pharmacist/patients',
                    name: 'Patients',
                    description: 'View patient medication history',
                    icon: 'users',
                },
                {
                    path: '/pharmacist/messages',
                    name: 'Messages',
                    description: 'Communicate with doctors and staff',
                    icon: 'message-square',
                },
                {
                    path: '/pharmacist/prescription-analyzer',
                    name: 'Prescription Analyzer',
                    description: 'AI-powered prescription analysis and inventory management',
                    icon: 'search',
                },
                {
                    path: '/pharmacist/umid-scanner',
                    name: 'UMID Scanner',
                    description: 'Scan and verify Universal Medical IDs',
                    icon: 'scan',
                },
            ],
        },
        {
            path: '/pharmacist/profile',
            name: 'Profile',
            description: 'Manage your profile',
            icon: 'user',
            protected: true,
            roles: ['pharmacist'],
        },
        {
            path: '/pharmacist/chatbot',
            name: 'Chatbot Management',
            description: 'Update medication information and drug interaction database',
            icon: 'bot',
            protected: true,
            roles: ['pharmacist'],
        },
    ],
    
    lab_technician: [
        {
            path: '/lab',
            name: 'Dashboard',
            description: 'Lab technician dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['lab_technician'],
            children: [
                {
                    path: '/lab/test-orders',
                    name: 'Test Orders',
                    description: 'Manage lab test orders',
                    icon: 'flask-conical',
                },
                {
                    path: '/lab/remote-orders',
                    name: 'Remote Test Orders',
                    description: 'Manage orders from telemedicine consultations',
                    icon: 'laptop',
                },
                {
                    path: '/lab/results',
                    name: 'Results',
                    description: 'Record and manage test results',
                    icon: 'clipboard-list',
                },
                {
                    path: '/lab/samples',
                    name: 'Samples',
                    description: 'Manage sample collection',
                    icon: 'test-tube',
                },
                {
                    path: '/lab/inventory',
                    name: 'Inventory',
                    description: 'Manage lab supplies',
                    icon: 'box',
                },
                {
                    path: '/lab/messages',
                    name: 'Messages',
                    description: 'Communicate with doctors and staff',
                    icon: 'message-square',
                },
            ],
        },
        {
            path: '/lab/profile',
            name: 'Profile',
            description: 'Manage your profile',
            icon: 'user',
            protected: true,
            roles: ['lab_technician'],
        },
    ],
    
    hospital_management: [
        {
            path: '/management',
            name: 'Dashboard',
            description: 'Hospital management dashboard overview',
            icon: 'layout-dashboard',
            protected: true,
            roles: ['hospital_management'],
            children: [
                {
                    path: '/management/departments',
                    name: 'Departments',
                    description: 'Oversee hospital departments',
                    icon: 'building',
                },
                {
                    path: '/management/telemedicine',
                    name: 'Telemedicine Program',
                    description: 'Manage virtual care initiatives',
                    icon: 'video',
                },
                {
                    path: '/management/telemedicine-analytics',
                    name: 'Telemedicine Analytics',
                    description: 'Virtual consultation metrics and insights',
                    icon: 'line-chart',
                },
                {
                    path: '/management/staff',
                    name: 'Staff Management',
                    description: 'Manage hospital staff',
                    icon: 'users',
                },
                {
                    path: '/management/budget',
                    name: 'Budget',
                    description: 'Manage departmental budgets',
                    icon: 'banknote',
                },
                {
                    path: '/management/performance',
                    name: 'Performance',
                    description: 'Track department performance',
                    icon: 'line-chart',
                },
                {
                    path: '/management/reports',
                    name: 'Reports',
                    description: 'Generate management reports',
                    icon: 'file',
                },
                {
                    path: '/management/resources',
                    name: 'Resource Allocation',
                    description: 'Manage hospital resources',
                    icon: 'list-checks',
                },
            ],
        },
        {
            path: '/management/profile',
            name: 'Profile',
            description: 'Manage your profile',
            icon: 'user',
            protected: true,
            roles: ['hospital_management'],
        },
        {
            path: '/management/chatbot',
            name: 'Chatbot Management',
            description: 'Oversee chatbot implementation and policy compliance',
            icon: 'bot',
            protected: true,
            roles: ['hospital_management'],
        },
    ],
};

// UMID specific routes
export const umidRoutes: RouteWithChildren[] = [
    {
        path: '/umid',
        name: 'Universal Medical ID',
        description: 'Access and manage Universal Medical ID system',
        icon: 'IdCard',
        protected: true,
        roles: ['patient', 'doctor', 'nurse', 'admin', 'hospital_management', 'lab_technician'],
        children: [
            {
                path: '/umid/access',
                name: 'Access UMID',
                description: 'Access patient medical information via UMID',
                icon: 'Scan',
                protected: true,
                roles: ['doctor', 'nurse', 'admin', 'hospital_management', 'lab_technician'],
            },
            {
                path: '/umid/generate',
                name: 'Generate UMID',
                description: 'Generate new Universal Medical ID for patient',
                icon: 'QrCode',
                protected: true,
                roles: ['admin', 'hospital_management'],
            },
            {
                path: '/umid/manage',
                name: 'Manage UMID',
                description: 'Manage existing Universal Medical IDs',
                icon: 'Settings',
                protected: true,
                roles: ['admin', 'hospital_management'],
            },
            {
                path: '/umid/audit',
                name: 'Access Audit',
                description: 'View UMID access logs and audit trail',
                icon: 'History',
                protected: true,
                roles: ['admin', 'hospital_management'],
            },
            {
                path: '/umid/emergency',
                name: 'Emergency Access',
                description: 'Emergency access to critical medical information',
                icon: 'AlertTriangle',
                protected: true,
                roles: ['doctor', 'nurse', 'admin'],
            },
        ],
    },
];

// Utility function to get routes based on user role
export const getRoutesByRole = (role: UserRole): RouteWithChildren[] => {
    return dashboardRoutes[role] || [];
};

// Utility function to check if a user has access to a specific route
export const hasRouteAccess = (route: Route, userRole: UserRole): boolean => {
    if (!route.protected) return true;
    if (!route.roles) return false;
    return route.roles.includes(userRole);
};

// API Routes for new features
export const apiRoutes = {
    // Universal Medical ID API routes
    umid: {
        base: '/api/umid',
        generate: '/api/umid/generate', // POST - Generate new UMID
        verify: '/api/umid/verify', // POST - Verify TOTP code
        refresh: '/api/umid/refresh', // POST - Refresh QR code
        access: '/api/umid/access', // POST - Log access attempt
        history: '/api/umid/history', // GET - Get access history
        deactivate: '/api/umid/deactivate', // POST - Deactivate UMID
        settings: '/api/umid/settings', // GET/PUT - UMID settings
    },

    // Health Assistant API routes
    healthAssistant: {
        base: '/api/health-assistant',
        inquiry: '/api/health-assistant/inquiry', // POST - Submit health inquiry
        reportAnalysis: '/api/health-assistant/report-analysis', // POST - Upload and analyze report
        history: '/api/health-assistant/history', // GET - Get inquiry history
        feedback: '/api/health-assistant/feedback', // POST - Provide feedback
        settings: '/api/health-assistant/settings', // GET/PUT - Assistant settings
        knowledgeBase: '/api/health-assistant/knowledge-base', // GET/POST/PUT/DELETE - Manage knowledge base
    },

    // Prescription Analyzer API routes
    prescriptionAnalyzer: {
        base: '/api/prescription-analyzer',
        analyze: '/api/prescription-analyzer/analyze', // POST - Analyze prescription
        inventory: '/api/prescription-analyzer/inventory', // GET - Check inventory
        alternatives: '/api/prescription-analyzer/alternatives', // GET - Get alternatives
        interactions: '/api/prescription-analyzer/interactions', // POST - Check interactions
        settings: '/api/prescription-analyzer/settings', // GET/PUT - Analyzer settings
        analytics: '/api/prescription-analyzer/analytics', // GET - Get analytics
    },

    // Medication Scheduling API routes
    medicationSchedule: {
        base: '/api/medication-schedule',
        schedules: '/api/medication-schedule/schedules', // GET/POST - Get/Create schedules  
        schedule: '/api/medication-schedule/schedule/:id', // GET/PUT/DELETE - Manage specific schedule
        reminders: '/api/medication-schedule/reminders', // GET/POST - Manage reminders
        adherence: '/api/medication-schedule/adherence', // GET/POST - Track adherence
        analytics: '/api/medication-schedule/analytics', // GET - Get adherence analytics
        settings: '/api/medication-schedule/settings', // GET/PUT - Reminder settings
        emergency: '/api/medication-schedule/emergency', // POST - Emergency notifications
    },

    // Telemedicine enhancements (existing but enhanced)
    telemedicine: {
        base: '/api/telemedicine',
        sessions: '/api/telemedicine/sessions', // Enhanced with new features
        prescription: '/api/telemedicine/prescription', // Electronic prescriptions
        waitingRoom: '/api/telemedicine/waiting-room', // Virtual waiting room
        support: '/api/telemedicine/support', // Technical support
        analytics: '/api/telemedicine/analytics', // Enhanced analytics
    },
};