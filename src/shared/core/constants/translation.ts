import { I18nManager } from 'react-native';

// RTL detection - defaults to true for Arabic-first app
export const isRTL = I18nManager.isRTL || true;

// Auth screen translations
export const authTranslations = {
    // Welcome
    welcomeTitle: isRTL ? 'مرحباً بعودتك' : 'Welcome Back',
    welcomeSubtitle: isRTL ? 'سجل الدخول للمتابعة' : 'Login to continue your journey',

    // Labels
    phoneLabel: isRTL ? 'رقم الهاتف' : 'Phone Number',
    emailLabel: isRTL ? 'البريد الإلكتروني' : 'Email',
    passwordLabel: isRTL ? 'كلمة المرور' : 'Password',

    // Buttons
    sendOTP: isRTL ? 'إرسال رمز التحقق' : 'Send OTP',
    login: isRTL ? 'تسجيل الدخول' : 'Login',
    loginWithEmail: isRTL ? 'تسجيل الدخول بالبريد الإلكتروني' : 'Login with Email',
    loginWithPhone: isRTL ? 'تسجيل الدخول برقم الهاتف' : 'Login with Phone',
    loginWithFacebook: isRTL ? 'تسجيل الدخول بإستخدام فيسبوك' : 'Login with Facebook',
    loginWithGoogle: isRTL ? 'تسجيل الدخول بإستخدام جوجل' : 'Login with Google',
    backToPhone: isRTL ? 'العودة إلى تسجيل الدخول بالهاتف' : 'Back to Phone Login',

    // Links
    forgotPassword: isRTL ? 'نسيت كلمة المرور؟' : 'Forgot Password?',
    noAccount: isRTL ? 'ليس لديك حساب؟' : "Don't have an account?",
    signUp: isRTL ? 'إنشاء حساب' : 'Sign Up',

    // Other
    orContinueWith: isRTL ? 'أو تابع مع' : 'Or continue with',
    orLoginWith: isRTL ? 'أو سجل دخول عن طريق' : 'Or login with',
    selectCountry: isRTL ? 'اختر الدولة' : 'Select Country',

    // App Welcome
    appWelcome: isRTL ? 'أهلا بيك في ويل. فيت. جو!' : 'Welcome to WellFit Go!',
};

// OTP verification translations
export const otpTranslations = {
    title: isRTL ? 'أدخل رمز التحقق' : 'Enter Verification Code',
    subtitle: isRTL ? 'أرسلنا رمزًا مكونًا من 6 أرقام إلى' : 'We sent a 6-digit code to',
    resendIn: isRTL ? 'إعادة الإرسال خلال' : 'Resend code in',
    resendCode: isRTL ? 'إعادة إرسال الرمز' : 'Resend Code',
    verifying: isRTL ? 'جاري التحقق...' : 'Verifying...',
    verified: isRTL ? 'تم التحقق بنجاح!' : 'Verified Successfully!',
    didntReceive: isRTL ? 'لم تستلم الرمز؟' : "Didn't receive the code?",
    changePhone: isRTL ? 'تغيير رقم الهاتف' : 'Change Phone Number',
};

// Health history / onboarding translations
export const healthTranslations = {
    quickSetup: isRTL ? 'الإعداد السريع' : 'Quick Setup',
    personalizeTitle: isRTL ? 'لنقم بتخصيص خطتك' : "Let's personalize your plan",
    firstName: isRTL ? 'الاسم الأول' : 'First Name',
    lastName: isRTL ? 'الاسم الاخير' : 'Last Name',
    phoneNumber: isRTL ? 'رقم الموبايل' : 'Phone Number',
    enterName: isRTL ? 'أدخل اسمك' : 'Enter your name',
    gender: isRTL ? 'الجنس' : 'Gender',
    male: isRTL ? 'ذكر' : 'Male',
    female: isRTL ? 'أنثى' : 'Female',
    yourAge: isRTL ? 'السن' : 'Age',
    years: isRTL ? 'سنة' : 'years',
    height: isRTL ? 'الطول' : 'Height',
    whatHeight: isRTL ? 'ما هو طولك؟' : 'What is your height?',
    currentWeight: isRTL ? 'الوزن الحالي' : 'Current Weight',
    targetWeight: isRTL ? 'الوزن المستهدف' : 'Target Weight',
    goal: isRTL ? 'هدفك' : 'Your Goal',
    weightLoss: isRTL ? 'خسارة الوزن' : 'Lose Weight',
    maintainWeight: isRTL ? 'الحفاظ على الوزن' : 'Maintain Weight',
    gainMuscle: isRTL ? 'بناء عضلات' : 'Build Muscle',
    medicalConditions: isRTL ? 'هل لديك أي أمراض أخرى؟' : 'Medical Conditions',
    medicalPlaceholder: isRTL ? ' مثل الضغط أو السكري' : 'Optional: e.g. blood pressure, diabetes',
    // Medical condition chips
    conditionNone: isRTL ? 'لا يوجد' : 'None',
    conditionDiabetes: isRTL ? 'سكري' : 'Diabetes',
    conditionHypertension: isRTL ? 'ضغط' : 'Hypertension',
    conditionPCOS: 'PCOS',
    conditionOther: isRTL ? 'أخرى' : 'Other',
    startJourney: isRTL ? 'ابدأ رحلتي' : 'Start My Journey',
};

// Home screen translations
export const homeTranslations = {
    // Greetings
    goodMorning: isRTL ? 'صباح الخير' : 'Good morning',
    goodAfternoon: isRTL ? 'مساء الخير' : 'Good afternoon',
    goodEvening: isRTL ? 'مساء الخير' : 'Good evening',
    defaultName: isRTL ? 'أحمد' : 'Ahmed',

    // Card titles
    thisWeeksProgress: isRTL ? 'تقدم هذا الأسبوع' : "This Week's Progress",
    todaysPlan: isRTL ? 'خطة اليوم' : "Today's Plan",

    // Weight
    kgUnit: 'kg',
    kgFromLastWeek: isRTL ? 'كجم من الأسبوع الماضي' : 'kg from last week',
    logWeeklyWeight: isRTL ? 'سجل وزن هذا الأسبوع' : "Log This Week's Weight",

    // Today's Focus
    greatJobBreakfast: isRTL ? 'عمل رائع في إفطارك!' : 'Great job on your breakfast!',
    keepMomentum: isRTL ? 'استمر في هذا الزخم' : 'Keep up the momentum',

    // Meals
    proteinOatmeal: isRTL ? 'شوفان بروتين ' : 'Protein Oatmeal ',
    grilledChickenSalad: isRTL ? 'سلطة دجاج مشوي ' : 'Grilled Chicken Salad ',
    nutsFruit: isRTL ? 'مكسرات وفواكه ' : 'Nuts & Fruit ',
    fishVegetables: isRTL ? 'سمك وخضروات ' : 'Fish & Vegetables ',

    // Actions
    viewAll: isRTL ? 'عرض الكل' : 'View All',
    view: isRTL ? 'عرض' : 'View',
    messageCoach: isRTL ? 'رسالة الدكتور' : 'Message Coach',
    waterTracker: isRTL ? 'متتبع المياه' : 'Water Tracker',

    // Banner
    newMessageFrom: isRTL ? 'رسالة جديدة من سارة' : 'New message from Sarah',
};

// Tab bar translations
export const tabTranslations = {
    home: isRTL ? 'الرئيسية' : 'Home',
    meals: isRTL ? 'الوجبات' : 'Meals',
    chat: isRTL ? 'المحادثة' : 'Chat',
    profile: isRTL ? 'الملف' : 'Profile',
    comingSoon: isRTL ? 'قريباً...' : 'Coming Soon...',
    profileTitle: isRTL ? 'الملف الشخصي' : 'Profile',
};

// Country data with bilingual names
export const countries = [
    { code: '+20', name: 'Egypt', nameAr: 'مصر', flag: '🇪🇬' },
    { code: '+966', name: 'Saudi Arabia', nameAr: 'السعودية', flag: '🇸🇦' },
    { code: '+971', name: 'UAE', nameAr: 'الإمارات', flag: '🇦🇪' },
    { code: '+965', name: 'Kuwait', nameAr: 'الكويت', flag: '🇰🇼' },
    { code: '+974', name: 'Qatar', nameAr: 'قطر', flag: '🇶🇦' },
    { code: '+973', name: 'Bahrain', nameAr: 'البحرين', flag: '🇧🇭' },
    { code: '+968', name: 'Oman', nameAr: 'عمان', flag: '🇴🇲' },
    { code: '+962', name: 'Jordan', nameAr: 'الأردن', flag: '🇯🇴' },
    { code: '+961', name: 'Lebanon', nameAr: 'لبنان', flag: '🇱🇧' },
];

export type Country = typeof countries[number];

// Doctor Dashboard translations
export const doctorTranslations = {
    // Stats Cards
    activeClients: isRTL ? 'العملاء النشطين' : 'Active Clients',
    pendingCheckins: isRTL ? 'تسجيلات الدخول المعلقة' : 'Pending Check-ins',
    unreadMessages: isRTL ? 'رسائل غير مقروءة' : 'Unread Messages',
    plansExpiring: isRTL ? 'خطط تنتهي قريباً' : 'Plans Expiring',
    thisMonth: isRTL ? '+3 هذا الشهر' : '+3 this month',
    dueThisWeek: isRTL ? 'مستحقة هذا الأسبوع' : 'Due this week',
    oldestMessage: isRTL ? 'الأقدم: منذ ساعتين' : 'Oldest: 2 hours ago',
    inNextDays: isRTL ? 'خلال 3 أيام' : 'In next 3 days',

    // Section Titles
    needsAttention: isRTL ? 'يحتاج اهتمام 🚨' : 'Needs Attention 🚨',
    todaysAppointments: isRTL ? 'مواعيد اليوم 📅' : "Today's Appointments 📅",
    quickActions: isRTL ? 'إجراءات سريعة' : 'Quick Actions',
    thisWeeksActivity: isRTL ? 'نشاط هذا الأسبوع' : "This Week's Activity",
    recentActivity: isRTL ? 'النشاط الأخير' : 'Recent Activity',

    // Actions
    viewAll: isRTL ? 'عرض الكل' : 'View All',
    add: isRTL ? '+ إضافة' : '+ Add',
    message: isRTL ? 'رسالة' : 'Message',
    join: isRTL ? 'انضمام' : 'Join',

    // Quick Actions
    newMealPlan: isRTL ? 'خطة وجبات جديدة' : 'New Meal Plan',
    addClient: isRTL ? 'إضافة عميل' : 'Add Client',
    templates: isRTL ? 'القوالب' : 'Templates',
    reports: isRTL ? 'التقارير' : 'Reports',

    // Weekly Stats
    messages: isRTL ? 'الرسائل' : 'Messages',
    plans: isRTL ? 'الخطط' : 'Plans',
    checkins: isRTL ? 'التسجيلات' : 'Check-ins',

    // Links
    viewFullAnalytics: isRTL ? 'عرض التحليلات الكاملة' : 'View Full Analytics',
    seeAllActivity: isRTL ? 'عرض كل النشاط' : 'See All Activity',

    // Empty States
    noAppointmentsToday: isRTL ? 'لا توجد مواعيد اليوم' : 'No appointments today',
    scheduleOne: isRTL ? 'حدد موعداً' : 'Schedule one',

    // Client Status
    lastActive: isRTL ? 'آخر نشاط:' : 'Last active:',

    // Day Labels (for chart)
    dayLabels: isRTL
        ? ['أح', 'إث', 'ث', 'أر', 'خ', 'ج', 'س']
        : ['S', 'M', 'T', 'W', 'T', 'F', 'S'],

    // Duration
    min: isRTL ? 'دقيقة' : 'min',
};

// Status message translations for mock data
export const statusTranslations: Record<string, string> = {
    // Critical
    'Missed 2 check-ins': isRTL ? 'فاتته 2 تسجيل دخول' : 'Missed 2 check-ins',
    // Warning
    'Weight +1.5kg this week': isRTL ? 'الوزن +1.5 كجم هذا الأسبوع' : 'Weight +1.5kg this week',
    // Info
    'Requested plan change': isRTL ? 'طلب تغيير الخطة' : 'Requested plan change',
};

// Time translations for mock data
export const timeTranslations: Record<string, string> = {
    '10 days ago': isRTL ? 'منذ 10 أيام' : '10 days ago',
    '2 hours ago': isRTL ? 'منذ ساعتين' : '2 hours ago',
    '2 min ago': isRTL ? 'منذ دقيقتين' : '2 min ago',
    '15 min ago': isRTL ? 'منذ 15 دقيقة' : '15 min ago',
    '1 hour ago': isRTL ? 'منذ ساعة' : '1 hour ago',
    '3 hours ago': isRTL ? 'منذ 3 ساعات' : '3 hours ago',
    '30 min': isRTL ? '30 دقيقة' : '30 min',
    '45 min': isRTL ? '45 دقيقة' : '45 min',
};

// Activity text translations
export const activityTranslations: Record<string, string> = {
    'Sara Ahmed logged weight 68kg': isRTL ? 'سارة أحمد سجلت وزن 68 كجم' : 'Sara Ahmed logged weight 68kg',
    'New message from Karim': isRTL ? 'رسالة جديدة من كريم' : 'New message from Karim',
    'Layla completed all meals': isRTL ? 'ليلى أكملت جميع الوجبات' : 'Layla completed all meals',
    'Mohamed opened meal plan': isRTL ? 'محمد فتح خطة الوجبات' : 'Mohamed opened meal plan',
    'You created plan for Ahmed': isRTL ? 'أنشأت خطة لأحمد' : 'You created plan for Ahmed',
};

// Helper function to translate status
export const translateStatus = (status: string): string => {
    return statusTranslations[status] || status;
};

// Helper function to translate time
export const translateTime = (time: string): string => {
    return timeTranslations[time] || time;
};

// Helper function to translate activity text
export const translateActivity = (text: string): string => {
    return activityTranslations[text] || text;
};

// Splash screen translations
export const splashTranslations = {
    tagline: isRTL ? 'رحلتك نحو صحة أفضل تبدأ هنا' : 'Your journey to better health starts here',
    loading: isRTL ? 'جاري التحميل...' : 'Loading...',
    welcomeBack: isRTL ? 'مرحباً بعودتك' : 'Welcome Back',
    gettingReady: isRTL ? 'جاري تجهيز كل شيء...' : 'Getting everything ready...',
};

// Profile screen translations
export const profileTranslations = {
    // Header
    profile: isRTL ? 'الملف الشخصي' : 'Profile',
    editProfile: isRTL ? 'تعديل الملف' : 'Edit Profile',
    memberSince: isRTL ? 'عضو منذ' : 'Member since',
    premium: isRTL ? 'مميز' : 'Premium',
    active: isRTL ? 'نشط' : 'Active',

    // Weight Progress
    weightProgress: isRTL ? 'تقدم الوزن' : 'Weight Progress',
    startWeight: isRTL ? 'الوزن' : 'Start Weight',
    currentWeight: isRTL ? 'الوزن الحالي' : 'Current Weight',
    targetWeight: isRTL ? 'الوزن المستهدف' : 'Target Weight',
    kgLost: isRTL ? 'كجم مفقود' : 'kg lost',
    kgRemaining: isRTL ? 'كجم متبقي' : 'kg remaining',
    viewHistory: isRTL ? 'عرض السجل' : 'View History',

    // Plan Summary
    yourPlan: isRTL ? 'خطتك' : 'Your Plan',
    coach: isRTL ? 'الدكتور' : 'Doctor',
    dayOf: isRTL ? 'يوم من' : 'Day of',
    daysRemaining: isRTL ? 'يوم متبقي' : 'days remaining',
    messageCoach: isRTL ? 'راسل الدكتور' : 'Message Doctor',
    viewPlan: isRTL ? 'عرض الخطة' : 'View Plan',
    noPlan: isRTL ? 'لا توجد خطة حالية' : 'No active plan',

    // Subscription
    subscription: isRTL ? 'الاشتراك' : 'Subscription',
    planName: isRTL ? 'اسم الخطة' : 'Plan Name',
    nextBilling: isRTL ? 'الفاتورة القادمة' : 'Next Billing',
    expiresOn: isRTL ? 'ينتهي في' : 'Expires on',
    manageSub: isRTL ? 'إدارة الاشتراك' : 'Manage Subscription',
    upgradePlan: isRTL ? 'ترقية الخطة' : 'Upgrade Plan',
    cancelSub: isRTL ? 'إلغاء الاشتراك' : 'Cancel Subscription',
    subscriptionStatus: {
        active: isRTL ? 'نشط' : 'Active',
        inactive: isRTL ? 'غير نشط' : 'Inactive',
        trial: isRTL ? 'تجريبي' : 'Trial',
        expired: isRTL ? 'منتهي' : 'Expired',
        cancelled: isRTL ? 'ملغي' : 'Cancelled',
    },

    // Personal Info
    personalInfo: isRTL ? 'المعلومات الشخصية' : 'Personal Information',
    gender: isRTL ? 'الجنس' : 'Gender',
    male: isRTL ? 'ذكر' : 'Male',
    female: isRTL ? 'أنثى' : 'Female',
    age: isRTL ? 'العمر' : 'Age',
    years: isRTL ? 'سنة' : 'years',
    height: isRTL ? 'الطول' : 'Height',
    weight: isRTL ? 'الوزن' : 'Weight',
    edit: isRTL ? 'تعديل' : 'Edit',

    // Notifications
    notifications: isRTL ? 'الإشعارات' : 'Notifications',
    pushNotifications: isRTL ? 'الإشعارات' : 'Push Notifications',
    mealReminders: isRTL ? 'تذكير الوجبات' : 'Meal Reminders',
    dailySummary: isRTL ? 'الملخص اليومي' : 'Daily Summary',
    weeklyReport: isRTL ? 'التقرير الأسبوعي' : 'Weekly Report',
    coachMessages: isRTL ? 'رسائل الدكتور' : 'Coach Messages',

    // Preferences
    preferences: isRTL ? 'التفضيلات' : 'Preferences',
    language: isRTL ? 'اللغة' : 'Language',
    arabic: isRTL ? 'العربية' : 'Arabic',
    english: isRTL ? 'الإنجليزية' : 'English',
    units: isRTL ? 'الوحدات' : 'Units',
    metric: isRTL ? 'متري (كجم/سم)' : 'Metric (kg/cm)',
    imperial: isRTL ? 'إمبراطوري (رطل/قدم)' : 'Imperial (lb/ft)',
    theme: isRTL ? 'المظهر' : 'Theme',
    light: isRTL ? 'فاتح' : 'Light',
    dark: isRTL ? 'داكن' : 'Dark',
    system: isRTL ? 'النظام' : 'System',

    // Support
    support: isRTL ? 'الدعم' : 'Support',
    helpCenter: isRTL ? 'مركز المساعدة' : 'Help Center',
    contactWhatsApp: isRTL ? 'تواصل عبر واتساب' : 'Contact via WhatsApp',
    contactEmail: isRTL ? 'تواصل عبر البريد' : 'Contact via Email',
    faq: isRTL ? 'الأسئلة الشائعة' : 'FAQ',
    privacyPolicy: isRTL ? 'سياسة الخصوصية' : 'Privacy Policy',
    termsOfService: isRTL ? 'شروط الخدمة' : 'Terms of Service',

    // Actions
    logout: isRTL ? 'تسجيل الخروج' : 'Logout',
    logoutConfirm: isRTL ? 'هل أنت متأكد من تسجيل الخروج؟' : 'Are you sure you want to logout?',
    deleteAccount: isRTL ? 'حذف الحساب' : 'Delete Account',
    deleteAccountConfirm: isRTL ? 'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه.' : 'Are you sure you want to delete your account? This action cannot be undone.',
    cancel: isRTL ? 'إلغاء' : 'Cancel',
    confirm: isRTL ? 'تأكيد' : 'Confirm',
    save: isRTL ? 'حفظ' : 'Save',

    // Avatar
    changePhoto: isRTL ? 'تغيير الصورة' : 'Change Photo',
    takePhoto: isRTL ? 'التقاط صورة' : 'Take Photo',
    chooseFromLibrary: isRTL ? 'اختر من المعرض' : 'Choose from Library',
    removePhoto: isRTL ? 'إزالة الصورة' : 'Remove Photo',
    uploading: isRTL ? 'جاري الرفع...' : 'Uploading...',

    // Edit Modals
    selectGender: isRTL ? 'اختر الجنس' : 'Select Gender',
    enterAge: isRTL ? 'أدخل العمر' : 'Enter Age',
    enterHeight: isRTL ? 'أدخل الطول' : 'Enter Height',
    enterWeight: isRTL ? 'أدخل الوزن' : 'Enter Weight',

    // Errors
    errorUpdating: isRTL ? 'حدث خطأ أثناء التحديث' : 'Error updating profile',
    errorLoading: isRTL ? 'حدث خطأ أثناء التحميل' : 'Error loading profile',
    tryAgain: isRTL ? 'حاول مرة أخرى' : 'Try Again',

    // BMI
    bmi: isRTL ? 'مؤشر كتلة الجسم' : 'BMI',
    underweight: isRTL ? 'نقص الوزن' : 'Underweight',
    normal: isRTL ? 'طبيعي' : 'Normal',
    overweight: isRTL ? 'زيادة الوزن' : 'Overweight',
    obese: isRTL ? 'سمنة' : 'Obese',
};

