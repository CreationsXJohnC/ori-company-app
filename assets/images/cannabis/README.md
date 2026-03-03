# Cannabis Product Images

Drop product photos here for the Ori Menu (reservation items).

## Naming convention
Use the product name in lowercase with hyphens:
  flower-sativa-001.jpg
  concentrate-wax-001.jpg
  tincture-cbd-001.jpg

## Recommended specs
- Format: JPG or PNG
- Size: 800×800 px minimum (square crop looks best in the grid)
- Aspect ratio: 1:1 or 4:3

## Wiring up
In the Supabase dashboard, set `menu_products.image_url` to a public URL
(Supabase Storage bucket "product-images" or any CDN URL).
The app uses expo-image which handles caching automatically.
