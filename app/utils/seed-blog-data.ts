import {
  collection,
  addDoc,
  doc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db } from '@/backend/config';
import { BlogPost, BlogCategory, UserRole } from '@/app/types';

// Sri Lankan healthcare professionals and sample data
const sriLankanAuthors = [
  {
    id: 'author_1',
    firstName: 'Nimal',
    lastName: 'Perera',
    role: 'doctor' as UserRole,
    email: 'nimal.perera@healthsphere.lk',
    avatar: null // Using fallback initials instead of non-existent image
  },
  {
    id: 'author_2',
    firstName: 'Kumari',
    lastName: 'Silva',
    role: 'nurse' as UserRole,
    email: 'kumari.silva@healthsphere.lk',
    avatar: null // Using fallback initials instead of non-existent image
  },
  {
    id: 'author_3',
    firstName: 'Chaminda',
    lastName: 'Jayawardena',
    role: 'doctor' as UserRole,
    email: 'chaminda.j@healthsphere.lk',
    avatar: null // Using fallback initials instead of non-existent image
  },
  {
    id: 'author_4',
    firstName: 'Sanduni',
    lastName: 'Rajapakse',
    role: 'pharmacist' as UserRole,
    email: 'sanduni.r@healthsphere.lk',
    avatar: null // Using fallback initials instead of non-existent image
  },
  {
    id: 'author_5',
    firstName: 'Mahesh',
    lastName: 'Fernando',
    role: 'lab_technician' as UserRole,
    email: 'mahesh.fernando@healthsphere.lk',
    avatar: null // Using fallback initials instead of non-existent image
  },
  {
    id: 'author_6',
    firstName: 'Priyanka',
    lastName: 'Gunasekara',
    role: 'doctor' as UserRole,
    email: 'priyanka.g@healthsphere.lk',
    avatar: null // Using fallback initials instead of non-existent image
  }
];

const blogPosts = [
  {
    title: 'Preventing Dengue Fever in Sri Lanka: Essential Tips for the Monsoon Season',
    slug: 'preventing-dengue-fever-sri-lanka-monsoon-tips',
    excerpt: 'With the onset of monsoon season, dengue fever cases typically rise in Sri Lanka. Learn essential prevention strategies to protect yourself and your family.',
    content: `
# Preventing Dengue Fever in Sri Lanka: Essential Tips for the Monsoon Season

As Sri Lanka enters the monsoon season, the risk of dengue fever significantly increases. This mosquito-borne disease has been a persistent health challenge in our country, but with proper knowledge and preventive measures, we can significantly reduce our risk.

## Understanding Dengue Fever

Dengue fever is caused by the dengue virus, which is transmitted through the bite of infected Aedes aegypti mosquitoes. These mosquitoes are most active during dawn and dusk and prefer to breed in clean, stagnant water.

## Key Prevention Strategies

### 1. Eliminate Breeding Sites
- Remove all sources of stagnant water around your home
- Clean water tanks, flower pots, and gutters regularly
- Cover water storage containers properly
- Change water in vases and pet bowls daily

### 2. Personal Protection
- Use mosquito repellents containing DEET
- Wear long-sleeved clothing, especially during dawn and dusk
- Use mosquito nets while sleeping
- Install screens on windows and doors

### 3. Community Efforts
- Participate in community clean-up drives
- Report potential breeding sites to local health authorities
- Educate neighbors about dengue prevention

## Recognizing Early Symptoms

If you experience any of these symptoms, seek medical attention immediately:
- High fever (40°C/104°F)
- Severe headache
- Pain behind the eyes
- Muscle and joint pain
- Skin rash
- Nausea and vomiting

## Treatment and Care

There is no specific medication for dengue fever. Treatment focuses on:
- Maintaining proper hydration
- Managing fever and pain with paracetamol (avoid aspirin)
- Regular monitoring of platelet count
- Immediate medical care for severe symptoms

## Conclusion

Prevention is our best defense against dengue fever. By working together as a community and maintaining vigilance, we can significantly reduce dengue transmission in Sri Lanka. Remember, a small effort from each individual can create a massive impact on public health.

Stay safe, stay informed, and let's work together to make Sri Lanka dengue-free.
    `,
    category: 'prevention' as BlogCategory,
    tags: ['dengue', 'monsoon', 'prevention', 'sri lanka', 'mosquito control'],
    status: 'published',
    featured: true,
    authorId: 'author_1',
    featuredImage: '/blog/dengue-prevention.jpg'
  },
  {
    title: 'Mental Health Awareness: Breaking the Stigma in Sri Lankan Society',
    slug: 'mental-health-awareness-breaking-stigma-sri-lanka',
    excerpt: 'Mental health is often overlooked in Sri Lankan society due to cultural stigma. Learn how we can create a more supportive environment for mental wellness.',
    content: `
# Mental Health Awareness: Breaking the Stigma in Sri Lankan Society

Mental health is an integral part of our overall well-being, yet it remains a topic shrouded in stigma and misunderstanding in Sri Lankan society. It's time we address this critical issue with the same urgency and care we give to physical health.

## The Current State of Mental Health in Sri Lanka

Sri Lanka faces significant challenges in mental health care:
- Limited mental health professionals
- Cultural stigma surrounding mental illness
- Lack of awareness about mental health conditions
- Inadequate funding for mental health services

## Common Mental Health Conditions

### Depression
Depression affects people of all ages and backgrounds. Symptoms include:
- Persistent sadness
- Loss of interest in activities
- Changes in appetite and sleep patterns
- Difficulty concentrating

### Anxiety Disorders
Anxiety can manifest in various forms:
- Generalized anxiety disorder
- Panic disorder
- Social anxiety
- Phobias

### Post-Traumatic Stress Disorder (PTSD)
Given Sri Lanka's history of conflict and natural disasters, PTSD is a significant concern affecting many individuals.

## Breaking the Stigma

### Education and Awareness
- Learn about mental health conditions
- Share accurate information with family and friends
- Challenge misconceptions when you encounter them

### Language Matters
- Use person-first language ("person with depression" rather than "depressed person")
- Avoid using mental health terms casually or as insults
- Speak openly about mental health without shame

### Support Systems
- Create safe spaces for open conversations
- Listen without judgment
- Encourage professional help when needed

## Traditional and Modern Approaches

Sri Lankan culture offers valuable resources for mental wellness:
- Meditation and mindfulness practices
- Community support systems
- Traditional healing methods
- Integration with modern psychiatric care

## Seeking Help

### When to Seek Professional Help
- Persistent symptoms affecting daily life
- Thoughts of self-harm
- Substance abuse
- Relationship problems due to mental health issues

### Available Resources in Sri Lanka
- National Institute of Mental Health (NIMH)
- Teaching hospitals with psychiatric units
- Private mental health practitioners
- Community mental health programs

## Supporting Loved Ones

### Do:
- Listen actively and without judgment
- Encourage professional help
- Be patient and understanding
- Take care of your own mental health

### Don't:
- Dismiss their feelings
- Give unsolicited advice
- Make it about yourself
- Force them to "get over it"

## Building a Mentally Healthy Society

Creating a mentally healthy Sri Lanka requires collective effort:
- Policy changes to improve mental health services
- Training for healthcare workers
- School-based mental health programs
- Workplace mental health initiatives

## Conclusion

Mental health is not a luxury—it's a necessity. By breaking the stigma, increasing awareness, and supporting those in need, we can build a more compassionate and understanding society. Remember, seeking help for mental health is a sign of strength, not weakness.

Let's work together to ensure that every Sri Lankan has access to the mental health support they deserve.
    `,
    category: 'mental_health' as BlogCategory,
    tags: ['mental health', 'stigma', 'awareness', 'sri lanka', 'depression', 'anxiety'],
    status: 'published',
    featured: true,
    authorId: 'author_6',
    featuredImage: '/blog/mental-health-awareness.jpg'
  },
  {
    title: 'Nutrition Guidelines for Sri Lankan Families: Balancing Traditional and Modern Diets',
    slug: 'nutrition-guidelines-sri-lankan-families-traditional-modern-diets',
    excerpt: 'Discover how to maintain optimal nutrition by combining the best of traditional Sri Lankan cuisine with modern nutritional science.',
    content: `
# Nutrition Guidelines for Sri Lankan Families: Balancing Traditional and Modern Diets

Sri Lankan cuisine is rich in flavors, spices, and nutrients. However, modern lifestyle changes have affected our eating habits. Let's explore how to maintain optimal nutrition by honoring our culinary traditions while embracing nutritional science.

## The Nutritional Wealth of Traditional Sri Lankan Food

### Rice: The Foundation
Rice provides:
- Complex carbohydrates for sustained energy
- B vitamins for metabolism
- Fiber (especially red rice and brown rice)

### Coconut: A Nutritional Powerhouse
- Healthy saturated fats
- Medium-chain triglycerides (MCTs)
- Fiber and minerals

### Spices: Nature's Medicine
- Turmeric: Anti-inflammatory properties
- Cinnamon: Blood sugar regulation
- Cardamom: Digestive health
- Cloves: Antioxidant benefits

### Traditional Vegetables and Fruits
- Bitter gourd: Blood sugar control
- Drumstick: Rich in vitamins and minerals
- Jackfruit: High in fiber and vitamin C
- Papaya: Digestive enzymes

## Modern Nutritional Challenges

### Processed Foods
- High sodium content
- Added sugars
- Trans fats
- Artificial preservatives

### Lifestyle Changes
- Reduced physical activity
- Irregular meal times
- Increased portion sizes
- Less home cooking

## Creating a Balanced Sri Lankan Diet

### The Ideal Plate
- 1/2 plate: Vegetables and fruits
- 1/4 plate: Whole grains (red rice, brown rice)
- 1/4 plate: Protein (fish, chicken, legumes)
- Small amount: Healthy fats (coconut oil, nuts)

### Sample Daily Menu

**Breakfast:**
- Red rice string hoppers with sambol
- Fresh fruit (papaya or banana)
- Ceylon tea without sugar

**Mid-Morning Snack:**
- Roasted peanuts or cashews
- King coconut water

**Lunch:**
- Red rice
- Fish curry (mackerel or tuna)
- Malluma (green leafy vegetables)
- Dhal curry
- Fresh salad

**Afternoon Snack:**
- Traditional fruit (mango, guava, or wood apple)
- Herbal tea

**Dinner:**
- Roti or red rice (smaller portion)
- Vegetable curry
- Chicken or egg curry
- Gotukola sambol

### Hydration
- 8-10 glasses of water daily
- King coconut water
- Herbal teas (ranawara, iramusu)

## Special Considerations

### For Children
- Include dairy or calcium-rich foods
- Ensure adequate protein for growth
- Limit processed snacks
- Encourage traditional games for physical activity

### For Elderly
- Softer textures when needed
- Adequate protein to prevent muscle loss
- Calcium and vitamin D for bone health
- Fiber for digestive health

### For Diabetes Management
- Choose red rice over white rice
- Include more vegetables
- Control portion sizes
- Regular meal timing

## Cooking Methods for Better Nutrition

### Traditional Methods to Continue
- Steaming (appa, string hoppers)
- Boiling (rice, vegetables)
- Grilling (fish, chicken)

### Methods to Limit
- Deep frying
- Excessive oil use
- Overcooking vegetables

## Shopping and Meal Planning Tips

### Local Markets
- Buy seasonal fruits and vegetables
- Choose fresh fish from coastal areas
- Support local farmers

### Meal Preparation
- Cook in batches
- Prepare sambol and curry bases ahead
- Store properly to maintain nutrition

## Addressing Common Nutritional Deficiencies

### Iron Deficiency
- Include green leafy vegetables
- Combine with vitamin C sources
- Traditional iron-rich foods like kankun

### Vitamin D
- Morning sunlight exposure
- Include fatty fish in diet
- Consider supplements if needed

### Calcium
- Traditional dairy products
- Sesame seeds (thala)
- Green leafy vegetables

## Conclusion

Maintaining good nutrition doesn't mean abandoning our culinary heritage. By making informed choices, controlling portions, and emphasizing whole foods, we can enjoy the best of both traditional Sri Lankan cuisine and modern nutritional knowledge.

Remember, small changes lead to big improvements in health. Start with one meal at a time and gradually transform your family's eating habits for better health and well-being.
    `,
    category: 'nutrition' as BlogCategory,
    tags: ['nutrition', 'sri lankan cuisine', 'traditional food', 'healthy eating', 'family nutrition'],
    status: 'published',
    featured: false,
    authorId: 'author_4',
    featuredImage: '/blog/sri-lankan-nutrition.jpg'
  },
  {
    title: 'Digital Health Records: Revolutionizing Healthcare in Sri Lanka',
    slug: 'digital-health-records-revolutionizing-healthcare-sri-lanka',
    excerpt: 'Explore how digital health records are transforming healthcare delivery and patient outcomes in Sri Lankan medical institutions.',
    content: `
# Digital Health Records: Revolutionizing Healthcare in Sri Lanka

The healthcare landscape in Sri Lanka is undergoing a digital transformation. Digital health records are at the forefront of this change, promising improved patient care, reduced medical errors, and enhanced healthcare delivery across the island.

## What Are Digital Health Records?

Digital health records, also known as Electronic Health Records (EHR), are digital versions of patients' paper charts. They contain:
- Medical history
- Diagnoses and treatments
- Medications and allergies
- Laboratory and imaging results
- Vital signs and demographics

## Benefits for Patients

### Improved Accessibility
- Access medical records from any healthcare facility
- Reduced waiting times
- Better coordination between specialists

### Enhanced Safety
- Reduced medication errors
- Allergy alerts
- Drug interaction warnings
- Complete medical history available to all providers

### Better Outcomes
- More informed medical decisions
- Faster diagnosis and treatment
- Improved follow-up care

## Benefits for Healthcare Providers

### Efficiency Gains
- Faster access to patient information
- Reduced paperwork
- Streamlined workflow
- Automated appointment scheduling

### Quality Improvement
- Evidence-based treatment protocols
- Clinical decision support
- Quality metrics tracking
- Reduced duplicate tests

### Cost Reduction
- Decreased administrative costs
- Reduced medical errors
- Improved resource utilization
- Better inventory management

## Implementation Challenges in Sri Lanka

### Infrastructure Requirements
- Reliable internet connectivity
- Power backup systems
- Hardware and software investments
- Network security measures

### Training and Adoption
- Staff training programs
- Change management
- User acceptance
- Continuous support

### Privacy and Security
- Data protection regulations
- Cybersecurity measures
- Access controls
- Audit trails

## Current Status in Sri Lanka

### Government Initiatives
- National eHealth policy
- Hospital information systems
- Telemedicine programs
- Digital health strategy

### Private Sector Adoption
- Leading private hospitals implementing EHR
- Integration with insurance systems
- Mobile health applications
- Patient portals

## Success Stories

### Colombo National Hospital
Implementation of digital systems has resulted in:
- 30% reduction in patient waiting times
- 25% decrease in medication errors
- Improved patient satisfaction scores

### Private Healthcare Networks
- Seamless patient transfers between facilities
- Coordinated specialist care
- Reduced duplicate tests
- Better emergency response

## Patient Privacy and Data Security

### Legal Framework
- Data Protection Act compliance
- Medical confidentiality requirements
- Patient consent protocols
- Cross-border data regulations

### Technical Safeguards
- Encryption of data
- Multi-factor authentication
- Regular security audits
- Backup and recovery systems

## Future Opportunities

### Artificial Intelligence Integration
- Predictive analytics for disease prevention
- Automated diagnostic assistance
- Drug discovery and development
- Personalized treatment plans

### Telemedicine Expansion
- Remote consultations
- Home monitoring devices
- Mobile health apps
- Rural healthcare access

### Population Health Management
- Disease surveillance
- Epidemic tracking
- Public health research
- Health policy development

## Preparing for the Digital Future

### For Healthcare Professionals
- Embrace technology training
- Understand privacy requirements
- Participate in system design
- Provide feedback for improvements

### For Patients
- Learn about digital health tools
- Understand your rights
- Maintain personal health records
- Engage with patient portals

### For Healthcare Institutions
- Develop digital strategies
- Invest in infrastructure
- Train staff adequately
- Ensure cybersecurity

## Recommendations for Successful Implementation

### Phased Approach
- Start with core modules
- Gradually expand functionality
- Monitor and adjust
- Learn from early experiences

### Stakeholder Engagement
- Involve all user groups
- Regular communication
- Address concerns promptly
- Celebrate successes

### Continuous Improvement
- Regular system updates
- User feedback incorporation
- Performance monitoring
- Technology upgrades

## Conclusion

Digital health records represent a paradigm shift in healthcare delivery. While challenges exist, the benefits for patients, providers, and the healthcare system as a whole are substantial. Sri Lanka has the opportunity to leapfrog traditional healthcare limitations and build a modern, efficient, and patient-centered healthcare system.

The success of this transformation depends on collaboration between government, healthcare providers, technology companies, and patients. Together, we can build a digitally enabled healthcare system that serves all Sri Lankans better.
    `,
    category: 'technology' as BlogCategory,
    tags: ['digital health', 'EHR', 'technology', 'healthcare innovation', 'sri lanka'],
    status: 'published',
    featured: true,
    authorId: 'author_3',
    featuredImage: '/blog/digital-health-records.jpg'
  },
  {
    title: 'Exercise and Physical Activity for Seniors: A Guide for Active Aging',
    slug: 'exercise-physical-activity-seniors-active-aging-guide',
    excerpt: 'Discover safe and effective exercise routines designed specifically for senior citizens to maintain health, mobility, and independence.',
    content: `
# Exercise and Physical Activity for Seniors: A Guide for Active Aging

As we age, staying physically active becomes increasingly important for maintaining health, independence, and quality of life. This comprehensive guide provides safe and effective exercise strategies specifically designed for senior citizens.

## The Importance of Exercise for Seniors

### Physical Benefits
- Maintains muscle mass and bone density
- Improves cardiovascular health
- Enhances balance and coordination
- Reduces risk of falls
- Manages chronic conditions

### Mental Health Benefits
- Reduces depression and anxiety
- Improves cognitive function
- Enhances mood and self-esteem
- Promotes better sleep
- Increases social interaction

### Independence Benefits
- Maintains ability to perform daily activities
- Reduces dependency on others
- Improves mobility and flexibility
- Enhances overall quality of life

## Types of Exercise for Seniors

### 1. Cardiovascular Exercise
**Benefits:** Heart health, endurance, weight management

**Safe Options:**
- Walking (start with 10-15 minutes daily)
- Swimming or water aerobics
- Stationary cycling
- Chair exercises
- Dancing

**Progression:**
- Week 1-2: 10-15 minutes, 3 times per week
- Week 3-4: 15-20 minutes, 4 times per week
- Week 5+: 20-30 minutes, 5 times per week

### 2. Strength Training
**Benefits:** Muscle mass, bone density, metabolism

**Equipment Needed:**
- Light weights (1-3 lbs to start)
- Resistance bands
- Water bottles as weights
- Body weight exercises

**Sample Exercises:**
- Chair stands
- Wall push-ups
- Bicep curls
- Leg raises
- Modified squats

### 3. Flexibility and Stretching
**Benefits:** Range of motion, reduced stiffness, injury prevention

**Daily Routine:**
- Morning stretches (5-10 minutes)
- Post-exercise stretches
- Evening relaxation stretches

**Key Areas to Focus:**
- Neck and shoulders
- Back and spine
- Hips and legs
- Arms and wrists

### 4. Balance and Coordination
**Benefits:** Fall prevention, stability, confidence

**Simple Exercises:**
- Standing on one foot
- Heel-to-toe walking
- Tai Chi movements
- Standing from sitting without using hands
- Side leg raises

## Getting Started Safely

### Medical Clearance
- Consult with healthcare provider
- Discuss current medications
- Review existing health conditions
- Get baseline fitness assessment

### Starting Slowly
- Begin with 10-15 minutes of activity
- Increase duration before intensity
- Rest days are important
- Listen to your body

### Warning Signs to Stop Exercise
- Chest pain or pressure
- Difficulty breathing
- Dizziness or lightheadedness
- Severe joint pain
- Unusual fatigue

## Sample Weekly Exercise Schedule

### Monday: Cardio + Stretching
- 20-minute walk
- 10 minutes of stretching

### Tuesday: Strength Training
- Upper body exercises
- Core strengthening
- Cool-down stretches

### Wednesday: Balance + Flexibility
- Balance exercises
- Yoga or gentle stretching
- Relaxation techniques

### Thursday: Cardio + Strength
- 15-minute bike ride or swim
- Lower body strength exercises

### Friday: Active Recovery
- Gentle stretching
- Light housework or gardening
- Social activities

### Weekend: Enjoyable Activities
- Dancing, walking with friends
- Recreational activities
- Family activities

## Exercise Modifications for Common Conditions

### Arthritis
- Low-impact activities
- Water exercises
- Gentle range of motion
- Heat therapy before exercise

### Diabetes
- Regular, consistent exercise
- Monitor blood sugar levels
- Stay hydrated
- Carry glucose tablets

### Heart Disease
- Moderate intensity only
- Avoid sudden intensity changes
- Monitor heart rate
- Stop if experiencing symptoms

### Osteoporosis
- Weight-bearing exercises
- Avoid spinal flexion
- Focus on posture
- Include balance training

## Exercise Equipment for Seniors

### Essential Items
- Comfortable, supportive shoes
- Water bottle
- Towel
- Chair for support

### Optional Equipment
- Light weights or resistance bands
- Exercise mat
- Stability ball
- Pedometer or fitness tracker

## Creating an Exercise Environment

### At Home
- Clear space of obstacles
- Good lighting
- Non-slip surfaces
- Emergency contact nearby

### Community Options
- Senior centers
- Local gyms with senior programs
- Swimming pools
- Walking groups
- Parks and recreational areas

## Staying Motivated

### Set Realistic Goals
- Start with small, achievable targets
- Celebrate progress
- Focus on how you feel
- Track improvements

### Find Exercise Partners
- Join senior exercise groups
- Exercise with family members
- Find walking buddies
- Participate in community activities

### Make it Enjoyable
- Choose activities you enjoy
- Listen to music
- Exercise outdoors when possible
- Vary your routine

## Nutrition and Hydration

### Pre-Exercise
- Light snack if needed
- Adequate hydration
- Avoid large meals

### During Exercise
- Sip water regularly
- Stop if feeling unwell
- Rest when needed

### Post-Exercise
- Rehydrate
- Light, nutritious snack
- Gentle stretching

## When to Seek Professional Help

### Consider a Fitness Professional When:
- Starting a new exercise program
- Recovering from injury
- Managing chronic conditions
- Needing motivation and accountability

### Types of Professionals
- Certified senior fitness trainers
- Physical therapists
- Occupational therapists
- Registered nurses with fitness training

## Technology and Exercise

### Helpful Apps and Devices
- Step counters and fitness trackers
- Exercise video apps
- Heart rate monitors
- Balance training apps

### Virtual Exercise Options
- Online senior fitness classes
- Video call exercise sessions
- YouTube exercise channels
- Telehealth fitness consultations

## Conclusion

Regular exercise is one of the most powerful tools for healthy aging. By starting slowly, choosing appropriate activities, and listening to your body, you can safely incorporate physical activity into your daily routine.

Remember, it's never too late to start exercising. Every bit of movement counts, and the benefits begin immediately. Consult with your healthcare provider, set realistic goals, and enjoy the journey to a more active, healthier lifestyle.

Your future self will thank you for the investment you make in your health today.
    `,
    category: 'senior_health' as BlogCategory,
    tags: ['senior health', 'exercise', 'active aging', 'fitness', 'physical activity'],
    status: 'published',
    featured: false,
    authorId: 'author_2',
    featuredImage: '/blog/senior-exercise.jpg'
  },
  {
    title: 'Understanding Diabetes Management in the Sri Lankan Context',
    slug: 'understanding-diabetes-management-sri-lankan-context',
    excerpt: 'A comprehensive guide to managing diabetes with culturally relevant strategies, traditional remedies, and modern medical approaches in Sri Lanka.',
    content: `
# Understanding Diabetes Management in the Sri Lankan Context

Diabetes has become increasingly prevalent in Sri Lanka, affecting millions of our citizens. This comprehensive guide combines modern medical knowledge with cultural understanding to help Sri Lankans effectively manage diabetes while honoring our food traditions and lifestyle.

## Diabetes in Sri Lanka: Current Scenario

### Prevalence and Trends
- Approximately 1 in 10 adults has diabetes
- Rising incidence in urban areas
- Increasing rates among younger populations
- Higher prevalence in certain ethnic groups

### Contributing Factors
- Genetic predisposition
- Lifestyle changes
- Urbanization and sedentary jobs
- Changes in dietary patterns
- Stress and environmental factors

## Types of Diabetes

### Type 1 Diabetes
- Usually develops in childhood or young adulthood
- Requires insulin therapy
- Represents about 5-10% of cases
- Not preventable with current knowledge

### Type 2 Diabetes
- Most common type (90-95% of cases)
- Often develops after age 40
- Related to lifestyle factors
- Can often be prevented or delayed

### Gestational Diabetes
- Develops during pregnancy
- Usually resolves after delivery
- Increases risk of Type 2 diabetes later
- Requires careful monitoring

## Cultural and Dietary Considerations

### Traditional Sri Lankan Diet and Diabetes

**Rice-Based Meals:**
- Choose red rice over white rice
- Control portion sizes
- Combine with high-fiber vegetables
- Consider alternative grains like finger millet

**Coconut in the Diet:**
- Moderate use of coconut oil
- Fresh coconut in moderation
- Coconut milk - use sparingly
- Virgin coconut oil may have benefits

**Traditional Vegetables:**
- Bitter gourd (karawila) - excellent for blood sugar
- Drumstick (murunga) - high in nutrients
- Green leafy vegetables (kankun, nivithi)
- Okra (bandakka) - helps control glucose

### Adapting Traditional Recipes

**Rice and Curry Meals:**
- Reduce rice portion to 1/2 cup cooked
- Increase vegetable curry portions
- Include a lean protein
- Add a fresh salad

**String Hoppers and Roti:**
- Use whole grain flour when possible
- Control portion sizes
- Pair with vegetable curries
- Avoid high-fat accompaniments

**Snacks and Sweets:**
- Traditional fruits instead of processed snacks
- Roasted nuts and seeds
- Herbal teas instead of sweet drinks
- Save traditional sweets for special occasions

## Blood Sugar Management

### Target Blood Sugar Levels
- Fasting: 80-130 mg/dL (4.4-7.2 mmol/L)
- After meals: Less than 180 mg/dL (10.0 mmol/L)
- HbA1c: Less than 7% for most adults

### Monitoring Techniques
- Regular blood glucose testing
- HbA1c tests every 3-6 months
- Keeping a food and blood sugar diary
- Understanding patterns and triggers

### Factors Affecting Blood Sugar
- Food choices and timing
- Physical activity levels
- Stress and emotions
- Illness and medications
- Sleep quality

## Traditional Remedies and Their Role

### Evidence-Based Traditional Options

**Bitter Gourd (Karawila):**
- Contains compounds that lower blood sugar
- Can be consumed as juice or curry
- Start with small amounts
- Monitor blood sugar response

**Fenugreek (Hulba):**
- Seeds can help improve glucose tolerance
- Soak overnight and consume in the morning
- Can be added to curries
- Consult healthcare provider before use

**Cinnamon (Kurundu):**
- May help improve insulin sensitivity
- Use Ceylon cinnamon, not Cassia
- Add to tea or food
- Modest effects, not a replacement for medication

**Garlic (Sudulunu):**
- May help with blood sugar control
- Include in daily cooking
- Raw or cooked forms both beneficial
- Part of a balanced approach

### Important Cautions
- Traditional remedies complement, not replace medical treatment
- Always inform your doctor about herbal supplements
- Monitor blood sugar carefully when trying new remedies
- Some herbs can interact with medications

## Physical Activity and Exercise

### Exercise Benefits for Diabetes
- Improves insulin sensitivity
- Helps with weight management
- Lowers blood pressure
- Reduces cardiovascular risk
- Improves mood and energy

### Suitable Activities for Sri Lankans
- Walking (especially early morning)
- Swimming or water aerobics
- Cycling or stationary bike
- Traditional dancing
- Yoga and meditation
- Gardening and household activities

### Exercise Guidelines
- Aim for 150 minutes per week
- Include both cardio and strength training
- Start slowly and build up gradually
- Monitor blood sugar before and after exercise
- Stay hydrated, especially in hot weather

## Stress Management

### Impact of Stress on Diabetes
- Raises blood sugar levels
- Affects eating and exercise habits
- Impacts sleep quality
- Increases risk of complications

### Traditional Stress Management
- Meditation and mindfulness practices
- Prayer and spiritual activities
- Community and family support
- Traditional music and arts
- Connection with nature

### Modern Approaches
- Counseling and therapy
- Support groups
- Stress reduction techniques
- Work-life balance
- Regular sleep schedule

## Managing Diabetes During Festivals and Celebrations

### Buddhist and Hindu Festivals
- Plan ahead for special foods
- Eat smaller portions of traditional sweets
- Focus on the social aspects, not just food
- Bring diabetes-friendly dishes to share

### Sinhala and Tamil New Year
- Enjoy traditional foods in moderation
- Balance sweet treats with physical activity
- Don't skip meals to "save up" for special foods
- Keep medications on schedule

### Wesak and Religious Observances
- Maintain regular meal times during fasting
- Choose healthy options when breaking fasts
- Stay hydrated
- Continue medication as prescribed

## Medication Management

### Types of Diabetes Medications
- Metformin (first-line treatment)
- Insulin (various types and timing)
- Other glucose-lowering medications
- Blood pressure and cholesterol medications

### Taking Medications Properly
- Follow prescribed schedules
- Don't skip doses
- Store medications properly (especially insulin)
- Understand potential side effects
- Regular follow-ups with healthcare provider

### Medication Access in Sri Lanka
- Government hospital services
- Private healthcare options
- Medication subsidies and programs
- Generic medication availability

## Preventing Complications

### Regular Health Screenings
- Eye examinations (diabetic retinopathy)
- Kidney function tests
- Foot examinations
- Cardiovascular assessments
- Blood pressure and cholesterol monitoring

### Daily Self-Care
- Daily foot inspection and care
- Proper dental hygiene
- Skin care and wound management
- Blood pressure monitoring
- Regular medication adherence

### When to Seek Immediate Care
- Blood sugar very high (over 300 mg/dL)
- Signs of diabetic ketoacidosis
- Severe hypoglycemia
- Foot injuries or infections
- Sudden vision changes

## Building Your Support Network

### Healthcare Team
- Primary care physician
- Endocrinologist or diabetes specialist
- Diabetes educator
- Nutritionist or dietitian
- Pharmacist

### Family and Community
- Educate family members about diabetes
- Find local diabetes support groups
- Connect with others managing diabetes
- Share experiences and tips
- Create accountability partnerships

## Economic Aspects of Diabetes Management

### Cost-Effective Strategies
- Generic medications when appropriate
- Home blood glucose monitoring
- Preventive care to avoid complications
- Community health programs
- Government healthcare services

### Health Insurance
- Understand your coverage
- Know what's included for diabetes care
- Plan for out-of-pocket expenses
- Consider supplemental insurance

## Looking Forward: Technology and Diabetes

### Emerging Tools
- Continuous glucose monitors
- Smartphone apps for tracking
- Telemedicine consultations
- Online education resources
- Digital support communities

### Artificial Intelligence and Prediction
- Apps that predict blood sugar patterns
- Medication adherence reminders
- Lifestyle coaching programs
- Risk assessment tools

## Conclusion

Managing diabetes in Sri Lanka requires a comprehensive approach that honors our cultural traditions while embracing modern medical knowledge. Success comes from combining proper medical care, appropriate lifestyle modifications, family support, and community resources.

Remember that diabetes management is a marathon, not a sprint. Small, consistent changes in diet, exercise, and self-care can lead to significant improvements in health outcomes. Work closely with your healthcare team, stay connected with your support network, and never hesitate to ask questions or seek help.

With proper management, people with diabetes can live full, healthy, and productive lives. Your journey with diabetes is unique, but you're not alone. Take it one day at a time, celebrate small victories, and keep working toward better health.

The key to successful diabetes management is education, support, and consistent action. By combining the wisdom of our traditions with the power of modern medicine, we can effectively manage diabetes and prevent complications.
    `,
    category: 'chronic_diseases' as BlogCategory,
    tags: ['diabetes', 'chronic disease', 'sri lanka', 'traditional medicine', 'lifestyle management'],
    status: 'published',
    featured: false,
    authorId: 'author_1',
    featuredImage: '/blog/diabetes-management.jpg'
  }
];

export async function seedBlogData(): Promise<void> {
  try {
    console.log('Starting blog data seeding...');

    // Check if blog posts already exist
    const existingPostsQuery = query(collection(db, 'blog_posts'));
    const existingPosts = await getDocs(existingPostsQuery);
    
    if (existingPosts.size > 0) {
      console.log('Blog posts already exist. Skipping seeding.');
      return;
    }

    // Seed authors first
    for (const author of sriLankanAuthors) {
      await setDoc(doc(db, 'users', author.id), {
        id: author.id,
        email: author.email,
        firstName: author.firstName,
        lastName: author.lastName,
        role: author.role,
        profileImageUrl: author.avatar,
        isActive: true,
        isEmailVerified: true,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    // Seed blog posts
    for (const post of blogPosts) {
      const author = sriLankanAuthors.find(a => a.id === post.authorId);
      if (!author) continue;

      const readingTime = Math.ceil(post.content.split(' ').length / 200);
      const publishedDate = new Date();
      publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 30));

      await addDoc(collection(db, 'blog_posts'), {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        category: post.category,
        tags: post.tags,
        status: post.status,
        featured: post.featured,
        readingTime,
        views: Math.floor(Math.random() * 1000) + 100,
        likes: Math.floor(Math.random() * 50) + 10,
        authorId: post.authorId,
        authorName: `${author.firstName} ${author.lastName}`,
        authorRole: author.role,
        authorAvatar: author.avatar,
        featuredImage: post.featuredImage,
        publishedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        seoTitle: post.title,
        seoDescription: post.excerpt,
        keywords: post.tags,
        relatedPosts: []
      });
    }

    // Seed some comments
    const commentsData = [
      {
        content: "Very informative article! As someone living in Colombo, I found the dengue prevention tips extremely helpful.",
        userName: "Sunil Wickramasinghe",
        userRole: "patient"
      },
      {
        content: "Thank you for addressing mental health stigma. This is much needed in our society.",
        userName: "Meditation Practitioner",
        userRole: "patient"
      },
      {
        content: "The traditional Sri Lankan nutrition guide is excellent. My grandmother always said the same things!",
        userName: "Anoma Rathnayake",
        userRole: "patient"
      }
    ];

    // Add comments to random posts
    const postsSnapshot = await getDocs(collection(db, 'blog_posts'));
    const postIds = postsSnapshot.docs.map(doc => doc.id);

    for (const comment of commentsData) {
      const randomPostId = postIds[Math.floor(Math.random() * postIds.length)];
      await addDoc(collection(db, 'blog_comments'), {
        postId: randomPostId,
        userId: `user_${Math.random().toString(36).substr(2, 9)}`,
        userName: comment.userName,
        userRole: comment.userRole,
        content: comment.content,
        approved: true,
        likes: Math.floor(Math.random() * 10),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    }

    console.log('Blog data seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding blog data:', error);
    throw error;
  }
}

// Function to clear blog data (for development purposes)
export async function clearBlogData(): Promise<void> {
  try {
    console.log('Clearing blog data...');
    
    // Clear blog posts
    const postsSnapshot = await getDocs(collection(db, 'blog_posts'));
    const deletePromises = postsSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    // Clear comments
    const commentsSnapshot = await getDocs(collection(db, 'blog_comments'));
    const commentDeletePromises = commentsSnapshot.docs.map(doc => 
      deleteDoc(doc.ref)
    );
    
    await Promise.all([...deletePromises, ...commentDeletePromises]);
    
    console.log('Blog data cleared successfully!');
  } catch (error) {
    console.error('Error clearing blog data:', error);
    throw error;
  }
}
