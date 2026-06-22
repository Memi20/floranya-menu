// seed-menu.js — run once: node seed-menu.js
// Clears demo data and populates the menu from the real image files.
const db = require('./db');

console.log('Clearing existing menu data…');
db.prepare('DELETE FROM comment_likes').run();
db.prepare('DELETE FROM item_likes').run();
db.prepare('DELETE FROM comments').run();
db.prepare('DELETE FROM extras').run();
db.prepare('DELETE FROM items').run();
db.prepare('DELETE FROM categories').run();
try { db.exec("DELETE FROM sqlite_sequence WHERE name IN ('categories','items','extras','comments','item_likes','comment_likes')"); } catch {}

const insertCat  = db.prepare('INSERT INTO categories (name, name_ar, sort_order, available) VALUES (?, ?, ?, 1)');
const insertItem = db.prepare(`
  INSERT INTO items (category_id, name, name_ar, description, description_ar, price, image_filename, sort_order, available, likes_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 0)
`);

let s = 0;
function cat(name, name_ar, sort) { return insertCat.run(name, name_ar, sort).lastInsertRowid; }
function item(cid, name, name_ar, desc, desc_ar, price, file) {
  insertItem.run(cid, name, name_ar, desc, desc_ar, price, file, ++s);
}

/* ─── COFFEE ────────────────────────────────────────────── */
const coffee = cat('Coffee', 'القهوة', 1); s = 0;
item(coffee, 'Single Espresso',   'إسبريسو سنغل',   'One perfect shot of freshly pulled espresso',           'شوت واحد مثالي من الإسبريسو الطازج',             3000, 'Coffee Single.jpg');
item(coffee, 'Double Espresso',   'دبل إسبريسو',    'Two shots of rich, concentrated espresso',              'شوتان من الإسبريسو المركّز الغني',                3500, 'Coffee Double.jpg');
item(coffee, 'Americano',         'أمريكانو',        'Espresso diluted with hot water for a smooth cup',      'إسبريسو ممزوج بالماء الساخن لكوب ناعم',           3500, 'Coffee Americano.jpg');
item(coffee, 'Cappuccino',        'كابتشينو',        'Equal parts espresso, steamed milk, and milk foam',     'أجزاء متساوية إسبريسو وحليب مبخر ورغوة',         4500, 'Coffee Cappuccino.jpg');
item(coffee, 'Flat White',        'فلات وايت',       'Espresso with microfoam steamed milk, smooth and strong','إسبريسو مع حليب مبخر ناعم، قوي ومتوازن',        5000, 'Coffee Flat White.jpg');
item(coffee, 'Macchiato',         'ماكياتو',         'Espresso with just a touch of foamed milk',             'إسبريسو مع لمسة خفيفة من رغوة الحليب',           3500, 'Coffee Macchiato.jpg');
item(coffee, 'Cortado',           'كورتادو',         'Equal parts espresso and steamed milk',                 'أجزاء متساوية من الإسبريسو والحليب المبخر',       4000, 'Coffee Cortado.jpg');
item(coffee, 'Con Panna',         'كون بانا',        'Espresso topped with freshly whipped cream',            'إسبريسو مغطى بالكريمة المخفوقة الطازجة',         4000, 'Coffee Con Panna.jpg');
item(coffee, 'Ristretto',         'ريستريتو',        'An ultra-short, intensely concentrated espresso',       'إسبريسو مركّز بشكل استثنائي',                    3500, 'Coffee Ristretto.jpg');
item(coffee, 'Romano',            'رومانو',          'Espresso served with a twist of fresh lemon',           'إسبريسو يُقدم مع شريحة ليمون طازجة',             3500, 'Coffee Romano.jpg');
item(coffee, 'Triestino',         'تريستينو',        'Espresso with a layer of warm sweetened milk',          'إسبريسو مع طبقة من الحليب الحلو الدافئ',         4000, 'Coffee Triestino.jpg');
item(coffee, 'Bombon',            'بومبون',          'Bold espresso sweetened with condensed milk',           'إسبريسو قوي محلى بالحليب المكثف',                4000, 'Coffee Bombon.jpg');
item(coffee, 'Choco Coffee',      'قهوة شوكولاتة',  'Espresso blended with rich dark chocolate',             'إسبريسو ممزوج بشوكولاتة داكنة غنية',             4500, 'Coffee Choco.jpg');
item(coffee, 'Affogato',          'أفوغاتو',         'Espresso poured over a scoop of vanilla ice cream',     'شوت إسبريسو يصب فوق كرة آيس كريم الفانيليا',    4500, 'Coffee Affogato.jpg');
item(coffee, 'Turkish Single',    'تركي سنغل',      'Traditional Turkish coffee brewed to perfection',       'قهوة تركية تقليدية محضّرة بإتقان',               3000, 'Coffee Turkish Single.jpg');
item(coffee, 'Turkish Double',    'تركي دبل',       'Rich double Turkish coffee brewed in a cezve',          'قهوة تركية مزدوجة غنية محضّرة في الجزوة',        3500, 'Coffee Turkish Double.jpg');

/* ─── LATTE ──────────────────────────────────────────────── */
const latte = cat('Latte', 'لاتيه', 2); s = 0;
item(latte, 'Latte',              'لاتيه',           'Classic espresso with steamed milk and light foam',     'إسبريسو كلاسيكي مع حليب مبخر ورغوة خفيفة',      5000, 'Latte.jpg');
item(latte, 'Caramel',            'كراميل',          'Silky latte drizzled with golden caramel sauce',        'لاتيه حريري مع رذاذ صلصة الكراميل الذهبي',       5500, 'Latte Caramel.jpg');
item(latte, 'Caramel Popcorn',    'كراميل فشار',    'Sweet buttery caramel popcorn-inspired latte',          'لاتيه مستوحى من الفشار بالكراميل',               5500, 'Latte Caramel Popcorn.jpg');
item(latte, 'Cinnamon Coconut',   'قرفة جوز هند',   'Warm spiced latte with coconut milk and cinnamon',      'لاتيه متبل دافئ بحليب جوز الهند والقرفة',        5500, 'Latte Cinnamon Coconut.jpg');
item(latte, 'Hazelnut',           'بندق',            'Creamy latte with smooth hazelnut syrup',               'لاتيه كريمي مع شراب البندق الناعم',              5500, 'Latte Hazelnut.jpg');
item(latte, 'Mocha',              'موكا',            'Espresso with chocolate sauce and steamed milk',        'إسبريسو مع صلصة الشوكولاتة والحليب المبخر',     5500, 'Latte Mocha.jpg');
item(latte, 'Pinky',              'بينكي',           'A rosy pink latte with a sweet berry touch',            'لاتيه وردي مع لمسة توت حلوة',                    5500, 'Latte Pinky.jpg');
item(latte, 'Spanish',            'إسباني',          'Espresso layered over condensed milk and cold foam',    'إسبريسو مع طبقات من الحليب المكثف والرغوة',     5500, 'Late Spanish.jpg');
item(latte, 'Sweet Lily',         'سويت ليلي',      'Floranya floral latte with lily-inspired sweetness',    'لاتيه فلورانيا الزهري بلمسة حلاوة الزنبق',       5500, 'Latte Sweet Lily.jpg');
item(latte, 'Vanilla',            'فانيليا',         'Smooth espresso latte sweetened with real vanilla',     'لاتيه إسبريسو ناعم محلى بالفانيليا الحقيقية',   5500, 'Latte Vanilla.jpg');
item(latte, 'Vanilla Special',    'فانيليا سبيشل',  'Our signature vanilla latte with an aromatic twist',    'لاتيه الفانيليا المميز مع لمسة عطرية',           5500, 'Latte Vanilla-1.jpg');

/* ─── ICED COFFEE ───────────────────────────────────────── */
const icedCoffee = cat('Iced Coffee', 'قهوة مثلجة', 3); s = 0;
item(icedCoffee, 'Iced Latte',           'لاتيه مثلج',         'Classic espresso over ice with cold milk',              'إسبريسو كلاسيكي على الثلج مع الحليب البارد',    5500, 'Ice Latte.jpg');
item(icedCoffee, 'Iced Americano',       'أمريكانو مثلج',      'Chilled espresso over ice, clean and refreshing',       'إسبريسو بارد على الثلج، نظيف ومنعش',           5000, 'Ice Americano.jpg');
item(icedCoffee, 'Orange Americano',     'أمريكانو برتقال',    'Iced Americano with a splash of fresh orange',          'أمريكانو مثلج مع رشة عصير برتقال طازج',        5500, 'Ice Americano Orange.jpg');
item(icedCoffee, 'Iced Mocha',           'موكا مثلج',          'Iced espresso blended with chocolate and cold milk',    'إسبريسو مثلج مع الشوكولاتة والحليب البارد',    6000, 'Ice Mocha.jpg');
item(icedCoffee, 'Caramel Latte',        'لاتيه كراميل',       'Iced latte with a generous caramel drizzle',            'لاتيه مثلج مع رذاذ كراميل كريم',              6000, 'Ice Latte Caramel.jpg');
item(icedCoffee, 'Cappuccino Latte',     'لاتيه كابتشينو',     'Cold cappuccino-style latte over ice',                  'لاتيه على طريقة الكابتشينو البارد',             5500, 'Ice Latte Cappuccino.jpg');
item(icedCoffee, 'Cinnamon Coconut Latte','لاتيه قرفة جوز هند','Iced latte with cinnamon syrup and coconut milk',       'لاتيه مثلج مع شراب القرفة وحليب جوز الهند',   6000, 'Ice Latte Cinnamon Coconut.jpg');
item(icedCoffee, 'Flora Latte',          'لاتيه فلورا',        'Floranya floral signature iced latte',                  'لاتيه مثلج توقيع فلورانيا الزهري',             6000, 'Ice Latte Flora.jpg');
item(icedCoffee, 'Pinky Latte',          'لاتيه بينكي',        'A blush pink iced latte with a sweet fruity touch',     'لاتيه مثلج وردي مع لمسة فواكه حلوة',          6000, 'Ice Latte Pinky.jpg');
item(icedCoffee, 'Pistachio Latte',      'لاتيه فستق',         'Iced latte with rich pistachio syrup',                  'لاتيه مثلج مع شراب الفستق الغني',             6000, 'Ice Latte Pistachio.jpg');

/* ─── SPECIALTY COFFEE ──────────────────────────────────── */
const specialty = cat('Specialty Coffee', 'قهوة متخصصة', 4); s = 0;
item(specialty, 'V60',          'في 60',        'Precision pour-over coffee through a V60 dripper',          'قهوة تقطير دقيق عبر قمع V60',                    7000, 'Specialty V60.jpg');
item(specialty, 'Chemex',       'كيمكس',        'Slow pour-over through a Chemex for a crystal-clear brew',  'قهوة تقطير بطيء عبر كيمكس لتحضير بلوري',        7000, 'Specialty Chemex.jpg');
item(specialty, 'Aeropress',    'إيروبريس',     'Coffee brewed under pressure for a clean, bright cup',      'قهوة محضّرة تحت الضغط لكوب نظيف ومشرق',         7000, 'Specialty Aeropress.jpg');
item(specialty, 'French Press', 'فرنش بريس',    'Full-bodied coffee brewed in a French press',               'قهوة كاملة القوام محضّرة بالفرنش بريس',          6500, 'Specialty Frenchpress.jpg');
item(specialty, 'Cold Brew',    'كولد برو',     'Coffee steeped cold for 12 hours — smooth, low-acid',       'قهوة منقوعة بارداً لـ 12 ساعة، ناعمة منخفضة الحموضة', 7500, 'Specialty Cold Brew.jpg');
item(specialty, 'Syphon',       'سايفون',       'Theatrical vacuum-brewed coffee using a syphon pot',        'قهوة مسلوقة بالفراغ بطريقة السايفون المسرحية',   8000, 'Specialty Syphon.jpg');

/* ─── FRAPPE ─────────────────────────────────────────────── */
const frappe = cat('Frappe', 'فرابي', 5); s = 0;
item(frappe, 'Caramel Frappe',   'فرابي كراميل',   'Blended iced coffee with caramel sauce and whipped cream', 'قهوة مثلجة مخلوطة مع صلصة الكراميل والكريمة',  6500, 'Frappe Caramel.jpg');
item(frappe, 'Mocha Frappe',     'فرابي موكا',     'Coffee and chocolate blended with ice and cream',          'قهوة وشوكولاتة مخلوطة مع الثلج والكريمة',      6500, 'Frappe Mocha.jpg');
item(frappe, 'Pistachio Frappe', 'فرابي فستق',     'Creamy pistachio frappe blended with coffee and ice',      'فرابي فستق كريمي مخلوط مع القهوة والثلج',      6500, 'Frappe Pistachio.jpg');
item(frappe, 'Tiramisu Frappe',  'فرابي تيراميسو', 'Tiramisu-inspired iced frappe with espresso',              'فرابي مستوحى من التيراميسو مع الإسبريسو',       7000, 'Frappe Tiramisu.jpg');
item(frappe, 'Popcorn Frappe',   'فرابي فشار',     'Sweet popcorn-flavored iced frappe — a Floranya original', 'فرابي مثلج بنكهة الفشار، ابتكار فلورانيا',      6500, 'Frappe Popcorn.jpg');
item(frappe, 'Frappuccino',      'فرابتشينو',      'Classic coffee frappuccino blended with ice and cream',    'فرابتشينو قهوة كلاسيكي مع الثلج والكريمة',     6500, 'Frappuccino.jpg');

/* ─── MATCHA ─────────────────────────────────────────────── */
const matcha = cat('Matcha', 'ماتشا', 6); s = 0;
item(matcha, 'Matcha Latte',      'لاتيه ماتشا',      'Premium matcha whisked with steamed milk',               'ماتشا فاخرة مخفوقة مع الحليب المبخر',           6500, 'Matcha Latte.jpg');
item(matcha, 'Iced Matcha',       'ماتشا مثلجة',      'Japanese ceremonial matcha blended over ice',            'ماتشا يابانية مخلوطة على الثلج',                6000, 'Matcha Iced.jpg');
item(matcha, 'Coconut Cloud',     'سحابة جوز الهند',  'Creamy matcha topped with airy coconut foam',            'ماتشا كريمي مغطى برغوة جوز الهند',             6500, 'Matcha Coconut Cloud.jpg');
item(matcha, 'Mango Matcha',      'ماتشا مانغو',      'Bright matcha layered with sweet mango purée',           'ماتشا متألق مع صاليص المانغو الحلوة',           6500, 'Matcha Mango.jpg');
item(matcha, 'Strawberry Matcha', 'ماتشا فراولة',     'Vibrant matcha paired with fresh strawberry',            'ماتشا حيوي مع الفراولة الطازجة',                6500, 'Matcha Strawberry.jpg');

/* ─── HOT DRINKS ─────────────────────────────────────────── */
const hot = cat('Hot Drinks', 'المشروبات الساخنة', 7); s = 0;
item(hot, 'Hot Chocolate', 'شوكولاتة ساخنة', 'Rich creamy hot chocolate made with premium cocoa',    'شوكولاتة ساخنة غنية وكريمية من الكاكاو الفاخر', 4500, 'Hot Chocolate.jpg');
item(hot, 'Hot Tea',       'شاي ساخن',        'Premium loose-leaf tea served hot with honey',         'شاي أوراق فاخر يُقدم ساخناً مع العسل',          3500, 'Hot Tea.jpg');
item(hot, 'Hot Milk',      'حليب ساخن',       'Freshly steamed whole milk, simple and comforting',    'حليب كامل الدسم مبخر طازج',                     3000, 'Hot Milk.jpg');
item(hot, 'Detox',         'ديتوكس',          'Warm blend of turmeric, ginger, and honey',            'مزيج دافئ من الكركم والزنجبيل والعسل',          4000, 'Hot Detox.jpg');

/* ─── ICED TEA ───────────────────────────────────────────── */
const icedtea = cat('Iced Tea', 'شاي مثلج', 8); s = 0;
item(icedtea, 'Peach',       'خوخ',        'Fragrant peach iced tea with a delicate floral note',  'شاي مثلج بالخوخ العطري ولمسة زهرية رقيقة',     4500, 'Iced Tea Peach.jpg');
item(icedtea, 'Mango',       'مانغو',      'Tropical mango iced tea, sweet and golden',            'شاي مثلج بالمانغو الاستوائي الذهبي',           4500, 'Iced Tea Mango.jpg');
item(icedtea, 'Strawberry',  'فراولة',     'Fruity strawberry iced tea, refreshing and vibrant',   'شاي مثلج بالفراولة المنعش',                    4500, 'Iced Tea Strawberry.jpg');
item(icedtea, 'Green Apple', 'تفاح أخضر',  'Crisp green apple iced tea, sweet and tangy',          'شاي مثلج بالتفاح الأخضر المقرمش',              4500, 'Iced Tea Green Apple.jpg');
item(icedtea, 'Breeze',      'بريز',       'Light refreshing iced tea blend with a cool finish',   'مزيج شاي مثلج خفيف ومنعش',                    4500, 'Iced Tea Breeze.jpg');
item(icedtea, 'Vibe',        'فايب',       'Floranya signature mixed-flavor iced tea',             'شاي مثلج بنكهات مختلطة توقيع فلورانيا',        5000, 'Iced Tea Vibe.jpg');

/* ─── MOCKTAILS ──────────────────────────────────────────── */
const mocktails = cat('Mocktails', 'موكتيلات', 9); s = 0;
item(mocktails, 'Rose Berry',      'روز بيري',        'Elegant mocktail with rose water and mixed berries',   'موكتيل أنيق بماء الورد والتوت المشكل',         5500, 'Mocktail Rose Berry.jpg');
item(mocktails, 'Sunny Beach',     'شاطئ مشمس',       'Breezy tropical mocktail inspired by sunny shores',    'موكتيل استوائي منعش مستوحى من الشواطئ',        5500, 'Mocktail Sunny Beach.jpg');
item(mocktails, 'Golden Island',   'جزيرة ذهبية',     'Golden mocktail with mango and passion fruit',         'موكتيل ذهبي استوائي بالمانغو وفاكهة الباشن',   5500, 'Mocktail Golden Island.jpg');
item(mocktails, 'Tropical Jewel',  'جوهرة استوائية',  'Jewel-toned tropical mocktail with layered flavors',   'موكتيل استوائي ملون بطبقات نكهات متنوعة',      5500, 'Mocktail Tropical Jewel.jpg');
item(mocktails, 'Bubble Joy',      'باب جوي',          'Sparkling fruity mocktail with popping candy bubbles', 'موكتيل فواكه فوار مع حلوى فقاعات',            5500, 'Mocktail Bubble Joy.jpg');
item(mocktails, 'Spicey Spice',    'سبايسي سبايس',    'A bold mocktail with a warming spice kick',            'موكتيل جريء مع لمسة بهارات دافئة',            5500, 'Mocktail Spicey Spice.jpg');
item(mocktails, 'Gula Shin',       'غولا شين',         'A unique mocktail with exotic Southeast Asian flavors','موكتيل فريد بنكهات جنوب شرق آسيا الغريبة',    5500, 'Mocktail Gula Shin.jpg');
item(mocktails, 'Orange Juice',    'عصير برتقال',      'Freshly squeezed orange juice, bright and natural',    'عصير برتقال طازج، مشرق وطبيعي',               4500, 'Mocktail Orange Juice.jpg');

/* ─── MOJITOS ────────────────────────────────────────────── */
const mojitos = cat('Mojitos', 'موهيتو', 10); s = 0;
item(mojitos, 'Classic',          'كلاسيك',          'The original mojito with fresh mint, lime, and soda',  'الموهيتو الأصلي بالنعناع الطازج والليمون',     5500, 'Mojito Classic.jpg');
item(mojitos, 'Strawberry',       'فراولة',           'Strawberry mojito with fresh mint and sparkling water','موهيتو فراولة مع النعناع والماء الفوار',        5500, 'Mojito Strawberry.jpg');
item(mojitos, 'Cloudy Apricot',   'مشمش غائم',       'Cloudy apricot mojito with mint and sparkling water',  'موهيتو مشمش غائم مع النعناع والماء الفوار',    5500, 'Mojito Cloudy Apricot.jpg');
item(mojitos, 'Sakura',           'ساكورا',           'Cherry blossom-inspired mojito with floral sweetness', 'موهيتو مستوحى من زهر الكرز',                   6000, 'Mojito Sakura.jpg');
item(mojitos, 'Mavi',             'مافي',             'Blue lagoon-inspired mojito with a tropical twist',    'موهيتو مستوحى من البحيرة الزرقاء',             5500, 'Mojito Mavi.jpg');
item(mojitos, 'Veronica',         'فيرونيكا',         'An elegant mojito with a unique floral character',     'موهيتو أنيق بطابع زهري فريد',                  6000, 'Mojito Veronica.jpg');
item(mojitos, 'Floranya Refresh', 'فلورانيا ريفريش', 'Floranya signature refreshing mojito blend',           'مزيج موهيتو فلورانيا المنعش المميز',            6000, 'Mojito Floranya Refresh.jpg');

/* ─── SMOOTHIES ──────────────────────────────────────────── */
const smoothies = cat('Smoothies', 'سموذي', 11); s = 0;
item(smoothies, 'Aurora',          'أورورا',          'Vibrant berry and pitaya smoothie with stunning color', 'سموذي توت وبيتايا نابض بالألوان',              6000, 'Smoothie Aurora.jpg');
item(smoothies, 'Tropical Blush',  'تروبيكال بلاش',  'Pink tropical smoothie with guava and passion fruit',  'سموذي استوائي وردي بالجوافة وفاكهة الباشن',   6000, 'Smoothie Tropical Blush.jpg');
item(smoothies, 'Golden Tropics',  'جولدن تروبيكس',  'Golden blend of mango, pineapple, and turmeric',       'مزيج ذهبي من المانغو والأناناس والكركم',       6000, 'Smoothie Golden Tropics.jpg');
item(smoothies, 'Green Sunset',    'غرين سانست',      'Spinach, banana, and mango — nutritious green boost',  'سبانخ وموز ومانغو لتعزيز أخضر مغذٍ',          6000, 'Smoothie Green Sunset.jpg');
item(smoothies, 'Cloud',           'كلاود',           'Light and airy coconut and banana cloud smoothie',     'سموذي جوز الهند والموز الخفيف الهوائي',        6000, 'Smoothie Cloud.jpg');
item(smoothies, 'Winter',          'وينتر',           'Warming winter spiced smoothie with seasonal fruits',  'سموذي شتوي دافئ مع فواكه موسمية',             6000, 'Smoothie Winter.jpg');

/* ─── MILKSHAKES ─────────────────────────────────────────── */
const milkshakes = cat('Milkshakes', 'ميلك شيك', 12); s = 0;
item(milkshakes, 'Floranya',          'فلورانيا',        'Floranya signature milkshake — a menu exclusive',      'ميلك شيك فلورانيا المميز، حصري في قائمتنا',   7000, 'Milkshake Floranya.jpg');
item(milkshakes, 'Berries Cheesecake','تشيزكيك توت',     'Thick shake blending cheesecake and mixed berries',   'شيك كثيف يمزج التشيزكيك مع التوت المشكل',     7000, 'Milkshake Berries Cheesecake.jpg');
item(milkshakes, 'Choconana',         'شوكو بنانا',      'Rich chocolate and banana milkshake combo',            'ميلك شيك الشوكولاتة والموز الغني',            6500, 'Milkshake Choconana.jpg');
item(milkshakes, 'Mangonilla',        'مانغو فانيليا',   'Sweet mango and vanilla milkshake',                    'ميلك شيك المانغو والفانيليا الحلو',           6500, 'Milkshake Mangonilla.jpg');
item(milkshakes, 'Strawberry',        'فراولة',           'Classic thick strawberry milkshake',                   'ميلك شيك الفراولة الكثيف الكلاسيكي',          6500, 'Milkshake Strawberry.jpg');
item(milkshakes, 'Vanilla',           'فانيليا',          'Creamy classic vanilla milkshake',                     'ميلك شيك الفانيليا الكريمي الكلاسيكي',        6500, 'Milkshake Vanilla.jpg');

/* ─── ENERGY DRINKS ──────────────────────────────────────── */
const energy = cat('Energy Drinks', 'مشروبات الطاقة', 13); s = 0;
item(energy, 'Red Line',    'الخط الأحمر', 'Bold red energy drink with an intense fruity punch',    'مشروب طاقة أحمر قوي بنكهة فواكه مكثفة',        5000, 'Energy Red Line.jpg');
item(energy, 'Green Line',  'الخط الأخضر', 'Refreshing green energy drink with a citrus kick',     'مشروب طاقة أخضر منعش مع لمسة حمضيات',         5000, 'Energy Green Line.jpg');
item(energy, 'Turbo Melon', 'توربو بطيخ',  'Energizing watermelon energy drink, sweet and powerful','مشروب طاقة البطيخ، حلو وقوي',                  5000, 'Energy Turbo Melon.jpg');
item(energy, 'Berries',     'توت',          'Energy drink bursting with mixed berry flavor',         'مشروب طاقة بنكهة التوت المنعشة',               5000, 'Energy Berries.jpg');

/* ─── ICE CREAM ──────────────────────────────────────────── */
const icecream = cat('Ice Cream', 'آيس كريم', 14); s = 0;
item(icecream, 'Pistachio',   'فستق',      'Premium pistachio ice cream made with real pistachios', 'آيس كريم الفستق الفاخر من فستق حقيقي',         4000, 'Ice Cream Pistachio.jpg');
item(icecream, 'Caramel',     'كراميل',    'Creamy caramel ice cream with butterscotch swirl',      'آيس كريم الكراميل الكريمي مع تورفيلة البترسكوتش',3500,'Ice Cream Caramel.jpg');
item(icecream, 'Chocolate',   'شوكولاتة', 'Indulgent dark chocolate ice cream, dense and smooth',  'آيس كريم شوكولاتة داكنة فاخر',                3500, 'Ice Cream Chocolate.jpg');
item(icecream, 'Strawberry',  'فراولة',    'Fresh strawberry ice cream with real fruit pieces',     'آيس كريم الفراولة الطازجة بقطع فواكه حقيقية', 3500, 'Ice Cream Strawberry.jpg');
item(icecream, 'Vanilla',     'فانيليا',   'Classic Madagascar vanilla bean ice cream',             'آيس كريم فانيليا مدغشقر الكلاسيكي',           3500, 'Ice Cream Vanilla.jpg');

/* ─── CAKES ──────────────────────────────────────────────── */
const cakes = cat('Cakes', 'الكيكات', 15); s = 0;
item(cakes, 'San Sebastian',      'سان سيباستيان',    'Basque-style burnt cheesecake with caramelized top',    'تشيزكيك مقرمش على الطريقة الباسكية',           7500, 'Cake San Sebastian.jpg');
item(cakes, 'Lotus Cheesecake',   'تشيزكيك لوتس',    'Creamy cheesecake on Lotus Biscoff base',               'تشيزكيك كريمي على قاعدة لوتس بسكوف',          7500, 'Cake Lotus Cheesecake.jpg');
item(cakes, 'Strawberry Cheesecake','تشيزكيك فراولة', 'Classic cheesecake topped with strawberry compote',     'تشيزكيك كلاسيكي مع مربى الفراولة الطازجة',     7500, 'Cake Strawberry Cheesecake.jpg');
item(cakes, 'Red Velvet',         'ريد فيلفيت',       'Moist red velvet cake with cream cheese frosting',      'كيكة ريد فيلفيت طرية مع طبقات كريمة الجبن',   7000, 'Cake Red Velvet.jpg');
item(cakes, 'Tiramisu',           'تيراميسو',          'Italian espresso-soaked sponge with mascarpone cream',  'طبقات الإسبريسو الإيطالي مع كريمة المسكاربوني',7000, 'Cake Tiramisu.jpg');
item(cakes, 'Chocolate Cake',     'كيكة الشوكولاتة', 'Classic dark chocolate cake with chocolate ganache',    'كيكة شوكولاتة داكنة مع غاناش مخملي',          6500, 'Cake Chocolate.jpg');
item(cakes, 'Chocolate Fondant',  'فوندون شوكولاتة', 'Warm chocolate cake with a molten center',              'كيكة شوكولاتة دافئة بمركز منصهر غني',         6500, 'Cake Chocolate Fondant.jpg');
item(cakes, 'Caramel Cake',       'كيكة الكراميل',   'Soft sponge layers with rich caramel cream',            'طبقات من الإسفنج الناعم مع كريمة الكراميل',    7000, 'Cake Caramel.jpg');
item(cakes, 'Framboise',          'فرامبواز',          'Light sponge with raspberry cream and floral finish',   'إسفنج خفيف مع كريمة التوت الأحمر',            7000, 'Cake Framboise.jpg');

/* ─── HEALTHY CAKES ──────────────────────────────────────── */
const healthy = cat('Healthy Cakes', 'كيكات صحية', 16); s = 0;
item(healthy, 'Almond Cake', 'كيكة اللوز',  'A guilt-free almond flour cake, naturally sweetened',  'كيكة دقيق اللوز الخالية من الذنب، محلاة طبيعياً',5500, 'Healthy Almond Cake.jpg');
item(healthy, 'Brownie',     'براوني صحي', 'Dense fudgy brownie made with wholesome ingredients',   'براوني كثيف ومطاطي من مكونات صحية',             5000, 'Healthy Brownie.jpg');

/* ─── BAKERY ─────────────────────────────────────────────── */
const bakery = cat('Bakery', 'المخبوزات', 17); s = 0;
item(bakery, 'Almond Croissant',       'كرواسان لوز',          'Flaky butter croissant filled with almond cream',         'كرواسان بالزبدة بحشوة كريمة اللوز',            4500, 'Bakery Croissant Almond.jpg');
item(bakery, 'Pistachio Croissant',    'كرواسان فستق',         'Golden croissant filled with pistachio paste',            'كرواسان ذهبي محشو بكريمة الفستق الفاخرة',     4500, 'Bakery Croissant Pistachio.jpg');
item(bakery, 'Floranya Croissant',     'كرواسان فلورانيا',     'Our signature croissant with Floranya special filling',   'كرواساننا المميز بحشوة فلورانيا الخاصة',      4500, 'Bakery Croissant Floranya.jpg');
item(bakery, 'Strawberry Croissant',   'كرواسان فراولة',       'Buttery croissant with fresh strawberry jam',             'كرواسان بالزبدة مع مربى الفراولة الطازجة',     4000, 'Bakery Croissant Strawberry.jpg');
item(bakery, 'Hazelnut Croissant Roll','رول كرواسان بندق',     'Rolled croissant with smooth hazelnut cream',             'رول كرواسان مع كريمة البندق الناعمة',          4500, 'Bakery Croissant Roll Hazelnut.jpg');
item(bakery, 'Pistachio Croissant Roll','رول كرواسان فستق',    'Rolled croissant filled with premium pistachio cream',    'رول كرواسان محشو بكريمة الفستق الفاخرة',      4500, 'Bakery Croissant Roll Pistachio.jpg');
item(bakery, 'Cinnamon Roll',          'رول القرفة',           'Soft spiral pastry infused with cinnamon and icing',      'رول لولبي ناعم بالقرفة مع غطاء الآيسينج',     4000, 'Bakery Cinnamon Roll.jpg');
item(bakery, 'Fruit Danish',           'دنش فواكه',             'Soft Danish pastry topped with fresh fruits',             'معجنات دنماركية ناعمة مع تشكيلة من الفواكه',  4000, 'Bakery Fruit Danish.jpg');
item(bakery, 'Lotus Donut',            'دونت لوتس',             'Glazed donut topped with crushed Lotus Biscoff',          'دونت بالطلاء مع لوتس بسكوف المجروش',          3500, 'Bakery Lotus Donut.jpg');
item(bakery, 'Oreo Donut',             'دونت أوريو',            'Donut covered in white glaze and crushed Oreo',           'دونت بالطلاء الأبيض وقطع الأوريو المجروشة',   3500, 'Bakery Oreo Donut.jpg');
item(bakery, 'Chocolate Muffin',       'مافن شوكولاتة',        'Rich moist chocolate muffin with chocolate chips',        'مافن شوكولاتة غني مع رقائق شوكولاتة',         3500, 'Bakery Chocolate Muffin.jpg');
item(bakery, 'Caramel Cookie',         'كوكيز كراميل',         'Buttery cookie loaded with golden caramel chips',         'كوكيز بالزبدة مع رقائق الكراميل الذهبي',      3000, 'Bakery Cookie Caramel.jpg');
item(bakery, 'Chocolate Cookie',       'كوكيز شوكولاتة',       'Classic chocolate chip cookie, soft and golden',          'كوكيز كلاسيكي برقائق الشوكولاتة',             3000, 'Bakery Cookie Chocolate.jpg');
item(bakery, 'Pistachio Cookie',       'كوكيز فستق',           'Delicate pistachio cookie with a rich nutty flavor',      'كوكيز فستق راقٍ بنكهة المكسرات الغنية',       3000, 'Bakery Cookie Pistachio.jpg');

/* ─── SANDWICHES ─────────────────────────────────────────── */
const sandwiches = cat('Sandwiches', 'ساندويتش', 18); s = 0;
item(sandwiches, 'Chicken Pesto (Brown)',      'دجاج بيستو (أسمر)',        'Grilled chicken with house-made pesto on brown bread',   'دجاج مشوي مع البيستو على خبز أسمر',           6500, 'Sandwich Chicken Pesto B.jpg');
item(sandwiches, 'Chicken Pesto (White)',      'دجاج بيستو (أبيض)',        'Grilled chicken with house-made pesto on white bread',   'دجاج مشوي مع البيستو على خبز أبيض',           6500, 'Sandwich Chicken Pesto W.jpg');
item(sandwiches, 'Chicken Pesto Club (Brown)', 'كلوب دجاج بيستو (أسمر)',  'Club-style chicken pesto on toasted brown bread',        'كلوب ساندويتش دجاج بيستو على خبز أسمر محمص', 7000, 'Sandwich Chicken Pesto Club B.jpg');
item(sandwiches, 'Chicken Pesto Club (White)', 'كلوب دجاج بيستو (أبيض)',  'Club-style chicken pesto on toasted white bread',        'كلوب ساندويتش دجاج بيستو على خبز أبيض محمص', 7000, 'Sandwich Chicken Pesto Club W.jpg');
item(sandwiches, 'Turkey Club (Brown)',        'كلوب تركي (أسمر)',         'Turkey club sandwich on toasted brown bread',            'كلوب ساندويتش تركي على خبز أسمر محمص',        7000, 'Sandwich Turkey Club B.jpg');
item(sandwiches, 'Turkey Club (White)',        'كلوب تركي (أبيض)',         'Turkey club sandwich on toasted white bread',            'كلوب ساندويتش تركي على خبز أبيض محمص',        7000, 'Sandwich Turkey Club W.jpg');

/* ─── ROSES (placeholder — no images yet) ───────────────── */
cat('Roses', 'الورود', 19);

console.log('✓ Menu seeded successfully!');
process.exit(0);
