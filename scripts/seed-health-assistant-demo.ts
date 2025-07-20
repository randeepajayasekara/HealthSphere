#!/usr/bin/env node

/**
 * Health Assistant Demo Data Seeding Script
 * Run this script to populate demo data for the health assistant
 */

import { HealthAssistantDemoDataService } from '../lib/utils/health-assistant-demo-data';

async function main() {
  try {
    // Default doctor ID - replace with actual doctor ID in production
    const doctorId = process.argv[2] || 'demo_doctor_001';
    
    console.log('🚀 Starting Health Assistant demo data seeding...');
    console.log(`📋 Doctor ID: ${doctorId}`);
    
    await HealthAssistantDemoDataService.quickSeed(doctorId);
    
    console.log('🎉 Demo data seeding completed successfully!');
    console.log('');
    console.log('📝 What was created:');
    console.log('  ✅ Health Assistant configuration');
    console.log('  ✅ Sample consultation sessions');
    console.log('  ✅ Demo conversations with AI responses');
    console.log('  ✅ Various medical scenarios');
    console.log('');
    console.log('🔗 You can now test the health assistant at:');
    console.log('  /doctor/health-assistant');
    console.log('');
    
  } catch (error) {
    console.error('❌ Error during demo data seeding:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main();
}

export { main as seedHealthAssistantDemoData };
