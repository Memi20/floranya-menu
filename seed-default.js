// seed-default.js — exports seedDefault(db). Called by db.js on first run and by seed-menu.js.
module.exports = function seedDefault(db) {
  const insertCat  = db.prepare('INSERT INTO categories (name, name_ar, sort_order, available) VALUES (?, ?, ?, 1)');
  const insertItem = db.prepare(
    'INSERT INTO items (category_id,name,name_ar,description,description_ar,price,image_filename,sort_order,available,likes_count) VALUES (?,?,?,?,?,?,?,?,1,0)'
  );
  const insertExtra = db.prepare(
    'INSERT INTO extras (item_id,name,name_ar,price_addition,conflict_group,sort_order,is_none_label) VALUES (?,?,?,?,?,?,?)'
  );

  let s = 0;
  function cat(n, na, so) { return insertCat.run(n, na, so).lastInsertRowid; }
  function item(cid, n, na, d, da, p, f) { return insertItem.run(cid, n, na, d, da, p, f, ++s).lastInsertRowid; }

  // ─── Extras helpers ────────────────────────────────────────────────────────
  let xo = 0;
  function ex(id, n, na, price, cg, none) {
    insertExtra.run(id, n, na, price, cg || null, ++xo, none ? 1 : 0);
  }
  function milk(id) {
    xo = 0;
    ex(id, 'Dairy',        'حليب عادي',      0,    'milk', true);
    ex(id, 'Almond Milk',  'حليب لوز',       1000, 'milk');
    ex(id, 'Oat Milk',     'حليب شوفان',     1000, 'milk');
    ex(id, 'Coconut Milk', 'حليب جوز هند',   1000, 'milk');
  }
  function shot(id)  { ex(id, 'Extra Shot',   'شوت إضافي',   1000, null); }
  function decaf(id) { ex(id, 'Decaf',         'بدون كافيين', 0,    null); }
  function syrup(id) { ex(id, 'Extra Syrup',   'شراب إضافي',  500,  null); }
  function sf(id)    { ex(id, 'Sugar Free',    'بدون سكر',    0,    null); }
  function size(id)  { ex(id, 'Upgrade Size',  'ترقية الحجم', 1500, null); }

  // Full milk-based espresso treatment
  function milkEspresso(id) { milk(id); xo=4; shot(id); decaf(id); syrup(id); sf(id); size(id); }
  // Espresso only (no milk)
  function espressoOnly(id) { xo=0; shot(id); decaf(id); }
  // Milk-based non-espresso (matcha, hot choc, frappes)
  function milkDrink(id) { milk(id); xo=4; syrup(id); sf(id); size(id); }

  // ─── COFFEE ───────────────────────────────────────────────────────────────
  s = 0;
  const coffee = cat('Coffee', 'القهوة', 1);
  const cSingle   = item(coffee,'Single Espresso','إسبريسو سنغل','One perfect shot of freshly pulled espresso','شوت واحد مثالي من الإسبريسو الطازج',3000,'Coffee Single.jpg');
  const cDouble   = item(coffee,'Double Espresso','دبل إسبريسو','Two shots of rich, concentrated espresso','شوتان من الإسبريسو المركّز الغني',3500,'Coffee Double.jpg');
  const cAmericano= item(coffee,'Americano','أمريكانو','Espresso diluted with hot water for a smooth cup','إسبريسو ممزوج بالماء الساخن لكوب ناعم',3500,'Coffee Americano.jpg');
  const cCappuc   = item(coffee,'Cappuccino','كابتشينو','Equal parts espresso, steamed milk, and milk foam','أجزاء متساوية إسبريسو وحليب مبخر ورغوة',4500,'Coffee Cappuccino.jpg');
  const cFlat     = item(coffee,'Flat White','فلات وايت','Espresso with microfoam steamed milk, smooth and strong','إسبريسو مع حليب مبخر ناعم، قوي ومتوازن',5000,'Coffee Flat White.jpg');
  const cMac      = item(coffee,'Macchiato','ماكياتو','Espresso with just a touch of foamed milk','إسبريسو مع لمسة خفيفة من رغوة الحليب',3500,'Coffee Macchiato.jpg');
  const cCortado  = item(coffee,'Cortado','كورتادو','Equal parts espresso and steamed milk','أجزاء متساوية من الإسبريسو والحليب المبخر',4000,'Coffee Cortado.jpg');
  const cConPanna = item(coffee,'Con Panna','كون بانا','Espresso topped with freshly whipped cream','إسبريسو مغطى بالكريمة المخفوقة الطازجة',4000,'Coffee Con Panna.jpg');
  const cRist     = item(coffee,'Ristretto','ريستريتو','An ultra-short, intensely concentrated espresso','إسبريسو مركّز بشكل استثنائي',3500,'Coffee Ristretto.jpg');
  const cRomano   = item(coffee,'Romano','رومانو','Espresso served with a twist of fresh lemon','إسبريسو يُقدم مع شريحة ليمون طازجة',3500,'Coffee Romano.jpg');
  const cTriest   = item(coffee,'Triestino','تريستينو','Espresso with a layer of warm sweetened milk','إسبريسو مع طبقة من الحليب الحلو الدافئ',4000,'Coffee Triestino.jpg');
  const cBombon   = item(coffee,'Bombon','بومبون','Bold espresso sweetened with condensed milk','إسبريسو قوي محلى بالحليب المكثف',4000,'Coffee Bombon.jpg');
  const cChoco    = item(coffee,'Choco Coffee','قهوة شوكولاتة','Espresso blended with rich dark chocolate','إسبريسو ممزوج بشوكولاتة داكنة غنية',4500,'Coffee Choco.jpg');
  const cAffog    = item(coffee,'Affogato','أفوغاتو','Espresso poured over a scoop of vanilla ice cream','شوت إسبريسو يصب فوق كرة آيس كريم الفانيليا',4500,'Coffee Affogato.jpg');
  const cTurkS    = item(coffee,'Turkish Single','تركي سنغل','Traditional Turkish coffee brewed to perfection','قهوة تركية تقليدية محضّرة بإتقان',3000,'Coffee Turkish Single.jpg');
  const cTurkD    = item(coffee,'Turkish Double','تركي دبل','Rich double Turkish coffee brewed in a cezve','قهوة تركية مزدوجة غنية محضّرة في الجزوة',3500,'Coffee Turkish Double.jpg');

  espressoOnly(cSingle); espressoOnly(cDouble);
  xo=0; shot(cAmericano); decaf(cAmericano); size(cAmericano);
  milkEspresso(cCappuc); milkEspresso(cFlat);
  xo=0; milk(cMac); xo=4; shot(cMac); decaf(cMac);
  xo=0; milk(cCortado); xo=4; shot(cCortado); decaf(cCortado);
  espressoOnly(cConPanna);
  xo=0; milk(cTriest); xo=4; shot(cTriest); decaf(cTriest); sf(cTriest);
  xo=0; shot(cBombon); decaf(cBombon); sf(cBombon);
  milkEspresso(cChoco);
  xo=0; sf(cTurkS); xo=0; sf(cTurkD);

  // ─── LATTE ────────────────────────────────────────────────────────────────
  s = 0;
  const latte = cat('Latte', 'لاتيه', 2);
  const lPlain  = item(latte,'Latte','لاتيه','Classic espresso with steamed milk and light foam','إسبريسو كلاسيكي مع حليب مبخر ورغوة خفيفة',5000,'Latte.jpg');
  const lCar    = item(latte,'Caramel','كراميل','Silky latte drizzled with golden caramel sauce','لاتيه حريري مع رذاذ صلصة الكراميل الذهبي',5500,'Latte Caramel.jpg');
  const lCarPop = item(latte,'Caramel Popcorn','كراميل فشار','Sweet buttery caramel popcorn-inspired latte','لاتيه مستوحى من الفشار بالكراميل',5500,'Latte Caramel Popcorn.jpg');
  const lCinCoc = item(latte,'Cinnamon Coconut','قرفة جوز هند','Warm spiced latte with coconut milk and cinnamon','لاتيه متبل دافئ بحليب جوز الهند والقرفة',5500,'Latte Cinnamon Coconut.jpg');
  const lHaz    = item(latte,'Hazelnut','بندق','Creamy latte with smooth hazelnut syrup','لاتيه كريمي مع شراب البندق الناعم',5500,'Latte Hazelnut.jpg');
  const lMocha  = item(latte,'Mocha','موكا','Espresso with chocolate sauce and steamed milk','إسبريسو مع صلصة الشوكولاتة والحليب المبخر',5500,'Latte Mocha.jpg');
  const lPinky  = item(latte,'Pinky','بينكي','A rosy pink latte with a sweet berry touch','لاتيه وردي مع لمسة توت حلوة',5500,'Latte Pinky.jpg');
  const lSpan   = item(latte,'Spanish','إسباني','Espresso layered over condensed milk and cold foam','إسبريسو مع طبقات من الحليب المكثف والرغوة',5500,'Late Spanish.jpg');
  const lLily   = item(latte,'Sweet Lily','سويت ليلي','Floranya floral latte with lily-inspired sweetness','لاتيه فلورانيا الزهري بلمسة حلاوة الزنبق',5500,'Latte Sweet Lily.jpg');
  const lVan    = item(latte,'Vanilla','فانيليا','Smooth espresso latte sweetened with real vanilla','لاتيه إسبريسو ناعم محلى بالفانيليا الحقيقية',5500,'Latte Vanilla.jpg');
  const lVanS   = item(latte,'Vanilla Special','فانيليا سبيشل','Our signature vanilla latte with an aromatic twist','لاتيه الفانيليا المميز مع لمسة عطرية',5500,'Latte Vanilla-1.jpg');

  [lPlain,lCar,lCarPop,lHaz,lMocha,lPinky,lLily,lVan,lVanS].forEach(id => milkEspresso(id));
  xo=0; shot(lCinCoc); decaf(lCinCoc); syrup(lCinCoc); sf(lCinCoc); size(lCinCoc);
  xo=0; shot(lSpan); decaf(lSpan); sf(lSpan); size(lSpan);

  // ─── ICED COFFEE ──────────────────────────────────────────────────────────
  s = 0;
  const iced = cat('Iced Coffee', 'قهوة مثلجة', 3);
  const iLatte   = item(iced,'Iced Latte','لاتيه مثلج','Classic espresso over ice with cold milk','إسبريسو كلاسيكي على الثلج مع الحليب البارد',5500,'Ice Latte.jpg');
  const iAmer    = item(iced,'Iced Americano','أمريكانو مثلج','Chilled espresso over ice, clean and refreshing','إسبريسو بارد على الثلج، نظيف ومنعش',5000,'Ice Americano.jpg');
  const iOrange  = item(iced,'Orange Americano','أمريكانو برتقال','Iced Americano with a splash of fresh orange','أمريكانو مثلج مع رشة عصير برتقال طازج',5500,'Ice Americano Orange.jpg');
  const iMocha   = item(iced,'Iced Mocha','موكا مثلج','Iced espresso blended with chocolate and cold milk','إسبريسو مثلج مع الشوكولاتة والحليب البارد',6000,'Ice Mocha.jpg');
  const iCarLat  = item(iced,'Caramel Latte','لاتيه كراميل','Iced latte with a generous caramel drizzle','لاتيه مثلج مع رذاذ كراميل كريم',6000,'Ice Latte Caramel.jpg');
  const iCappLat = item(iced,'Cappuccino Latte','لاتيه كابتشينو','Cold cappuccino-style latte over ice','لاتيه على طريقة الكابتشينو البارد',5500,'Ice Latte Cappuccino.jpg');
  const iCinCoc  = item(iced,'Cinnamon Coconut Latte','لاتيه قرفة جوز هند','Iced latte with cinnamon syrup and coconut milk','لاتيه مثلج مع شراب القرفة وحليب جوز الهند',6000,'Ice Latte Cinnamon Coconut.jpg');
  const iFlora   = item(iced,'Flora Latte','لاتيه فلورا','Floranya floral signature iced latte','لاتيه مثلج توقيع فلورانيا الزهري',6000,'Ice Latte Flora.jpg');
  const iPinky   = item(iced,'Pinky Latte','لاتيه بينكي','A blush pink iced latte with a sweet fruity touch','لاتيه مثلج وردي مع لمسة فواكه حلوة',6000,'Ice Latte Pinky.jpg');
  const iPist    = item(iced,'Pistachio Latte','لاتيه فستق','Iced latte with rich pistachio syrup','لاتيه مثلج مع شراب الفستق الغني',6000,'Ice Latte Pistachio.jpg');

  [iLatte,iMocha,iCarLat,iCappLat,iFlora,iPinky,iPist].forEach(id => milkEspresso(id));
  xo=0; shot(iAmer); decaf(iAmer); size(iAmer);
  xo=0; shot(iOrange); decaf(iOrange); size(iOrange);
  xo=0; shot(iCinCoc); decaf(iCinCoc); syrup(iCinCoc); sf(iCinCoc); size(iCinCoc);

  // ─── SPECIALTY COFFEE ─────────────────────────────────────────────────────
  s = 0;
  const spec = cat('Specialty Coffee', 'قهوة متخصصة', 4);
  item(spec,'V60','في 60','Precision pour-over coffee through a V60 dripper','قهوة تقطير دقيق عبر قمع V60',7000,'Specialty V60.jpg');
  item(spec,'Chemex','كيمكس','Slow pour-over through a Chemex for a crystal-clear brew','قهوة تقطير بطيء عبر كيمكس لتحضير بلوري',7000,'Specialty Chemex.jpg');
  item(spec,'Aeropress','إيروبريس','Coffee brewed under pressure for a clean, bright cup','قهوة محضّرة تحت الضغط لكوب نظيف ومشرق',7000,'Specialty Aeropress.jpg');
  item(spec,'French Press','فرنش بريس','Full-bodied coffee brewed in a French press','قهوة كاملة القوام محضّرة بالفرنش بريس',6500,'Specialty Frenchpress.jpg');
  const sColdBrew = item(spec,'Cold Brew','كولد برو','Coffee steeped cold for 12 hours — smooth, low-acid','قهوة منقوعة بارداً لـ 12 ساعة، ناعمة منخفضة الحموضة',7500,'Specialty Cold Brew.jpg');
  item(spec,'Syphon','سايفون','Theatrical vacuum-brewed coffee using a syphon pot','قهوة مسلوقة بالفراغ بطريقة السايفون المسرحية',8000,'Specialty Syphon.jpg');
  xo=0; size(sColdBrew);

  // ─── FRAPPE ───────────────────────────────────────────────────────────────
  s = 0;
  const frappe = cat('Frappe', 'فرابي', 5);
  const frItems = [
    item(frappe,'Caramel Frappe','فرابي كراميل','Blended iced coffee with caramel sauce and whipped cream','قهوة مثلجة مخلوطة مع صلصة الكراميل والكريمة',6500,'Frappe Caramel.jpg'),
    item(frappe,'Mocha Frappe','فرابي موكا','Coffee and chocolate blended with ice and cream','قهوة وشوكولاتة مخلوطة مع الثلج والكريمة',6500,'Frappe Mocha.jpg'),
    item(frappe,'Pistachio Frappe','فرابي فستق','Creamy pistachio frappe blended with coffee and ice','فرابي فستق كريمي مخلوط مع القهوة والثلج',6500,'Frappe Pistachio.jpg'),
    item(frappe,'Tiramisu Frappe','فرابي تيراميسو','Tiramisu-inspired iced frappe with espresso','فرابي مستوحى من التيراميسو مع الإسبريسو',7000,'Frappe Tiramisu.jpg'),
    item(frappe,'Popcorn Frappe','فرابي فشار','Sweet popcorn-flavored iced frappe — a Floranya original','فرابي مثلج بنكهة الفشار، ابتكار فلورانيا',6500,'Frappe Popcorn.jpg'),
    item(frappe,'Frappuccino','فرابتشينو','Classic coffee frappuccino blended with ice and cream','فرابتشينو قهوة كلاسيكي مع الثلج والكريمة',6500,'Frappuccino.jpg'),
  ];
  frItems.forEach(id => milkDrink(id));

  // ─── MATCHA ───────────────────────────────────────────────────────────────
  s = 0;
  const matcha = cat('Matcha', 'ماتشا', 6);
  const mLatte  = item(matcha,'Matcha Latte','لاتيه ماتشا','Premium matcha whisked with steamed milk','ماتشا فاخرة مخفوقة مع الحليب المبخر',6500,'Matcha Latte.jpg');
  const mIced   = item(matcha,'Iced Matcha','ماتشا مثلجة','Japanese ceremonial matcha blended over ice','ماتشا يابانية مخلوطة على الثلج',6000,'Matcha Iced.jpg');
  const mCoco   = item(matcha,'Coconut Cloud','سحابة جوز الهند','Creamy matcha topped with airy coconut foam','ماتشا كريمي مغطى برغوة جوز الهند',6500,'Matcha Coconut Cloud.jpg');
  const mMango  = item(matcha,'Mango Matcha','ماتشا مانغو','Bright matcha layered with sweet mango purée','ماتشا متألق مع صاليص المانغو الحلوة',6500,'Matcha Mango.jpg');
  const mStraw  = item(matcha,'Strawberry Matcha','ماتشا فراولة','Vibrant matcha paired with fresh strawberry','ماتشا حيوي مع الفراولة الطازجة',6500,'Matcha Strawberry.jpg');

  [mLatte,mIced,mMango,mStraw].forEach(id => milkDrink(id));
  xo=0; syrup(mCoco); sf(mCoco); size(mCoco);

  // ─── HOT DRINKS ───────────────────────────────────────────────────────────
  s = 0;
  const hot = cat('Hot Drinks', 'المشروبات الساخنة', 7);
  const hChoco = item(hot,'Hot Chocolate','شوكولاتة ساخنة','Rich creamy hot chocolate made with premium cocoa','شوكولاتة ساخنة غنية وكريمية من الكاكاو الفاخر',4500,'Hot Chocolate.jpg');
  const hTea   = item(hot,'Hot Tea','شاي ساخن','Premium loose-leaf tea served hot with honey','شاي أوراق فاخر يُقدم ساخناً مع العسل',3500,'Hot Tea.jpg');
  const hMilk  = item(hot,'Hot Milk','حليب ساخن','Freshly steamed whole milk, simple and comforting','حليب كامل الدسم مبخر طازج',3000,'Hot Milk.jpg');
  item(hot,'Detox','ديتوكس','Warm blend of turmeric, ginger, and honey','مزيج دافئ من الكركم والزنجبيل والعسل',4000,'Hot Detox.jpg');

  milkDrink(hChoco);
  xo=0; syrup(hTea); sf(hTea); size(hTea);
  xo=0; size(hMilk);

  // ─── ICED TEA ─────────────────────────────────────────────────────────────
  s = 0;
  const icedtea = cat('Iced Tea', 'شاي مثلج', 8);
  const itItems = [
    item(icedtea,'Peach','خوخ','Fragrant peach iced tea with a delicate floral note','شاي مثلج بالخوخ العطري ولمسة زهرية رقيقة',4500,'Iced Tea Peach.jpg'),
    item(icedtea,'Mango','مانغو','Tropical mango iced tea, sweet and golden','شاي مثلج بالمانغو الاستوائي الذهبي',4500,'Iced Tea Mango.jpg'),
    item(icedtea,'Strawberry','فراولة','Fruity strawberry iced tea, refreshing and vibrant','شاي مثلج بالفراولة المنعش',4500,'Iced Tea Strawberry.jpg'),
    item(icedtea,'Green Apple','تفاح أخضر','Crisp green apple iced tea, sweet and tangy','شاي مثلج بالتفاح الأخضر المقرمش',4500,'Iced Tea Green Apple.jpg'),
    item(icedtea,'Breeze','بريز','Light refreshing iced tea blend with a cool finish','مزيج شاي مثلج خفيف ومنعش',4500,'Iced Tea Breeze.jpg'),
    item(icedtea,'Vibe','فايب','Floranya signature mixed-flavor iced tea','شاي مثلج بنكهات مختلطة توقيع فلورانيا',5000,'Iced Tea Vibe.jpg'),
  ];
  itItems.forEach(id => { xo=0; syrup(id); sf(id); size(id); });

  // ─── MOCKTAILS ────────────────────────────────────────────────────────────
  s = 0;
  const mock = cat('Mocktails', 'موكتيلات', 9);
  const mockItems = [
    item(mock,'Rose Berry','روز بيري','Elegant mocktail with rose water and mixed berries','موكتيل أنيق بماء الورد والتوت المشكل',5500,'Mocktail Rose Berry.jpg'),
    item(mock,'Sunny Beach','شاطئ مشمس','Breezy tropical mocktail inspired by sunny shores','موكتيل استوائي منعش مستوحى من الشواطئ',5500,'Mocktail Sunny Beach.jpg'),
    item(mock,'Golden Island','جزيرة ذهبية','Golden mocktail with mango and passion fruit','موكتيل ذهبي استوائي بالمانغو وفاكهة الباشن',5500,'Mocktail Golden Island.jpg'),
    item(mock,'Tropical Jewel','جوهرة استوائية','Jewel-toned tropical mocktail with layered flavors','موكتيل استوائي ملون بطبقات نكهات متنوعة',5500,'Mocktail Tropical Jewel.jpg'),
    item(mock,'Bubble Joy','باب جوي','Sparkling fruity mocktail with popping candy bubbles','موكتيل فواكه فوار مع حلوى فقاعات',5500,'Mocktail Bubble Joy.jpg'),
    item(mock,'Spicey Spice','سبايسي سبايس','A bold mocktail with a warming spice kick','موكتيل جريء مع لمسة بهارات دافئة',5500,'Mocktail Spicey Spice.jpg'),
    item(mock,'Gula Shin','غولا شين','A unique mocktail with exotic Southeast Asian flavors','موكتيل فريد بنكهات جنوب شرق آسيا الغريبة',5500,'Mocktail Gula Shin.jpg'),
    item(mock,'Orange Juice','عصير برتقال','Freshly squeezed orange juice, bright and natural','عصير برتقال طازج، مشرق وطبيعي',4500,'Mocktail Orange Juice.jpg'),
  ];
  mockItems.forEach(id => { xo=0; syrup(id); size(id); });

  // ─── MOJITOS ──────────────────────────────────────────────────────────────
  s = 0;
  const moji = cat('Mojitos', 'موهيتو', 10);
  const mojiItems = [
    item(moji,'Classic','كلاسيك','The original mojito with fresh mint, lime, and soda','الموهيتو الأصلي بالنعناع الطازج والليمون',5500,'Mojito Classic.jpg'),
    item(moji,'Strawberry','فراولة','Strawberry mojito with fresh mint and sparkling water','موهيتو فراولة مع النعناع والماء الفوار',5500,'Mojito Strawberry.jpg'),
    item(moji,'Cloudy Apricot','مشمش غائم','Cloudy apricot mojito with mint and sparkling water','موهيتو مشمش غائم مع النعناع والماء الفوار',5500,'Mojito Cloudy Apricot.jpg'),
    item(moji,'Sakura','ساكورا','Cherry blossom-inspired mojito with floral sweetness','موهيتو مستوحى من زهر الكرز',6000,'Mojito Sakura.jpg'),
    item(moji,'Mavi','مافي','Blue lagoon-inspired mojito with a tropical twist','موهيتو مستوحى من البحيرة الزرقاء',5500,'Mojito Mavi.jpg'),
    item(moji,'Veronica','فيرونيكا','An elegant mojito with a unique floral character','موهيتو أنيق بطابع زهري فريد',6000,'Mojito Veronica.jpg'),
    item(moji,'Floranya Refresh','فلورانيا ريفريش','Floranya signature refreshing mojito blend','مزيج موهيتو فلورانيا المنعش المميز',6000,'Mojito Floranya Refresh.jpg'),
  ];
  mojiItems.forEach(id => { xo=0; syrup(id); size(id); });

  // ─── SMOOTHIES ────────────────────────────────────────────────────────────
  s = 0;
  const smooth = cat('Smoothies', 'سموذي', 11);
  const smItems = [
    item(smooth,'Aurora','أورورا','Vibrant berry and pitaya smoothie with stunning color','سموذي توت وبيتايا نابض بالألوان',6000,'Smoothie Aurora.jpg'),
    item(smooth,'Tropical Blush','تروبيكال بلاش','Pink tropical smoothie with guava and passion fruit','سموذي استوائي وردي بالجوافة وفاكهة الباشن',6000,'Smoothie Tropical Blush.jpg'),
    item(smooth,'Golden Tropics','جولدن تروبيكس','Golden blend of mango, pineapple, and turmeric','مزيج ذهبي من المانغو والأناناس والكركم',6000,'Smoothie Golden Tropics.jpg'),
    item(smooth,'Green Sunset','غرين سانست','Spinach, banana, and mango — nutritious green boost','سبانخ وموز ومانغو لتعزيز أخضر مغذٍ',6000,'Smoothie Green Sunset.jpg'),
    item(smooth,'Cloud','كلاود','Light and airy coconut and banana cloud smoothie','سموذي جوز الهند والموز الخفيف الهوائي',6000,'Smoothie Cloud.jpg'),
    item(smooth,'Winter','وينتر','Warming winter spiced smoothie with seasonal fruits','سموذي شتوي دافئ مع فواكه موسمية',6000,'Smoothie Winter.jpg'),
  ];
  smItems.forEach(id => { xo=0; size(id); });

  // ─── MILKSHAKES ───────────────────────────────────────────────────────────
  s = 0;
  const shake = cat('Milkshakes', 'ميلك شيك', 12);
  const shItems = [
    item(shake,'Floranya','فلورانيا','Floranya signature milkshake — a menu exclusive','ميلك شيك فلورانيا المميز، حصري في قائمتنا',7000,'Milkshake Floranya.jpg'),
    item(shake,'Berries Cheesecake','تشيزكيك توت','Thick shake blending cheesecake and mixed berries','شيك كثيف يمزج التشيزكيك مع التوت المشكل',7000,'Milkshake Berries Cheesecake.jpg'),
    item(shake,'Choconana','شوكو بنانا','Rich chocolate and banana milkshake combo','ميلك شيك الشوكولاتة والموز الغني',6500,'Milkshake Choconana.jpg'),
    item(shake,'Mangonilla','مانغو فانيليا','Sweet mango and vanilla milkshake','ميلك شيك المانغو والفانيليا الحلو',6500,'Milkshake Mangonilla.jpg'),
    item(shake,'Strawberry','فراولة','Classic thick strawberry milkshake','ميلك شيك الفراولة الكثيف الكلاسيكي',6500,'Milkshake Strawberry.jpg'),
    item(shake,'Vanilla','فانيليا','Creamy classic vanilla milkshake','ميلك شيك الفانيليا الكريمي الكلاسيكي',6500,'Milkshake Vanilla.jpg'),
  ];
  shItems.forEach(id => milkDrink(id));

  // ─── ENERGY DRINKS ────────────────────────────────────────────────────────
  s = 0;
  const energy = cat('Energy Drinks', 'مشروبات الطاقة', 13);
  item(energy,'Red Line','الخط الأحمر','Bold red energy drink with an intense fruity punch','مشروب طاقة أحمر قوي بنكهة فواكه مكثفة',5000,'Energy Red Line.jpg');
  item(energy,'Green Line','الخط الأخضر','Refreshing green energy drink with a citrus kick','مشروب طاقة أخضر منعش مع لمسة حمضيات',5000,'Energy Green Line.jpg');
  item(energy,'Turbo Melon','توربو بطيخ','Energizing watermelon energy drink, sweet and powerful','مشروب طاقة البطيخ، حلو وقوي',5000,'Energy Turbo Melon.jpg');
  item(energy,'Berries','توت','Energy drink bursting with mixed berry flavor','مشروب طاقة بنكهة التوت المنعشة',5000,'Energy Berries.jpg');

  // ─── ICE CREAM ────────────────────────────────────────────────────────────
  s = 0;
  const ice = cat('Ice Cream', 'آيس كريم', 14);
  item(ice,'Pistachio','فستق','Premium pistachio ice cream made with real pistachios','آيس كريم الفستق الفاخر من فستق حقيقي',4000,'Ice Cream Pistachio.jpg');
  item(ice,'Caramel','كراميل','Creamy caramel ice cream with butterscotch swirl','آيس كريم الكراميل الكريمي مع تورفيلة البترسكوتش',3500,'Ice Cream Caramel.jpg');
  item(ice,'Chocolate','شوكولاتة','Indulgent dark chocolate ice cream, dense and smooth','آيس كريم شوكولاتة داكنة فاخر',3500,'Ice Cream Chocolate.jpg');
  item(ice,'Strawberry','فراولة','Fresh strawberry ice cream with real fruit pieces','آيس كريم الفراولة الطازجة بقطع فواكه حقيقية',3500,'Ice Cream Strawberry.jpg');
  item(ice,'Vanilla','فانيليا','Classic Madagascar vanilla bean ice cream','آيس كريم فانيليا مدغشقر الكلاسيكي',3500,'Ice Cream Vanilla.jpg');

  // ─── CAKES ────────────────────────────────────────────────────────────────
  s = 0;
  const cakes = cat('Cakes', 'الكيكات', 15);
  item(cakes,'San Sebastian','سان سيباستيان','Basque-style burnt cheesecake with caramelized top','تشيزكيك مقرمش على الطريقة الباسكية',7500,'Cake San Sebastian.jpg');
  item(cakes,'Lotus Cheesecake','تشيزكيك لوتس','Creamy cheesecake on Lotus Biscoff base','تشيزكيك كريمي على قاعدة لوتس بسكوف',7500,'Cake Lotus Cheesecake.jpg');
  item(cakes,'Strawberry Cheesecake','تشيزكيك فراولة','Classic cheesecake topped with strawberry compote','تشيزكيك كلاسيكي مع مربى الفراولة الطازجة',7500,'Cake Strawberry Cheesecake.jpg');
  item(cakes,'Red Velvet','ريد فيلفيت','Moist red velvet cake with cream cheese frosting','كيكة ريد فيلفيت طرية مع طبقات كريمة الجبن',7000,'Cake Red Velvet.jpg');
  item(cakes,'Tiramisu','تيراميسو','Italian espresso-soaked sponge with mascarpone cream','طبقات الإسبريسو الإيطالي مع كريمة المسكاربوني',7000,'Cake Tiramisu.jpg');
  item(cakes,'Chocolate Cake','كيكة الشوكولاتة','Classic dark chocolate cake with chocolate ganache','كيكة شوكولاتة داكنة مع غاناش مخملي',6500,'Cake Chocolate.jpg');
  item(cakes,'Chocolate Fondant','فوندون شوكولاتة','Warm chocolate cake with a molten center','كيكة شوكولاتة دافئة بمركز منصهر غني',6500,'Cake Chocolate Fondant.jpg');
  item(cakes,'Caramel Cake','كيكة الكراميل','Soft sponge layers with rich caramel cream','طبقات من الإسفنج الناعم مع كريمة الكراميل',7000,'Cake Caramel.jpg');
  item(cakes,'Framboise','فرامبواز','Light sponge with raspberry cream and floral finish','إسفنج خفيف مع كريمة التوت الأحمر',7000,'Cake Framboise.jpg');

  // ─── HEALTHY CAKES ────────────────────────────────────────────────────────
  s = 0;
  const healthy = cat('Healthy Cakes', 'كيكات صحية', 16);
  item(healthy,'Almond Cake','كيكة اللوز','A guilt-free almond flour cake, naturally sweetened','كيكة دقيق اللوز الخالية من الذنب، محلاة طبيعياً',5500,'Healthy Almond Cake.jpg');
  item(healthy,'Brownie','براوني صحي','Dense fudgy brownie made with wholesome ingredients','براوني كثيف ومطاطي من مكونات صحية',5000,'Healthy Brownie.jpg');

  // ─── BAKERY ───────────────────────────────────────────────────────────────
  s = 0;
  const bakery = cat('Bakery', 'المخبوزات', 17);
  item(bakery,'Almond Croissant','كرواسان لوز','Flaky butter croissant filled with almond cream','كرواسان بالزبدة بحشوة كريمة اللوز',4500,'Bakery Croissant Almond.jpg');
  item(bakery,'Pistachio Croissant','كرواسان فستق','Golden croissant filled with pistachio paste','كرواسان ذهبي محشو بكريمة الفستق الفاخرة',4500,'Bakery Croissant Pistachio.jpg');
  item(bakery,'Floranya Croissant','كرواسان فلورانيا','Our signature croissant with Floranya special filling','كرواساننا المميز بحشوة فلورانيا الخاصة',4500,'Bakery Croissant Floranya.jpg');
  item(bakery,'Strawberry Croissant','كرواسان فراولة','Buttery croissant with fresh strawberry jam','كرواسان بالزبدة مع مربى الفراولة الطازجة',4000,'Bakery Croissant Strawberry.jpg');
  item(bakery,'Hazelnut Croissant Roll','رول كرواسان بندق','Rolled croissant with smooth hazelnut cream','رول كرواسان مع كريمة البندق الناعمة',4500,'Bakery Croissant Roll Hazelnut.jpg');
  item(bakery,'Pistachio Croissant Roll','رول كرواسان فستق','Rolled croissant filled with premium pistachio cream','رول كرواسان محشو بكريمة الفستق الفاخرة',4500,'Bakery Croissant Roll Pistachio.jpg');
  item(bakery,'Cinnamon Roll','رول القرفة','Soft spiral pastry infused with cinnamon and icing','رول لولبي ناعم بالقرفة مع غطاء الآيسينج',4000,'Bakery Cinnamon Roll.jpg');
  item(bakery,'Fruit Danish','دنش فواكه','Soft Danish pastry topped with fresh fruits','معجنات دنماركية ناعمة مع تشكيلة من الفواكه',4000,'Bakery Fruit Danish.jpg');
  item(bakery,'Lotus Donut','دونت لوتس','Glazed donut topped with crushed Lotus Biscoff','دونت بالطلاء مع لوتس بسكوف المجروش',3500,'Bakery Lotus Donut.jpg');
  item(bakery,'Oreo Donut','دونت أوريو','Donut covered in white glaze and crushed Oreo','دونت بالطلاء الأبيض وقطع الأوريو المجروشة',3500,'Bakery Oreo Donut.jpg');
  item(bakery,'Chocolate Muffin','مافن شوكولاتة','Rich moist chocolate muffin with chocolate chips','مافن شوكولاتة غني مع رقائق شوكولاتة',3500,'Bakery Chocolate Muffin.jpg');
  item(bakery,'Caramel Cookie','كوكيز كراميل','Buttery cookie loaded with golden caramel chips','كوكيز بالزبدة مع رقائق الكراميل الذهبي',3000,'Bakery Cookie Caramel.jpg');
  item(bakery,'Chocolate Cookie','كوكيز شوكولاتة','Classic chocolate chip cookie, soft and golden','كوكيز كلاسيكي برقائق الشوكولاتة',3000,'Bakery Cookie Chocolate.jpg');
  item(bakery,'Pistachio Cookie','كوكيز فستق','Delicate pistachio cookie with a rich nutty flavor','كوكيز فستق راقٍ بنكهة المكسرات الغنية',3000,'Bakery Cookie Pistachio.jpg');

  // ─── SANDWICHES ───────────────────────────────────────────────────────────
  s = 0;
  const sand = cat('Sandwiches', 'ساندويتش', 18);
  item(sand,'Chicken Pesto (Brown)','دجاج بيستو (أسمر)','Grilled chicken with house-made pesto on brown bread','دجاج مشوي مع البيستو على خبز أسمر',6500,'Sandwich Chicken Pesto B.jpg');
  item(sand,'Chicken Pesto (White)','دجاج بيستو (أبيض)','Grilled chicken with house-made pesto on white bread','دجاج مشوي مع البيستو على خبز أبيض',6500,'Sandwich Chicken Pesto W.jpg');
  item(sand,'Chicken Pesto Club (Brown)','كلوب دجاج بيستو (أسمر)','Club-style chicken pesto on toasted brown bread','كلوب ساندويتش دجاج بيستو على خبز أسمر محمص',7000,'Sandwich Chicken Pesto Club B.jpg');
  item(sand,'Chicken Pesto Club (White)','كلوب دجاج بيستو (أبيض)','Club-style chicken pesto on toasted white bread','كلوب ساندويتش دجاج بيستو على خبز أبيض محمص',7000,'Sandwich Chicken Pesto Club W.jpg');
  item(sand,'Turkey Club (Brown)','كلوب تركي (أسمر)','Turkey club sandwich on toasted brown bread','كلوب ساندويتش تركي على خبز أسمر محمص',7000,'Sandwich Turkey Club B.jpg');
  item(sand,'Turkey Club (White)','كلوب تركي (أبيض)','Turkey club sandwich on toasted white bread','كلوب ساندويتش تركي على خبز أبيض محمص',7000,'Sandwich Turkey Club W.jpg');

  // ─── ROSES (placeholder) ──────────────────────────────────────────────────
  cat('Roses', 'الورود', 19);

  console.log('✓ Default menu seeded: 131 items, 19 categories, extras included.');
};
