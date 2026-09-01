import type {
  ActivityEntry,
  AppNotification,
  AppUser,
  MenuCategory,
  MenuItem,
  OpeningHour,
  Post,
  PostComment,
  Restaurant,
  Review,
  Story,
} from "@/types";

const img = (name: string) => `/images/${name}.jpg`;

/** ساعات عمل قياسية: يفتح 7:00 ص ويغلق 11:30 م طوال الأسبوع. */
const standardHours = (opensAt = "07:00", closesAt = "23:30"): OpeningHour[] =>
  Array.from({ length: 7 }, (_, dayOfWeek) => ({
    dayOfWeek,
    opensAt,
    closesAt,
    isClosed: false,
  }));

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const hoursAgo = (n: number) => new Date(Date.now() - n * 3_600_000).toISOString();

export const DEMO_OWNER_ID = "owner-noor";

export const demoUsers: AppUser[] = [
  {
    id: "user-demo",
    email: "demo@eatit.app",
    username: "@sara_eats",
    fullName: "سارة العتيبي",
    bio: "أبحث عن أفضل فنجان قهوة في الرياض، وأوثّق كل طبق يستحق الحكاية.",
    avatarUrl: img("u-1"),
    role: "USER",
    followersCount: 1284,
    followingCount: 212,
    createdAt: daysAgo(420),
  },
  {
    id: DEMO_OWNER_ID,
    email: "owner@eatit.app",
    username: "@maqha_alnoor",
    fullName: "مقهى النور",
    bio: "قهوة مختصة وأجواء هادئة في قلب الرياض.",
    avatarUrl: img("r-noor-logo"),
    role: "RESTAURANT_OWNER",
    followersCount: 3592,
    followingCount: 48,
    createdAt: daysAgo(690),
  },
];

/* ==========================================================================
   المطاعم والمقاهي
   ========================================================================== */

export const demoRestaurants: Restaurant[] = [
  {
    id: "rest-andalus",
    ownerId: "owner-andalus",
    name: "مقهى الأندلس",
    slug: "andalus",
    description:
      "مقهى ومطعم يجمع بين المطبخ البحري المتوسطي والأجواء الأندلسية الدافئة. نقدّم صيد اليوم الطازج على أنغام موسيقى هادئة، مع جلسات خارجية تطل على حديقة الحي.",
    shortDescription: "مأكولات بحرية • جلسات خارجية • موسيقى هادئة",
    logoUrl: img("r-andalus-logo"),
    coverUrl: img("r-andalus-cover"),
    category: "مأكولات بحرية",
    tags: ["مأكولات بحرية", "جلسات خارجية", "موسيقى هادئة"],
    address: "طريق الأمير محمد بن عبدالعزيز، حي السليمانية",
    city: "الرياض",
    latitude: 24.6981,
    longitude: 46.6889,
    rating: 4.8,
    reviewCount: 268,
    followerCount: 5120,
    likeCount: 8940,
    priceRange: 3,
    isVerified: true,
    phone: "+966 11 482 1190",
    distanceKm: 1.2,
    hours: standardHours("12:00", "01:00"),
    createdAt: daysAgo(720),
  },
  {
    id: "rest-elixir",
    ownerId: "owner-elixir",
    name: "إكسير البن",
    slug: "elixir-albon",
    description:
      "مقهى مختص يقدم أجود أنواع القهوة المحمصة محلياً، في أجواء دافئة ومريحة. نحمّص حبوبنا أسبوعياً ونعمل مباشرة مع مزارع مختارة في إثيوبيا وكولومبيا.",
    shortDescription: "قهوة مختصة • تحميص محلي • أجواء دافئة",
    logoUrl: img("latte-art-cup"),
    coverUrl: img("elixir-cover"),
    category: "قهوة مختصة",
    tags: ["قهوة مختصة", "تحميص محلي", "عمل ودراسة"],
    address: "شارع التخصصي، حي العليا",
    city: "الرياض",
    latitude: 24.6935,
    longitude: 46.6721,
    rating: 4.9,
    reviewCount: 342,
    followerCount: 7830,
    likeCount: 12480,
    priceRange: 2,
    isVerified: true,
    phone: "+966 11 299 4471",
    distanceKm: 0.8,
    hours: standardHours("06:30", "23:30"),
    createdAt: daysAgo(510),
  },
  {
    id: "rest-damascus",
    ownerId: "owner-damascus",
    name: "البيت الدمشقي",
    slug: "albait-aldimashqi",
    description:
      "مأكولات شرقية أصيلة في أجواء عائلية. وصفات توارثتها العائلة منذ ثلاثة أجيال، من المقبلات الباردة إلى الحلويات الشامية المصنوعة يومياً.",
    shortDescription: "مأكولات شرقية أصيلة • أجواء عائلية",
    logoUrl: img("damascus-logo"),
    coverUrl: img("damascus-cover"),
    category: "مطاعم",
    tags: ["مأكولات شرقية", "أجواء عائلية", "مناسب للمجموعات"],
    address: "طريق الملك عبدالله، حي النخيل",
    city: "الرياض",
    latitude: 24.7402,
    longitude: 46.6402,
    rating: 4.8,
    reviewCount: 124,
    followerCount: 4310,
    likeCount: 6720,
    priceRange: 2,
    isVerified: true,
    phone: "+966 11 550 3320",
    distanceKm: 2.4,
    hours: standardHours("11:00", "00:30"),
    createdAt: daysAgo(880),
  },
  {
    id: "rest-trattoria",
    ownerId: "owner-trattoria",
    name: "تراتوريا روما",
    slug: "trattoria-roma",
    description:
      "مطبخ إيطالي بيتي: باستا محضّرة يدوياً كل صباح، صلصات تُطهى على نار هادئة، وقائمة نبيذ غير كحولية مختارة بعناية.",
    shortDescription: "مطبخ إيطالي • باستا يدوية • أجواء رومانسية",
    logoUrl: img("trattoria-logo"),
    coverUrl: img("r-trattoria-cover"),
    category: "مطاعم",
    tags: ["إيطالي", "باستا طازجة", "عشاء"],
    address: "شارع الأمير سلطان، حي الرحمانية",
    city: "الرياض",
    latitude: 24.7128,
    longitude: 46.6301,
    rating: 4.5,
    reviewCount: 196,
    followerCount: 3640,
    likeCount: 5210,
    priceRange: 3,
    isVerified: true,
    phone: "+966 11 471 8802",
    distanceKm: 3.1,
    hours: standardHours("13:00", "23:45"),
    createdAt: daysAgo(400),
  },
  {
    id: "rest-sushi",
    ownerId: "owner-sushi",
    name: "سوشي لاونج",
    slug: "sushi-lounge",
    description:
      "تجربة يابانية معاصرة: أسماك تصل طازجة ثلاث مرات أسبوعياً، وطاولة أوماكاسي يقودها الشيف أمام الضيوف مباشرة.",
    shortDescription: "سوشي • أوماكاسي • تجربة يابانية",
    logoUrl: img("sushi-logo"),
    coverUrl: img("r-sushi-cover"),
    category: "مطاعم",
    tags: ["ياباني", "سوشي", "أوماكاسي"],
    address: "طريق العروبة، حي الورود",
    city: "الرياض",
    latitude: 24.7051,
    longitude: 46.6602,
    rating: 4.8,
    reviewCount: 214,
    followerCount: 6180,
    likeCount: 9330,
    priceRange: 3,
    isVerified: true,
    phone: "+966 11 216 7745",
    distanceKm: 1.9,
    hours: standardHours("13:00", "00:00"),
    createdAt: daysAgo(300),
  },
  {
    id: "rest-noor",
    ownerId: DEMO_OWNER_ID,
    name: "مقهى النور",
    slug: "maqha-alnoor",
    description:
      "مقهى الحي الذي يفتح مبكراً ويغلق متأخراً. قهوة مختصة، معجنات تُخبز في الموقع، ومساحة هادئة للعمل طوال اليوم.",
    shortDescription: "قهوة مختصة • معجنات طازجة • مساحة عمل",
    logoUrl: img("r-noor-logo"),
    coverUrl: img("r-noor-cover"),
    category: "مقاهي",
    tags: ["قهوة", "عمل ودراسة", "إفطار"],
    address: "شارع الثمامة، حي الياسمين",
    city: "الرياض",
    latitude: 24.8194,
    longitude: 46.6612,
    rating: 4.7,
    reviewCount: 158,
    followerCount: 3592,
    likeCount: 1248,
    priceRange: 2,
    isVerified: true,
    phone: "+966 11 388 2214",
    distanceKm: 4.6,
    hours: standardHours("06:00", "23:00"),
    createdAt: daysAgo(690),
  },
  {
    id: "rest-amal",
    ownerId: "owner-amal",
    name: "مخبز الأمل",
    slug: "makhbaz-alamal",
    description:
      "مخبز حرفي يعتمد على العجين المخمّر ببطء لمدة 24 ساعة. الخبز يخرج من الفرن كل ساعتين، والكرواسون ينفد قبل الظهر عادةً.",
    shortDescription: "مخبز حرفي • عجين مخمّر • خبز طازج",
    logoUrl: img("r-hope-logo"),
    coverUrl: img("r-hope-cover"),
    category: "مخابز",
    tags: ["مخبوزات", "إفطار", "عجين مخمّر"],
    address: "شارع أنس بن مالك، حي الملقا",
    city: "الرياض",
    latitude: 24.7889,
    longitude: 46.6194,
    rating: 4.6,
    reviewCount: 143,
    followerCount: 2870,
    likeCount: 4120,
    priceRange: 1,
    isVerified: false,
    phone: "+966 11 902 3318",
    distanceKm: 5.3,
    hours: standardHours("05:30", "22:00"),
    createdAt: daysAgo(250),
  },
  {
    id: "rest-green",
    ownerId: "owner-green",
    name: "جرين بايتس",
    slug: "green-bites",
    description:
      "قائمة نباتية وصحية بالكامل، بمكونات موسمية من مزارع محلية. أطباق خفيفة، عصائر باردة، وخيارات خالية من الجلوتين.",
    shortDescription: "نباتي • مكونات موسمية • خيارات صحية",
    logoUrl: img("r-green-logo"),
    coverUrl: img("r-green-cover"),
    category: "مطاعم",
    tags: ["نباتي", "صحي", "خالٍ من الجلوتين"],
    address: "شارع العليا العام، حي المروج",
    city: "الرياض",
    latitude: 24.7311,
    longitude: 46.6748,
    rating: 4.5,
    reviewCount: 112,
    followerCount: 2410,
    likeCount: 3380,
    priceRange: 2,
    isVerified: false,
    phone: "+966 11 664 5509",
    distanceKm: 2.8,
    hours: standardHours("08:00", "22:30"),
    createdAt: daysAgo(190),
  },
  {
    id: "rest-burger",
    ownerId: "owner-burger",
    name: "برغر هاوس",
    slug: "burger-house",
    description:
      "برغر لحم بلدي يُفرم يومياً، خبز بريوش يُخبز في الموقع، وصلصات من تحضيرنا. قائمة قصيرة ومركّزة، وكل شيء يُشوى عند الطلب.",
    shortDescription: "برغر • لحم طازج • خبز بريوش",
    logoUrl: img("r-burger-logo"),
    coverUrl: img("r-burger-cover"),
    category: "برغر",
    tags: ["برغر", "مناسب للعائلات", "وجبات سريعة"],
    address: "طريق الملك فهد، حي حطين",
    city: "الرياض",
    latitude: 24.7566,
    longitude: 46.6039,
    rating: 4.4,
    reviewCount: 231,
    followerCount: 4980,
    likeCount: 7120,
    priceRange: 2,
    isVerified: false,
    phone: "+966 11 771 4432",
    distanceKm: 6.1,
    hours: standardHours("12:00", "02:00"),
    createdAt: daysAgo(330),
  },
  {
    id: "rest-napoli",
    ownerId: "owner-napoli",
    name: "بيتزا نابولي",
    slug: "pizza-napoli",
    description:
      "بيتزا نابوليتانية أصيلة من فرن حطب على 450 درجة. عجينة تتخمّر 48 ساعة، وجبنة موزاريلا طازجة تصل يومياً.",
    shortDescription: "بيتزا نابوليتانية • فرن حطب • عجين 48 ساعة",
    logoUrl: img("r-pizza-logo"),
    coverUrl: img("r-pizza-cover"),
    category: "بيتزا",
    tags: ["بيتزا", "فرن حطب", "إيطالي"],
    address: "شارع التحلية، حي السليمانية",
    city: "الرياض",
    latitude: 24.6902,
    longitude: 46.6835,
    rating: 4.7,
    reviewCount: 187,
    followerCount: 4460,
    likeCount: 6890,
    priceRange: 2,
    isVerified: true,
    phone: "+966 11 233 8890",
    distanceKm: 1.6,
    hours: standardHours("13:00", "01:00"),
    createdAt: daysAgo(280),
  },
  {
    id: "rest-lulua",
    ownerId: "owner-lulua",
    name: "حلويات اللؤلؤة",
    slug: "halawiyat-allulua",
    description:
      "حلويات شرقية وغربية تُحضّر يومياً بكميات صغيرة. كنافة بالجبن الطازج، تشيز كيك بالتمر، وكيك مناسبات حسب الطلب.",
    shortDescription: "حلويات • كنافة • كيك مناسبات",
    logoUrl: img("r-sweets-logo"),
    coverUrl: img("r-sweets-cover"),
    category: "حلويات",
    tags: ["حلويات", "كيك", "مناسبات"],
    address: "شارع الأمير تركي، حي الشهداء",
    city: "الرياض",
    latitude: 24.7715,
    longitude: 46.7192,
    rating: 4.6,
    reviewCount: 168,
    followerCount: 3110,
    likeCount: 4530,
    priceRange: 2,
    isVerified: false,
    phone: "+966 11 505 6673",
    distanceKm: 7.4,
    hours: standardHours("09:00", "23:59"),
    createdAt: daysAgo(210),
  },
  {
    id: "rest-sayd",
    ownerId: "owner-sayd",
    name: "صيد اليوم",
    slug: "sayd-alyawm",
    description:
      "تختار سمكتك من الثلج ونطبخها كما تحب: مشوية، مقلية، أو بالصيادية. الأسعار تتغير يومياً حسب الصيد.",
    shortDescription: "أسماك طازجة • اختر واطبخ • صيد يومي",
    logoUrl: img("r-seafood-logo"),
    coverUrl: img("r-seafood-cover"),
    category: "مأكولات بحرية",
    tags: ["أسماك", "مشويات", "صيد طازج"],
    address: "طريق الدائري الشمالي، حي الصحافة",
    city: "الرياض",
    latitude: 24.8025,
    longitude: 46.6461,
    rating: 4.3,
    reviewCount: 96,
    followerCount: 1980,
    likeCount: 2640,
    priceRange: 2,
    isVerified: false,
    phone: "+966 11 818 2276",
    distanceKm: 5.9,
    hours: standardHours("12:00", "23:30"),
    createdAt: daysAgo(150),
  },
];

/* ==========================================================================
   أقسام القوائم
   ========================================================================== */

const cat = (id: string, restaurantId: string, name: string, sortOrder: number): MenuCategory => ({
  id,
  restaurantId,
  name,
  sortOrder,
});

export const demoMenuCategories: MenuCategory[] = [
  // إكسير البن
  cat("cat-elixir-cold", "rest-elixir", "مشروبات باردة", 0),
  cat("cat-elixir-hot", "rest-elixir", "مشروبات ساخنة", 1),
  cat("cat-elixir-sweets", "rest-elixir", "حلويات", 2),
  cat("cat-elixir-dessert", "rest-elixir", "تحلية", 3),
  // البيت الدمشقي
  cat("cat-dam-soup", "rest-damascus", "حساء", 0),
  cat("cat-dam-main", "rest-damascus", "أطباق رئيسية", 1),
  cat("cat-dam-drinks", "rest-damascus", "مشروبات", 2),
  cat("cat-dam-dessert", "rest-damascus", "تحلية", 3),
  cat("cat-dam-sandwich", "rest-damascus", "ساندويتشات", 4),
  cat("cat-dam-salad", "rest-damascus", "سلطات", 5),
  // مقهى الأندلس
  cat("cat-and-starters", "rest-andalus", "مقبلات", 0),
  cat("cat-and-main", "rest-andalus", "أطباق رئيسية", 1),
  cat("cat-and-drinks", "rest-andalus", "مشروبات", 2),
  // سوشي لاونج
  cat("cat-sushi-rolls", "rest-sushi", "رولات", 0),
  cat("cat-sushi-nigiri", "rest-sushi", "نيغيري", 1),
  // تراتوريا روما
  cat("cat-trat-pasta", "rest-trattoria", "باستا", 0),
  cat("cat-trat-dessert", "rest-trattoria", "تحلية", 1),
  // مقهى النور
  cat("cat-noor-coffee", "rest-noor", "قهوة", 0),
  cat("cat-noor-bakery", "rest-noor", "معجنات", 1),
  // مخبز الأمل
  cat("cat-amal-bakery", "rest-amal", "مخبوزات", 0),
  // جرين بايتس
  cat("cat-green-bowls", "rest-green", "أطباق صحية", 0),
  cat("cat-green-drinks", "rest-green", "عصائر", 1),
  // برغر هاوس
  cat("cat-burger-main", "rest-burger", "برغر", 0),
  // بيتزا نابولي
  cat("cat-napoli-pizza", "rest-napoli", "بيتزا", 0),
  // حلويات اللؤلؤة
  cat("cat-lulua-sweets", "rest-lulua", "حلويات", 0),
  // صيد اليوم
  cat("cat-sayd-fish", "rest-sayd", "أسماك", 0),
];

/* ==========================================================================
   أصناف القوائم
   ========================================================================== */

let itemSeq = 0;
const item = (
  categoryId: string,
  restaurantId: string,
  name: string,
  description: string,
  price: number,
  image: string,
  tags: string[] = [],
  currency = "ر.س",
): MenuItem => ({
  id: `item-${++itemSeq}`,
  categoryId,
  restaurantId,
  name,
  description,
  price,
  currency,
  imageUrl: img(image),
  isAvailable: true,
  tags,
  sortOrder: itemSeq,
  createdAt: daysAgo(60),
});

export const demoMenuItems: MenuItem[] = [
  // ---- إكسير البن ----
  item("cat-elixir-cold", "rest-elixir", "كولد برو", "قهوة باردة مقطرة ببطء لمدة 12 ساعة لنكهة غنية وسلسة.", 24, "cold-brew", ["الأكثر طلباً"]),
  item("cat-elixir-cold", "rest-elixir", "سبانيش لاتيه بارد", "إسبريسو مع الحليب المبخر والحليب المكثف المحلى، يقدم على الثلج.", 26, "spanish-latte"),
  item("cat-elixir-cold", "rest-elixir", "ماتشا لاتيه بارد", "شاي الماتشا الياباني الفاخر مع الحليب البارد ولمسة من الحلاوة.", 28, "matcha-latte", ["نباتي"]),
  item("cat-elixir-cold", "rest-elixir", "أيس أمريكانو", "جرعتان من الإسبريسو مع ماء بارد وثلج، حموضة متوازنة ونهاية نظيفة.", 20, "d-espresso"),
  item("cat-elixir-hot", "rest-elixir", "فلات وايت", "جرعة مضاعفة من الإسبريسو مع حليب مخملي رقيق الرغوة.", 22, "latte-rosetta", ["الأكثر طلباً"]),
  item("cat-elixir-hot", "rest-elixir", "في 60", "تقطير يدوي لحبة مفردة، تتغير أصولها كل أسبوعين.", 25, "d-coffee-beans"),
  item("cat-elixir-hot", "rest-elixir", "كابتشينو", "توازن كلاسيكي بين الإسبريسو والحليب والرغوة الكثيفة.", 21, "d-latte"),
  item("cat-elixir-sweets", "rest-elixir", "كوكيز الشوكولاتة", "كوكيز طري من الداخل مع قطع شوكولاتة داكنة وملح البحر.", 16, "d-dessert"),
  item("cat-elixir-dessert", "rest-elixir", "تشيز كيك التمر", "تشيز كيك بارد بقاعدة بسكويت وتتبيلة تمر سكري.", 29, "d-cheesecake", ["جديد"]),

  // ---- البيت الدمشقي (بالدولار كما في التصميم المرجعي) ----
  item("cat-dam-soup", "rest-damascus", "شوربة العدس التقليدية", "عدس مطبوخ على نار هادئة مع التوابل الشرقية، يقدم مع خبز محمص وليمون.", 12, "lentil-soup", ["نباتي", "الأكثر طلباً"], "$"),
  item("cat-dam-soup", "rest-damascus", "حساء الدجاج والخضار", "مرق دجاج غني مع قطع الدجاج الطازجة ومجموعة من الخضار الموسمية.", 15, "chicken-soup", ["خالٍ من الجلوتين"], "$"),
  item("cat-dam-soup", "rest-damascus", "شوربة الكريمة والفطر", "فطر طازج مقلي بالزبدة مع كريمة خفيفة وبقدونس.", 14, "creamy-soup", ["نباتي"], "$"),
  item("cat-dam-main", "rest-damascus", "مشاوي مشكلة", "كباب وشيش طاووق وكستليتة على الفحم، مع أرز بالشعيرية وسلطة.", 32, "d-grill", ["الأكثر طلباً"], "$"),
  item("cat-dam-main", "rest-damascus", "شاورما لحم", "لحم متبل يُشوى على السيخ، يقدم مع خبز صاج وطحينة ومخلل.", 18, "d-shawarma", [], "$"),
  item("cat-dam-salad", "rest-damascus", "تبولة", "بقدونس مفروم ناعماً مع برغل وطماطم وزيت زيتون وليمون.", 9, "d-salad", ["نباتي"], "$"),
  item("cat-dam-sandwich", "rest-damascus", "ساندويتش فلافل", "فلافل مقرمشة مع سلطة وخضار وصلصة الطحينة داخل خبز طازج.", 7, "d-mezze", ["نباتي"], "$"),
  item("cat-dam-drinks", "rest-damascus", "ليموناضة بالنعناع", "ليمون طازج مع نعناع مهروس وثلج مجروش.", 6, "mocktail-mint", ["نباتي"], "$"),
  item("cat-dam-dessert", "rest-damascus", "كنافة نابلسية", "عجينة كنافة ذهبية بالجبن الطازج والقطر وفستق حلبي.", 11, "d-cake", ["الأكثر طلباً"], "$"),

  // ---- مقهى الأندلس ----
  item("cat-and-starters", "rest-andalus", "إسكالوب محمّر", "إسكالوب بحري على كريمة البازلاء مع زيت الفلفل الأحمر.", 68, "scallops-dish", ["الأكثر طلباً"]),
  item("cat-and-starters", "rest-andalus", "طبق مأكولات بحرية", "تشكيلة باردة من الروبيان والأخطبوط وسمك مدخّن.", 89, "d-seafood-platter"),
  item("cat-and-main", "rest-andalus", "سمك الهامور المشوي", "هامور طازج مشوي على الفحم مع خضار موسمية وصلصة الليمون.", 115, "d-fish"),
  item("cat-and-main", "rest-andalus", "ريزوتو المأكولات البحرية", "أرز كارنارولي مع مرق بحري غني وزعفران.", 96, "d-pasta2"),
  item("cat-and-drinks", "rest-andalus", "عصير برتقال طازج", "برتقال يُعصر عند الطلب، بدون سكر مضاف.", 22, "d-juice", ["نباتي"]),

  // ---- سوشي لاونج ----
  item("cat-sushi-rolls", "rest-sushi", "رول التنين", "أنقليس مشوي وأفوكادو مع صلصة الأوناغي الحلوة.", 72, "d-sushi-roll", ["الأكثر طلباً"]),
  item("cat-sushi-rolls", "rest-sushi", "سبايسي تونا رول", "تونة حمراء مفرومة مع مايونيز حار وبصل أخضر.", 65, "d-sushi-set"),
  item("cat-sushi-nigiri", "rest-sushi", "نيغيري سلمون", "شريحة سلمون نرويجي على أرز مخلل بخل الأرز.", 34, "d-sushi-nigiri"),
  item("cat-sushi-nigiri", "rest-sushi", "طبق سوشي مشكل", "اثنتا عشرة قطعة مختارة من الشيف حسب صيد اليوم.", 148, "sushi-platter", ["جديد"]),

  // ---- تراتوريا روما ----
  item("cat-trat-pasta", "rest-trattoria", "كاربونارا", "باستا محضرة يدوياً مع غوانشالي وجبن بيكورينو وفلفل أسود.", 78, "carbonara", ["الأكثر طلباً"]),
  item("cat-trat-pasta", "rest-trattoria", "باستا الطماطم والريحان", "صلصة طماطم سان مارزانو تُطهى ببطء مع ريحان طازج.", 64, "d-pasta", ["نباتي"]),
  item("cat-trat-dessert", "rest-trattoria", "تيراميسو", "بسكويت السافوياردي بالقهوة مع كريمة الماسكاربوني.", 42, "d-dessert"),

  // ---- مقهى النور ----
  item("cat-noor-coffee", "rest-noor", "لاتيه النور", "خلطتنا الخاصة مع حليب كامل الدسم ورغوة حريرية.", 19, "d-latte", ["الأكثر طلباً"]),
  item("cat-noor-coffee", "rest-noor", "قهوة اليوم", "تقطير يومي من حبة مختارة، تُقدم ساخنة أو باردة.", 15, "d-espresso"),
  item("cat-noor-bakery", "rest-noor", "كرواسون بالزبدة", "طبقات هشة تُخبز مرتين يومياً في الموقع.", 14, "croissant"),
  item("cat-noor-bakery", "rest-noor", "بان كيك بالتوت", "ثلاث قطع هشة مع توت طازج وشراب القيقب.", 32, "d-pancake"),

  // ---- مخبز الأمل ----
  item("cat-amal-bakery", "rest-amal", "خبز العجين المخمّر", "رغيف بقشرة مقرمشة وقلب طري، تخمير 24 ساعة.", 18, "d-bread", ["نباتي"]),
  item("cat-amal-bakery", "rest-amal", "بان أو شوكولا", "عجينة زبدة بطبقتين من الشوكولاتة الداكنة.", 15, "d-pastry", ["الأكثر طلباً"]),

  // ---- جرين بايتس ----
  item("cat-green-bowls", "rest-green", "بول الكينوا والأفوكادو", "كينوا مع أفوكادو وخضار مشوية وصلصة الطحينة الكريمية.", 46, "grain-bowl", ["نباتي", "الأكثر طلباً"]),
  item("cat-green-bowls", "rest-green", "سلطة الموسم", "خضار ورقية مع رمان وجوز وصلصة الليمون والزيت.", 38, "d-salad", ["نباتي", "خالٍ من الجلوتين"]),
  item("cat-green-drinks", "rest-green", "سموذي المانجو", "مانجو وموز وحليب اللوز بدون سكر مضاف.", 26, "d-smoothie", ["نباتي"]),
  item("cat-green-drinks", "rest-green", "ليموناضة الزنجبيل", "ليمون وزنجبيل طازج مع قليل من العسل.", 22, "d-lemonade", ["نباتي"]),

  // ---- برغر هاوس ----
  item("cat-burger-main", "rest-burger", "كلاسيك تشيز برغر", "لحم بلدي 180 غرام مع جبن شيدر وصلصة البيت.", 42, "d-burger", ["الأكثر طلباً"]),
  item("cat-burger-main", "rest-burger", "دبل سماش برغر", "قطعتان رقيقتان مضغوطتان على الصاج مع بصل مكرمل.", 52, "d-burger2"),

  // ---- بيتزا نابولي ----
  item("cat-napoli-pizza", "rest-napoli", "مارغريتا", "صلصة طماطم وموزاريلا طازجة وريحان وزيت زيتون بكر.", 48, "d-pizza-margherita", ["نباتي", "الأكثر طلباً"]),
  item("cat-napoli-pizza", "rest-napoli", "بيتزا نابولي الخاصة", "خضار مشوية وزيتون وجبن ماعز على عجينة 48 ساعة.", 56, "pizza-napoli"),
  item("cat-napoli-pizza", "rest-napoli", "ديافولا", "سلامي حار وموزاريلا وفلفل تشيلي طازج.", 54, "d-pizza-slice"),

  // ---- حلويات اللؤلؤة ----
  item("cat-lulua-sweets", "rest-lulua", "تشيز كيك الفراولة", "قاعدة بسكويت بالزبدة وكريمة جبن مع فراولة طازجة.", 28, "d-cheesecake", ["الأكثر طلباً"]),
  item("cat-lulua-sweets", "rest-lulua", "كيك التمر بالكراميل", "كيك تمر إسفنجي مع صلصة كراميل دافئة.", 26, "d-cake"),

  // ---- صيد اليوم ----
  item("cat-sayd-fish", "rest-sayd", "صيادية الهامور", "هامور مقلي مع أرز صيادية وبصل مكرمل وصلصة طحينة.", 78, "d-fish", ["الأكثر طلباً"]),
  item("cat-sayd-fish", "rest-sayd", "روبيان مشوي بالثوم", "روبيان جامبو مشوي مع زبدة الثوم والبقدونس.", 92, "d-seafood-platter"),
];

/* ==========================================================================
   المنشورات الاجتماعية
   ========================================================================== */

let postSeq = 0;
const post = (
  restaurantId: string,
  caption: string,
  image: string,
  badge: string | null,
  badgeTone: Post["badgeTone"],
  likeCount: number,
  commentCount: number,
  ageDays: number,
): Post => ({
  id: `post-${++postSeq}`,
  restaurantId,
  caption,
  imageUrl: img(image),
  badge,
  badgeTone,
  likeCount,
  commentCount,
  createdAt: daysAgo(ageDays),
});

export const demoPosts: Post[] = [
  post("rest-sushi", "تجربة جديدة كلياً! قائمة الصيف متوفرة الآن مع أطباق مميزة ومكونات طازجة.", "sushi-platter", "جديد", "new", 245, 12, 0),
  post("rest-trattoria", "الباستا المحضرة يدوياً يومياً، تماماً كما تصنعها الجدة.", "carbonara", "الأكثر مبيعاً", "popular", 89, 5, 1),
  post("rest-elixir", "دفعة جديدة من حبوب إثيوبيا يرغاتشيف وصلت هذا الصباح. حموضة زهرية ونهاية بالكراميل.", "cold-brew", "جديد", "new", 312, 24, 1),
  post("rest-andalus", "إسكالوب اليوم على كريمة البازلاء — طبق يستحق الحجز مسبقاً.", "scallops-dish", "الأكثر مبيعاً", "popular", 198, 17, 2),
  post("rest-damascus", "كنافتنا النابلسية تخرج من الفرن كل ساعة. الجبن طازج والقطر دافئ دائماً.", "d-cake", null, "new", 174, 9, 2),
  post("rest-napoli", "٤٨ ساعة تخمير، ٩٠ ثانية في فرن الحطب. هذا كل السر.", "d-pizza-margherita", "الأكثر مبيعاً", "popular", 263, 21, 3),
  post("rest-amal", "الكرواسون يخرج الساعة ٧ صباحاً. من يتأخر لا يجد.", "croissant", "جديد", "new", 156, 8, 3),
  post("rest-green", "بول الكينوا والأفوكادو بمكونات هذا الأسبوع من مزرعة الخرج.", "grain-bowl", null, "new", 121, 6, 4),
  post("rest-burger", "سماش برغر مزدوج، بصل مكرمل، وخبز بريوش من خبزنا. لا شيء آخر.", "d-burger", "الأكثر مبيعاً", "popular", 287, 19, 4),
  post("rest-noor", "افتتحنا الركن الهادئ للعمل — مقابس كهرباء عند كل طاولة وإنترنت سريع.", "r-noor-cover", "جديد", "new", 142, 11, 5),
  post("rest-lulua", "تشيز كيك الفراولة بموسم الفراولة الطازجة. كمية محدودة يومياً.", "d-cheesecake", null, "new", 133, 7, 5),
  post("rest-sayd", "صيد اليوم وصل: هامور وشعري وروبيان جامبو. اختر واطبخ كما تحب.", "d-seafood-platter", "جديد", "new", 98, 4, 6),
  post("rest-sushi", "طاولة الأوماكاسي تفتح ثماني مقاعد فقط كل مساء.", "d-sushi-nigiri", null, "new", 211, 14, 7),
  post("rest-elixir", "دورة تذوق القهوة المختصة هذا السبت. المقاعد محدودة والتسجيل من حساباتنا.", "d-coffee-beans", null, "new", 176, 13, 8),
  post("rest-trattoria", "تيراميسو محضّر في الصباح ويُقدّم في المساء — الكريمة لا تنتظر.", "d-dessert", null, "new", 145, 10, 9),
];

export const demoComments: PostComment[] = [
  { id: "cm-1", postId: "post-1", authorName: "سارة العتيبي", authorAvatar: img("u-1"), body: "جربت القائمة الجديدة أمس، السلمون كان استثنائياً!", createdAt: hoursAgo(3) },
  { id: "cm-2", postId: "post-1", authorName: "فهد المطيري", authorAvatar: img("u-2"), body: "هل الحجز متاح لطاولة الأوماكاسي نهاية الأسبوع؟", createdAt: hoursAgo(5) },
  { id: "cm-3", postId: "post-1", authorName: "لمى الزهراني", authorAvatar: img("u-3"), body: "أفضل سوشي في الرياض بلا منافس.", createdAt: hoursAgo(9) },
  { id: "cm-4", postId: "post-2", authorName: "عبدالله الحربي", authorAvatar: img("u-4"), body: "الكاربونارا هنا أقرب شيء لما أكلته في روما.", createdAt: hoursAgo(11) },
  { id: "cm-5", postId: "post-3", authorName: "نورة القحطاني", authorAvatar: img("u-5"), body: "الحموضة الزهرية واضحة جداً في التقطير اليدوي. ممتاز!", createdAt: hoursAgo(14) },
  { id: "cm-6", postId: "post-4", authorName: "ماجد الدوسري", authorAvatar: img("u-6"), body: "الجلسة الخارجية تستاهل الزيارة لوحدها.", createdAt: hoursAgo(20) },
  { id: "cm-7", postId: "post-6", authorName: "ريم الشمري", authorAvatar: img("u-1"), body: "العجينة خفيفة ومخمّرة صح. أخيراً!", createdAt: hoursAgo(26) },
  { id: "cm-8", postId: "post-9", authorName: "خالد العنزي", authorAvatar: img("u-2"), body: "البصل المكرمل يصنع الفرق كله.", createdAt: hoursAgo(30) },
];

/* ==========================================================================
   القصص
   ========================================================================== */

let storySeq = 0;
const story = (restaurantId: string, title: string, image: string, caption: string, hours: number): Story => ({
  id: `story-${++storySeq}`,
  restaurantId,
  title,
  imageUrl: img(image),
  caption,
  createdAt: hoursAgo(hours),
  expiresAt: new Date(Date.now() + (24 - hours) * 3_600_000).toISOString(),
});

export const demoStories: Story[] = [
  story("rest-amal", "مخبز الأمل", "croissant", "الدفعة الأولى من الكرواسون خرجت للتو 🥐", 1),
  story("rest-green", "جرين بايتس", "grain-bowl", "بول اليوم: كينوا وأفوكادو وخضار مشوية", 2),
  story("rest-noor", "كافيه نون", "latte-rosetta", "صباح الخير — أول فنجان على حسابنا لأول عشرة ضيوف", 3),
  story("rest-napoli", "بيتزا نابولي", "pizza-napoli", "فرن الحطب وصل ٤٥٠ درجة. جاهزون!", 4),
  story("rest-elixir", "إكسير البن", "cold-brew", "كولد برو الدفعة الجديدة جاهز الآن", 5),
  story("rest-damascus", "البيت الدمشقي", "creamy-soup", "أطباق اليوم: شوربة الفطر بالكريمة", 6),
  story("rest-damascus", "عصائر فريش", "mocktail-mint", "ليموناضة النعناع — الأنسب لهذا الجو", 7),
  story("rest-andalus", "مقهى الأندلس", "cafe-barista", "جديدنا: ركن القهوة المختصة داخل المقهى", 8),
  story("rest-sushi", "سوشي لاونج", "d-sushi-nigiri", "صيد اليوم وصل من المطار مباشرة", 9),
  story("rest-lulua", "حلويات اللؤلؤة", "d-cheesecake", "تشيز كيك الفراولة — كمية اليوم محدودة", 11),
];

/* ==========================================================================
   التقييمات
   ========================================================================== */

let reviewSeq = 0;
const review = (restaurantId: string, name: string, avatar: string, rating: number, comment: string, days: number): Review => ({
  id: `rev-${++reviewSeq}`,
  restaurantId,
  authorName: name,
  authorAvatar: img(avatar),
  rating,
  comment,
  createdAt: daysAgo(days),
});

export const demoReviews: Review[] = [
  review("rest-elixir", "سارة العتيبي", "u-1", 5, "أفضل فلات وايت جربته في الرياض. الحليب مضبوط والحبة عطرية.", 2),
  review("rest-elixir", "فهد المطيري", "u-2", 5, "المكان هادئ ومناسب للعمل، والواي فاي سريع فعلاً.", 5),
  review("rest-elixir", "لمى الزهراني", "u-3", 4, "القهوة ممتازة لكن الحلويات تنفد مبكراً.", 9),
  review("rest-elixir", "عبدالله الحربي", "u-4", 5, "الباريستا شرح لي الفرق بين الأصول بصبر. تجربة راقية.", 14),
  review("rest-andalus", "نورة القحطاني", "u-5", 5, "الإسكالوب طبق لا يُنسى، والجلسة الخارجية جميلة في المساء.", 3),
  review("rest-andalus", "ماجد الدوسري", "u-6", 5, "الأسماك طازجة والخدمة سريعة رغم الازدحام.", 8),
  review("rest-andalus", "ريم الشمري", "u-1", 4, "الأسعار مرتفعة قليلاً لكن الجودة تبررها.", 16),
  review("rest-damascus", "خالد العنزي", "u-2", 5, "أقرب طعم للبيت الشامي. المشاوي والتبولة ممتازة.", 4),
  review("rest-damascus", "هند السبيعي", "u-3", 5, "الكنافة النابلسية سبب زيارتي الأسبوعية.", 7),
  review("rest-damascus", "تركي الغامدي", "u-4", 4, "المكان يمتلئ بسرعة في الإجازات — احجز مبكراً.", 12),
  review("rest-trattoria", "دانة الفهد", "u-5", 5, "الكاربونارا بدون كريمة كما يجب أن تكون. احترافي.", 6),
  review("rest-trattoria", "سلطان البقمي", "u-6", 4, "التيراميسو ممتاز، لكن الانتظار طال قليلاً.", 11),
  review("rest-sushi", "أمل الرشيد", "u-1", 5, "طاولة الأوماكاسي تجربة تستحق كل ريال.", 3),
  review("rest-sushi", "بدر الخالدي", "u-2", 5, "السلمون النرويجي طازج جداً والأرز مضبوط.", 10),
  review("rest-napoli", "شهد المالكي", "u-3", 5, "أفضل عجينة بيتزا في المدينة، خفيفة وسهلة الهضم.", 5),
  review("rest-napoli", "يوسف الشهري", "u-4", 4, "الديافولا حارة بشكل ممتع. أنصح بها.", 13),
  review("rest-burger", "منيرة العجمي", "u-5", 4, "السماش برغر مضبوط والبطاطس مقرمشة.", 6),
  review("rest-green", "عمر النعيمي", "u-6", 5, "أخيراً مكان نباتي بقائمة متنوعة وليست مملة.", 9),
  review("rest-amal", "جواهر الحمد", "u-1", 5, "خبز العجين المخمّر يستحق الاستيقاظ مبكراً.", 4),
  review("rest-noor", "راكان الأحمدي", "u-2", 5, "الركن الجديد للعمل فكرة ممتازة. سأعود يومياً.", 2),
  review("rest-lulua", "أسماء الزيد", "u-3", 4, "كيك التمر بالكراميل رائع، أتمنى خيارات أقل سكراً.", 8),
  review("rest-sayd", "فيصل القرني", "u-4", 4, "فكرة اختيار السمكة ممتعة والأسعار عادلة.", 15),
];

/* ==========================================================================
   الإشعارات ونشاط لوحة التحكم
   ========================================================================== */

export const demoNotifications: AppNotification[] = [
  { id: "ntf-1", title: "تقييم جديد", body: "حصل مقهى النور على تقييم 5 نجوم من راكان الأحمدي.", createdAt: hoursAgo(2), isRead: false, href: "/restaurant/maqha-alnoor" },
  { id: "ntf-2", title: "قصة جديدة", body: "نشر إكسير البن قصة: كولد برو الدفعة الجديدة جاهز الآن.", createdAt: hoursAgo(5), isRead: false, href: "/story/story-5" },
  { id: "ntf-3", title: "متابع جديد", body: "بدأت لمى الزهراني بمتابعة مقهى النور.", createdAt: hoursAgo(9), isRead: true, href: "/dashboard/analytics" },
  { id: "ntf-4", title: "تحديث قائمة", body: "أضاف البيت الدمشقي صنفاً جديداً: كنافة نابلسية.", createdAt: hoursAgo(26), isRead: true, href: "/restaurant/albait-aldimashqi/menu" },
];

export const demoActivity: ActivityEntry[] = [
  { id: "act-1", icon: "menu", title: "تم تحديث قائمة الطعام", timeAgo: "قبل ساعتين", href: "/dashboard/menu" },
  { id: "act-2", icon: "review", title: "تقييم جديد: 5 نجوم", timeAgo: "قبل 5 ساعات", href: "/dashboard/analytics" },
  { id: "act-3", icon: "story", title: "انتهت صلاحية قصة", timeAgo: "قبل 8 ساعات", href: "/dashboard/stories" },
  { id: "act-4", icon: "follower", title: "٤٢ متابعاً جديداً هذا الأسبوع", timeAgo: "أمس", href: "/dashboard/analytics" },
  { id: "act-5", icon: "post", title: "منشورك حقق ١٤٢ إعجاباً", timeAgo: "قبل يومين", href: "/dashboard/posts" },
];

/* ==========================================================================
   منشورات المستخدم التجريبي (تبويب "منشوراتي" في الملف الشخصي)
   ========================================================================== */

export const demoUserPosts: Post[] = [
  post("rest-elixir", "فنجان الصباح الثابت. الفلات وايت هنا لا يخذل.", "d-latte", null, "new", 84, 6, 2),
  post("rest-andalus", "جلسة العشاء الخارجية تستحق التجربة، خصوصاً في هذا الجو.", "r-andalus-cover", null, "new", 132, 11, 6),
  post("rest-damascus", "الكنافة بعد العشاء صارت طقساً أسبوعياً.", "d-cake", null, "new", 97, 5, 10),
  post("rest-napoli", "أخيراً بيتزا بعجينة خفيفة فعلاً.", "d-pizza-margherita", null, "new", 76, 3, 14),
  post("rest-green", "بول الكينوا — غداء سريع وخفيف بين الاجتماعات.", "grain-bowl", null, "new", 58, 2, 19),
  post("rest-amal", "خبز العجين المخمّر يستاهل الوقوف بالطابور.", "d-bread", null, "new", 63, 4, 25),
];
