"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare, 
  Search,
  ChevronRight,
  Star,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Users,
  Shield,
  Heart,
  Stethoscope,
  Calendar,
  CreditCard,
  FileText,
  Video,
  Settings,
  Lock,
  PlayCircle,
  User,
  Pill,
  Loader2,
  ExternalLink,
  MessageCircle,
  Headphones,
  Globe,
  Smartphone
} from 'lucide-react';
import { useAuth } from '@/app/contexts/auth-context';
import ContactService, { 
  type ContactSubmission, 
  type FAQCategory, 
  type FAQItem, 
  type ContactCategory, 
  type ContactPriority 
} from '@/lib/firestore/contact-services';
import { useContact } from '@/hooks/use-contact';
import seedContactData from '@/app/utils/seed-contact-data';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

// Contact form data interface
interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  category: ContactCategory;
  priority: ContactPriority;
}

// FAQ search and filtering
interface FAQFilters {
  search: string;
  category: string;
}

// Fallback FAQ categories for when database is empty
const FALLBACK_CATEGORIES = [
  { id: 'getting-started', name: 'Getting Started', description: 'Basic information about using HealthSphere', icon: 'PlayCircle' },
  { id: 'account', name: 'Account & Profile', description: 'Manage your account and personal information', icon: 'User' },
  { id: 'appointments', name: 'Appointments', description: 'Schedule and manage your medical appointments', icon: 'Calendar' },
  { id: 'records', name: 'Medical Records', description: 'Access and manage your health records', icon: 'FileText' },
  { id: 'billing', name: 'Billing & Insurance', description: 'Payment and insurance related questions', icon: 'CreditCard' },
  { id: 'technical', name: 'Technical Support', description: 'Get help with technical issues', icon: 'Settings' }
];

// Fallback FAQ items for when database is empty
const FALLBACK_FAQS = [
  {
    id: 'faq-1',
    categoryId: 'getting-started',
    question: 'How do I get started with HealthSphere?',
    answer: 'Welcome to HealthSphere! Start by completing your profile, adding your medical information, and connecting with healthcare providers. Our getting started guide will walk you through each step.',
    tags: ['getting started', 'profile', 'setup'],
    viewCount: 0,
    helpfulVotes: 0,
    unhelpfulVotes: 0,
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'faq-2',
    categoryId: 'account',
    question: 'How do I update my profile information?',
    answer: 'You can update your profile by navigating to Settings > Profile. Here you can change your personal information, contact details, and medical preferences. Make sure to save your changes.',
    tags: ['profile', 'update', 'settings'],
    viewCount: 0,
    helpfulVotes: 0,
    unhelpfulVotes: 0,
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'faq-3',
    categoryId: 'appointments',
    question: 'How do I schedule an appointment?',
    answer: 'To schedule an appointment, go to the Appointments section, select your preferred healthcare provider, choose an available time slot, and confirm your booking. You\'ll receive a confirmation email.',
    tags: ['appointments', 'schedule', 'booking'],
    viewCount: 0,
    helpfulVotes: 0,
    unhelpfulVotes: 0,
    order: 1,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const ContactPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('contact');
  const [filteredFAQs, setFilteredFAQs] = useState<FAQItem[]>([]);
  const [faqFilters, setFAQFilters] = useState<FAQFilters>({ search: '', category: '' });
  const [expandedFAQ, setExpandedFAQ] = useState<string>('');
  const [formData, setFormData] = useState<ContactFormData>({
    name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    subject: '',
    message: '',
    category: 'general_inquiry',
    priority: 'medium'
  });

  // Use the custom contact hook
  const {
    isSubmitting,
    submitSuccess,
    faqCategories,
    faqItems,
    loadingFAQs,
    submitContactForm,
    incrementFAQView,
    rateFAQHelpfulness,
    resetForm
  } = useContact({
    onSuccess: () => {
      // Reset form data on successful submission
      setFormData({
        name: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '',
        email: user?.email || '',
        phone: user?.phone || '',
        subject: '',
        message: '',
        category: 'general_inquiry',
        priority: 'medium'
      });
    }
  });

  // Use database data if available, otherwise use fallback data (memoized to prevent infinite loops)
  const displayCategories = React.useMemo(() => {
    return faqCategories.length > 0 ? faqCategories : FALLBACK_CATEGORIES;
  }, [faqCategories]);

  const displayFAQs = React.useMemo(() => {
    return faqItems.length > 0 ? faqItems : FALLBACK_FAQS;
  }, [faqItems]);

  // Contact categories with healthcare-focused options
  const contactCategories = [
    { value: 'general_inquiry', label: 'General Inquiry', icon: HelpCircle },
    { value: 'technical_support', label: 'Technical Support', icon: Settings },
    { value: 'billing_insurance', label: 'Billing & Insurance', icon: CreditCard },
    { value: 'medical_records', label: 'Medical Records', icon: FileText },
    { value: 'appointment_scheduling', label: 'Appointment Scheduling', icon: Calendar },
    { value: 'emergency_assistance', label: 'Emergency Assistance', icon: AlertCircle },
    { value: 'feature_request', label: 'Feature Request', icon: Star },
    { value: 'bug_report', label: 'Bug Report', icon: AlertCircle },
    { value: 'account_access', label: 'Account Access', icon: User },
    { value: 'privacy_security', label: 'Privacy & Security', icon: Shield },
    { value: 'other', label: 'Other', icon: MessageSquare }
  ];

  const priorityLevels = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' }
  ];

  // Filter FAQs based on search and category
  useEffect(() => {
    let filtered = displayFAQs;
    
    if (faqFilters.search) {
      const searchTerm = faqFilters.search.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(searchTerm) ||
        item.answer.toLowerCase().includes(searchTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }
    
    if (faqFilters.category) {
      filtered = filtered.filter(item => item.categoryId === faqFilters.category);
    }
    
    setFilteredFAQs(filtered);
  }, [displayFAQs, faqFilters]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all required fields');
      return;
    }

    const submission: Omit<ContactSubmission, 'id' | 'submittedAt' | 'status'> = {
      ...formData,
      userId: user?.id,
      userRole: user?.role,
      metadata: {
        userAgent: navigator.userAgent,
        source: 'contact_page'
      }
    };

    await submitContactForm(submission);
  };

  const handleInputChange = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (submitSuccess) resetForm();
  };

  const handleFAQClick = async (faq: FAQItem) => {
    if (faq.id) {
      await incrementFAQView(faq.id);
    }
  };

  const handleFAQRating = async (faqId: string, isHelpful: boolean) => {
    await rateFAQHelpfulness(faqId, isHelpful);
  };

  const handleSeedData = async () => {
    try {
      toast.loading('Seeding FAQ data...');
      await seedContactData();
      toast.dismiss();
      toast.success('FAQ data seeded successfully! Refreshing...');
      
      // Reload FAQ data after seeding
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to seed FAQ data. Please try again.');
      console.error('Seeding error:', error);
    }
  };

  const getIconForCategory = (categoryName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'Getting Started': PlayCircle,
      'Account & Profile': User,
      'Appointments': Calendar,
      'Medical Records': FileText,
      'Billing & Insurance': CreditCard,
      'UMID & Security': Shield,
      'Telemedicine': Video,
      'Medications': Pill,
      'Privacy & Data': Lock,
      'Technical Support': Settings
    };
    return iconMap[categoryName] || HelpCircle;
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white dark:bg-black">
        <div className="absolute inset-0 bg-[url('/api/placeholder/1920/1080')] opacity-10 bg-cover bg-center" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative container mx-auto px-4 py-16 lg:py-24"
        >
          <div className="text-center text-red-500 max-w-4xl mx-auto">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-6"
            >
              <Heart className="w-16 h-16 mx-auto mb-4 text-red-400" />
            </motion.div>
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl lg:text-6xl font-bold mb-6"
            >
              How Can We Help You?
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-lg lg:text-lg text-zinc-500 dark:text-white mb-8 leading-relaxed"
            >
              Get the support you need for your healthcare journey. We're here to help with 
              any questions about HealthSphere, your account, or technical assistance.
            </motion.p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap justify-center gap-4"
            >
              <Button 
                size="lg" 
                variant="secondary"
                onClick={() => setActiveTab('contact')}
                className="bg-white text-red-700 hover:bg-red-50 border-red-200 hover:text-red-700"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Send Message
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => setActiveTab('faq')}
                className="border-white text-black dark:text-white hover:bg-bg-red-100 hover:text-red-700"
              >
                <HelpCircle className="w-5 h-5 mr-2" />
                Browse FAQ
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Quick Contact Cards */}
      <section className="container mx-auto px-4 -mt-12 relative z-10">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <Card className="text-center hover:shadow-lg transition-all duration-300 bg-white dark:bg-zinc-900 border-red-100 dark:border-red-900">
            <CardContent className="p-6">
              <Phone className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Call Us</h3>
              <p className="text-muted-foreground mb-3">24/7 Emergency Support</p>
              <a href="tel:+94712345678" className="text-red-600 hover:text-red-700 font-medium">
                +94712345678
              </a>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-all duration-300 bg-white dark:bg-zinc-900 border-red-100 dark:border-red-900">
            <CardContent className="p-6">
              <Mail className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Email Support</h3>
              <p className="text-muted-foreground mb-3">Get help via email</p>
              <a href="mailto:support@healthsphere.com" className="text-red-600 hover:text-red-700 font-medium">
                support@healthsphere.com
              </a>
            </CardContent>
          </Card>
          
          <Card className="text-center hover:shadow-lg transition-all duration-300 bg-white dark:bg-zinc-900 border-red-100 dark:border-red-900">
            <CardContent className="p-6">
              <MessageCircle className="w-8 h-8 text-red-600 mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">Whatsapp Chat</h3>
              <p className="text-muted-foreground mb-3">Instant assistance</p>
              <a href="tel:+94712345678" className="text-red-600 hover:text-red-700 font-medium">
                +94712345678
              </a>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-16">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="contact">Contact Us</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            
          </TabsList>

          {/* Contact Form Tab */}
          <TabsContent value="contact">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="max-w-4xl mx-auto">
                <CardHeader>
                  <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
                    <Send className="w-6 h-6 text-red-600" />
                    Send Us a Message
                  </CardTitle>
                  <p className="text-center text-muted-foreground">
                    Fill out the form below and we'll get back to you as soon as possible
                  </p>
                </CardHeader>
                <CardContent>
                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mb-6"
                    >
                      <Alert className="border-green-200 bg-green-50 dark:bg-green-950/20">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-800 dark:text-green-300">
                          Your message has been sent successfully! We'll get back to you soon.
                        </AlertDescription>
                      </Alert>
                    </motion.div>
                  )}

                  <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="Enter your phone number"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category">Category *</Label>
                        <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value as ContactCategory)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
                          </SelectTrigger>
                          <SelectContent>
                            {contactCategories.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                <div className="flex items-center gap-2">
                                  <category.icon className="w-4 h-4 text-red-300" />
                                  {category.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority Level</Label>
                        <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value as ContactPriority)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            {priorityLevels.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                <div className="flex items-center gap-2">
                                  <Badge className={cn('text-xs', priority.color)}>
                                    {priority.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">Subject *</Label>
                        <Input
                          id="subject"
                          type="text"
                          value={formData.subject}
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                          placeholder="Brief description of your inquiry"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message *</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Please provide detailed information about your inquiry..."
                        rows={6}
                        required
                      />
                    </div>

                    <div className="flex justify-center">
                      <Button 
                        type="submit" 
                        size="lg"
                        disabled={isSubmitting}
                        className="bg-red-600 hover:bg-red-700 text-white min-w-[200px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* FAQ Search and Filters */}
              <Card>
                <CardContent className="p-6">
                  {faqCategories.length === 0 && (
                    <Alert className="mb-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
                      <AlertCircle className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800 dark:text-blue-300">
                        <div className="flex items-center justify-between">
                          <div>
                            <strong>Demo Mode:</strong> Showing sample FAQ data. To load your custom FAQ content, please seed the database.
                          </div>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={handleSeedData}
                            className="ml-4 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                          >
                            <Settings className="w-3 h-3 mr-1" />
                            Seed Data
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}
                  <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <Input
                          placeholder="Search frequently asked questions..."
                          value={faqFilters.search}
                          onChange={(e) => setFAQFilters(prev => ({ ...prev, search: e.target.value }))}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div className="w-full md:w-64">
                      <Select 
                        value={faqFilters.category} 
                        onValueChange={(value) => setFAQFilters(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Select...">All Categories</SelectItem>
                          {displayCategories.map((category) => {
                            const IconComponent = getIconForCategory(category.name);
                            return (
                              <SelectItem key={category.id} value={category.id!}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="w-4 h-4 text-red-300" />
                                  {category.name}
                                </div>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* FAQ Categories Grid */}
              {!faqFilters.search && !faqFilters.category && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                  {displayCategories.map((category) => {
                    const IconComponent = getIconForCategory(category.name);
                    return (
                      <motion.div
                        key={category.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card 
                          className="cursor-pointer hover:shadow-lg transition-all duration-300 border-red-100 dark:border-red-900"
                          onClick={() => setFAQFilters(prev => ({ ...prev, category: category.id! }))}
                        >
                          <CardContent className="p-6 text-center">
                            <IconComponent className="w-8 h-8 text-red-600 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">{category.name}</h3>
                            <p className="text-sm text-muted-foreground">{category.description}</p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* FAQ Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-red-600" />
                    Frequently Asked Questions
                    {filteredFAQs.length > 0 && (
                      <Badge variant="secondary">{filteredFAQs.length}</Badge>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingFAQs ? (
                    <div className="text-center py-8">
                      <Loader2 className="w-8 h-8 text-red-600 mx-auto mb-4 animate-spin" />
                      <h3 className="text-lg font-medium mb-2">Loading FAQ Content</h3>
                      <p className="text-muted-foreground">
                        Please wait while we fetch the latest help information...
                      </p>
                    </div>
                  ) : filteredFAQs.length === 0 ? (
                    <div className="text-center py-8">
                      <HelpCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">No FAQs Found</h3>
                      <p className="text-muted-foreground">
                        Try adjusting your search terms or browse different categories.
                      </p>
                    </div>
                  ) : (
                    <Accordion type="single" collapsible value={expandedFAQ} onValueChange={setExpandedFAQ}>
                      {filteredFAQs.map((faq, index) => (
                        <motion.div
                          key={faq.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1, duration: 0.3 }}
                        >
                          <AccordionItem value={faq.id!}>
                            <AccordionTrigger 
                              className="text-left hover:text-red-600 transition-colors"
                              onClick={() => handleFAQClick(faq)}
                            >
                              <div className="flex items-start gap-3 flex-1">
                                <div className="flex-1">
                                  <h4 className="font-medium">{faq.question}</h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    {faq.tags.slice(0, 3).map((tag) => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                    {faq.viewCount > 0 && (
                                      <span className="text-xs text-muted-foreground">
                                        {faq.viewCount} views
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pt-2">
                                <p className="text-muted-foreground leading-relaxed mb-4">
                                  {faq.answer}
                                </p>
                                <Separator className="my-4" />
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                    <span className="text-sm text-muted-foreground">
                                      Was this helpful?
                                    </span>
                                    <div className="flex items-center gap-2">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFAQRating(faq.id!, true)}
                                        className="h-8 px-2"
                                      >
                                        <ThumbsUp className="w-3 h-3 mr-1" />
                                        {faq.helpfulVotes}
                                      </Button>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleFAQRating(faq.id!, false)}
                                        className="h-8 px-2"
                                      >
                                        <ThumbsDown className="w-3 h-3 mr-1" />
                                        {faq.unhelpfulVotes}
                                      </Button>
                                    </div>
                                  </div>
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => setActiveTab('contact')}
                                    className="text-red-600 hover:text-red-700"
                                  >
                                    Still need help?
                                    <ChevronRight className="w-3 h-3 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        </motion.div>
                      ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Support Tab */}
          <TabsContent value="support">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              {/* Support Options Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Headphones className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">24/7 Phone Support</h3>
                    <p className="text-muted-foreground mb-4">
                      Speak directly with our healthcare support specialists
                    </p>
                    <Button variant="outline" className="w-full">
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <MessageCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Live Chat</h3>
                    <p className="text-muted-foreground mb-4">
                      Get instant help through our live chat system
                    </p>
                    <Button variant="outline" className="w-full">
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Start Chat
                    </Button>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-6 text-center">
                    <Video className="w-12 h-12 text-red-600 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Video Support</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule a screen-sharing session for technical help
                    </p>
                    <Button variant="outline" className="w-full">
                      <Video className="w-4 h-4 mr-2" />
                      Schedule Session
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Support Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-red-600" />
                      Support Hours
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Emergency Support</span>
                      <span className="text-red-600 font-medium">24/7</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">General Support</span>
                      <span>Mon-Fri: 8:00 AM - 8:00 PM</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Weekend Support</span>
                      <span>Sat-Sun: 9:00 AM - 5:00 PM</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Response Time</span>
                      <span className="text-green-600">&lt; 2 hours</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-red-600" />
                      Contact Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="font-medium">Emergency: +1 (800) HEALTH-1</p>
                        <p className="text-sm text-muted-foreground">24/7 immediate assistance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="font-medium">support@healthsphere.com</p>
                        <p className="text-sm text-muted-foreground">General inquiries and support</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Globe className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="font-medium">www.healthsphere.com/help</p>
                        <p className="text-sm text-muted-foreground">Online documentation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-4 h-4 text-red-600" />
                      <div>
                        <p className="font-medium">SMS Support: Text "HELP"</p>
                        <p className="text-sm text-muted-foreground">to +1 (555) 123-HLTH</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Emergency Notice */}
              <Alert className="border-red-200 bg-red-50 dark:bg-red-950/20">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-300">
                  <strong>Medical Emergency:</strong> If you are experiencing a medical emergency, 
                  please call 119 (Sri Lanka) or 911 (USA) immediately or go to your nearest emergency room. This platform 
                  is not intended for emergency medical situations.
                </AlertDescription>
              </Alert>
            </motion.div>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
};

export default ContactPage;