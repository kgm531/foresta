/**
 * Foresta — Complete bilingual translation system (EN ↔ AR)
 * Covers every static text string across all public pages + admin.
 * Strategy: data-i18n attributes + full DOM text-node walker.
 */

/* ═══════════════════════════════════════════════
   COMPLETE ENGLISH → ARABIC DICTIONARY
   Keys = exact trimmed English text node content
═══════════════════════════════════════════════ */
const EN_AR = {
  /* ── General / Repeated ── */
  'Light': 'فاتح',
  'Dark': 'داكن',
  'View Product': 'عرض المنتج',
  'View Product →': 'عرض المنتج →',
  'New In': 'وصل حديثًا',
  'New Season Favourite': 'المفضّل في الموسم الجديد',
  'New Arrival': 'وصل حديثًا',
  'Bestseller': 'الأكثر مبيعًا',
  'Limited Edition': 'إصدار محدود',
  'Perennial Favourite': 'المفضّل الدائم',
  'In Stock': 'متوفر',
  'Low Stock': 'كمية محدودة',
  'Out of Stock': 'نفد المخزون',
  'Free': 'مجاني',
  'Save': 'حفظ',
  'Cancel': 'إلغاء',
  'Delete': 'حذف',
  'Edit': 'تعديل',
  'View': 'عرض',
  'Back': 'رجوع',
  'Search': 'بحث',
  'Filter': 'تصفية',
  'Clear': 'مسح',
  'Manage': 'إدارة',
  'Remove': 'إزالة',

  /* ── NAVBAR ── */
  'Home': 'الرئيسية',
  'Shop': 'المتجر',
  'Shop All': 'تسوّق الكل',
  'Collections': 'المجموعات',
  'Why Foresta': 'لماذا فوريستا',
  'Sustainability': 'لماذا فوريستا',
  'Wishlist': 'المفضلة',
  'Cart': 'السلة',
  'عربي': 'عربي',
  'English': 'English',

  /* ── INDEX — HERO ── */
  'New Season Arrival': 'مجموعة الموسم الجديد',
  'Wear the forest.': 'ارتدِ الغابة.',
  'Leave it standing.': 'دعها قائمةً.',
  'Slow fashion, hand-finished in Portugal.': 'أزياء بطيئة، مُنتَهى تصنيعها يدويًا في البرتغال.',
  'Worn by those who care about the earth.': 'يرتديها من يهتم بالأرض.',
  'Shop the Collection': 'تسوّق المجموعة',
  'Explore the Collection': 'استكشف المجموعة',
  'Explore the collection': 'استكشف المجموعة',
  'Featured Piece': 'القطعة المميزة',
  'FEATURED': 'مميز',
  'AUTUMN CANOPY': 'خريف الغابة',

  /* ── INDEX — FEATURES ── */
  'Why Foresta': 'لماذا فوريستا',
  'Earth-First Materials': 'خامات تُقدِّم الأرض أولًا',
  'Every fabric is OEKO-TEX® certified. No synthetics. No compromises.': 'كل قماش حاصل على شهادة OEKO-TEX®. بلا ألياف اصطناعية. بلا تنازلات.',
  'Hand-Finished in Portugal': 'تشطيب يدوي في البرتغال',
  'Small-batch production. Craftspeople paid above living wage.': 'إنتاج دفعات صغيرة. حِرَفيون يحصلون على أجور فوق الحدّ الأدنى للمعيشة.',
  'Carbon-Neutral Shipping': 'شحن محايد للكربون',
  'Every order shipped via DHL GoGreen. Fully offset.': 'كل طلب يُشحن عبر DHL GoGreen. تعويض كامل عن انبعاثات الكربون.',
  '1 Tree Per Order': 'شجرة لكل طلب',
  'Partnered with One Tree Planted since 2021.': 'شراكة مع One Tree Planted منذ عام 2021.',

  /* ── INDEX — WHY FORESTA ── */
  'Our Commitment': 'لماذا فوريستا',
  'Why Foresta': 'لماذا فوريستا',
  'Where the wild': 'حيث تلتقي البرية',
  'meets your wardrobe': 'بخزانة ملابسك',
  'Every Foresta design is born in the wild — drawn from the raw beauty of forests, the power of wolves, the grace of eagles, and the untamed spirit of nature. Clothing that tells a story.': 'كل تصميم من فوريستا يُولد في البرية — مستوحى من جمال الغابات الخام، وقوة الذئاب، ورشاقة النسور، وروح الطبيعة الجامحة. ملابس تحكي قصة.',

  /* ── INDEX — COLLECTION ── */
  'The Collection': 'المجموعة',
  'The Forest Edit': 'تشكيلة الغابة',
  'Considered pieces for considered living.': 'قطع مدروسة لحياة مدروسة.',
  'View all': 'عرض الكل',
  'View All': 'عرض الكل',
  'View All Collections': 'عرض جميع المجموعات',

  /* ── INDEX — NEWSLETTER ── */
  'Join the forest': 'انضم للغابة',
  'Stay in the forest.': 'ابقَ في الغابة.',
  'Early access to new collections, behind-the-scenes stories, and invitations to special events.': 'وصول مبكر للمجموعات الجديدة، قصص من الكواليس، ودعوات لفعاليات خاصة.',
  'Your email address': 'بريدك الإلكتروني',
  'Join': 'انضم',
  'Subscribe': 'اشترك',

  /* ── INDEX — FOOTER ── */
  'Wear the forest. Leave it standing.': 'ارتدِ الغابة. دعها قائمة.',
  'All Pieces': 'جميع القطع',
  'Outerwear': 'الملابس الخارجية',
  'Tops': 'الأعلى',
  'Bottoms': 'الأسفل',
  'Sets': 'الأطقم',
  'Information': 'معلومات',
  'Our Story': 'قصتنا',
  'Care Guide': 'دليل العناية',
  'Returns': 'المرتجعات',
  '© 2025 Foresta. All rights reserved.': '© 2025 فوريستا. جميع الحقوق محفوظة.',
  'Made with care for the earth.': 'صُنع باهتمام بالأرض.',

  /* ── PRODUCTS PAGE ── */
  'Sort by': 'ترتيب حسب',
  'Sort: Featured': 'ترتيب: مميز',
  'Featured': 'مميز',
  'Price: Low–High': 'السعر: الأقل أولًا',
  'Price: High–Low': 'السعر: الأعلى أولًا',
  'Top Rated': 'الأعلى تقييمًا',
  'Biggest Discount': 'أكبر خصم',
  'Quick Add': 'إضافة سريعة',
  'Added ✓': 'تمت الإضافة ✓',
  'pieces found': 'قطعة',
  'piece found': 'قطعة',
  'No products found': 'لم يتم العثور على منتجات',
  'Try adjusting your filters': 'حاول تعديل الفلاتر',
  'Collections': 'المجموعات',
  'All Collections': 'جميع المجموعات',
  'Sort': 'ترتيب',
  'Grid': 'شبكة',
  '2 col': 'عمودان',
  '3 col': 'ثلاثة أعمدة',

  /* ── PRODUCT DETAIL ── */
  'Select Size': 'اختر المقاس',
  'Size guide': 'دليل المقاسات',
  'Quantity': 'الكمية',
  'Add to Cart': 'أضف للسلة',
  'Save to Wishlist': 'أضف للمفضلة',
  'Saved ♡': 'محفوظ ♡',
  'Adding…': 'جارٍ الإضافة...',
  'Free shipping on orders over $200': 'شحن مجاني للطلبات فوق ٢٠٠ دولار',
  '30-day free returns': 'إرجاع مجاني خلال ٣٠ يومًا',
  'You May Also Like': 'قد يعجبك أيضًا',
  'Materials & Care': 'الخامات والعناية',
  'Fit & Sizing': 'القصة والمقاسات',
  'Delivery & Returns': 'التوصيل والإرجاع',
  'Please select a size': 'الرجاء اختيار مقاس',
  'Virtual Mirror': 'المرآة الافتراضية',
  'Find Your Fit': 'اعثر على مقاسك',
  'Enter your measurements': 'أدخل قياساتك',
  'Height (cm)': 'الطول (سم)',
  'Weight (kg)': 'الوزن (كجم)',
  'Analyse': 'تحليل',
  'Your Profile': 'ملفك الشخصي',

  /* ── CART ── */
  'Your Cart': 'سلتك',
  'Items in Your Basket': 'المنتجات في سلتك',
  'items selected': 'عناصر محددة',
  'item selected': 'عنصر محدد',
  'Empty for now': 'فارغة الآن',
  'Size:': 'المقاس:',
  'Free Carbon-Offset Shipping Unlocked': 'تم تفعيل الشحن المجاني محايد الكربون 🌿',
  'Free Carbon-Offset Shipping Unlocked 🌿': 'تم تفعيل الشحن المجاني محايد الكربون 🌿',
  'Order Summary': 'ملخص الطلب',
  'Subtotal': 'المجموع الفرعي',
  'Shipping': 'الشحن',
  'Total': 'الإجمالي',
  'Proceed to Checkout →': 'إتمام الشراء ←',
  'Proceed to Checkout': 'إتمام الشراء',
  '← Continue Shopping': 'متابعة التسوق →',
  'Continue Shopping': 'متابعة التسوق',
  'Your cart is empty': 'سلتك فارغة',
  "You haven't added anything yet.": 'لم تضف أي شيء حتى الآن.',
  'Explore our collection and find your next favourite piece.': 'استكشف مجموعتنا وأضف قطعتك المفضلة التالية.',
  'away from free shipping': 'متبقٍ للشحن المجاني',
  "You've unlocked free shipping! 🌿": 'تهانينا! حصلت على شحن مجاني 🌿',
  'Home': 'الرئيسية',

  /* ── CHECKOUT ── */
  'Checkout': 'إتمام الشراء',
  'Contact Information': 'بيانات التواصل',
  'Full Name': 'الاسم الكامل',
  'Email Address': 'البريد الإلكتروني',
  'Phone (optional)': 'رقم الهاتف (اختياري)',
  'Shipping Address': 'عنوان الشحن',
  'Street Address': 'عنوان الشارع',
  'City': 'المدينة',
  'Country': 'الدولة',
  'Postal Code': 'الرمز البريدي',
  'Gift message (optional)': 'رسالة هدية (اختياري)',
  'Payment': 'الدفع',
  'Credit / Debit Card': 'بطاقة الائتمان / الدفع',
  'Apple Pay': 'Apple Pay',
  'PayPal': 'PayPal',
  'Card Number': 'رقم البطاقة',
  'Expiry': 'تاريخ الانتهاء',
  'CVV': 'CVV',
  'Name on Card': 'الاسم على البطاقة',
  'Place Order': 'تأكيد الطلب',
  '256-bit SSL encrypted': 'مُشفَّر بـ SSL 256-bit',
  'Secure Checkout': 'دفع آمن',
  'Cart': 'السلة',
  'Details': 'التفاصيل',
  'Confirmation': 'التأكيد',
  'Select country': 'اختر الدولة',
  'Required': 'مطلوب',
  'Your full name': 'اسمك الكامل',
  '123 Forest Lane': '١٢٣ شارع الغابة',
  'Processing Order…': 'جارٍ معالجة الطلب...',

  /* ── ORDER SUCCESS ── */
  'Order Confirmed': 'تم تأكيد الطلب',
  'Thank you,': 'شكرًا لك،',
  'Your order is confirmed and being prepared with care.': 'تم تأكيد طلبك وهو قيد التحضير بعناية.',
  'Your order is on its way to the forest.': 'طلبك في طريقه إلى الغابة.',
  'Order ID': 'رقم الطلب',
  'Order Date': 'تاريخ الطلب',
  'Est. Delivery': 'التسليم المتوقع',
  'Items Ordered': 'المنتجات المطلوبة',
  'Delivery Address': 'عنوان التسليم',
  'Continue Shopping': 'متابعة التسوق',
  'Track Order': 'تتبع الطلب',
  '1 tree will be planted for your order.': 'ستُزرع شجرة واحدة لطلبك.',
  'For every order placed, we plant one tree through One Tree Planted. Since 2021, the Foresta community has helped restore over 47,000 trees across three continents.': 'مع كل طلب، نزرع شجرة واحدة من خلال One Tree Planted. منذ 2021، ساعد مجتمع فوريستا في استعادة أكثر من 47,000 شجرة عبر ثلاث قارات.',
  'Order confirmed': 'تم تأكيد الطلب',
  'Order Received': 'تم استلام الطلب',
  'Preparing': 'قيد التحضير',
  'Shipped': 'تم الشحن',
  'Out for Delivery': 'في طريقه إليك',
  'Delivered': 'تم التسليم',
  'Estimated 3–5 business days': 'يُقدَّر بـ ٣–٥ أيام عمل',
  'View Order Details': 'عرض تفاصيل الطلب',

  /* ── SEARCH ── */
  'Search the Collection': 'ابحث في المجموعة',
  'Results for': 'نتائج البحث عن',
  'result': 'نتيجة',
  'results': 'نتائج',
  'Showing': 'عرض',
  'results for': 'نتائج عن',
  'No results found': 'لم يتم العثور على نتائج',
  "We couldn't find anything matching": 'لم نتمكن من إيجاد ما يطابق',
  'Try a different search term or browse our collections.': 'جرّب كلمة بحث مختلفة أو تصفّح مجموعاتنا.',
  'Try a different keyword or browse our collection.': 'جرّب كلمة مختلفة أو تصفّح مجموعتنا.',
  'What are you looking for?': 'ما الذي تبحث عنه؟',
  'Search by product name, material, collection, or category.': 'ابحث باسم المنتج، الخامة، المجموعة، أو التصنيف.',
  'Search by name, material, collection…': 'ابحث بالاسم، الخامة، المجموعة...',
  'Linen': 'كتان',
  'Jacket': 'جاكيت',
  'Coat': 'معطف',
  'Shirt': 'قميص',
  'All Products': 'جميع المنتجات',
  'Browse All': 'تصفّح الكل',
  'Browse Collection': 'تصفّح المجموعة',
  'Outerwear': 'الملابس الخارجية',
  'Merino': 'ميرينو',
  'View →': 'عرض ←',

  /* ── WISHLIST ── */
  'Your Wishlist': 'مفضلتي',
  'saved piece': 'قطعة محفوظة',
  'saved pieces': 'قطع محفوظة',
  'Nothing saved yet': 'لا يوجد شيء محفوظ بعد',
  'Your wishlist is empty': 'مفضلتك فارغة',
  'Save pieces you love by clicking the heart icon on any product.': 'احفظ القطع التي تعجبك بالنقر على أيقونة القلب على أي منتج.',
  "They'll be waiting here for you.": 'ستجدها هنا في انتظارك.',
  'Save pieces you love for later.': 'احفظ القطع التي تعجبك لوقت لاحق.',
  'Explore the Collection': 'استكشف المجموعة',

  /* ── ADMIN — GENERAL ── */
  'Store Admin': 'إدارة المتجر',
  'Admin Portal': 'بوابة الإدارة',
  'Welcome back': 'أهلاً بك',
  'Sign in to manage your store': 'تسجيل الدخول لإدارة متجرك',
  'Username': 'اسم المستخدم',
  'Password': 'كلمة المرور',
  'Sign In to Dashboard': 'تسجيل الدخول إلى لوحة التحكم',
  '← Back to Store': '← العودة للمتجر',
  'Sign Out': 'تسجيل الخروج',
  'View Store': 'عرض المتجر',

  /* ── ADMIN — SIDEBAR ── */
  'Overview': 'نظرة عامة',
  'Dashboard': 'لوحة التحكم',
  'Catalogue': 'الكتالوج',
  'Products': 'المنتجات',
  'Add Product': 'إضافة منتج',
  'Commerce': 'التجارة',
  'Orders': 'الطلبات',
  'Subscribers': 'المشتركون',
  'Store': 'المتجر',

  /* ── ADMIN — DASHBOARD ── */
  'Welcome back — here\'s what\'s happening in your store': 'أهلاً — إليك ما يحدث في متجرك',
  'Total Revenue': 'إجمالي الإيرادات',
  'Total Orders': 'إجمالي الطلبات',
  'Out of Stock': 'نفد المخزون',
  'Revenue — Last 7 Days': 'الإيرادات — آخر ٧ أيام',
  'Daily totals': 'الإجماليات اليومية',
  'Revenue ($)': 'الإيرادات ($)',
  'Order Status': 'حالة الطلبات',
  'Recent Orders': 'الطلبات الأخيرة',
  'View All': 'عرض الكل',
  'All products in stock': 'جميع المنتجات متوفرة',
  'No orders yet': 'لا توجد طلبات بعد',
  'Orders will appear here after customers checkout': 'ستظهر الطلبات هنا بعد إتمام الشراء',

  /* ── ADMIN — TABLE HEADERS ── */
  'Order': 'الطلب',
  'Customer': 'العميل',
  'Status': 'الحالة',
  'Date': 'التاريخ',
  'Actions': 'الإجراءات',
  'Category': 'التصنيف',
  'Price': 'السعر',
  'Rating': 'التقييم',
  'Stock': 'المخزون',
  'Badge': 'الشارة',
  'Email': 'البريد الإلكتروني',
  'Source': 'المصدر',
  'Subscribed': 'تاريخ الاشتراك',
  'Location': 'الموقع',
  'Items': 'المنتجات',

  /* ── ADMIN — PRODUCTS ── */
  'Add Product': 'إضافة منتج',
  'product': 'منتج',
  'products': 'منتجات',
  'Search products…': 'ابحث عن منتجات...',
  'All Categories': 'جميع التصنيفات',
  'All Stock': 'كل المخزون',
  'In Stock': 'متوفر',
  '✓ In Stock': '✓ متوفر',
  '✗ Out of Stock': '✗ نفد المخزون',
  'No products found': 'لم يتم العثور على منتجات',
  'Try adjusting your filters': 'حاول تعديل الفلاتر',
  'Add your first product to get started': 'أضف منتجك الأول للبدء',
  'Delete Product?': 'حذف المنتج؟',
  'Are you sure you want to delete': 'هل أنت متأكد من حذف',
  'This cannot be undone.': 'لا يمكن التراجع عن هذا الإجراء.',

  /* ── ADMIN — PRODUCT FORM ── */
  'Edit Product': 'تعديل المنتج',
  'New Product': 'منتج جديد',
  'Editing:': 'تعديل:',
  'Add a new product to your catalogue': 'أضف منتجًا جديدًا إلى كتالوجك',
  '← Back': '← رجوع',
  '👁 Preview': '👁 معاينة',
  '🌿 Basic Information': '🌿 المعلومات الأساسية',
  'Product Name': 'اسم المنتج',
  'e.g. The Canopy Linen Jacket': 'مثال: جاكيت الكتان',
  'Subtitle / Tagline': 'الوصف المختصر',
  'Short evocative description': 'وصف مختصر وجذاب',
  'Collection': 'المجموعة',
  'e.g. Autumn Canopy': 'مثال: خريف الغابة',
  '— Select —': '— اختر —',
  'Outerwear': 'الملابس الخارجية',
  'Tops': 'الأعلى',
  'Bottoms': 'الأسفل',
  'Sets': 'الأطقم',
  'Accessories': 'الإكسسوارات',
  'Badge / Label': 'الشارة / التسمية',
  'e.g. New Arrival, Bestseller, Limited Edition': 'مثال: وصل حديثًا، الأكثر مبيعًا',
  'Description': 'الوصف',
  'Full product description…': 'وصف كامل للمنتج...',
  '💰 Pricing': '💰 التسعير',
  'Original Price': 'السعر الأصلي',
  'Leave blank if no discount': 'اتركه فارغًا إذا لم يكن هناك خصم',
  'Discount %': 'نسبة الخصم %',
  'Rating (0–5)': 'التقييم (٠–٥)',
  'Review Count': 'عدد التقييمات',
  '📐 Available Sizes': '📐 المقاسات المتاحة',
  'Check all sizes this product comes in. Unchecked sizes will show as unavailable.': 'اختر جميع المقاسات المتاحة. المقاسات غير المحددة ستظهر كغير متاحة.',
  '📋 Product Details (Accordion)': '📋 تفاصيل المنتج (أقسام)',
  'Materials & Care': 'الخامات والعناية',
  'Fit & Sizing': 'القصة والمقاسات',
  'Delivery & Returns': 'التوصيل والإرجاع',
  'Enter bullet points, one per line…': 'أدخل النقاط، واحدة في كل سطر...',
  'One point per line. Each line becomes a bullet item.': 'نقطة واحدة لكل سطر. كل سطر يصبح عنصرًا في القائمة.',
  '🌱 Eco Credentials': '🌱 الاعتمادات البيئية',
  'Eco claim, e.g. 100% Organic Linen': 'ادعاء بيئي، مثال: ١٠٠% كتان عضوي',
  '🖼 Cover Image': '🖼 صورة الغلاف',
  'Click to upload cover image': 'انقر لرفع صورة الغلاف',
  'PNG, JPG, WEBP · max 16 MB': 'PNG، JPG، WEBP · الحد الأقصى ١٦ ميجابايت',
  'Or paste image URL': 'أو الصق رابط الصورة',
  '🗂 Gallery Images': '🗂 صور المعرض',
  'Add up to 4 additional images (URL + label)': 'أضف حتى ٤ صور إضافية (رابط + تسمية)',
  'Image URL': 'رابط الصورة',
  'Label (e.g. Back View)': 'التسمية (مثال: منظر خلفي)',
  '⚙️ Status': '⚙️ الحالة',
  'In Stock': 'متوفر',
  'Uncheck to mark as out of stock': 'ألغِ التحديد للإشارة إلى نفاد المخزون',
  '💾 Save Changes': '💾 حفظ التغييرات',
  '🌿 Create Product': '🌿 إنشاء المنتج',

  /* ── ADMIN — ORDERS ── */
  'order': 'طلب',
  'orders': 'طلبات',
  'Search by name, email, order ID…': 'ابحث بالاسم، البريد الإلكتروني، رقم الطلب...',
  'All Orders': 'جميع الطلبات',
  'Confirmed': 'مؤكد',
  'Processing': 'قيد المعالجة',
  'Shipped': 'تم الشحن',
  'Delivered': 'تم التسليم',
  'Cancelled': 'ملغى',
  'confirmed': 'مؤكد',
  'processing': 'قيد المعالجة',
  'shipped': 'تم الشحن',
  'delivered': 'تم التسليم',
  'cancelled': 'ملغى',
  'Free shipping': 'شحن مجاني',
  'Delete Order?': 'حذف الطلب؟',
  'No orders found': 'لم يتم العثور على طلبات',
  'Try adjusting your search': 'حاول تعديل بحثك',
  'Orders will appear after customers checkout': 'ستظهر الطلبات بعد إتمام الشراء',
  'View All': 'عرض الكل',
  '← All Orders': '← جميع الطلبات',
  'Delete Order': 'حذف الطلب',
  'Placed on': 'تم الطلب في',
  'Order Items': 'منتجات الطلب',
  'item': 'منتج',
  'items': 'منتجات',
  'Size: N/A': 'المقاس: غير محدد',
  'each': 'لكل قطعة',
  'Customer Information': 'معلومات العميل',
  'Full Name': 'الاسم الكامل',
  'Phone': 'الهاتف',
  'Shipping Address': 'عنوان الشحن',
  'Gift Note': 'رسالة الهدية',
  'Order Timeline': 'مراحل الطلب',
  'Order Summary': 'ملخص الطلب',
  'Update Status': 'تحديث الحالة',
  'Quick Actions': 'إجراءات سريعة',
  '📧 Email Customer': '📧 مراسلة العميل',
  '← Back to Orders': '← العودة للطلبات',

  /* ── ADMIN — SUBSCRIBERS ── */
  'subscriber': 'مشترك',
  'subscribers': 'مشتركون',
  'Total Subscribers': 'إجمالي المشتركين',
  'From Checkout': 'من إتمام الشراء',
  'Newsletter Signups': 'اشتراكات النشرة',
  'Search by email…': 'ابحث بالبريد الإلكتروني...',
  'All Sources': 'جميع المصادر',
  'Newsletter': 'النشرة الإخبارية',
  'newsletter': 'النشرة الإخبارية',
  'checkout': 'إتمام الشراء',
  'No subscribers found': 'لم يتم العثور على مشتركين',
  "Subscribers will appear when customers sign up": 'سيظهر المشتركون عند تسجيل العملاء',
  'Remove Subscriber?': 'إزالة المشترك؟',
  'Remove': 'إزالة',
  'from your subscriber list?': 'من قائمة المشتركين؟',
  'Remove from your subscriber list?': 'إزالة من قائمة المشتركين؟',

  /* ── ADMIN — COMMON UI ── */
  'Cancel': 'إلغاء',
  'Confirm': 'تأكيد',
  'Save': 'حفظ',
  'Back': 'رجوع',
  'Loading…': 'جارٍ التحميل...',
  'No data available': 'لا توجد بيانات',
  'Admin / ': 'الإدارة / ',
  'v2.0': 'v2.0',

  /* ── NAVBAR / FOOTER LINKS (missing) ── */
  'Journal': 'المجلة',
  'Shop Now': 'تسوّق الآن',
  'Company': 'الشركة',
  'Support': 'الدعم',
  'Careers': 'الوظائف',
  'Press': 'الصحافة',
  'Size Guide': 'دليل المقاسات',
  'Care Instructions': 'تعليمات العناية',
  'Shipping & Returns': 'الشحن والإرجاع',
  'Repair Service': 'خدمة الإصلاح',
  'Contact Us': 'تواصل معنا',
  'Privacy Policy': 'سياسة الخصوصية',
  'Terms of Use': 'شروط الاستخدام',
  'Cookie Settings': 'إعدادات ملفات تعريف الارتباط',
  'Autumn Canopy': 'خريف الغابة',
  'River Stone': 'حجر النهر',
  'Dusk Outerwear': 'ملابس الغسق الخارجية',
  'Archive Sale': 'تصفية الأرشيف',

  /* ── INDEX — HERO (missing) ── */
  'Designs inspired by the wild.': 'تصاميم مستوحاة من البرية.',
  'Wear the spirit of the forest.': 'ارتدِ روح الغابة.',
  'Scroll': 'تمرير',

  /* ── INDEX — PHILOSOPHY (missing) ── */
  'Our Philosophy': 'فلسفتنا',
  "Nature is not a backdrop. It's the design.": 'الطبيعة ليست خلفية. إنها التصميم بذاتها.',
  'Read Our Manifesto →': 'اقرأ بيانونا ←',
  'Belgian Linen': 'كتان بلجيكي',
  'Handcrafted': 'صُنع يدويًا',
  'Natural Tones': 'ألوان طبيعية',

  /* ── INDEX — STATS ── */
  'Exclusive Designs': 'تصميم حصري',
  'Countries Shipped': 'دولة نشحن إليها',
  'Happy Customers': 'عميل سعيد',
  '5-Star Reviews': 'تقييم ٥ نجوم',

  /* ── INDEX — COLLECTIONS (missing) ── */
  'Curated for the Season': 'مختارة لهذا الموسم',
  'Autumn 2025': 'خريف ٢٠٢٥',
  'The Canopy Collection': 'مجموعة الغابة',
  '12 Pieces · Linen & Cotton': '١٢ قطعة · كتان وقطن',
  'Explore →': 'استكشف ←',
  'Perennial': 'كلاسيكي',
  'River Stone Essentials': 'أساسيات حجر النهر',
  '8 Pieces': '٨ قطع',
  '6 Pieces': '٦ قطع',
  '10 Pieces': '١٠ قطع',
  'All Season': 'كل الفصول',
  'Morning Ritual': 'طقوس الصباح',

  /* ── INDEX — FEATURED ── */
  '⭑ New Season Favourite': '⭑ المفضّل في الموسم الجديد',
  'Featured Product': 'المنتج المميز',
  'The Canopy Linen Jacket': 'جاكيت الكتان الغابي',
  '100% European Linen': '١٠٠% كتان أوروبي',
  'Original Wildlife Print': 'طبعة حيوانات أصلية',
  'Premium Heavy Fabric': 'قماش ثقيل فاخر',
  '4.9 · 238 Reviews': '٤.٩ · ٢٣٨ تقييم',
  'View the Jacket': 'عرض الجاكيت',
  '♡ Add to Wishlist': '♡ أضف للمفضلة',

  /* ── INDEX — LOOKBOOK ── */
  'The Journal': 'المجلة',
  'Styled in the Wild': 'موضة في الطبيعة',
  'View Full Lookbook →': 'عرض الكتالوج الكامل ←',
  'Look 01': 'إطلالة ٠١',
  'Look 02': 'إطلالة ٠٢',
  'Look 03': 'إطلالة ٠٣',
  'Look 04': 'إطلالة ٠٤',
  'Look 05': 'إطلالة ٠٥',
  'Look 06': 'إطلالة ٠٦',
  'The Canopy Jacket': 'جاكيت الغابة',
  'Stone Linen Trousers': 'بنطلون كتان حجري',
  'Dusk Oversized Coat': 'معطف أوفرسايز الغسق',
  'Morning Ritual Set': 'طقم طقوس الصباح',
  'Birch Linen Shirt': 'قميص كتان البتولا',
  'Forest Floor Knit': 'محبوك أرضية الغابة',
  'Drag to explore': 'اسحب للاستكشاف',

  /* ── INDEX — WHY FORESTA CARDS ── */
  'Exclusive Wildlife Prints': 'طبعات حيوانات حصرية',
  'Premium Quality': 'جودة عالية',
  'Fast Worldwide Delivery': 'توصيل سريع حول العالم',
  'What People Say': 'ماذا يقول الناس',
  'Worn. Loved. Kept.': 'مُرتدى. محبوب. محفوظ.',

  /* ── INDEX — NEWSLETTER ── */
  'New arrivals, exclusive drops, and early access to limited collections — delivered once a month.': 'وصولات جديدة، إصدارات حصرية، ووصول مبكر للمجموعات المحدودة — مرة في الشهر.',
  'No spam. Unsubscribe any time.': 'بلا إزعاج. إلغاء الاشتراك في أي وقت.',

  /* ── INDEX — SUSTAINABILITY CARDS ── */
  'Our linen is cultivated in Belgium and France, regions where rain-fed crops require zero irrigation. Every metre of fabric we use demands 13× less water than conventional cotton.': 'يُزرع كتاننا في بلجيكا وفرنسا، مناطق تعتمد على مياه الأمطار دون أي ري. كل متر من قماشنا يستهلك ١٣ مرة أقل ماءً من القطن التقليدي.',
  "We've eliminated carbon from our supply chain and offset what remains through verified projects in Portugal and West Africa. Every shipment is carbon-balanced.": 'أزلنا الكربون من سلسلة التوريد لدينا وعوّضنا ما تبقى من خلال مشاريع موثقة في البرتغال وغرب أفريقيا. كل شحنة متوازنة كربونيًا.',
  'For every order placed, we plant one tree through One Tree Planted. Since 2021, the Foresta community has helped restore over 47,000 trees across three continents.': 'مع كل طلب، نزرع شجرة واحدة عبر One Tree Planted. منذ ٢٠٢١، ساعد مجتمع فوريستا في استعادة أكثر من ٤٧,٠٠٠ شجرة عبر ثلاث قارات.',

  /* ── PRODUCTS PAGE (missing) ── */
  'Sort By': 'ترتيب حسب',
  'Price: Low → High': 'السعر: الأقل أولًا',
  'Price: High → Low': 'السعر: الأعلى أولًا',
  '✕ Clear All Filters': '✕ مسح جميع الفلاتر',
  'reviews': 'تقييم',
  'Nothing here yet.': 'لا يوجد شيء هنا بعد.',
  'Try adjusting your filters to discover more pieces.': 'حاول تعديل الفلاتر لاكتشاف المزيد من القطع.',
  'Search the collection…': 'ابحث في المجموعة...',
  'available': 'متاح',
  'piece': 'قطعة',
  'pieces': 'قطع',

  /* ── PRODUCT DETAIL (missing) ── */
  'Standard View': 'عرض عادي',
  'My Body View': 'عرض على جسمي',
  'Find My Perfect Fit — Virtual Mirror': 'ابحث عن مقاسي المثالي — المرآة الافتراضية',
  'Enter your measurements to see how this fits your body type': 'أدخل قياساتك لترى كيف تناسب قوام جسمك',
  'The Virtual Mirror': 'المرآة الافتراضية',
  "Enter your measurements and we'll recommend the ideal size for this garment.": 'أدخل قياساتك وسنوصي بالمقاس الأمثل لهذه القطعة.',
  'Height': 'الطول',
  'Weight': 'الوزن',
  'Generate My View ✦': 'عرض جسمي ✦',
  'Size Guide ↗': 'دليل المقاسات ↗',
  'Select a size to continue': 'اختر مقاسًا للمتابعة',

  /* ── CART (missing) ── */
  'selected': 'محدد',
  'Add ': 'أضف ',
  'more for free shipping': 'للحصول على شحن مجاني',
  '🌿 Free Carbon-Offset Shipping Unlocked': '🌿 تم تفعيل الشحن المجاني محايد الكربون',
  'Fast worldwide shipping. Free shipping on all orders above $': 'شحن سريع حول العالم. شحن مجاني على الطلبات فوق $',
  'Secure Payment': 'دفع آمن',
  '30-Day Returns': 'إرجاع خلال ٣٠ يومًا',
  'Carbon Neutral': 'محايد الكربون',

  /* ── CHECKOUT (missing) ── */
  'Select country…': 'اختر الدولة...',
  'State / Province': 'الولاية / المقاطعة',
  '💳 Card': '💳 بطاقة',
  '🍎 Apple Pay': '🍎 Apple Pay',
  '🅿️ PayPal': '🅿️ PayPal',
  'Cardholder Name': 'اسم حامل البطاقة',
  'Expiry Date': 'تاريخ الانتهاء',
  'Your payment information is encrypted and never stored on our servers.': 'معلومات دفعك مشفرة ولا تُحفظ على خوادمنا.',
  'Gift Note (optional)': 'رسالة هدية (اختياري)',
  '← Back to Cart': '← رجوع للسلة',
  'Fast tracked shipping. Your order will be on its way soon.': 'شحن سريع مع تتبع. طلبك في طريقه إليك قريبًا.',
  'United States': 'الولايات المتحدة',
  'United Kingdom': 'المملكة المتحدة',
  'Canada': 'كندا',
  'Australia': 'أستراليا',
  'Germany': 'ألمانيا',
  'France': 'فرنسا',
  'Portugal': 'البرتغال',
  'Spain': 'إسبانيا',
  'Italy': 'إيطاليا',
  'Netherlands': 'هولندا',
  'Other': 'أخرى',

  /* ── ORDER SUCCESS (missing) ── */
  'Shipping To': 'الشحن إلى',
  'Items in this Order': 'المنتجات في هذا الطلب',
  'Size ': 'المقاس ',
  '· Qty ': '· الكمية ',
  'Order Total': 'إجمالي الطلب',
  'Just now': 'الآن',
  '1–2 days': '١–٢ أيام',
  '2–3 days': '٢–٣ أيام',
  'Thank you for wearing the wild.': 'شكرًا لك على ارتداء روح البرية.',
  'Your unique Foresta piece is being carefully packed and will be on its way to you shortly. We hope it turns heads wherever you go.': 'قطعتك الفريدة من فوريستا تُعبَّأ بعناية وستكون في طريقها إليك قريبًا. نأمل أن تلفت الأنظار أينما ذهبت.',
  'Back to Home': 'العودة للرئيسية',

  /* ── SPLIT HEADING FRAGMENTS ── */
  'The Canopy': 'الغابة',
  'Linen Jacket': 'جاكيت الكتان',

  /* ── TESTIMONIAL LOCATIONS ── */
  'Paris, France': 'باريس، فرنسا',
  'Berlin, Germany': 'برلين، ألمانيا',
  'Dubai, UAE': 'دبي، الإمارات',
};

/* Build reverse map AR→EN */
const AR_EN = {};
for (const [en, ar] of Object.entries(EN_AR)) {
  AR_EN[ar] = en;
}

/* ═══════════════════════════════════════════════
   STATE
═══════════════════════════════════════════════ */
let _lang = localStorage.getItem('forestaLang') || 'en';

/* ═══════════════════════════════════════════════
   DOM TEXT-NODE WALKER
   Stores originals; replaces on switch
═══════════════════════════════════════════════ */
const _originals = new Map();   // nodeId → original text
let _nodeCounter = 0;

function _getId(node) {
  if (!node.__fid) node.__fid = ++_nodeCounter;
  return node.__fid;
}

function _hasNotranslate(node) {
  let p = node.parentNode;
  while (p && p !== document.body) {
    if (p.hasAttribute && p.hasAttribute('data-notranslate')) return true;
    p = p.parentNode;
  }
  return false;
}

function _walkAndReplace(toAr) {
  const dict = toAr ? EN_AR : AR_EN;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        const tag = node.parentNode && node.parentNode.tagName;
        if (['SCRIPT','STYLE','NOSCRIPT','TEXTAREA','INPUT','CODE','PRE'].includes(tag)) {
          return NodeFilter.FILTER_REJECT;
        }
        if (node.textContent.trim() === '') return NodeFilter.FILTER_REJECT;
        if (_hasNotranslate(node)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  for (const node of nodes) {
    const id = _getId(node);

    // Store the very first English version
    if (!_originals.has(id)) {
      _originals.set(id, node.textContent);
    }

    if (!toAr) {
      // Restore original English
      node.textContent = _originals.get(id);
      continue;
    }

    // Translate to Arabic
    const original = _originals.get(id);
    const trimmed = original.trim();

    // 1. Exact match
    if (dict[trimmed] !== undefined) {
      node.textContent = original.replace(trimmed, dict[trimmed]);
      continue;
    }

    // 2. Partial match — try all dict entries (longest first)
    let result = original;
    const sortedKeys = Object.keys(dict).sort((a, b) => b.length - a.length);
    for (const key of sortedKeys) {
      if (result.includes(key)) {
        result = result.split(key).join(dict[key]);
      }
    }
    node.textContent = result;
  }
}

/* ═══════════════════════════════════════════════
   DATA-I18N ATTRIBUTE HANDLER
═══════════════════════════════════════════════ */
const I18N_KEYS = {
  en: {},  // keys map to their English value (identity)
  ar: {
    nav_home: 'الرئيسية', nav_shop: 'المتجر', nav_search: 'البحث',
    nav_wishlist: 'المفضلة', nav_cart: 'السلة', nav_toggle_lang: 'English',
    hero_eyebrow: 'مجموعة الموسم الجديد',
    hero_title_1: 'ارتدِ الغابة.', hero_title_2: 'دعها قائمةً.',
    hero_cta: 'تسوّق المجموعة', hero_badge: 'المفضّل في الموسم الجديد',
    feat_title: 'لماذا فوريستا',
    feat_1_t: 'خامات تُقدِّم الأرض أولًا',
    feat_2_t: 'تشطيب يدوي في البرتغال',
    feat_3_t: 'شحن محايد للكربون',
    feat_4_t: 'شجرة لكل طلب',
    sust_label: 'التزامنا', sust_title: 'أزياء\nتُعيد للأرض.',
    coll_label: 'المجموعة', coll_title: 'تشكيلة الغابة',
    coll_sub: 'قطع مدروسة لحياة مدروسة.',
    coll_view_all: 'عرض الكل', coll_new_in: 'وصل حديثًا',
    nl_label: 'انضم للغابة', nl_title: 'ابقَ في الغابة.',
    nl_sub: 'وصول مبكر للمجموعات الجديدة، قصص من الكواليس، ودعوات لفعاليات خاصة.',
    nl_placeholder: 'بريدك الإلكتروني', nl_btn: 'انضم',
    footer_tagline: 'ارتدِ الغابة. دعها قائمة.',
    footer_shop: 'المتجر', footer_all: 'جميع القطع',
    footer_outerwear: 'الملابس الخارجية', footer_tops: 'الأعلى',
    footer_bottoms: 'الأسفل', footer_info: 'معلومات',
    footer_about: 'قصتنا', footer_sustain: 'الاستدامة',
    footer_care: 'دليل العناية', footer_returns: 'المرتجعات',
    footer_copy: '© 2025 فوريستا. جميع الحقوق محفوظة.',
    footer_made: 'صُنع باهتمام بالأرض.',
    shop_title: 'تسوّق الكل', shop_sub: 'قطع مدروسة لحياة مدروسة.',
    filter_all: 'جميع القطع', filter_outer: 'الملابس الخارجية',
    filter_tops: 'الأعلى', filter_bottoms: 'الأسفل', filter_sets: 'الأطقم',
    product_add: 'إضافة سريعة', modal_select: 'اختر المقاس',
    modal_confirm: 'أضف للسلة',
    pd_size_label: 'اختر المقاس', pd_add_cart: 'أضف للسلة',
    pd_add_wish: 'أضف للمفضلة', pd_in_wish: 'محفوظ',
    pd_free_ship: 'شحن مجاني للطلبات فوق ٢٠٠ دولار',
    pd_related: 'قد يعجبك أيضًا', pd_select_first: 'الرجاء اختيار مقاس',
    cart_title: 'سلتك', cart_summary: 'ملخص الطلب',
    cart_subtotal: 'المجموع الفرعي', cart_shipping: 'الشحن',
    cart_total: 'الإجمالي', cart_checkout: 'إتمام الشراء',
    cart_continue: 'متابعة التسوق', cart_empty: 'سلتك فارغة',
    cart_empty_sub: 'اكتشف مجموعتنا وأضف ما يعجبك.',
    cart_shop_now: 'تسوّق الآن',
    chk_title: 'إتمام الشراء', chk_shipping: 'بيانات الشحن',
    chk_name: 'الاسم الكامل', chk_email: 'البريد الإلكتروني',
    chk_phone: 'رقم الهاتف', chk_address: 'عنوان الشارع',
    chk_city: 'المدينة', chk_country: 'الدولة',
    chk_postal: 'الرمز البريدي', chk_gift: 'رسالة هدية (اختياري)',
    chk_payment: 'الدفع', chk_place: 'تأكيد الطلب',
    chk_summary: 'ملخص الطلب', chk_secure: 'مُشفَّر بـ SSL 256-bit',
    os_confirmed: 'تم تأكيد الطلب', os_thank: 'شكرًا لك،',
    os_sub: 'طلبك في طريقه إلى الغابة.',
    os_order_id: 'رقم الطلب', os_date: 'التاريخ',
    os_delivery: 'التسليم المتوقع', os_total: 'الإجمالي',
    os_continue: 'متابعة التسوق', os_eco: 'ستُزرع شجرة واحدة لطلبك.',
    srch_title: 'البحث', srch_placeholder: 'ابحث عن قطعة…',
    srch_btn: 'بحث', srch_no_results: 'لم يتم العثور على نتائج',
    srch_no_sub: 'جرّب كلمة مختلفة أو تصفّح مجموعتنا.',
    wl_title: 'مفضلتي', wl_empty: 'مفضلتك فارغة',
    wl_empty_sub: 'احفظ القطع التي تعجبك لوقت لاحق.',
    wl_shop: 'استكشف المجموعة', wl_remove: 'إزالة', wl_add_cart: 'أضف للسلة',
    phil_line1: 'الطبيعة ليست',
    phil_line2: 'خلفية.',
    phil_line3: 'إنها ',
    phil_design: 'التصميم بذاتها.',
    feat_title1: 'جاكيت الغابة',
    feat_title2: 'جاكيت الكتان',
    sust_title1: 'حيث تلتقي البرية',
    sust_title2: 'بخزانة ملابسك',
  }
};

const _i18nOriginals = new Map();

function _applyDataI18n(lang) {
  const dict = lang === 'ar' ? I18N_KEYS.ar : {};
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (lang === 'ar' && dict[key]) {
      if (!_i18nOriginals.has(el)) _i18nOriginals.set(el, el.innerHTML);
      el.textContent = dict[key];
    } else if (lang === 'en' && _i18nOriginals.has(el)) {
      el.innerHTML = _i18nOriginals.get(el);
    }
  });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const key = el.getAttribute('data-i18n-ph');
    if (lang === 'ar' && dict[key]) el.placeholder = dict[key];
    else if (lang === 'en') el.placeholder = el.getAttribute('placeholder') || '';
  });
  // Language toggle buttons
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.textContent = lang === 'ar' ? 'English' : 'عربي';
  });
}

/* ═══════════════════════════════════════════════
   PLACEHOLDER TRANSLATIONS
═══════════════════════════════════════════════ */
const PH_AR = {
  'Search by name, material, collection…': 'ابحث بالاسم، الخامة، المجموعة...',
  'Your email address': 'بريدك الإلكتروني',
  'Your full name': 'اسمك الكامل',
  '123 Forest Lane': '١٢٣ شارع الغابة',
  'City': 'المدينة',
  'Search products…': 'ابحث عن منتجات...',
  'Search by name, email, order ID…': 'ابحث بالاسم، البريد الإلكتروني، رقم الطلب...',
  'Search by email…': 'ابحث بالبريد الإلكتروني...',
};

function _translatePlaceholders(toAr) {
  document.querySelectorAll('input[placeholder], textarea[placeholder]').forEach(el => {
    const ph = el.getAttribute('placeholder') || '';
    if (toAr) {
      if (!el.dataset.origPh) el.dataset.origPh = ph;
      if (PH_AR[ph]) el.placeholder = PH_AR[ph];
      else if (EN_AR[ph]) el.placeholder = EN_AR[ph];
    } else {
      if (el.dataset.origPh) el.placeholder = el.dataset.origPh;
    }
  });
}

/* ═══════════════════════════════════════════════
   MAIN APPLY FUNCTION
═══════════════════════════════════════════════ */
function applyTranslations() {
  const toAr = _lang === 'ar';
  const dir  = toAr ? 'rtl' : 'ltr';

  document.documentElement.lang = _lang;
  document.documentElement.dir  = dir;
  document.documentElement.setAttribute('data-lang', _lang);

  // Apply data-i18n attributes first
  _applyDataI18n(_lang);

  // Walk DOM and replace all text nodes
  _walkAndReplace(toAr);

  // Translate placeholders
  _translatePlaceholders(toAr);

  // RTL body class
  document.body.classList.toggle('lang-ar', toAr);

  localStorage.setItem('forestaLang', _lang);
}

/* ═══════════════════════════════════════════════
   PUBLIC API
═══════════════════════════════════════════════ */
function toggleLanguage() {
  _lang = _lang === 'en' ? 'ar' : 'en';
  applyTranslations();
}

function setLanguage(lang) {
  _lang = lang;
  applyTranslations();
}

// Auto-apply on page load
document.addEventListener('DOMContentLoaded', applyTranslations);
