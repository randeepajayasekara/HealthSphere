import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from '@/backend/config';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type: 'text' | 'analysis' | 'suggestion' | 'diagnosis' | 'treatment';
  confidence?: number;
  sources?: string[];
  attachments?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  doctorId: string;
  patientId?: string;
  patientName?: string;
  specialty: string;
  createdAt: Date;
  updatedAt: Date;
  messages: ChatMessage[];
  status: 'active' | 'archived' | 'completed';
}

export interface AssistantCapability {
  id: string;
  name: string;
  description: string;
  category: 'diagnosis' | 'treatment' | 'research' | 'education' | 'administration';
  enabled: boolean;
  confidence: number;
}

export interface MedicalInsight {
  id: string;
  title: string;
  description: string;
  category: 'symptom' | 'diagnosis' | 'treatment' | 'prevention' | 'research';
  confidence: number;
  sources: string[];
  relevance: number;
  createdAt: Date;
}

export interface PatientContext {
  patientId: string;
  patientName: string;
  age: number;
  gender: string;
  currentSymptoms: string[];
  medicalHistory: string[];
  currentMedications: string[];
  allergies: string[];
  vitalSigns?: {
    bloodPressure: string;
    heartRate: number;
    temperature: number;
    oxygenSaturation: number;
  };
}

interface AssistantConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  specialty: string;
  includePatientData: boolean;
  confidenceThreshold: number;
}

interface CreateSessionRequest {
  doctorId: string;
  patientId?: string;
  specialty: string;
  title: string;
}

interface SendMessageRequest {
  sessionId: string;
  message: string;
  patientContext?: PatientContext | null;
  includeInsights?: boolean;
  model?: string;
  temperature?: number;
}

interface AIResponse {
  content: string;
  type: 'text' | 'analysis' | 'suggestion' | 'diagnosis' | 'treatment';
  confidence?: number;
  sources?: string[];
  insights?: MedicalInsight[];
}

interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export class DoctorHealthAssistantService {
  private static readonly COLLECTION_NAME = 'doctor_health_assistant';
  private static readonly SESSIONS_COLLECTION = 'health_assistant_sessions';
  private static readonly CAPABILITIES_COLLECTION = 'health_assistant_capabilities';
  private static readonly GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  private static readonly GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models';

  // Initialize Health Assistant
  static async initializeAssistant(doctorId: string, config: AssistantConfig): Promise<ServiceResponse<boolean>> {
    try {
      console.log('Initializing Health Assistant for doctor:', doctorId);
      
      // Check if Firebase is properly configured
      if (!db) {
        throw new Error('Firebase is not properly configured. Please check your environment variables.');
      }
      
      const assistantRef = doc(db, this.COLLECTION_NAME, doctorId);
      
      await setDoc(assistantRef, {
        doctorId,
        config,
        initialized: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Initialize default capabilities
      await this.initializeDefaultCapabilities(doctorId);

      console.log('Health Assistant initialized successfully');

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error initializing assistant:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to initialize assistant'
      };
    }
  }

  // Create new chat session
  static async createSession(request: CreateSessionRequest): Promise<ServiceResponse<ChatSession>> {
    try {
      const sessionId = `session_${Date.now()}`;
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      
      const sessionData: ChatSession = {
        id: sessionId,
        title: request.title,
        doctorId: request.doctorId,
        patientId: request.patientId,
        patientName: request.patientId ? `Patient ${request.patientId}` : undefined,
        specialty: request.specialty,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
        status: 'active'
      };

      await setDoc(sessionRef, {
        ...sessionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        data: sessionData
      };
    } catch (error) {
      console.error('Error creating session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create session'
      };
    }
  }

  // Get all sessions for a doctor
  static async getSessions(doctorId: string): Promise<ServiceResponse<ChatSession[]>> {
    try {
      const sessionsQuery = query(
        collection(db, this.SESSIONS_COLLECTION),
        where('doctorId', '==', doctorId),
        orderBy('updatedAt', 'desc'),
        limit(50)
      );

      const snapshot = await getDocs(sessionsQuery);
      const sessions: ChatSession[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        sessions.push({
          id: doc.id,
          title: data.title,
          doctorId: data.doctorId,
          patientId: data.patientId,
          patientName: data.patientName,
          specialty: data.specialty,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          messages: data.messages || [],
          status: data.status || 'active'
        });
      });

      return {
        success: true,
        data: sessions
      };
    } catch (error) {
      console.error('Error getting sessions:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get sessions'
      };
    }
  }

  // Send message to AI assistant
  static async sendMessage(request: SendMessageRequest): Promise<ServiceResponse<AIResponse>> {
    try {
      // First, save the user message to the session
      await this.saveMessageToSession(request.sessionId, {
        id: Date.now().toString(),
        role: 'user',
        content: request.message,
        timestamp: new Date(),
        type: 'text'
      });

      // Generate AI response using Gemini
      const aiResponse = await this.generateAIResponse(request);
      
      // Save AI response to session
      await this.saveMessageToSession(request.sessionId, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse.content,
        timestamp: new Date(),
        type: aiResponse.type,
        confidence: aiResponse.confidence,
        sources: aiResponse.sources
      });

      return {
        success: true,
        data: aiResponse
      };
    } catch (error) {
      console.error('Error sending message:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send message'
      };
    }
  }

  // Generate AI response using Gemini
  private static async generateAIResponse(request: SendMessageRequest): Promise<AIResponse> {
    try {
      // Check if API key is available
      if (!this.GEMINI_API_KEY) {
        console.error('Gemini API key not found. Please set NEXT_PUBLIC_GEMINI_API_KEY in your environment variables.');
        return {
          content: 'AI assistant is not configured. Please contact your system administrator to set up the Gemini API key.',
          type: 'text',
          confidence: 0.1,
          sources: []
        };
      }

      const systemPrompt = this.buildSystemPrompt(request.patientContext);
      const userPrompt = this.buildUserPrompt(request.message, request.patientContext);

      console.log('Sending request to Gemini API...');
      
      const response = await fetch(`${this.GEMINI_API_URL}/gemini-1.5-flash-latest:generateContent?key=${this.GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: systemPrompt },
                { text: userPrompt }
              ]
            }
          ],
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: 1000,
            topP: 0.9,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      const aiContent = data.candidates?.[0]?.content?.parts?.[0]?.text || 'I apologize, but I cannot provide a response at this time.';

      console.log('Received response from Gemini API');

      // Analyze response type and confidence
      const responseType = this.analyzeResponseType(aiContent);
      const confidence = this.calculateConfidence(aiContent, responseType);

      return {
        content: aiContent,
        type: responseType,
        confidence,
        sources: ['Gemini AI', 'Medical Literature Database'],
        insights: this.generateInsights(aiContent, responseType)
      };
    } catch (error) {
      console.error('Error generating AI response:', error);
      return {
        content: 'I apologize, but I encountered an error while processing your request. Please try again or contact support if the issue persists.',
        type: 'text',
        confidence: 0.1,
        sources: []
      };
    }
  }

  // Build system prompt for medical AI
  private static buildSystemPrompt(patientContext?: PatientContext | null): string {
    return `You are a professional medical AI assistant designed to support healthcare professionals. 

Your role is to:
1. Provide evidence-based medical information and insights
2. Assist with differential diagnosis considerations
3. Suggest appropriate treatment options based on clinical guidelines
4. Analyze symptoms and recommend diagnostic approaches
5. Check for drug interactions and contraindications
6. Provide patient education materials when requested

Important Guidelines:
- Always emphasize that your recommendations are for informational purposes only
- Remind users that clinical judgment and patient examination are essential
- Suggest consulting current clinical guidelines and literature
- Never provide definitive diagnoses without proper examination
- Always consider patient safety and recommend appropriate escalation when needed
- Be thorough but concise in your responses
- Include confidence levels when appropriate

${patientContext ? `
Current Patient Context:
- Patient: ${patientContext.patientName}
- Age: ${patientContext.age} years
- Gender: ${patientContext.gender}
- Current Symptoms: ${patientContext.currentSymptoms.join(', ')}
- Medical History: ${patientContext.medicalHistory.join(', ')}
- Current Medications: ${patientContext.currentMedications.join(', ')}
- Known Allergies: ${patientContext.allergies.join(', ')}
${patientContext.vitalSigns ? `
- Recent Vital Signs:
  - Blood Pressure: ${patientContext.vitalSigns.bloodPressure}
  - Heart Rate: ${patientContext.vitalSigns.heartRate} bpm
  - Temperature: ${patientContext.vitalSigns.temperature}°C
  - Oxygen Saturation: ${patientContext.vitalSigns.oxygenSaturation}%
` : ''}
` : ''}

Please provide professional, evidence-based medical guidance while maintaining appropriate clinical disclaimers.`;
  }

  // Build user prompt with context
  private static buildUserPrompt(message: string, patientContext?: PatientContext | null): string {
    let prompt = `Medical Query: ${message}`;
    
    if (patientContext) {
      prompt += `\n\nPlease consider the patient context provided in the system prompt when formulating your response.`;
    }
    
    return prompt;
  }

  // Analyze response type based on content
  private static analyzeResponseType(content: string): 'text' | 'analysis' | 'suggestion' | 'diagnosis' | 'treatment' {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('diagnosis') || lowerContent.includes('differential') || lowerContent.includes('likely') || lowerContent.includes('suspect')) {
      return 'diagnosis';
    } else if (lowerContent.includes('treatment') || lowerContent.includes('medication') || lowerContent.includes('therapy') || lowerContent.includes('recommend')) {
      return 'treatment';
    } else if (lowerContent.includes('suggest') || lowerContent.includes('consider') || lowerContent.includes('might') || lowerContent.includes('could')) {
      return 'suggestion';
    } else if (lowerContent.includes('analysis') || lowerContent.includes('interpretation') || lowerContent.includes('results') || lowerContent.includes('findings')) {
      return 'analysis';
    } else {
      return 'text';
    }
  }

  // Calculate confidence based on response characteristics
  private static calculateConfidence(content: string, type: string): number {
    const lowerContent = content.toLowerCase();
    let confidence = 0.7; // Base confidence
    
    // Increase confidence for evidence-based statements
    if (lowerContent.includes('evidence') || lowerContent.includes('studies') || lowerContent.includes('research')) {
      confidence += 0.1;
    }
    
    // Increase confidence for specific medical terms
    if (lowerContent.includes('pathophysiology') || lowerContent.includes('mechanism') || lowerContent.includes('etiology')) {
      confidence += 0.1;
    }
    
    // Decrease confidence for uncertain language
    if (lowerContent.includes('might') || lowerContent.includes('possibly') || lowerContent.includes('uncertain')) {
      confidence -= 0.2;
    }
    
    // Adjust based on response type
    switch (type) {
      case 'diagnosis':
        confidence -= 0.1; // Lower confidence for diagnostic suggestions
        break;
      case 'treatment':
        confidence += 0.05; // Slightly higher for treatment recommendations
        break;
      case 'analysis':
        confidence += 0.1; // Higher for analysis
        break;
    }
    
    return Math.max(0.1, Math.min(0.95, confidence));
  }

  // Generate insights from AI response
  private static generateInsights(content: string, type: string): MedicalInsight[] {
    const insights: MedicalInsight[] = [];
    
    // This is a simplified insight generation
    // In a real implementation, you would use NLP to extract key medical insights
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('urgent') || lowerContent.includes('emergency') || lowerContent.includes('immediate')) {
      insights.push({
        id: `insight_${Date.now()}`,
        title: 'Urgent Medical Attention Required',
        description: 'This case may require immediate medical intervention.',
        category: 'diagnosis',
        confidence: 0.9,
        sources: ['Clinical Guidelines'],
        relevance: 0.95,
        createdAt: new Date()
      });
    }
    
    return insights;
  }

  // Save message to session
  private static async saveMessageToSession(sessionId: string, message: ChatMessage): Promise<void> {
    try {
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (sessionDoc.exists()) {
        const sessionData = sessionDoc.data();
        const messages = sessionData.messages || [];
        messages.push({
          ...message,
          timestamp: Timestamp.fromDate(message.timestamp)
        });
        
        await updateDoc(sessionRef, {
          messages,
          updatedAt: serverTimestamp()
        });
      }
    } catch (error) {
      console.error('Error saving message to session:', error);
      throw error;
    }
  }

  // Get patient context
  static async getPatientContext(patientId: string): Promise<ServiceResponse<PatientContext>> {
    try {
      // This is a demo implementation - in real app, you'd fetch from patient records
      const demoPatientContext: PatientContext = {
        patientId,
        patientName: 'Demo Patient',
        age: 35,
        gender: 'Female',
        currentSymptoms: ['Headache', 'Fatigue', 'Nausea'],
        medicalHistory: ['Hypertension', 'Diabetes Type 2'],
        currentMedications: ['Metformin 500mg BID', 'Lisinopril 10mg daily'],
        allergies: ['Penicillin', 'Shellfish'],
        vitalSigns: {
          bloodPressure: '140/90',
          heartRate: 78,
          temperature: 37.2,
          oxygenSaturation: 98
        }
      };

      return {
        success: true,
        data: demoPatientContext
      };
    } catch (error) {
      console.error('Error getting patient context:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get patient context'
      };
    }
  }

  // Get capabilities
  static async getCapabilities(): Promise<ServiceResponse<AssistantCapability[]>> {
    try {
      const capabilitiesQuery = query(
        collection(db, this.CAPABILITIES_COLLECTION),
        orderBy('category', 'asc')
      );

      const snapshot = await getDocs(capabilitiesQuery);
      const capabilities: AssistantCapability[] = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        capabilities.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          category: data.category,
          enabled: data.enabled,
          confidence: data.confidence
        });
      });

      return {
        success: true,
        data: capabilities
      };
    } catch (error) {
      console.error('Error getting capabilities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get capabilities'
      };
    }
  }

  // Update capabilities
  static async updateCapabilities(capabilities: AssistantCapability[]): Promise<ServiceResponse<boolean>> {
    try {
      const batch = writeBatch(db);

      capabilities.forEach((capability) => {
        const capabilityRef = doc(db, this.CAPABILITIES_COLLECTION, capability.id);
        batch.set(capabilityRef, capability);
      });

      await batch.commit();

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error updating capabilities:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update capabilities'
      };
    }
  }

  // Export session
  static async exportSession(sessionId: string): Promise<ServiceResponse<string>> {
    try {
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      const sessionDoc = await getDoc(sessionRef);
      
      if (!sessionDoc.exists()) {
        throw new Error('Session not found');
      }

      const sessionData = sessionDoc.data();
      const exportData = {
        session: {
          id: sessionDoc.id,
          ...sessionData,
          createdAt: sessionData.createdAt?.toDate().toISOString(),
          updatedAt: sessionData.updatedAt?.toDate().toISOString()
        },
        exportedAt: new Date().toISOString()
      };

      return {
        success: true,
        data: JSON.stringify(exportData, null, 2)
      };
    } catch (error) {
      console.error('Error exporting session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to export session'
      };
    }
  }

  // Initialize default capabilities
  private static async initializeDefaultCapabilities(doctorId: string): Promise<void> {
    const defaultCapabilities: AssistantCapability[] = [
      {
        id: 'diagnosis',
        name: 'Diagnostic Support',
        description: 'AI-powered symptom analysis and differential diagnosis suggestions',
        category: 'diagnosis',
        enabled: true,
        confidence: 0.85
      },
      {
        id: 'treatment',
        name: 'Treatment Planning',
        description: 'Evidence-based treatment recommendations and protocols',
        category: 'treatment',
        enabled: true,
        confidence: 0.82
      },
      {
        id: 'drug-interaction',
        name: 'Drug Interaction Checker',
        description: 'Comprehensive medication interaction analysis',
        category: 'treatment',
        enabled: true,
        confidence: 0.95
      },
      {
        id: 'lab-interpretation',
        name: 'Lab Result Analysis',
        description: 'Automated interpretation of laboratory results',
        category: 'diagnosis',
        enabled: true,
        confidence: 0.88
      },
      {
        id: 'research',
        name: 'Medical Literature Search',
        description: 'Access to latest research papers and clinical guidelines',
        category: 'research',
        enabled: true,
        confidence: 0.78
      },
      {
        id: 'education',
        name: 'Patient Education',
        description: 'Generate patient-friendly explanations and materials',
        category: 'education',
        enabled: true,
        confidence: 0.80
      }
    ];

    const batch = writeBatch(db);
    defaultCapabilities.forEach((capability) => {
      const capabilityRef = doc(db, this.CAPABILITIES_COLLECTION, capability.id);
      batch.set(capabilityRef, capability);
    });

    await batch.commit();
  }

  // Subscribe to session updates
  static subscribeToSession(sessionId: string, callback: (session: ChatSession) => void): () => void {
    const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
    
    return onSnapshot(sessionRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        const session: ChatSession = {
          id: doc.id,
          title: data.title,
          doctorId: data.doctorId,
          patientId: data.patientId,
          patientName: data.patientName,
          specialty: data.specialty,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          messages: data.messages?.map((msg: any) => ({
            ...msg,
            timestamp: msg.timestamp?.toDate() || new Date()
          })) || [],
          status: data.status || 'active'
        };
        callback(session);
      }
    });
  }

  // Delete session
  static async deleteSession(sessionId: string): Promise<ServiceResponse<boolean>> {
    try {
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await deleteDoc(sessionRef);

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error deleting session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete session'
      };
    }
  }

  // Archive session
  static async archiveSession(sessionId: string): Promise<ServiceResponse<boolean>> {
    try {
      const sessionRef = doc(db, this.SESSIONS_COLLECTION, sessionId);
      await updateDoc(sessionRef, {
        status: 'archived',
        updatedAt: serverTimestamp()
      });

      return {
        success: true,
        data: true
      };
    } catch (error) {
      console.error('Error archiving session:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to archive session'
      };
    }
  }
}
