import heroImage from '../assets/landing/landing hero.jpg';
import featuresImage from '../assets/landing/landign features.jpg';
import platformImage from '../assets/landing/landing page 1.png';
import knowledgeImage from '../assets/landing/landing_knowledge.jpg';
import progressImage from '../assets/landing/landing_progress.jpg';
import whyImage from '../assets/landing/landing_why choose us.jpg';
import authImage from '../assets/landing/log in and sign up pages.jpg';

export const landingAssets = {
  hero: heroImage,
  features: featuresImage,
  platform: platformImage,
  knowledge: knowledgeImage,
  progress: progressImage,
  why: whyImage,
  auth: authImage,
};

export const landingTeachers = [
  {
    id: 'teacher-1',
    name: 'أ. ياسمين السعدي',
    subject: 'محتوى تعليمي',
    bio: 'شرح منظم يساعدك تتابع وتفهم خطوة بخطوة.',
    stage: 'تالتة اعدادي',
    rating: 4.9,
    studentsCount: 320,
  },
  {
    id: 'teacher-2',
    name: 'أ. خالد الشمري',
    subject: 'محتوى تعليمي',
    bio: 'خبرة تساعدك تختار المحتوى اللي يناسب مستواك.',
    stage: 'تانية ثانوي',
    rating: 4.8,
    studentsCount: 410,
  },
];

export const landingFeatures = [
  { id: 'f-1', number: 1, title: 'محتوى منسق', description: 'دروس مرتبة ومبسطة تناسب كل مستوى', icon: '📚' },
  { id: 'f-2', number: 2, title: 'متابعة شخصية', description: 'تقارير وتحديثات لتتبع تقدمك', icon: '👩‍🏫' },
  { id: 'f-3', number: 3, title: 'اختبارات دورية', description: 'اختبارات تساعدك على التقييم والتحسن', icon: '📝' },
  { id: 'f-4', number: 4, title: 'دعم مباشر', description: 'تواصل مع المدرس واستفسر بسهولة', icon: '💬' },
  { id: 'f-5', number: 5, title: 'شهادات إتمام', description: 'احصل على شهادة عند إنهاء المسار', icon: '🏅' },
];

export const landingCourses = [
  { id: 'c-1', title: 'محتوى البداية', instructorId: 'teacher-1', price: 0, duration: '8 أسابيع', image: platformImage },
  { id: 'c-2', title: 'تعلّم بطريقة منظمة', instructorId: 'teacher-1', price: 120, duration: '10 أسابيع', image: knowledgeImage },
  { id: 'c-3', title: 'مراجعة وتطبيق', instructorId: 'teacher-2', price: 150, duration: '12 أسابيع', image: featuresImage },
  { id: 'c-4', title: 'استعد لهدفك', instructorId: 'teacher-2', price: 200, duration: '6 أسابيع', image: progressImage },
  { id: 'c-5', title: 'جلسات سريعة', instructorId: 'teacher-1', price: 30, duration: 'مباشر', image: whyImage },
];
