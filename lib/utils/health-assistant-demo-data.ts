/**
 * Health Assistant Demo Data Seeding
 * Creates sample data for testing the health assistant functionality
 */

import { DoctorHealthAssistantService } from '../firestore/doctor-health-assistant-service';
import { 
  Stethoscope, 
  Heart, 
  Pill, 
  FlaskConical, 
  BookOpen, 
  Users 
} from 'lucide-react';

interface DemoDataConfig {
  doctorId: string;
  createSessions?: boolean;
  createCapabilities?: boolean;
  createInsights?: boolean;
}

export class HealthAssistantDemoDataService {
  
  /**
   * Seeds demo data for health assistant
   */
  static async seedDemoData(config: DemoDataConfig): Promise<void> {
    try {
      console.log('🌱 Starting Health Assistant demo data seeding...');
      
      // Initialize assistant with default config
      await DoctorHealthAssistantService.initializeAssistant(config.doctorId, {
        model: 'gemini-1.5-flash',
        temperature: 0.7,
        maxTokens: 1000,
        specialty: 'general',
        includePatientData: true,
        confidenceThreshold: 0.8
      });
      
      // Create sample sessions if requested
      if (config.createSessions) {
        await this.createSampleSessions(config.doctorId);
      }
      
      console.log('✅ Health Assistant demo data seeding completed successfully');
      
    } catch (error) {
      console.error('❌ Error seeding demo data:', error);
      throw error;
    }
  }
  
  /**
   * Creates sample consultation sessions with demo conversations
   */
  private static async createSampleSessions(doctorId: string): Promise<void> {
    console.log('📝 Creating sample consultation sessions...');
    
    const sampleSessions = [
      {
        title: 'Hypertension Follow-up',
        specialty: 'cardiology',
        patientId: 'patient_demo_001',
        messages: [
          {
            role: 'user' as const,
            content: 'Patient presents with elevated blood pressure readings. Current BP is 150/95. Patient is on Lisinopril 10mg daily. What are the next steps?',
            type: 'text' as const
          },
          {
            role: 'assistant' as const,
            content: 'Based on the elevated BP reading of 150/95 while on Lisinopril 10mg, consider the following approach:\n\n1. **Medication Adjustment**: Consider increasing Lisinopril to 20mg daily or adding a thiazide diuretic (HCTZ 12.5mg)\n2. **Lifestyle Counseling**: Reinforce DASH diet, sodium restriction (<2g/day), regular exercise\n3. **Follow-up**: Schedule in 4-6 weeks to assess response\n4. **Additional Testing**: Consider 24-hour ambulatory BP monitoring if office readings remain elevated\n\n**Confidence Level**: 85%\n\n*Note: This recommendation should be individualized based on patient comorbidities and contraindications.*',
            type: 'treatment' as const,
            confidence: 0.85
          }
        ]
      },
      {
        title: 'Diabetes Management Consultation',
        specialty: 'endocrinology',
        patientId: 'patient_demo_002',
        messages: [
          {
            role: 'user' as const,
            content: 'Type 2 diabetes patient with HbA1c of 8.2%. Currently on Metformin 1000mg BID. Patient reports occasional hypoglycemic episodes. What adjustments should be made?',
            type: 'text' as const
          },
          {
            role: 'assistant' as const,
            content: 'With HbA1c of 8.2% and hypoglycemic episodes, consider this management approach:\n\n**Medication Review:**\n- Continue Metformin 1000mg BID (good foundation)\n- Add DPP-4 inhibitor (Sitagliptin 100mg daily) - low hypoglycemia risk\n- Alternative: GLP-1 agonist if weight loss is needed\n\n**Monitoring:**\n- Review glucose logs for hypoglycemia patterns\n- Check for drug interactions\n- Assess meal timing and composition\n\n**Target Adjustment:**\n- Aim for HbA1c <7% but avoid aggressive lowering\n- Consider individualized targets based on life expectancy\n\n**Confidence Level**: 88%',
            type: 'treatment' as const,
            confidence: 0.88
          }
        ]
      },
      {
        title: 'Chest Pain Evaluation',
        specialty: 'cardiology',
        patientId: 'patient_demo_003',
        messages: [
          {
            role: 'user' as const,
            content: 'Analyze these symptoms: 45-year-old male with chest pain, radiating to left arm, diaphoresis, and nausea. Pain started 2 hours ago. What is the differential diagnosis?',
            type: 'text' as const
          },
          {
            role: 'assistant' as const,
            content: '**URGENT EVALUATION REQUIRED**\n\nDifferential Diagnosis (in order of priority):\n\n**1. Acute Coronary Syndrome (ACS)**\n- Classic presentation: chest pain, radiation, diaphoresis\n- High suspicion given age, gender, symptoms\n- Immediate ECG, cardiac enzymes, aspirin\n\n**2. Myocardial Infarction**\n- Time-sensitive: 2 hours from onset\n- Requires immediate catheterization consideration\n\n**3. Unstable Angina**\n- Similar presentation but normal enzymes\n\n**4. Other considerations**\n- Aortic dissection (less likely without back pain)\n- Pulmonary embolism\n- Esophageal spasm\n\n**IMMEDIATE ACTIONS:**\n- Activate cardiac catheterization lab\n- Aspirin 325mg, nitroglycerin\n- Serial ECGs and cardiac enzymes\n\n**Confidence Level**: 95%',
            type: 'diagnosis' as const,
            confidence: 0.95
          }
        ]
      },
      {
        title: 'Drug Interaction Check',
        specialty: 'general',
        messages: [
          {
            role: 'user' as const,
            content: 'Check for drug interactions with current medications: Warfarin 5mg daily, Metformin 1000mg BID, Atorvastatin 20mg daily, and patient wants to start Ibuprofen for arthritis pain.',
            type: 'text' as const
          },
          {
            role: 'assistant' as const,
            content: '**SIGNIFICANT DRUG INTERACTION DETECTED**\n\n**Warfarin + Ibuprofen (Major Interaction)**\n- ⚠️ **Risk**: Increased bleeding risk\n- **Mechanism**: Ibuprofen inhibits platelet aggregation and may increase warfarin levels\n- **Recommendation**: AVOID concurrent use\n\n**Safe Alternatives for Arthritis Pain:**\n1. **Acetaminophen** (up to 3g/day) - safer with warfarin\n2. **Topical NSAIDs** (diclofenac gel) - minimal systemic absorption\n3. **Physical therapy** and non-pharmacological approaches\n\n**Other Interactions (Minor):**\n- Atorvastatin + Warfarin: Monitor INR more frequently\n- No significant interactions with Metformin\n\n**Recommendations:**\n- Continue current regimen\n- Substitute acetaminophen for ibuprofen\n- Monitor INR closely if any changes made\n\n**Confidence Level**: 98%',
            type: 'analysis' as const,
            confidence: 0.98
          }
        ]
      },
      {
        title: 'Lab Results Interpretation',
        specialty: 'general',
        messages: [
          {
            role: 'user' as const,
            content: 'Interpret recent lab results: WBC 12,500, Hgb 9.2, Platelets 450,000, Creatinine 1.8, BUN 45, Glucose 180, HbA1c 8.9%',
            type: 'text' as const
          },
          {
            role: 'assistant' as const,
            content: '**Lab Results Analysis:**\n\n**🔴 Critical Findings:**\n- **Creatinine 1.8** (Normal: 0.6-1.2) - Kidney dysfunction\n- **Anemia** (Hgb 9.2, Normal: 12-15) - Moderate anemia\n- **Poor Diabetes Control** (HbA1c 8.9%, Goal: <7%)\n\n**🟡 Abnormal Findings:**\n- **Leukocytosis** (WBC 12,500) - Possible infection/inflammation\n- **Thrombocytosis** (Platelets 450,000) - Reactive or primary\n- **Elevated BUN** (45) - Consistent with kidney dysfunction\n\n**Clinical Correlations:**\n- Diabetic nephropathy likely given diabetes + kidney dysfunction\n- Anemia of chronic kidney disease\n- Possible concurrent infection\n\n**Immediate Actions:**\n1. Nephrology consultation\n2. Urinalysis and proteinuria assessment\n3. Iron studies for anemia workup\n4. Diabetes medication adjustment\n5. Search for infection source\n\n**Confidence Level**: 92%',
            type: 'analysis' as const,
            confidence: 0.92
          }
        ]
      }
    ];
    
    // Create sessions with sample conversations
    for (const sessionData of sampleSessions) {
      try {
        const session = await DoctorHealthAssistantService.createSession({
          doctorId,
          patientId: sessionData.patientId,
          specialty: sessionData.specialty,
          title: sessionData.title
        });
        
        if (session.success && session.data) {
          // Add sample messages to the session
          for (const message of sessionData.messages) {
            await new Promise(resolve => setTimeout(resolve, 100)); // Small delay to ensure proper ordering
            
            // Simulate the message sending process
            await DoctorHealthAssistantService.sendMessage({
              sessionId: session.data.id,
              message: message.content,
              model: 'gemini-1.5-flash',
              temperature: 0.7
            });
          }
        }
        
        console.log(`✅ Created session: ${sessionData.title}`);
      } catch (error) {
        console.error(`❌ Failed to create session: ${sessionData.title}`, error);
      }
    }
  }
  
  /**
   * Cleans up demo data (for testing purposes)
   */
  static async cleanupDemoData(doctorId: string): Promise<void> {
    try {
      console.log('🧹 Cleaning up Health Assistant demo data...');
      
      // Get all sessions for the doctor
      const sessionsResponse = await DoctorHealthAssistantService.getSessions(doctorId);
      if (sessionsResponse.success && sessionsResponse.data) {
        for (const session of sessionsResponse.data) {
          await DoctorHealthAssistantService.deleteSession(session.id);
        }
      }
      
      console.log('✅ Demo data cleanup completed');
    } catch (error) {
      console.error('❌ Error cleaning up demo data:', error);
      throw error;
    }
  }
  
  /**
   * Quick seed function for immediate testing
   */
  static async quickSeed(doctorId: string): Promise<void> {
    await this.seedDemoData({
      doctorId,
      createSessions: true,
      createCapabilities: true,
      createInsights: true
    });
  }
}

// Example usage:
// await HealthAssistantDemoDataService.quickSeed('doctor_123');
