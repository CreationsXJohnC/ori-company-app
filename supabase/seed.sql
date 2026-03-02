-- ═══════════════════════════════════════════════════════════════════════════
-- ORI APP — Demo Seed Data
-- Run AFTER migrations. Populates demo content for investor presentation.
-- Supabase Dashboard → SQL Editor → paste and run
-- OR: supabase db reset --db-url $DATABASE_URL (resets + seeds)
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── Menu Categories ──────────────────────────────────────────────────────────
INSERT INTO public.menu_categories (name, description, icon, sort_order) VALUES
  ('Flower',       'Premium cannabis flower in multiple weights',     'leaf',      1),
  ('Pre-Rolls',    'Ready-to-smoke pre-rolled joints',                'cigarette', 2),
  ('Concentrates', 'Fresh-pressed rosin and bubble hash',             'droplet',   3),
  ('Edibles',      'Cannabis-infused honey and herbal teas',          'coffee',    4),
  ('Tinctures',    'Medical cannabis tinctures for precise dosing',   'flask',     5);

-- ─── Menu Products ────────────────────────────────────────────────────────────
DO $$
DECLARE
  flower_id     UUID;
  preroll_id    UUID;
  conc_id       UUID;
  edible_id     UUID;
  tincture_id   UUID;
BEGIN

SELECT id INTO flower_id   FROM public.menu_categories WHERE name = 'Flower';
SELECT id INTO preroll_id  FROM public.menu_categories WHERE name = 'Pre-Rolls';
SELECT id INTO conc_id     FROM public.menu_categories WHERE name = 'Concentrates';
SELECT id INTO edible_id   FROM public.menu_categories WHERE name = 'Edibles';
SELECT id INTO tincture_id FROM public.menu_categories WHERE name = 'Tinctures';

-- ── FLOWER ────────────────────────────────────────────────────────────────────
INSERT INTO public.menu_products
  (category_id, name, description, price, unit, strain_type, thc_percentage, cbd_percentage,
   effects, terpenes, available, featured, sort_order)
VALUES
  (flower_id,
   'Origin Reserve — 3.5g', 'Our signature indoor-grown flower. Dense, aromatic, and precisely cultivated for our medical patients. Smooth smoke with complex terpene expression and balanced effects.',
   45.00, '3.5g', 'hybrid', 23.4, 0.8,
   ARRAY['Relaxing','Euphoric','Creative','Uplifting'],
   ARRAY['Myrcene','Limonene','Caryophyllene'],
   true, true, 1),

  (flower_id,
   'Origin Reserve — 7g', 'Same premium batch as our 3.5g offering, now at an accessible ounce-fraction price for our regular patients.',
   80.00, '7g', 'hybrid', 23.4, 0.8,
   ARRAY['Relaxing','Euphoric','Creative'],
   ARRAY['Myrcene','Limonene','Caryophyllene'],
   true, false, 2),

  (flower_id,
   'Origin Reserve — 14g', 'Half-ounce of our reserve flower. Ideal for established patients who appreciate consistent quality and savings.',
   150.00, '14g', 'hybrid', 23.4, 0.8,
   ARRAY['Relaxing','Euphoric','Creative'],
   ARRAY['Myrcene','Limonene','Caryophyllene'],
   true, false, 3),

  (flower_id,
   'Origin Reserve — 28g', 'Full ounce of Origin Reserve. Our most economical option for medical patients with higher usage needs.',
   280.00, '28g', 'hybrid', 23.4, 0.8,
   ARRAY['Relaxing','Euphoric','Creative'],
   ARRAY['Myrcene','Limonene','Caryophyllene'],
   true, false, 4),

  (flower_id,
   'Sol Sativa — 3.5g', 'Bright, energizing daytime flower. Perfect for patients seeking focus and gentle euphoria without sedation.',
   42.00, '3.5g', 'sativa', 21.8, 0.3,
   ARRAY['Energizing','Focused','Uplifting','Happy'],
   ARRAY['Limonene','Terpinolene','Pinene'],
   true, false, 5),

  (flower_id,
   'Luna Indica — 3.5g', 'Deep, relaxing evening flower for rest and recovery. Body-forward effects with calming mental quiet.',
   42.00, '3.5g', 'indica', 24.1, 1.2,
   ARRAY['Relaxing','Sleepy','Body Relief','Calming'],
   ARRAY['Myrcene','Linalool','Caryophyllene'],
   true, false, 6),

  (flower_id,
   'Balance CBD — 3.5g', 'High-CBD wellness flower for patients seeking therapeutic support with minimal psychoactivity.',
   40.00, '3.5g', 'cbd', 8.5, 15.2,
   ARRAY['Calm','Focused','Grounded','Clear-headed'],
   ARRAY['Myrcene','CBD','Caryophyllene'],
   true, true, 7);

-- ── PRE-ROLLS ─────────────────────────────────────────────────────────────────
INSERT INTO public.menu_products
  (category_id, name, description, price, unit, strain_type, thc_percentage,
   effects, terpenes, available, featured, sort_order)
VALUES
  (preroll_id,
   'A Healthy Joint', 'Our 1-gram signature pre-roll. Expertly rolled with Origin Reserve flower. Fresh, consistent, and ready for your wellness ritual.',
   15.00, 'each (1g)', 'hybrid', 22.8,
   ARRAY['Relaxing','Euphoric','Creative'],
   ARRAY['Myrcene','Limonene','Caryophyllene'],
   true, true, 1),

  (preroll_id,
   'Box-A-Joints', 'Eight half-gram pre-rolls in our signature presentation box. Perfect for measured, consistent dosing throughout the week.',
   55.00, 'box of 8 (0.5g each)', 'hybrid', 22.8,
   ARRAY['Relaxing','Euphoric','Creative'],
   ARRAY['Myrcene','Limonene'],
   true, true, 2),

  (preroll_id,
   'A Healthy Joint — Sativa', 'Our 1-gram pre-roll featuring Sol Sativa flower. Daytime-ready with uplifting, clear-headed energy.',
   15.00, 'each (1g)', 'sativa', 21.8,
   ARRAY['Energizing','Focused','Uplifting'],
   ARRAY['Limonene','Terpinolene','Pinene'],
   true, false, 3);

-- ── CONCENTRATES ──────────────────────────────────────────────────────────────
INSERT INTO public.menu_products
  (category_id, name, description, price, unit, strain_type, thc_percentage,
   effects, terpenes, available, featured, sort_order)
VALUES
  (conc_id,
   'Ori Coins — Fresh Pressed Rosin', 'Solventless live rosin coins, fresh-pressed from whole flower. Full-spectrum terpene expression. For the discerning medical patient who demands purity.',
   60.00, 'each (1g)', 'hybrid', 78.4,
   ARRAY['Potent','Euphoric','Relaxing','Creative'],
   ARRAY['Myrcene','Limonene','Caryophyllene','Linalool'],
   true, true, 1),

  (conc_id,
   'Ori Tokens — Ice-Water Bubble Hash', 'Full-melt ice-water extracted bubble hash. Cold-processed to preserve the complete cannabinoid and terpene profile. 6-star quality.',
   55.00, 'each (1g)', 'hybrid', 65.2,
   ARRAY['Relaxing','Full-body','Euphoric','Focused'],
   ARRAY['Myrcene','Terpinolene','Ocimene'],
   true, true, 2);

-- ── EDIBLES ───────────────────────────────────────────────────────────────────
INSERT INTO public.menu_products
  (category_id, name, description, price, unit, strain_type,
   effects, available, featured, sort_order)
VALUES
  (edible_id,
   'Ori Infused Raw Organic Honey', 'Single-origin raw honey infused with our cannabis extract. Ethically sourced, minimally processed, and gently dosed for consistent wellness support. Drizzle, blend, or enjoy by the spoonful.',
   35.00, 'jar (4oz)', 'balanced',
   ARRAY['Relaxing','Grounding','Nourishing'],
   true, true, 1),

  (edible_id,
   'Ori Cannabis Herbal Tea — Calm Blend', 'A soothing blend of chamomile, lavender, and passionflower with our cannabis herbal extract. 14 individually wrapped tea bags. Designed for evening wind-down and restful sleep support.',
   28.00, 'box (14 bags)', 'indica',
   ARRAY['Calming','Sleepy','Relaxing'],
   true, true, 2),

  (edible_id,
   'Ori Cannabis Herbal Tea — Clarity Blend', 'Green tea, peppermint, and ginkgo with our daytime cannabis herbal blend. 14 bags for morning or midday clarity and focus support.',
   28.00, 'box (14 bags)', 'sativa',
   ARRAY['Focused','Energizing','Clear-headed'],
   true, false, 3);

-- ── TINCTURES ─────────────────────────────────────────────────────────────────
INSERT INTO public.menu_products
  (category_id, name, description, price, unit, strain_type, thc_percentage, cbd_percentage,
   effects, terpenes, available, featured, sort_order)
VALUES
  (tincture_id,
   'Ori Full-Spectrum Tincture 1:1', 'Our balanced 1:1 THC:CBD tincture in MCT oil. Sublingual delivery for precise, consistent dosing. 30mL bottle with graduated dropper.',
   65.00, 'bottle (30mL)', 'balanced', 15.0, 15.0,
   ARRAY['Balanced','Calm','Therapeutic','Non-sedating'],
   ARRAY['Myrcene','CBD'],
   true, true, 1),

  (tincture_id,
   'Ori CBD Wellness Tincture', 'High-CBD tincture for patients prioritizing wellness and clarity. Minimal THC with maximum therapeutic cannabinoid support.',
   55.00, 'bottle (30mL)', 'cbd', 3.0, 30.0,
   ARRAY['Calm','Focused','Grounded','Therapeutic'],
   ARRAY['CBD','Myrcene'],
   true, false, 2),

  (tincture_id,
   'Ori Evening Tincture THC', 'Higher-THC evening tincture for patients seeking support with rest, discomfort, and night-time relaxation.',
   65.00, 'bottle (30mL)', 'indica', 30.0, 2.0,
   ARRAY['Relaxing','Sleepy','Body Relief'],
   ARRAY['Myrcene','Linalool'],
   true, false, 3);

END $$;

-- ─── Shop Categories ──────────────────────────────────────────────────────────
INSERT INTO public.shop_categories (name, description, sort_order) VALUES
  ('Apparel',     'Ori Clothing & Co — premium wearables',      1),
  ('Accessories', 'Cannabis accessories and smoking essentials', 2),
  ('Collectibles','Stickers, prints, and Ori memorabilia',       3);

-- ─── Shop Products ────────────────────────────────────────────────────────────
DO $$
DECLARE
  apparel_id     UUID;
  access_id      UUID;
  collect_id     UUID;
BEGIN

SELECT id INTO apparel_id  FROM public.shop_categories WHERE name = 'Apparel';
SELECT id INTO access_id   FROM public.shop_categories WHERE name = 'Accessories';
SELECT id INTO collect_id  FROM public.shop_categories WHERE name = 'Collectibles';

INSERT INTO public.shop_products
  (category_id, name, description, price, compare_at_price, images, variants, total_inventory, available, featured, sort_order)
VALUES
  (apparel_id,
   'Ori Classic Hoodie',
   'Premium heavyweight 400gsm French terry hoodie. The Ori wordmark embroidered on chest. Unisex fit. Available in Forest Green and Charcoal.',
   75.00, 95.00,
   ARRAY['https://placehold.co/600x600/1A2E1F/C8922A?text=Ori+Hoodie'],
   '[{"size":"S","color":"Forest Green","sku":"HOD-FG-S","inventory":5},{"size":"M","color":"Forest Green","sku":"HOD-FG-M","inventory":8},{"size":"L","color":"Forest Green","sku":"HOD-FG-L","inventory":6},{"size":"XL","color":"Forest Green","sku":"HOD-FG-XL","inventory":4},{"size":"S","color":"Charcoal","sku":"HOD-CH-S","inventory":3},{"size":"M","color":"Charcoal","sku":"HOD-CH-M","inventory":7},{"size":"L","color":"Charcoal","sku":"HOD-CH-L","inventory":5},{"size":"XL","color":"Charcoal","sku":"HOD-CH-XL","inventory":3}]'::jsonb,
   41, true, true, 1),

  (apparel_id,
   'Ori Signature Sweater',
   'Relaxed-fit crewneck pullover. Ori leaf logo screenprinted. Midweight fleece for year-round DC weather.',
   60.00, NULL,
   ARRAY['https://placehold.co/600x600/243425/C8922A?text=Ori+Sweater'],
   '[{"size":"S","color":"Forest","sku":"SWT-FO-S","inventory":6},{"size":"M","color":"Forest","sku":"SWT-FO-M","inventory":10},{"size":"L","color":"Forest","sku":"SWT-FO-L","inventory":8},{"size":"XL","color":"Forest","sku":"SWT-FO-XL","inventory":4}]'::jsonb,
   28, true, true, 2),

  (apparel_id,
   'Ori Community Tee',
   'Soft 100% organic cotton tee. The Ori leaf + "Flourish Naturally" tagline screen-printed on back. Relaxed unisex fit.',
   35.00, NULL,
   ARRAY['https://placehold.co/600x600/1A2E1F/F5F0E8?text=Ori+Tee'],
   '[{"size":"S","color":"Forest Green","sku":"TEE-FG-S","inventory":12},{"size":"M","color":"Forest Green","sku":"TEE-FG-M","inventory":15},{"size":"L","color":"Forest Green","sku":"TEE-FG-L","inventory":12},{"size":"XL","color":"Forest Green","sku":"TEE-FG-XL","inventory":8},{"size":"S","color":"Cream","sku":"TEE-CR-S","inventory":10},{"size":"M","color":"Cream","sku":"TEE-CR-M","inventory":12},{"size":"L","color":"Cream","sku":"TEE-CR-L","inventory":10}]'::jsonb,
   79, true, false, 3),

  (access_id,
   'Ori Gold Lighter — Zippo Style',
   'Matte gold windproof lighter with the Ori leaf logo engraved. Refillable. A collector''s daily carry.',
   28.00, NULL,
   ARRAY['https://placehold.co/600x600/C8922A/0D1B12?text=Ori+Lighter'],
   '[{"sku":"LIGHT-GOLD","inventory":30}]'::jsonb,
   30, true, true, 1),

  (access_id,
   'Ori Rolling Tray — Large',
   'Anodized aluminum rolling tray with Ori leaf motif. Non-stick surface, raised edges. 11"x7" — plenty of workspace.',
   32.00, NULL,
   ARRAY['https://placehold.co/600x600/0D1B12/C8922A?text=Ori+Tray'],
   '[{"sku":"TRAY-LRG","inventory":20}]'::jsonb,
   20, true, true, 2),

  (access_id,
   'Ori Rolling Tray — Mini',
   'Compact 7"x5" version of our signature rolling tray. Perfect for on-the-go.',
   18.00, NULL,
   ARRAY['https://placehold.co/600x600/243425/C8922A?text=Ori+Mini+Tray'],
   '[{"sku":"TRAY-MINI","inventory":25}]'::jsonb,
   25, true, false, 3),

  (collect_id,
   'Ori Sticker Pack — Vol. 1',
   '6 premium vinyl stickers. Ori wordmark, leaf logo, and "Flourish Naturally" designs. Weatherproof and UV-resistant.',
   12.00, NULL,
   ARRAY['https://placehold.co/600x600/1A2E1F/C8922A?text=Ori+Stickers'],
   '[{"sku":"STIX-V1","inventory":50}]'::jsonb,
   50, true, false, 1),

  (collect_id,
   'Ori Enamel Pin — Leaf',
   'Hard enamel collector pin. Forest green leaf on gold backing with butterfly clutch. 1.25" diameter.',
   15.00, NULL,
   ARRAY['https://placehold.co/600x600/C8922A/1A2E1F?text=Ori+Pin'],
   '[{"sku":"PIN-LEAF","inventory":40}]'::jsonb,
   40, true, true, 2);

END $$;

-- ─── Events ───────────────────────────────────────────────────────────────────
INSERT INTO public.events (title, description, date, start_time, end_time, location, address, is_free, active)
VALUES
  ('Cannabis Education Workshop',
   'Join Ori Company for an educational deep-dive into the endocannabinoid system, terpene science, and responsible cannabis use for medical patients. Light refreshments provided.',
   CURRENT_DATE + INTERVAL '7 days', '14:00', '16:00',
   'Ori Company Community Room', 'Washington, DC',
   true, true),

  ('Ori Community Wellness Day',
   'A free community wellness event featuring cannabis education stations, mindfulness activities, and local vendor markets. Come connect with the Ori family.',
   CURRENT_DATE + INTERVAL '21 days', '11:00', '17:00',
   'Malcolm X Park', 'Washington, DC',
   true, true),

  ('Patient Appreciation Night',
   'An exclusive appreciation event for our registered medical patients. Strain showcases, educational presentations from our budtenders, and community connection.',
   CURRENT_DATE + INTERVAL '14 days', '18:00', '21:00',
   'Ori Company', 'Washington, DC',
   true, true);

-- ─── About / Content Blocks ───────────────────────────────────────────────────
INSERT INTO public.content_blocks (section, key, value, sort_order) VALUES
  -- Company Overview
  ('company_overview', 'headline', 'Flourish Naturally, Live Better', 1),
  ('company_overview', 'body', 'Ori Company is a vertically integrated medical cannabis company rooted in Washington, DC. We cultivate, process, and distribute premium cannabis products with a commitment to patient wellness, community impact, and sustainable practice.', 2),
  ('company_overview', 'mission', 'Our mission is to empower individuals through education, compassion, and the highest-quality medical cannabis products — creating a healthier, more connected community.', 3),

  -- Company Video
  ('company_video', 'title', 'Our Story', 1),
  ('company_video', 'subtitle', 'How Ori began — from vision to community', 2),
  ('company_video', 'video_url', '', 3),
  ('company_video', 'poster_url', 'https://placehold.co/800x450/0D1B12/C8922A?text=Our+Story+Video', 4),

  -- Founder Video
  ('founder_video', 'title', 'From the Founder', 1),
  ('founder_video', 'subtitle', 'A personal message about purpose and healing', 2),
  ('founder_video', 'video_url', '', 3),
  ('founder_video', 'poster_url', 'https://placehold.co/800x450/0D1B12/F5F0E8?text=Founder+Video', 4),

  -- Values
  ('values', 'value_1_title', 'Innovation', 1),
  ('values', 'value_1_body', 'Pioneering cannabis education and access in Washington, DC through cutting-edge cultivation and product development.', 2),
  ('values', 'value_2_title', 'Integrity', 3),
  ('values', 'value_2_body', 'Transparent practices, honest patient care, and unwavering commitment to quality in everything we do.', 4),
  ('values', 'value_3_title', 'Well-being', 5),
  ('values', 'value_3_body', 'Holistic patient wellness through plant-based medicine, education, and personalized care.', 6),
  ('values', 'value_4_title', 'Sustainability', 7),
  ('values', 'value_4_body', 'Environmentally conscious cultivation, minimal-waste processing, and responsible business operations.', 8),
  ('values', 'value_5_title', 'Community', 9),
  ('values', 'value_5_body', 'Deeply rooted in and actively giving back to Washington, DC — the community that inspires everything we do.', 10),

  -- Community
  ('community', 'headline', 'Rooted in DC', 1),
  ('community', 'body', 'Ori Company was founded in Washington, DC and remains deeply committed to the communities we serve. We partner with local organizations, support economic development in underserved neighborhoods, and work to ensure equitable access to cannabis wellness. From patient education programs to community events at Malcolm X Park, Ori is more than a dispensary — we are neighbors, advocates, and partners in DC''s wellness future.', 2),

  -- Social Links
  ('social_links', 'youtube_label', 'Ori on YouTube', 1),
  ('social_links', 'youtube_url', 'https://www.youtube.com/@OriCompanyDC', 2),
  ('social_links', 'instagram_label', 'Ori on Instagram', 3),
  ('social_links', 'instagram_url', 'https://www.instagram.com/oricompanydc', 4);

-- ─── Knowledge Docs (RAG — Ori AI Seed Content) ──────────────────────────────
-- Note: Embeddings are generated by the ingest script (see supabase/functions/ingest-knowledge/)
-- These are the raw text documents. Run the ingest script to generate embeddings.
INSERT INTO public.knowledge_docs (title, content, category, tags) VALUES

  ('Cannabis and the Endocannabinoid System',
   'The endocannabinoid system (ECS) is a complex cell-signaling system present in all mammals. It was discovered in the early 1990s during research on THC (tetrahydrocannabinol). The ECS consists of three core components: endocannabinoids (naturally produced compounds that bind to cannabinoid receptors), receptors (CB1 receptors in the brain and nervous system; CB2 receptors in the immune system and peripheral tissues), and enzymes that break down endocannabinoids after they''ve served their function. The ECS regulates a wide range of functions including sleep, mood, appetite, memory, reproduction, and pain sensation. Cannabis interacts with the ECS primarily through THC (which binds to CB1 receptors) and CBD (which modulates receptor activity without direct binding). Understanding the ECS is essential for appreciating why cannabis affects so many different physiological systems.',
   'science', ARRAY['endocannabinoid', 'ECS', 'CB1', 'CB2', 'science', 'THC', 'CBD']),

  ('Cannabis History and Cultural Context',
   'Cannabis has one of the longest histories of human use of any plant. Archaeological evidence suggests cannabis cultivation began in Central Asia around 10,000 years ago. In ancient China, cannabis was used medicinally as early as 2700 BCE, recorded in the Shennong Bencao Jing (Divine Farmer''s Herb-Root Classic). Cannabis spread along the Silk Road to India, the Middle East, and eventually to Europe and the Americas. In India, cannabis (known as bhang, ganja, and charas) has been integral to Hindu spiritual practice for millennia. In the 19th century, cannabis tinctures were widely used in Western medicine. The plant was criminalized in the United States with the Marihuana Tax Act of 1937, largely driven by political and racial motivations rather than medical evidence. Washington, DC has a particularly significant history with cannabis policy — DC voters approved Initiative 71 in 2014, allowing personal possession and home cultivation. The medical cannabis program in DC provides regulated access for qualified patients.',
   'history', ARRAY['history', 'ancient', 'DC', 'culture', 'policy', 'initiative 71']),

  ('THC — Tetrahydrocannabinol',
   'THC (delta-9-tetrahydrocannabinol) is the primary psychoactive compound in cannabis. It was first isolated in 1964 by Israeli chemist Raphael Mechoulam. THC binds to CB1 receptors in the brain and nervous system, producing effects including euphoria, relaxation, altered sensory perception, increased appetite, and in some cases anxiety or paranoia at high doses. Medically, THC has been shown to help with pain management, nausea and vomiting (particularly from chemotherapy), sleep disorders, and stimulating appetite in patients with wasting conditions. THC percentage in cannabis products varies widely — from under 10% in hemp-adjacent varieties to over 30% in potent cultivars. Tolerance to THC develops with regular use. Important: THC produces psychoactive effects and affects everyone differently. Start low and go slow, particularly with new products or delivery methods. Always consult your physician about THC use if you have a medical condition.',
   'science', ARRAY['THC', 'tetrahydrocannabinol', 'cannabinoid', 'psychoactive', 'medical']),

  ('CBD — Cannabidiol',
   'CBD (cannabidiol) is a non-intoxicating cannabinoid found in cannabis and hemp. It does not bind directly to CB1 or CB2 receptors but modulates their activity and interacts with other receptor systems including serotonin (5-HT1A), TRPV1 (pain/inflammation), and GPR55 receptors. CBD has demonstrated therapeutic potential for: epilepsy (FDA-approved as Epidiolex), anxiety and stress, inflammation and pain, sleep quality, and nausea. CBD does not produce the "high" associated with THC. Many medical patients prefer CBD-dominant or balanced (1:1 THC:CBD) products for therapeutic benefit without significant psychoactivity. CBD may modulate THC''s effects — products with both cannabinoids often produce a more balanced experience due to the "entourage effect."',
   'science', ARRAY['CBD', 'cannabidiol', 'non-psychoactive', 'medical', 'wellness']),

  ('Terpenes — The Aromatic Science of Cannabis',
   'Terpenes are aromatic compounds produced by many plants, including cannabis. They give each cultivar its distinctive smell and flavor profile. In cannabis, terpenes work synergistically with cannabinoids to influence the overall effect — this is known as the "entourage effect." Key cannabis terpenes include: Myrcene (earthy, musky — the most common; associated with relaxing, sedating effects), Limonene (citrusy — associated with elevated mood and stress relief), Caryophyllene (spicy, peppery — the only terpene that also acts as a cannabinoid, binding to CB2 receptors; anti-inflammatory properties), Linalool (floral, lavender — associated with calming and anti-anxiety effects), Pinene (pine — associated with alertness and memory retention), Terpinolene (complex, floral/fruity — associated with uplifting effects), and Ocimene (sweet, woody — associated with energizing effects). When choosing a cannabis product, the terpene profile can be as informative as the THC/CBD percentages.',
   'science', ARRAY['terpenes', 'myrcene', 'limonene', 'caryophyllene', 'entourage effect', 'aroma']),

  ('Indica, Sativa, Hybrid — What the Terms Mean',
   'The terms "indica," "sativa," and "hybrid" are widely used in cannabis retail, but modern cannabis science has refined our understanding of what they mean. Botanically, Cannabis indica and Cannabis sativa are distinct subspecies with different growth patterns. Indica plants tend to be shorter and bushier; sativa plants taller and more slender. Historically, these terms were used to predict effects: indica = relaxing/body-focused/sedating; sativa = energizing/cerebral/uplifting; hybrid = somewhere in between. However, modern research suggests that the indica/sativa distinction is not a reliable predictor of effects. The terpene profile and cannabinoid content are more accurate predictors of how a product will affect you. At Ori Company, we provide terpene profiles alongside indica/sativa classification so patients can make more informed choices. As a general educational guide: products marketed as indica tend to have more myrcene and linalool; sativas tend toward limonene and terpinolene. Always consult with a budtender for personalized guidance.',
   'science', ARRAY['indica', 'sativa', 'hybrid', 'classification', 'effects', 'terpenes']),

  ('Consumption Methods and Bioavailability',
   'Cannabis can be consumed in multiple ways, each with different onset times, duration, and bioavailability: Inhalation (smoking/vaping): Fastest onset (minutes), shorter duration (1-3 hours), bioavailability 10-35%. Good for immediate symptom relief. Sublingual (tinctures under tongue): Onset 15-45 minutes, duration 3-6 hours, bioavailability 20-30%. Good for consistent dosing. Oral (edibles, capsules, honey): Slowest onset (30 min - 2 hours), longest duration (4-8+ hours), bioavailability 4-20% but more variable. Effects can be more intense — start with low doses. Topical (lotions, balms): Localized effects, minimal systemic absorption, no intoxication. Good for localized discomfort. At Ori Company, our menu offers flower, pre-rolls (inhalation), tinctures (sublingual), and honey/tea (oral). Our budtenders can help you choose the right method for your wellness goals.',
   'science', ARRAY['consumption', 'bioavailability', 'edibles', 'tincture', 'inhalation', 'onset']),

  ('DC Medical Cannabis Program',
   'Washington, DC has one of the oldest medical cannabis programs in the United States, dating to the Legalization of Marijuana for Medical Treatment Act of 1998 (though implementation was delayed until 2013). The DC medical cannabis program is regulated by the Department of Health (DOH). Qualifying conditions include: cancer, HIV/AIDS, glaucoma, multiple sclerosis, seizure disorder, severe and persistent muscle spasms, and other conditions as determined by the patient''s physician. To participate, DC residents need a written recommendation from a licensed DC physician, registration with the DOH, and a valid medical cannabis card. Non-DC residents with a valid medical cannabis card from another state may purchase from DC dispensaries under reciprocity provisions (verify current status). Ori Company operates in full compliance with DC medical cannabis regulations. Our staff can answer questions about the registration process.',
   'regulations', ARRAY['DC', 'medical', 'program', 'DOH', 'regulations', 'patient', 'registration']),

  ('Ori Company Product Guide — Cannabis Flower',
   'Ori Company offers premium cannabis flower in multiple formats. Our Origin Reserve is our signature indoor-grown hybrid cultivar — dense, aromatic buds with 23-24% THC. Available in 3.5g, 7g, 14g, and 28g portions. Sol Sativa is our daytime cultivar — energizing, uplifting, and clear-headed. Luna Indica is our evening cultivar — deeply relaxing with body-forward effects. Balance CBD is our wellness cultivar — high-CBD for patients seeking therapeutic support with minimal psychoactivity. All flower is grown indoors under LED lighting, hand-trimmed, and third-party tested for potency and purity. Reservations are available through the Ori App — products are reserved for up to 24 hours and purchased onsite.',
   'products', ARRAY['flower', 'origin reserve', 'sativa', 'indica', 'CBD', 'ori products']),

  ('Responsible Cannabis Use',
   'Ori Company is committed to responsible cannabis education. Key principles for safe use: Start low, go slow — especially with new products, delivery methods, or higher-potency items. Know your tolerance — cannabis affects everyone differently based on body weight, metabolism, genetics, and experience. Never drive or operate machinery while impaired. Keep cannabis products away from children and pets. Be aware of your environment and legal status. Cannabis and alcohol together can intensify effects unpredictably. If you experience anxiety or discomfort: move to a calm environment, breathe deeply, drink water, and rest. CBD can help moderate THC-induced anxiety. Seek medical attention if symptoms are severe. Medical patients: always discuss cannabis use with your physician, especially if you take prescription medications, as cannabis can interact with certain drugs. This information is educational only. Ori Company does not provide medical advice.',
   'wellness', ARRAY['responsible', 'safety', 'dosing', 'education', 'patients', 'guidelines']);
