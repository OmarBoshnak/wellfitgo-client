import { Ionicons } from '@expo/vector-icons';

export interface Slide {
    id: number;
    title: string;
    description: string;
    gradientColors: readonly [string, string];
}

export const Slides: Slide[] = [
    {
        id: 1,
        title: 'هنساعدك تكمل لحد ماتوصل',
        description:
            'خلال فترة الاشتراك تقدر تبعتلنا اي اسئلة واستفسارات عن اي حاجة في النظام الغذائي',
        gradientColors: ['#5073FE', '#7B68EE'] as const,
    },
    {
        id: 2,
        title: 'برنامج جديد كل اسبوع',
        description:
            'هنبعتلك نظام جديد تبدأ بيه الاسبوع، و واحدة واحدة معانا هنوصلك لتغيير نظام التغذية',
        gradientColors: ['#02C3CD', '#00CED1'] as const,
    },
    {
        id: 3,
        title: 'هتخس وانت مبسوط',
        description:
            'من خلال دمج الجوانب العلمية من التغذية الصحية السليمة مع الجانب النفسي',
        gradientColors: ['#FF6B6B', '#FFE66D'] as const,
    },
];

// Onboarding button labels
export const onboardingLabels = {
    skip: 'تخطي',
    next: 'التالي',
    getStarted: 'ابدأ ',
};

