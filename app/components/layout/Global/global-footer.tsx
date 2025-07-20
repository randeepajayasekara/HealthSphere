"use client";

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Mail, 
  Send, 
  Globe, 
  Shield, 
  Lock, 
  MapPin, 
  Phone, 
  MessageCircle, 
  Stethoscope, 
  QrCode, 
  Brain, 
  Calendar, 
  FileText, 
  Star, 
  CheckCircle, 
  ArrowRight,
  Loader2,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Github,
  Award
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/backend/config';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface NewsletterSubscription {
  email: string;
  subscribedAt: Date;
  isActive: boolean;
  source: string;
}

interface FooterLink {
  title: string;
  href: string;
  external?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const footerSections: FooterSection[] = [
  {
    title: "Features",
    links: [
      { title: "Universal Medical ID", href: "/dashboard/umid", icon: QrCode },
      { title: "AI Health Assistant", href: "/dashboard/health-assistant", icon: Brain },
      { title: "Doctor Portal", href: "/doctor", icon: Stethoscope },
      { title: "Appointments", href: "/dashboard/appointments", icon: Calendar },
      { title: "Medical Records", href: "/dashboard/medical-records", icon: FileText },
      { title: "Telemedicine", href: "/dashboard/telemedicine", icon: Heart },
    ]
  },
  {
    title: "Platform",
    links: [
      { title: "Dashboard", href: "/dashboard" },
      { title: "Doctor Analytics", href: "/doctor/analytics" },
      { title: "Lab Results", href: "/dashboard/lab-results" },
      { title: "Virtual Waiting Room", href: "/doctor/virtual-waiting-room" },
      { title: "Prescriptions", href: "/dashboard/prescriptions" },
      { title: "Medication Schedule", href: "/dashboard/medication-schedule" },
    ]
  },
  {
    title: "Company",
    links: [
      { title: "User Guide", href: "/guide" },
      { title: "Blog", href: "/blog" },
      { title: "Contact", href: "/contact" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Accessibility", href: "/accessibility" },
    ]
  },
  {
    title: "Support",
    links: [
      { title: "Contact Support", href: "/contact" },
      { title: "User Guide", href: "/guide" },
      { title: "Privacy Policy", href: "/privacy" },
      { title: "Cookie Policy", href: "/cookies" },
      { title: "Terms of Service", href: "/terms" },
      { title: "Accessibility", href: "/accessibility" },
    ]
  }
];

const socialLinks = [
  { name: "Facebook", href: "#", icon: Facebook },
  { name: "Twitter", href: "#", icon: Twitter },
  { name: "Instagram", href: "#", icon: Instagram },
  { name: "LinkedIn", href: "#", icon: Linkedin },
  { name: "YouTube", href: "https://www.youtube.com/@quarista_official", icon: Youtube },
  { name: "GitHub", href: "https://github.com/Quarista", icon: Github },
];

export default function GlobalFooter() {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [currentYear] = useState(new Date().getFullYear());

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubscribing(true);

    try {
      // Create subscription document in Firestore
      const subscriptionData: Omit<NewsletterSubscription, 'subscribedAt'> & { subscribedAt: any } = {
        email: email.toLowerCase().trim(),
        subscribedAt: serverTimestamp(),
        isActive: true,
        source: 'footer_newsletter'
      };

      // Use email as document ID to prevent duplicates
      await setDoc(doc(db, 'newsletter_subscriptions', email.toLowerCase().trim()), subscriptionData);

      // Success toast
      toast.success('🎉 Successfully subscribed to our newsletter!', {
        duration: 4000,
        style: {
          background: '#10b981',
          color: 'white',
          border: '1px solid #059669',
        },
      });

      // Clear form
      setEmail('');
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      toast.error('Failed to subscribe. Please try again.');
    } finally {
      setIsSubscribing(false);
    }
  };

  // Trust indicators data
  const trustIndicators = [
    { icon: Shield, text: "HIPAA Compliant", color: "text-red-600" },
    { icon: Lock, text: "End-to-End Encrypted", color: "text-red-700" },
    { icon: CheckCircle, text: "ISO 27001 Certified", color: "text-red-800" },
    { icon: Globe, text: "Global Healthcare Network", color: "text-red-900" },
  ];

  return (
    <footer className="relative">
      {/* Gradient Separator */}
      <div className="h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent"></div>
      
      {/* Main Footer */}
      <div className="relative bg-gradient-to-b from-white via-red-50/30 to-red-100/50 dark:from-zinc-900 dark:via-zinc-900/95 dark:to-black backdrop-blur-sm">
        {/* Glass-like gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/80 via-red-50/40 to-red-100/60 dark:from-zinc-900/90 dark:via-zinc-900/80 dark:to-black/95 backdrop-blur-md"></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Top Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Company Info & Newsletter */}
            <div className="space-y-8">
              {/* Brand */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-600 to-red-800 rounded-xl shadow-lg flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-full animate-pulse"></div>
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                    HealthSphere
                  </h3>
                </div>
                
                <p className="text-lg text-slate-700 dark:text-zinc-300 leading-relaxed max-w-md">
                  Revolutionizing healthcare through innovative technology. 
                  Secure, accessible, and intelligent medical care for everyone.
                </p>

                {/* Trust Indicators */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  {trustIndicators.map((indicator, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <indicator.icon className={`w-4 h-4 ${indicator.color}`} />
                      <span className="text-slate-600 dark:text-zinc-400">{indicator.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Newsletter Subscription */}
              <Card className="bg-gradient-to-br from-red-50 to-red-100/80 dark:from-zinc-800 dark:to-zinc-900 border-red-200 dark:border-zinc-700 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center">
                        <Mail className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-slate-900 dark:text-white">
                          Stay Updated
                        </h4>
                        <p className="text-sm text-slate-600 dark:text-zinc-400">
                          Get the latest healthcare insights and updates
                        </p>
                      </div>
                    </div>
                    
                    <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                      <div className="flex space-x-2">
                        <Input
                          type="email"
                          placeholder="Enter your email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="flex-1 bg-white/80 dark:bg-zinc-800/80 border-red-200 dark:border-zinc-600 focus:border-red-500 dark:focus:border-red-400 backdrop-blur-sm"
                          disabled={isSubscribing}
                        />
                        <Button 
                          type="submit" 
                          disabled={isSubscribing}
                          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5"
                        >
                          {isSubscribing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-zinc-500">
                        By subscribing, you agree to our{' '}
                        <Link href="/privacy" className="text-red-600 hover:text-red-700 underline">
                          Privacy Policy
                        </Link>
                      </p>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Links */}
            <div className="space-y-8">
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center">
                  <ArrowRight className="w-4 h-4 mr-2 text-red-600" />
                  Quick Access
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {footerSections[0].links.slice(0, 4).map((link, index) => (
                    <Link
                      key={index}
                      href={link.href}
                      className="flex items-center space-x-3 p-3 rounded-lg bg-white/60 dark:bg-zinc-800/60 hover:bg-red-50 dark:hover:bg-zinc-700 transition-all duration-300 backdrop-blur-sm border border-red-100 dark:border-zinc-700 hover:border-red-200 dark:hover:border-zinc-600 group"
                    >
                      {link.icon && (
                        <link.icon className="w-5 h-5 text-red-600 group-hover:text-red-700 transition-colors" />
                      )}
                      <span className="text-sm font-medium text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-white">
                        {link.title}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white flex items-center">
                  <MessageCircle className="w-4 h-4 mr-2 text-red-600" />
                  Get in Touch
                </h4>
                <div className="space-y-3">
                  
                  <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-zinc-400">
                    <Phone className="w-4 h-4 text-red-600" />
                    <span>+94712345678</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-slate-600 dark:text-zinc-400">
                    <Mail className="w-4 h-4 text-red-600" />
                    <span>support@healthsphere.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {footerSections.map((section, index) => (
              <div key={index} className="space-y-4">
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm uppercase tracking-wider">
                  {section.title}
                </h4>
                <ul className="space-y-2">
                  {section.links.map((link, linkIndex) => (
                    <li key={linkIndex}>
                      <Link
                        href={link.href}
                        className="text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200 text-sm flex items-center group"
                        target={link.external ? "_blank" : "_self"}
                        rel={link.external ? "noopener noreferrer" : undefined}
                      >
                        {link.icon && (
                          <link.icon className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                        {link.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Section */}
          <div className="space-y-8">
            <Separator className="bg-gradient-to-r from-transparent via-red-200 dark:via-zinc-700 to-transparent" />
            
            {/* Social Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-1">
                <span className="text-sm text-slate-600 dark:text-zinc-400">Follow us:</span>
                <div className="flex items-center space-x-2 ml-3">
                  {socialLinks.map((social, index) => (
                    <Link
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 bg-white/80 dark:bg-zinc-800/80 rounded-lg flex items-center justify-center hover:bg-red-50 dark:hover:bg-zinc-700 transition-all duration-300 hover:scale-110 backdrop-blur-sm border border-red-100 dark:border-zinc-700"
                    >
                      <social.icon className="w-4 h-4 text-slate-600 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Recognition */}
              <div className="flex items-center space-x-4">
                <Badge variant="outline" className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400">
                  <Star className="w-3 h-3 mr-1" />
                  #1 Healthcare Platform
                </Badge>
                <Badge variant="outline" className="border-red-200 dark:border-zinc-700 text-red-700 dark:text-red-400">
                  <Award className="w-3 h-3 mr-1" />
                  Healthcare Innovation Award
                </Badge>
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0 text-sm text-slate-600 dark:text-zinc-400">
              <p>
                © {currentYear} HealthSphere. All rights reserved. Built with ❤️ for better healthcare.
              </p>
              <div className="flex items-center space-x-6">
                <Link href="/privacy" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Privacy Policy
                </Link>
                <Link href="/terms" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Terms of Service
                </Link>
                <Link href="/cookies" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Cookie Policy
                </Link>
                <Link href="/accessibility" className="hover:text-red-600 dark:hover:text-red-400 transition-colors">
                  Accessibility
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
