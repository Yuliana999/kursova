import dotenv from 'dotenv';
import connectDB from './config/db.js';
import Category from './models/Category.js';
import Product from './models/Product.js';

dotenv.config();

const categories = [
  { name: 'Догляд за обличчям',   slug: 'face-care',    description: 'Креми, сироватки, тоніки та засоби для очищення шкіри обличчя' },
  { name: 'Макіяж',               slug: 'makeup',       description: 'Тональні основи, помади, туші, тіні та інші косметичні засоби' },
  { name: 'Парфуми',              slug: 'perfumes',     description: 'Парфумована та туалетна вода, парфумерні набори' },
  { name: 'Догляд за волоссям',   slug: 'hair-care',    description: 'Шампуні, кондиціонери, маски та олії для волосся' },
  { name: 'Засоби для тіла',      slug: 'body-care',    description: 'Скраби, лосьйони, масла та засоби для душу' },
  { name: 'Сонцезахисні засоби',  slug: 'sun-care',     description: 'SPF-креми, флюїди, спреї та молочко для захисту від сонця' },
  { name: 'Догляд за нігтями',    slug: 'nail-care',    description: 'Лаки, засоби для зміцнення нігтів, пілочки та засоби для кутикули' },
  { name: 'Чоловіча косметика',   slug: 'mens-care',    description: 'Засоби для гоління, догляд за шкірою та волоссям для чоловіків' },
  { name: 'Натуральна косметика', slug: 'natural-care', description: 'Органічні та натуральні засоби без шкідливих хімічних компонентів' },
  { name: 'Подарункові набори',   slug: 'gift-sets',    description: 'Готові косметичні набори в подарунковому пакуванні' },
];

const getProducts = (c) => [
  // ── Догляд за обличчям (10 товарів) ─────────────────────────────
  {
    name: 'Зволожуючий крем SPF30 Aqua Boost',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Легкий денний крем з SPF захистом та гіалуроновою кислотою. Зволожує шкіру на 24 години, захищає від УФ-випромінювання.',
    price: 420, discountPercent: 10, stockQuantity: 45,
    category: c['face-care'],
  },
  {
    name: 'Сироватка з вітаміном C Glow Serum',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    description: 'Освітлювальна сироватка з 15% вітаміном C та феруловою кислотою. Вирівнює тон шкіри та надає сяяння.',
    price: 680, discountPercent: 15, stockQuantity: 32,
    category: c['face-care'],
  },
  {
    name: 'Міцелярна вода 3в1 Pure Clean',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    description: 'Ніжно очищає шкіру, знімає макіяж та тонізує. Підходить для всіх типів шкіри, без спирту.',
    price: 185, discountPercent: 0, stockQuantity: 120,
    category: c['face-care'],
  },
  {
    name: 'Нічний крем Retinol Renew',
    imageUrl: 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400',
    description: 'Нічний крем з ретинолом та пептидами. Стимулює оновлення клітин, зменшує зморшки та вирівнює рельєф шкіри.',
    price: 750, discountPercent: 5, stockQuantity: 28,
    category: c['face-care'],
  },
  {
    name: 'Тонік з гіалуроновою кислотою HydraFix',
    imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
    description: 'Зволожуючий тонік з гіалуроновою кислотою та пантенолом. Підготовлює шкіру до нанесення сироватки та крему.',
    price: 295, discountPercent: 0, stockQuantity: 65,
    category: c['face-care'],
  },
  {
    name: 'Пілінг-маска AHA/BHA Clear Skin',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
    description: 'Глибоке очищення пор за допомогою кислотного пілінгу. Видаляє мертві клітини, звужує пори та надає сяяння.',
    price: 390, discountPercent: 20, stockQuantity: 40,
    category: c['face-care'],
  },
  {
    name: 'Крем для шкіри навколо очей Eye Lift',
    imageUrl: 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=400',
    description: 'Підтягуючий крем проти темних кіл і набряків. Містить кофеїн, ретинол та пептиди.',
    price: 520, discountPercent: 0, stockQuantity: 22,
    category: c['face-care'],
  },
  {
    name: 'BB-крем All-In-One SPF20 відтінок Beige',
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    description: 'Легкий BB-крем що поєднує зволоження, захист SPF20 і вирівнювання тону шкіри.',
    price: 310, discountPercent: 10, stockQuantity: 58,
    category: c['face-care'],
  },
  {
    name: 'Маска-плівка Charcoal Detox',
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
    description: 'Очищаюча маска-плівка з активованим вугіллям. Витягує бруд та надлишок себуму з пор.',
    price: 230, discountPercent: 15, stockQuantity: 75,
    category: c['face-care'],
  },
  {
    name: 'Праймер для обличчя Pore Blur',
    imageUrl: 'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=400',
    description: 'Праймер з ефектом розмиття пор та рівної шкіри. Подовжує стійкість макіяжу до 12 годин.',
    price: 355, discountPercent: 0, stockQuantity: 50,
    category: c['face-care'],
  },

  // ── Макіяж (10 товарів) ──────────────────────────────────────────
  {
    name: 'Тональна основа Velvet Skin №03',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    description: 'Стійка тональна основа з матовим фінішем. Забезпечує середнє-повне покриття на весь день.',
    price: 350, discountPercent: 20, stockQuantity: 60,
    category: c['makeup'],
  },
  {
    name: 'Туш для вій Volume Max чорна',
    imageUrl: 'https://images.unsplash.com/photo-1591360236480-4ed861025fa1?w=400',
    description: 'Екстремальний обʼєм без грудочок. Формула зі зміцнюючим комплексом та вигнутою щіточкою.',
    price: 240, discountPercent: 5, stockQuantity: 88,
    category: c['makeup'],
  },
  {
    name: 'Помада матова Rose Rouge відтінок 07',
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=400',
    description: 'Насичена матова помада з довготривалою стійкістю до 12 годин. Не сушить губи.',
    price: 290, discountPercent: 10, stockQuantity: 54,
    category: c['makeup'],
  },
  {
    name: 'Палетка тіней Smoky Eyes 12 відтінків',
    imageUrl: 'https://images.unsplash.com/photo-1512207736890-6ffed8a84e8d?w=400',
    description: '12 пігментованих відтінків від нюдових до глибоких темних. Ідеально для денного та вечірнього макіяжу.',
    price: 480, discountPercent: 0, stockQuantity: 30,
    category: c['makeup'],
  },
  {
    name: 'Консилер Perfect Cover відтінок Ivory',
    imageUrl: 'https://images.unsplash.com/photo-1631214499984-46a84bcf6c53?w=400',
    description: 'Стійкий консилер повного покриття для маскування темних кіл та недоліків шкіри.',
    price: 195, discountPercent: 0, stockQuantity: 70,
    category: c['makeup'],
  },
  {
    name: "Рум'яна Blush Natural Glow відтінок Peach",
    imageUrl: 'https://images.unsplash.com/photo-1583241475880-083f84372725?w=400',
    description: "Шовковисті рум'яна з натуральним перламутровим сяянням. Надають обличчю свіжість та рум'янець.",
    price: 265, discountPercent: 10, stockQuantity: 42,
    category: c['makeup'],
  },
  {
    name: 'Олівець для очей Kohl Liner чорний',
    imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=400',
    description: "М'який кайяловий олівець для стрілок та підведення очей. Стійка формула, не розмазується.",
    price: 155, discountPercent: 0, stockQuantity: 110,
    category: c['makeup'],
  },
  {
    name: 'Фіксуючий спрей Makeup Lock 100мл',
    imageUrl: 'https://images.unsplash.com/photo-1571875257727-256c39da42af?w=400',
    description: 'Спрей фіксує макіяж на 16 годин. Освіжає та надає шкірі природного сяяння.',
    price: 320, discountPercent: 15, stockQuantity: 48,
    category: c['makeup'],
  },
  {
    name: 'Хайлайтер Glow Powder рожеве золото',
    imageUrl: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a24?w=400',
    description: 'Пігментований хайлайтер у відтінку рожевого золота. Підкреслює виличні кістки та надає ефект сяяння.',
    price: 340, discountPercent: 0, stockQuantity: 36,
    category: c['makeup'],
  },
  {
    name: 'Гель для брів Brow Fix прозорий',
    imageUrl: 'https://images.unsplash.com/photo-1560343090-f0409e92791a?w=400',
    description: 'Прозорий гель для фіксації та укладки брів. Тримає форму весь день, не злипається.',
    price: 130, discountPercent: 5, stockQuantity: 95,
    category: c['makeup'],
  },

  // ── Парфуми (10 товарів) ─────────────────────────────────────────
  {
    name: 'Парфумована вода Chic Noir 50мл',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400',
    description: 'Чуттєвий аромат з нотами чорної орхідеї, мускусу та ванілі. Стійкість 8–10 годин.',
    price: 1250, discountPercent: 0, stockQuantity: 18,
    category: c['perfumes'],
  },
  {
    name: 'Туалетна вода Fresh Breeze 100мл',
    imageUrl: 'https://images.unsplash.com/photo-1547887538-047d4d2960f4?w=400',
    description: 'Свіжий унісекс аромат з нотами цитрусу, бергамоту та кедрового дерева.',
    price: 890, discountPercent: 25, stockQuantity: 12,
    category: c['perfumes'],
  },
  {
    name: 'Парфумована вода Rose Garden 30мл',
    imageUrl: 'https://images.unsplash.com/photo-1588514912908-b2a3e7c42086?w=400',
    description: 'Романтичний квітковий аромат із серцем дамаської троянди та бергамотом у вступі.',
    price: 780, discountPercent: 10, stockQuantity: 25,
    category: c['perfumes'],
  },
  {
    name: 'Туалетна вода Aqua Intense Men 100мл',
    imageUrl: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?w=400',
    description: 'Чоловічий морський аромат із нотами морського бризу, ялівцю та амбри.',
    price: 950, discountPercent: 0, stockQuantity: 20,
    category: c['perfumes'],
  },
  {
    name: 'Парфумований міст для тіла Vanilla Dream 200мл',
    imageUrl: 'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?w=400',
    description: 'Легкий парфумований спрей для тіла з ванільно-квітковим ароматом. Ідеально для щоденного використання.',
    price: 320, discountPercent: 0, stockQuantity: 55,
    category: c['perfumes'],
  },
  {
    name: 'Парфумована вода Oud Mystique 50мл',
    imageUrl: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400',
    description: 'Розкішний східний аромат з нотами уду, сандалу та троянди. Залишає слід на 10–12 годин.',
    price: 1680, discountPercent: 5, stockQuantity: 10,
    category: c['perfumes'],
  },
  {
    name: 'Туалетна вода Citrus Burst 75мл',
    imageUrl: 'https://images.unsplash.com/photo-1600612253971-57b7c6d07d97?w=400',
    description: 'Енергійний цитрусовий аромат з нотами грейпфрута, лайму та зеленого чаю. Ідеально для літа.',
    price: 620, discountPercent: 15, stockQuantity: 38,
    category: c['perfumes'],
  },
  {
    name: 'Парфумований набір His & Hers',
    imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400',
    description: 'Парний подарунковий набір: жіночий квітковий та чоловічий деревний аромат по 30мл.',
    price: 1100, discountPercent: 10, stockQuantity: 15,
    category: c['perfumes'],
  },
  {
    name: 'Парфумована вода Jasmine Blanc 50мл',
    imageUrl: 'https://images.unsplash.com/photo-1563170351-be82bc888aa4?w=400',
    description: 'Ніжний квітковий аромат із серцем жасмину, нотами пудри та мускусу в основі.',
    price: 870, discountPercent: 0, stockQuantity: 22,
    category: c['perfumes'],
  },
  {
    name: 'Роллер-парфум Pocket Scent Oud 10мл',
    imageUrl: 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?w=400',
    description: 'Зручний роллер з концентрованим ароматом уду. Ідеальний для сумки чи кишені.',
    price: 290, discountPercent: 0, stockQuantity: 60,
    category: c['perfumes'],
  },

  // ── Догляд за волоссям (10 товарів) ──────────────────────────────
  {
    name: 'Шампунь відновлюючий Keratin Pro',
    imageUrl: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400',
    description: 'Відновлює пошкоджене волосся завдяки кератину та аргановій олії. Надає гладкість та блиск.',
    price: 310, discountPercent: 10, stockQuantity: 76,
    category: c['hair-care'],
  },
  {
    name: 'Маска для волосся Deep Repair 250мл',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400',
    description: 'Інтенсивна відновлювальна маска для сухого та ламкого волосся. Містить протеїни шовку.',
    price: 450, discountPercent: 0, stockQuantity: 0,
    category: c['hair-care'],
  },
  {
    name: 'Кондиціонер Smooth & Shine 350мл',
    imageUrl: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400',
    description: 'Розгладжуючий кондиціонер для неслухняного та кучерявого волосся. Полегшує розчісування.',
    price: 255, discountPercent: 5, stockQuantity: 90,
    category: c['hair-care'],
  },
  {
    name: 'Олія для волосся Argan Elixir 100мл',
    imageUrl: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400',
    description: 'Легка олія на основі арганової олії та вітаміну E. Живить, блищить та захищає від термальних пошкоджень.',
    price: 395, discountPercent: 0, stockQuantity: 45,
    category: c['hair-care'],
  },
  {
    name: 'Термозахисний спрей Heat Shield 200мл',
    imageUrl: 'https://images.unsplash.com/photo-1622646916404-1bb14dc1b33c?w=400',
    description: 'Захищає волосся від впливу температур до 230°C. Зменшує ламкість та надає гладкість.',
    price: 285, discountPercent: 10, stockQuantity: 62,
    category: c['hair-care'],
  },
  {
    name: 'Шампунь проти лупи Clear Balance',
    imageUrl: 'https://images.unsplash.com/photo-1631390932968-f3b6dae2b0f8?w=400',
    description: 'Щадний шампунь з піроктон оламіном та цинком. Ефективно усуває лупу вже після першого миття.',
    price: 220, discountPercent: 0, stockQuantity: 85,
    category: c['hair-care'],
  },
  {
    name: 'Сироватка для росту волосся Growth Factor',
    imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=400',
    description: 'Активізує сплячі фолікули волосся. Містить біотин, кофеїн та пептиди росту.',
    price: 580, discountPercent: 20, stockQuantity: 30,
    category: c['hair-care'],
  },
  {
    name: 'Суха шампунь Refresh & Go 150мл',
    imageUrl: 'https://images.unsplash.com/photo-1614159102509-9fe51e3e0c5e?w=400',
    description: 'Миттєво освіжає волосся між миттям. Поглинає надлишок себуму та надає обʼєм.',
    price: 190, discountPercent: 0, stockQuantity: 100,
    category: c['hair-care'],
  },
  {
    name: 'Скраб для шкіри голови Scalp Detox',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    description: 'Відлущуючий скраб з морською сіллю та олією чайного дерева. Усуває лусочки та покращує кровообіг.',
    price: 335, discountPercent: 0, stockQuantity: 40,
    category: c['hair-care'],
  },
  {
    name: 'Набір для відновлення волосся Repair Kit',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    description: 'Комплект з шампуню, маски та сироватки для глибокого відновлення пошкодженого волосся.',
    price: 890, discountPercent: 15, stockQuantity: 20,
    category: c['hair-care'],
  },

  // ── Засоби для тіла (10 товарів) ─────────────────────────────────
  {
    name: 'Живильне масло для тіла Argan Gold',
    imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400',
    description: "Розкішне масло на основі арганової олії та вітаміну E. Живить, пом'якшує та надає сяяння шкірі.",
    price: 380, discountPercent: 15, stockQuantity: 55,
    category: c['body-care'],
  },
  {
    name: 'Скраб для тіла Coffee Energy 300г',
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400',
    description: 'Кавовий скраб з цукром та кокосовою олією. Відлущує, тонізує та розгладжує шкіру.',
    price: 265, discountPercent: 0, stockQuantity: 90,
    category: c['body-care'],
  },
  {
    name: 'Лосьйон для тіла Silk Touch 400мл',
    imageUrl: 'https://images.unsplash.com/photo-1643185539104-3622eb1f0ff3?w=400',
    description: 'Легкий зволожуючий лосьйон з маслом ши та алое вера. Швидко вбирається, не залишає жирного блиску.',
    price: 230, discountPercent: 10, stockQuantity: 75,
    category: c['body-care'],
  },
  {
    name: 'Крем для рук Intensive Care 75мл',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Інтенсивно зволожуючий крем для рук з гіалуроновою кислотою та гліцерином. Відновлює сухі та потріскані руки.',
    price: 145, discountPercent: 0, stockQuantity: 130,
    category: c['body-care'],
  },
  {
    name: 'Гель для душу Refreshing Mint 300мл',
    imageUrl: 'https://images.unsplash.com/photo-1626197031507-c17099753214?w=400',
    description: "Освіжаючий гель для душу з екстрактом м'яти та морською сіллю. Тонізує та бадьорить шкіру.",
    price: 175, discountPercent: 5, stockQuantity: 110,
    category: c['body-care'],
  },
  {
    name: 'Масло для ванни Lavender Relax 200мл',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
    description: "Ароматна олія для ванни з лавандою та ромашкою. Розслабляє, пом'якшує шкіру та допомагає заснути.",
    price: 320, discountPercent: 0, stockQuantity: 42,
    category: c['body-care'],
  },
  {
    name: 'Антицелюлітний крем Slim Body 200мл',
    imageUrl: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400',
    description: 'Крем з кофеїном та L-карнітином. Підтягує шкіру, покращує мікроциркуляцію та зменшує апельсинову кірку.',
    price: 445, discountPercent: 20, stockQuantity: 38,
    category: c['body-care'],
  },
  {
    name: 'Відлущуючий лосьйон AHA Body Glow 300мл',
    imageUrl: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400',
    description: "Щоденний лосьйон з молочною кислотою. М'яко відлущує, вирівнює тон та надає шкірі гладкість.",
    price: 360, discountPercent: 10, stockQuantity: 45,
    category: c['body-care'],
  },
  {
    name: 'Бальзам для губ Honey Lip Care SPF15',
    imageUrl: 'https://images.unsplash.com/photo-1631214500004-a1f78b0f3571?w=400',
    description: 'Живильний бальзам для губ з медом, бджолиним воском та SPF15. Захищає від вітру та сонця.',
    price: 85, discountPercent: 0, stockQuantity: 200,
    category: c['body-care'],
  },
  {
    name: 'Молочко для тіла Rose & Shea 400мл',
    imageUrl: 'https://images.unsplash.com/photo-1585241645927-c7a8e5840c42?w=400',
    description: 'Ніжне живильне молочко з олією ши та екстрактом троянди. Залишає шкіру оксамитовою та ароматною.',
    price: 275, discountPercent: 0, stockQuantity: 68,
    category: c['body-care'],
  },

  // ── Сонцезахисні засоби (10 товарів) ─────────────────────────────
  {
    name: 'Сонцезахисний флюїд Ultra Guard SPF50',
    imageUrl: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400',
    description: 'Легкий невидимий флюїд з SPF50 для щоденного захисту від UVA/UVB. Не залишає білих плям.',
    price: 445, discountPercent: 0, stockQuantity: 35,
    category: c['sun-care'],
  },
  {
    name: 'Сонцезахисне молочко Tropical Sun SPF30 200мл',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Зволожуюче сонцезахисне молочко для тіла SPF30. Водостійке, підходить для пляжу та басейну.',
    price: 315, discountPercent: 10, stockQuantity: 60,
    category: c['sun-care'],
  },
  {
    name: 'Спрей-захист від сонця Invisible Mist SPF50+ 150мл',
    imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
    description: 'Невидимий прозорий спрей з максимальним SPF50+. Не залишає слідів на одязі, зручний формат.',
    price: 390, discountPercent: 15, stockQuantity: 45,
    category: c['sun-care'],
  },
  {
    name: 'Дитячий сонцезахисний крем Kids Safe SPF50',
    imageUrl: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400',
    description: 'Гіпоалергенний крем для чутливої дитячої шкіри. Без хімічних УФ-фільтрів, на мінеральній основі.',
    price: 480, discountPercent: 0, stockQuantity: 40,
    category: c['sun-care'],
  },
  {
    name: 'Тонуючий BB-флюїд з SPF40 відтінок Sand',
    imageUrl: 'https://images.unsplash.com/photo-1631214499984-46a84bcf6c53?w=400',
    description: 'Легкий тонуючий флюїд поєднує захист SPF40 з вирівнюванням тону шкіри. Ідеальний для літа.',
    price: 420, discountPercent: 0, stockQuantity: 52,
    category: c['sun-care'],
  },
  {
    name: 'Після сонячне молочко After Sun Relief 200мл',
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400',
    description: 'Заспокоює та зволожує шкіру після перебування на сонці. Містить алое вера та пантенол.',
    price: 270, discountPercent: 5, stockQuantity: 70,
    category: c['sun-care'],
  },
  {
    name: 'Сонцезахисна помада для губ Lip Shield SPF30',
    imageUrl: 'https://images.unsplash.com/photo-1586495777744-4e6232bf2f9b?w=400',
    description: 'Захисний бальзам для губ з SPF30 та зволожуючим комплексом. Запобігає пересиханню та опікам.',
    price: 120, discountPercent: 0, stockQuantity: 150,
    category: c['sun-care'],
  },
  {
    name: 'Мінеральна пудра з SPF25 Sun Veil',
    imageUrl: 'https://images.unsplash.com/photo-1583241800698-e8ab01830a24?w=400',
    description: 'Прозора мінеральна пудра з SPF25. Фіксує макіяж і захищає від сонця впродовж дня.',
    price: 355, discountPercent: 10, stockQuantity: 38,
    category: c['sun-care'],
  },
  {
    name: 'Крем для обличчя з SPF50+ Urban Shield',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Денний крем із захистом SPF50+ від UVA, UVB та блакитного світла. Антиоксидантна формула.',
    price: 560, discountPercent: 0, stockQuantity: 28,
    category: c['sun-care'],
  },
  {
    name: 'Сонцезахисна олія для тіла Tan Glow SPF15',
    imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=400',
    description: 'Суха олія для тіла з SPF15 та бронзуючим ефектом. Живить шкіру та надає рівний засмаглий вигляд.',
    price: 345, discountPercent: 20, stockQuantity: 48,
    category: c['sun-care'],
  },

  // ── Догляд за нігтями (10 товарів) ───────────────────────────────
  {
    name: 'Лак для нігтів Gel Effect відтінок Coral',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    description: 'Стійкий лак з гель-ефектом. Яскравий корал тримається до 10 днів без сколів.',
    price: 145, discountPercent: 0, stockQuantity: 120,
    category: c['nail-care'],
  },
  {
    name: 'Зміцнювач для нігтів Nail Armor',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    description: 'Зміцнюючий засіб з кальцієм та кератином. Запобігає ламкості та розшаруванню нігтів.',
    price: 195, discountPercent: 10, stockQuantity: 85,
    category: c['nail-care'],
  },
  {
    name: 'Олія для кутикули Cuticle Elixir 15мл',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    description: "Живильна олія з вітаміном E та жожоба. Пом'якшує кутикулу та прискорює ріст нігтів.",
    price: 115, discountPercent: 0, stockQuantity: 160,
    category: c['nail-care'],
  },
  {
    name: 'Топ для нігтів No Wipe Gloss',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    description: 'Глянцевий топ без залипання. Надає нігтям дзеркальний блиск та подовжує стійкість лаку.',
    price: 160, discountPercent: 5, stockQuantity: 95,
    category: c['nail-care'],
  },
  {
    name: 'Засіб для зняття лаку Gentle Remover 100мл',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    description: 'Ніжний засіб для зняття будь-якого лаку без ацетону. Містить алое вера для захисту нігтів.',
    price: 85, discountPercent: 0, stockQuantity: 200,
    category: c['nail-care'],
  },
  {
    name: 'Набір пилочок для нігтів Pro File Set',
    imageUrl: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400',
    description: 'Набір з 4 пилочок різної зернистості для натуральних та гелевих нігтів.',
    price: 130, discountPercent: 0, stockQuantity: 75,
    category: c['nail-care'],
  },
  {
    name: 'Гель-лак Soak Off відтінок Berry Pink',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    description: 'Гель-лак для домашнього манікюру. Стійкість 3 тижні, знімається замочуванням без пошкоджень.',
    price: 210, discountPercent: 15, stockQuantity: 55,
    category: c['nail-care'],
  },
  {
    name: 'Крем для рук і нігтів Nail & Hand Luxe',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Насичений крем з маслом авокадо та протеїнами шовку. Живить шкіру рук і зміцнює нігтьову пластину.',
    price: 170, discountPercent: 0, stockQuantity: 110,
    category: c['nail-care'],
  },
  {
    name: 'Лак-основа для нігтів Protect Base',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    description: 'Захисна база під лак. Вирівнює нігтьову пластину та захищає від пожовтіння.',
    price: 140, discountPercent: 0, stockQuantity: 130,
    category: c['nail-care'],
  },
  {
    name: 'Сироватка для нігтів Nail Renew Serum',
    imageUrl: 'https://images.unsplash.com/photo-1519014816548-bf5fe059798b?w=400',
    description: 'Відновлювальна сироватка для ламких та пошкоджених нігтів. Збагачена біотином та мінералами.',
    price: 280, discountPercent: 10, stockQuantity: 60,
    category: c['nail-care'],
  },

  // ── Чоловіча косметика (10 товарів) ──────────────────────────────
  {
    name: 'Піна для гоління Smooth Shave 200мл',
    imageUrl: 'https://images.unsplash.com/photo-1621607512022-6aecc4fed814?w=400',
    description: 'Зволожуюча піна для гоління з алое вера та пантенолом. Забезпечує гладке ковзання та захищає шкіру.',
    price: 175, discountPercent: 0, stockQuantity: 95,
    category: c['mens-care'],
  },
  {
    name: 'Бальзам після гоління Cool Relief 100мл',
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    description: 'Заспокоює подразнення після гоління. Містить ментол, алое вера та вітамін E.',
    price: 220, discountPercent: 10, stockQuantity: 72,
    category: c['mens-care'],
  },
  {
    name: 'Денний крем для чоловіків Energy Boost SPF20',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Легкий денний крем для чоловіків з SPF20. Зволожує, матує та захищає від старіння.',
    price: 345, discountPercent: 0, stockQuantity: 55,
    category: c['mens-care'],
  },
  {
    name: 'Шампунь 2в1 для чоловіків Fresh Power',
    imageUrl: 'https://images.unsplash.com/photo-1526045612212-70caf35c14df?w=400',
    description: 'Шампунь та кондиціонер в одному. Очищає і зволожує волосся, надає свіжість на весь день.',
    price: 210, discountPercent: 5, stockQuantity: 88,
    category: c['mens-care'],
  },
  {
    name: 'Олія для бороди Beard Master 30мл',
    imageUrl: 'https://images.unsplash.com/photo-1621607512214-68297480165e?w=400',
    description: 'Живильна олія для бороди з аргановою олією та кедром. Розгладжує, живить та надає блиск.',
    price: 295, discountPercent: 0, stockQuantity: 48,
    category: c['mens-care'],
  },
  {
    name: 'Гель для волосся Strong Hold 150мл',
    imageUrl: 'https://images.unsplash.com/photo-1622478814840-d3e5b2f1b5f5?w=400',
    description: 'Гель сильної фіксації для укладки волосся. Тримає форму весь день, не злипається.',
    price: 165, discountPercent: 0, stockQuantity: 110,
    category: c['mens-care'],
  },
  {
    name: 'Скраб для обличчя Men Deep Clean 100мл',
    imageUrl: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400',
    description: 'Глибоко очищаючий скраб для чоловічої шкіри. Видаляє забруднення, звужує пори та освіжає.',
    price: 255, discountPercent: 15, stockQuantity: 65,
    category: c['mens-care'],
  },
  {
    name: 'Дезодорант-антиперспірант Men Active 48H',
    imageUrl: 'https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=400',
    description: 'Захист від поту та запаху до 48 годин. Не залишає слідів на одязі, свіжий аромат.',
    price: 135, discountPercent: 0, stockQuantity: 150,
    category: c['mens-care'],
  },
  {
    name: 'Крем для ніг Men Foot Repair 75мл',
    imageUrl: 'https://images.unsplash.com/photo-1643185539104-3622eb1f0ff3?w=400',
    description: 'Інтенсивний крем для огрубілої шкіри ніг. Містить сечовину та ментол для свіжості та гладкості.',
    price: 150, discountPercent: 0, stockQuantity: 85,
    category: c['mens-care'],
  },
  {
    name: 'Набір для догляду Men Grooming Kit',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    description: 'Подарунковий набір: піна для гоління, бальзам після гоління та денний крем у зручному боксі.',
    price: 680, discountPercent: 10, stockQuantity: 30,
    category: c['mens-care'],
  },

  // ── Натуральна косметика (10 товарів) ────────────────────────────
  {
    name: 'Органічний крем Rose Hip Seed Oil 50мл',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400',
    description: 'Крем на основі органічної олії шипшини. Відновлює, живить та вирівнює тон шкіри без хімії.',
    price: 520, discountPercent: 0, stockQuantity: 35,
    category: c['natural-care'],
  },
  {
    name: 'Натуральний дезодорант Crystal Salt',
    imageUrl: 'https://images.unsplash.com/photo-1576426863848-c21f53c60b19?w=400',
    description: 'Мінеральний дезодорант без алюмінієвих солей та спирту. Ефективний захист до 24 годин.',
    price: 185, discountPercent: 0, stockQuantity: 90,
    category: c['natural-care'],
  },
  {
    name: 'Органічна маска з глиною Green Clay',
    imageUrl: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400',
    description: 'Маска на основі зеленої глини та органічних трав. Очищає, звужує пори, нормалізує себум.',
    price: 310, discountPercent: 5, stockQuantity: 55,
    category: c['natural-care'],
  },
  {
    name: 'Натуральний шампунь з кропивою 250мл',
    imageUrl: 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=400',
    description: 'Шампунь без сульфатів та парабенів з екстрактом кропиви та лопуха. Зміцнює та живить волосся.',
    price: 275, discountPercent: 10, stockQuantity: 68,
    category: c['natural-care'],
  },
  {
    name: 'Масло какао для тіла Raw Cacao Butter 100г',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
    description: 'Нерафіноване масло какао холодного пресування. Інтенсивно живить суху шкіру та підвищує еластичність.',
    price: 240, discountPercent: 0, stockQuantity: 80,
    category: c['natural-care'],
  },
  {
    name: "Органічний бальзам для губ Beeswax Mint",
    imageUrl: 'https://images.unsplash.com/photo-1631214500004-a1f78b0f3571?w=400',
    description: "Бальзам на основі бджолиного воску, масла ши та олії м'яти. Без мінеральних олій та ароматизаторів.",
    price: 95, discountPercent: 0, stockQuantity: 180,
    category: c['natural-care'],
  },
  {
    name: 'Натуральний скраб з морською сіллю Sea Detox',
    imageUrl: 'https://images.unsplash.com/photo-1570194065650-d99fb4b8ccb0?w=400',
    description: 'Скраб на основі морської солі, мигдального масла та ефірних олій. Глибоко очищає та розгладжує шкіру.',
    price: 295, discountPercent: 15, stockQuantity: 62,
    category: c['natural-care'],
  },
  {
    name: 'Сироватка з екстрактом центели Cica Glow',
    imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
    description: "100% натуральна сироватка з центелою азіатською. Заспокоює, регенерує та зміцнює бар'єр шкіри.",
    price: 480, discountPercent: 0, stockQuantity: 42,
    category: c['natural-care'],
  },
  {
    name: 'Органічний тонер з трояндовою водою Rose Pure',
    imageUrl: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400',
    description: 'Тонер на основі дистиляту дамаської троянди. Зволожує, освіжає та підготовлює шкіру до догляду.',
    price: 340, discountPercent: 0, stockQuantity: 50,
    category: c['natural-care'],
  },
  {
    name: 'Натуральний зубний порошок White Smile',
    imageUrl: 'https://images.unsplash.com/photo-1607006344380-b6775a0824a7?w=400',
    description: 'Зубний порошок без фториду та хімічних абразивів. Відбілює, захищає емаль та свіжить подих.',
    price: 155, discountPercent: 10, stockQuantity: 95,
    category: c['natural-care'],
  },

  // ── Подарункові набори (10 товарів) ──────────────────────────────
  {
    name: 'Подарунковий набір Spa Day для неї',
    imageUrl: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400',
    description: 'Набір для домашнього спа: скраб, масло для ванни, лосьйон та ароматна свічка у красивій коробці.',
    price: 980, discountPercent: 10, stockQuantity: 25,
    category: c['gift-sets'],
  },
  {
    name: 'Набір Mini Perfume Collection 5x15мл',
    imageUrl: 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400',
    description: '5 мініатюрних парфумів у подарунковому пеналі. Ідеальний спосіб відкрити нові аромати.',
    price: 1250, discountPercent: 0, stockQuantity: 18,
    category: c['gift-sets'],
  },
  {
    name: 'Подарунковий набір Glow Up Skincare',
    imageUrl: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400',
    description: 'Базовий набір догляду: очищувач, тонік, зволожуючий крем та сироватка SPF. Ідеально для початківців.',
    price: 850, discountPercent: 15, stockQuantity: 30,
    category: c['gift-sets'],
  },
  {
    name: 'Набір для макіяжу Glam Essentials',
    imageUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=400',
    description: 'Набір косметики для щоденного макіяжу: тушь, помада, консилер і хайлайтер у красивому боксі.',
    price: 790, discountPercent: 0, stockQuantity: 22,
    category: c['gift-sets'],
  },
  {
    name: "Подарунковий набір для чоловіків Men's Best",
    imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=400',
    description: 'Набір для чоловічого догляду: шампунь, піна для гоління, бальзам та туалетна вода 50мл.',
    price: 1150, discountPercent: 10, stockQuantity: 20,
    category: c['gift-sets'],
  },
  {
    name: 'Набір догляду за волоссям Salon Collection',
    imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=400',
    description: 'Професійний набір: шампунь, маска, олія та термозахисний спрей для красивого волосся вдома.',
    price: 1380, discountPercent: 5, stockQuantity: 15,
    category: c['gift-sets'],
  },
  {
    name: 'Набір натуральної косметики Green Beauty Box',
    imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400',
    description: 'Колекція органічних засобів: масло, скраб, тонік та бальзам для губ. 100% натуральний склад.',
    price: 920, discountPercent: 0, stockQuantity: 28,
    category: c['gift-sets'],
  },
  {
    name: 'Подарунковий набір Nail Art Kit',
    imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=400',
    description: 'Набір для манікюру: 4 лаки, топ, база, олія для кутикули та пилочки в стильному чохлі.',
    price: 640, discountPercent: 20, stockQuantity: 35,
    category: c['gift-sets'],
  },
  {
    name: 'Набір для засмаги Sun Holiday SPF Set',
    imageUrl: 'https://images.unsplash.com/photo-1520206183501-b80df61043c2?w=400',
    description: 'Набір для пляжу: SPF50 флюїд для обличчя, молочко для тіла SPF30 та бальзам для губ SPF15.',
    price: 875, discountPercent: 0, stockQuantity: 40,
    category: c['gift-sets'],
  },
  {
    name: 'VIP Подарунковий набір Luxury Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400',
    description: 'Розкішний набір преміум-класу: парфум 50мл, крем для обличчя, масло для тіла та маска в оксамитовій коробці.',
    price: 2200, discountPercent: 0, stockQuantity: 10,
    category: c['gift-sets'],
  },
];

const seed = async () => {
  try {
    await connectDB();

    // Крок 1: видаляємо дублікати категорій
    const allCatsRaw = await Category.find({}).lean();
    const seenSlugs = new Set();
    const seenNames = new Set();
    for (const cat of allCatsRaw) {
      if (seenSlugs.has(cat.slug) || seenNames.has(cat.name)) {
        await Category.deleteOne({ _id: cat._id });
      } else {
        seenSlugs.add(cat.slug);
        seenNames.add(cat.name);
      }
    }

    // Крок 2: додаємо відсутні категорії
    for (const cat of categories) {
      try {
        const exists = await Category.findOne({ slug: cat.slug });
        if (!exists) await Category.create(cat);
      } catch (e) {
        if (e.code !== 11000) throw e;
      }
    }
    console.log('✅ Категорії синхронізовано');

    // Крок 3: будуємо catMap
    const allCategories = await Category.find({}).lean();
    console.log('Знайдено категорій:', allCategories.length, allCategories.map(c => c.slug));
    const catMap = {};
    for (const cat of allCategories) {
      catMap[cat.slug] = cat._id;
      catMap[cat.name] = cat._id;
      if (cat.slug === 'face')    catMap['face-care']    = cat._id;
      if (cat.slug === 'perfume') catMap['perfumes']     = cat._id;
      if (cat.slug === 'hair')    catMap['hair-care']    = cat._id;
      if (cat.slug === 'body')    catMap['body-care']    = cat._id;
      if (cat.slug === 'sun')     catMap['sun-care']     = cat._id;
      if (cat.slug === 'nail')    catMap['nail-care']    = cat._id;
      if (cat.slug === 'mens')    catMap['mens-care']    = cat._id;
      if (cat.slug === 'natural') catMap['natural-care'] = cat._id;
      if (cat.slug === 'gifts')   catMap['gift-sets']    = cat._id;
    }

    // Крок 4: додаємо нові товари
    const existingNames = new Set((await Product.find({}, 'name').lean()).map(p => p.name));
    const products = getProducts(catMap).filter(p => p.category && !existingNames.has(p.name));

    if (products.length > 0) {
      await Product.insertMany(products);
      console.log('✅ Додано нових товарів: ' + products.length);
    } else {
      console.log('ℹ️  Всі товари вже існують, нічого не додано');
    }

    console.log('\n🌱 Seed завершено успішно!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed помилка:', error.message);
    process.exit(1);
  }
};

seed();
