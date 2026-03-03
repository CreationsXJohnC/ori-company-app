# Merch / Clothing Product Images

Drop product photos here for the Ori Clothing & Co shop.

## Naming convention
Use the product name in lowercase with hyphens:
  hoodie-black-front.jpg
  cap-ori-logo.jpg
  tote-bag-001.jpg

## Recommended specs
- Format: JPG or PNG
- Size: 800×800 px minimum (square crop looks best in the grid)
- Multiple angles: front, back, detail shots
- Aspect ratio: 1:1 preferred

## Wiring up
In the Supabase dashboard, set `shop_products.images` (text array) to an array
of public URLs. The app displays images[0] as the primary product thumbnail.
Example: '{"https://your-cdn.com/merch/hoodie-black-front.jpg","https://..."}'
