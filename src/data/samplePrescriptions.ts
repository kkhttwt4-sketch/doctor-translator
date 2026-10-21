import { PrescriptionAnalysis } from '../types';

export interface SamplePrescriptionItem {
  id: string;
  title: string;
  category: string;
  doctorName: string;
  clinic: string;
  date: string;
  imageDataUri: string;
  previewData: PrescriptionAnalysis;
}

// Generate realistic prescription pad SVG encoded as Data URI
function createPrescriptionSvg(
  rxNumber: string,
  doctor: string,
  specialty: string,
  clinic: string,
  patient: string,
  date: string,
  rxLines: { text: string; sub: string }[]
): string {
  const linesHtml = rxLines
    .map(
      (line, i) => `
      <g transform="translate(40, ${250 + i * 85})">
        <text x="0" y="0" font-family="'Courier New', monospace" font-size="24" font-weight="bold" fill="#0f172a">${line.text}</text>
        <text x="25" y="32" font-family="'Tajawal', sans-serif" font-size="19" fill="#1e293b">${line.sub}</text>
        <line x1="0" y1="48" x2="620" y2="48" stroke="#cbd5e1" stroke-dasharray="4,4" stroke-width="1.5" />
      </g>
    `
    )
    .join('');

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 700 880" width="700" height="880">
    <defs>
      <filter id="paper-shadow" x="-5%" y="-5%" width="110%" height="110%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.15" />
      </filter>
      <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0284c7" />
        <stop offset="100%" stop-color="#0369a1" />
      </linearGradient>
    </defs>
    <!-- Paper background -->
    <rect x="15" y="15" width="670" height="850" rx="14" fill="#fcfbf7" stroke="#e2e8f0" stroke-width="3" filter="url(#paper-shadow)" />
    
    <!-- Top Medical Header -->
    <rect x="15" y="15" width="670" height="120" rx="14" fill="url(#headerGrad)" />
    <!-- Rx Symbol -->
    <circle cx="75" cy="75" r="38" fill="#ffffff" opacity="0.9" />
    <text x="58" y="90" font-family="serif" font-size="44" font-weight="900" fill="#0284c7">℞</text>

    <!-- Clinic & Doctor info in Header -->
    <text x="135" y="60" font-family="'Tajawal', sans-serif" font-size="24" font-weight="bold" fill="#ffffff">${clinic}</text>
    <text x="135" y="90" font-family="'Tajawal', sans-serif" font-size="18" fill="#e0f2fe">${doctor} — ${specialty}</text>
    <text x="640" y="75" text-anchor="end" font-family="monospace" font-size="16" fill="#bae6fd">Rx No: ${rxNumber}</text>

    <!-- Patient info bar -->
    <rect x="35" y="155" width="630" height="55" rx="8" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="1.5" />
    <text x="640" y="188" text-anchor="end" font-family="'Tajawal', sans-serif" font-size="18" fill="#334155">اسم المريض: <tspan font-weight="bold" fill="#0f172a">${patient}</tspan></text>
    <text x="55" y="188" font-family="'Tajawal', sans-serif" font-size="16" fill="#475569">التاريخ: ${date}</text>

    <!-- Rx Body Lines -->
    ${linesHtml}

    <!-- Stamp & Signature -->
    <g transform="translate(420, 690)">
      <ellipse cx="110" cy="50" rx="95" ry="42" fill="none" stroke="#2563eb" stroke-width="3" stroke-dasharray="6,3" opacity="0.8" />
      <text x="110" y="44" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="16" font-weight="bold" fill="#1d4ed8">مستشفى الأمل التخصصي</text>
      <text x="110" y="68" text-anchor="middle" font-family="'Tajawal', sans-serif" font-size="14" fill="#2563eb">طبيب معتمد ومصرح</text>
      <path d="M 40,75 Q 85,20 120,60 T 180,45" fill="none" stroke="#1e3a8a" stroke-width="2.5" />
    </g>

    <text x="50" y="770" font-family="'Tajawal', sans-serif" font-size="14" fill="#94a3b8">تنبيه: يُصرف هذا الدواء بإشراف الصيدلي ومطابقاً للجرعة المحددة.</text>
  </svg>`;

  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

export const SAMPLE_PRESCRIPTIONS: SamplePrescriptionItem[] = [
  {
    id: 'sample-bp',
    title: 'علاج ضغط الدم والقلب (كونكور)',
    category: 'أمراض باطنية وقلب',
    doctorName: 'د. خالد عبد الرحمن',
    clinic: 'مركز القلب والأوعية الدموية التخصصي',
    date: '2026-10-18',
    imageDataUri: createPrescriptionSvg(
      'RX-88421',
      'د. خالد عبد الرحمن',
      'استشاري أمراض القلب والباطنة',
      'مركز القلب والأوعية الدموية التخصصي',
      'الحاج أحمد عبد الله (٦٨ سنة)',
      '18/10/2026',
      [
        {
          text: '1. Concor (Bisoprolol) 5mg Tab',
          sub: 'قرص واحد يومياً صباحاً بعد وجبة الإفطار بانتظام',
        },
        {
          text: '2. Aspirin Protect 100mg Tab',
          sub: 'قرص واحد يومياً بعد وجبة الغداء مع كوب ماء وفير',
        },
      ]
    ),
    previewData: {
      medicationName: 'كونكور ٥ ملغ (Concor / Bisoprolol)',
      concentration: '5 ملغ (5mg)',
      dosage: 'قرص واحد',
      frequency: 'مرة واحدة يومياً',
      timing: 'صباحاً بعد وجبة الإفطار مباشرة',
      duration: 'علاج مستمر ومنتظم (حسب توجيه الطبيب المعالج)',
      doctorInstructions: 'يُرجى قياس ضغط الدم وتسجيله أسبوعياً، وعدم إيقاف الدواء بشكل مفاجئ إطلاقاً.',
      simplifiedExplanation:
        'هذا الدواء يُساعد في تنظيم ضربات القلب وتخفيف المجهود عليه، كما يعمل على خفض ضغط الدم المرتفع لحماية الشرايين والوقاية من الجلطات بإذن الله. احرص على تناوله في نفس الوقت كل صباح.',
      importantWarnings: [
        'لا تتوقف عن تناول الدواء فجأة من تلقاء نفسك حتى لا يرتفع الضغط سريعاً.',
        'إذا شعرت بدوار عند الوقوف، قم بالنهوض ببطء وهدوء.',
        'أخبر الطبيب إذا لاحظت بطئاً شديداً في ضربات القلب أو ضيقاً في التنفس.',
      ],
      clarityStatus: 'clear',
      unclearNotice: '',
      allMedications: [
        {
          name: 'Concor 5mg',
          concentration: '5mg',
          dosage: 'قرص واحد',
          frequency: 'مرة يومياً',
          timing: 'صباحاً بعد الإفطار',
          instructions: 'تنظيم ضغط الدم',
        },
        {
          name: 'Aspirin Protect 100mg',
          concentration: '100mg',
          dosage: 'قرص واحد',
          frequency: 'مرة يومياً',
          timing: 'بعد الغداء',
          instructions: 'حماية الشرايين والسيولة',
        },
      ],
    },
  },
  {
    id: 'sample-antibiotic',
    title: 'مضاد حيوي للالتهاب الصدري (أوجمنتين)',
    category: 'أمراض تنفسية وباطنية',
    doctorName: 'د. سارة المنصوري',
    clinic: 'مستشفى السلام الدولي',
    date: '2026-10-15',
    imageDataUri: createPrescriptionSvg(
      'RX-99104',
      'د. سارة المنصوري',
      'أخصائية الأمراض الصدرية والباطنية',
      'مستشفى السلام الدولي',
      'فاطمة إبراهيم (٦٢ سنة)',
      '15/10/2026',
      [
        {
          text: '1. Augmentin 1g (1000mg) Tab',
          sub: 'قرص واحد كل ١٢ ساعة (مرتين يومياً) مع بداية الوجبة',
        },
        {
          text: '2. Panadol Extra 500mg',
          sub: 'قرصان عند اللزوم في حال الصداع أو ارتفاع الحرارة',
        },
      ]
    ),
    previewData: {
      medicationName: 'أوجمنتين ١ غرام (Augmentin 1g)',
      concentration: '1000 ملغ (1g)',
      dosage: 'قرص واحد',
      frequency: 'مرتين في اليوم (كل 12 ساعة)',
      timing: 'مع بداية تناول الطعام لراحة المعدة',
      duration: 'لمدة 7 أيام متواصلة حتى انتهاء العبوة',
      doctorInstructions: 'يجب إكمال كامل فترة العلاج المقررة 7 أيام حتى لو شعرت بالتحسن والشفاء.',
      simplifiedExplanation:
        'هذا الدواء مضاد حيوي فعال للقضاء على البكتيريا المسببة للالتهاب الصدري والسعال. تناوله مع أول لقمة من وجبتك حتى لا يسبب لك أي انزعاج أو غثيان في المعدة.',
      importantWarnings: [
        'ضروري جداً إكمال الـ 7 أيام كاملة لمنع عودة الميكروب أو مقاومة المضادات الحيوية.',
        'احرص على شرب كمية كافية من الماء طوال اليوم.',
        'إذا ظهر طفح جلدي أو حكة شديدة، توقف عن الدواء واستشر الطبيب فوراً.',
      ],
      clarityStatus: 'clear',
      unclearNotice: '',
    },
  },
  {
    id: 'sample-diabetes',
    title: 'منظم السكر (ميتفورمين / غلوكوفاج)',
    category: 'الغدد الصماء والسكري',
    doctorName: 'د. طارق الحكيم',
    clinic: 'عيادة رعاية السكري التخصصية',
    date: '2026-10-12',
    imageDataUri: createPrescriptionSvg(
      'RX-75419',
      'د. طارق الحكيم',
      'استشاري السكري والغدد الصماء',
      'عيادة رعاية السكري التخصصية',
      'سليمان ناصر (٧١ سنة)',
      '12/10/2026',
      [
        {
          text: '1. Glucophage XR 1000mg Tab',
          sub: 'قرص واحد يومياً مساءً أثناء وجبة العشاء',
        },
        {
          text: '2. Vitamin B12 Neurobion',
          sub: 'قرص واحد يومياً صباحاً لدعم الأعصاب',
        },
      ]
    ),
    previewData: {
      medicationName: 'غلوكوفاج إكس آر ١٠٠٠ ملغ (Glucophage XR)',
      concentration: '1000 ملغ ممتد المفعول (XR)',
      dosage: 'قرص واحد كامل (يُبلع دون كسر أو مضغ)',
      frequency: 'مرة واحدة يومياً',
      timing: 'أثناء أو بعد وجبة العشاء مباشرة',
      duration: 'علاج منتظم طويل الأمد',
      doctorInstructions: 'ابتلع القرص كاملاً مع كوب ماء، ولا تقم بمضغه أو تقسيمه لأنه ممتد المفعول.',
      simplifiedExplanation:
        'دواء آمن يساعد خلايا الجسم على الاستفادة من الإنسولين ويضبط مستوى السكر في الدم على مدار اليوم. تناوله أثناء العشاء يحمي المعدة من أي اضطراب.',
      importantWarnings: [
        'لا تكسر القرص أو تسحقه لأنه مصمم ليطلق الدواء ببطء في الجسم طوال الليل.',
        'حافظ على فحص مستوى السكر بانتظام في المنزل.',
        'احرص على شرب الماء والسوائل بكميات مناسبة يومياً.',
      ],
      clarityStatus: 'clear',
      unclearNotice: '',
    },
  },
  {
    id: 'sample-handwritten-unclear',
    title: 'وصفة بخط يدوي صعب (تنبيه عدم الوضوح)',
    category: 'حالة طبية مع تنبيه أمان',
    doctorName: 'عيادات الشفاء العامة',
    clinic: 'مركز الرعاية الأولية',
    date: '2026-10-09',
    imageDataUri: createPrescriptionSvg(
      'RX-33102',
      'طبيب مناوب',
      'الطب العام',
      'عيادات الشفاء الأولية',
      'أم محمد (٧٥ سنة)',
      '09/10/2026',
      [
        {
          text: 'Rx: Med?? ~20mg (?) b.i.d',
          sub: 'خط غير مقروء بوضوح في أسفل الصفحة',
        },
      ]
    ),
    previewData: {
      medicationName: 'غير مقروء بوضوح (قد يكون دواء خافض للكوليسترول أو الضغط)',
      concentration: 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي',
      dosage: 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي',
      frequency: 'مرتين يومياً تقريباً (b.i.d)',
      timing: 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي',
      duration: 'المعلومة غير واضحة، يرجى التأكد من الطبيب أو الصيدلي',
      doctorInstructions: 'يرجى إبراز الورقة الأصلية للصيدلي قبل تناول أي علاج لتفادي أي خطأ دوائي.',
      simplifiedExplanation:
        'نعتذر، خط الطبيب في هذه الوصفة متداخل وغير واضح بما يكفي لضمان سلامتك. لحمايتك وصحتك، يمنع تخمين الجرعة أو اسم الدواء ونرجو منك عرض الورقة على أقرب صيدلي معتمد لقراءتها بأمان.',
      importantWarnings: [
        'تنبيه سلامة: لا تتناول أي علاج قبل التأكد بنسبة 100% من الصيدلي.',
        'لا تحاول تخمين الجرعة بناءً على الشبه.',
      ],
      clarityStatus: 'unclear',
      unclearNotice:
        'تنبيه أمان: بعض المعلومات غير واضحة في الوصفة. حفاظاً على سلامتك، امتنعنا عن تخمين الجرعة ويجب مراجعة الصيدلي مباشرة.',
    },
  },
];
