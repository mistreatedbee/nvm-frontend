export const vendors = [{
  id: '1',
  name: "Mama K's Textiles",
  specialty: 'Authentic Kente & Ankara',
  location: 'Accra Market Hub',
  image: 'https://images.unsplash.com/photo-1530263503756-b38229559733?auto=format&fit=crop&q=80&w=800',
  rating: 4.9,
  description: 'Hand-woven fabrics sourced directly from master weavers in the Volta Region. We specialize in ceremonial Kente and vibrant Ankara prints perfect for modern fashion.',
  products: ['p1', 'p2', 'p3']
}, {
  id: '2',
  name: "Ojo's Ceramics",
  specialty: 'Handcrafted Pottery',
  location: 'Lagos Creative District',
  image: 'https://images.unsplash.com/photo-1565193566173-7a64b27876e9?auto=format&fit=crop&q=80&w=800',
  rating: 4.8,
  description: 'Traditional pottery techniques meets contemporary design. Our clay is locally sourced and fired in wood-burning kilns for unique, earthy finishes.',
  products: ['p4', 'p5']
}, {
  id: '3',
  name: 'Zara Spices & Herbs',
  specialty: 'Organic Spice Blends',
  location: 'Zanzibar Spice Market',
  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
  rating: 5.0,
  description: 'Aromatic blends that bring the taste of Africa to your kitchen. From Berbere to Ras el Hanout, our spices are sun-dried and ground fresh daily.',
  products: ['p6', 'p7', 'p8']
}, {
  id: '4',
  name: 'Ubuntu Crafts',
  specialty: 'Wood Carvings & Masks',
  location: 'Cape Town Artisan Quarter',
  image: 'https://images.unsplash.com/photo-1499242330351-0d32b5eb7845?auto=format&fit=crop&q=80&w=800',
  rating: 4.7,
  description: 'Preserving heritage through wood. Our collective of artisans creates stunning masks, sculptures, and functional homeware from sustainable timber.',
  products: ['p9']
}];
export const products = [{
  id: 'p1',
  vendorId: '1',
  name: 'Royal Gold Kente Cloth',
  price: 120.0,
  category: 'Textiles',
  image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&q=80&w=800',
  description: 'Premium cotton blend Kente cloth with gold threading. Perfect for weddings and special occasions. 6 yards.'
}, {
  id: 'p2',
  vendorId: '1',
  name: 'Vibrant Wax Print - Blue',
  price: 45.0,
  category: 'Textiles',
  image: 'https://images.unsplash.com/photo-1622617711974-904f479495b0?auto=format&fit=crop&q=80&w=800',
  description: 'High-quality Dutch wax print in striking blue and orange patterns. 100% cotton, colorfast.'
}, {
  id: 'p3',
  vendorId: '1',
  name: 'Mudcloth Throw Blanket',
  price: 85.0,
  category: 'Home Decor',
  image: 'https://images.unsplash.com/photo-1617325247661-675ab4b64ae8?auto=format&fit=crop&q=80&w=800',
  description: 'Authentic Malian mudcloth (Bògòlanfini). Hand-dyed with fermented mud for rich, earthy tones.'
}, {
  id: 'p4',
  vendorId: '2',
  name: 'Terracotta Water Jug',
  price: 55.0,
  category: 'Ceramics',
  image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&q=80&w=800',
  description: 'Naturally cooling terracotta jug. Hand-thrown and unglazed to maintain water freshness.'
}, {
  id: 'p5',
  vendorId: '2',
  name: 'Painted Clay Bowl Set',
  price: 65.0,
  category: 'Ceramics',
  image: 'https://images.unsplash.com/photo-1605333396915-47ed6b68a00e?auto=format&fit=crop&q=80&w=800',
  description: 'Set of 3 nesting bowls featuring traditional geometric patterns painted in indigo and ochre.'
}, {
  id: 'p6',
  vendorId: '3',
  name: 'Ethiopian Berbere Blend',
  price: 15.0,
  category: 'Food',
  image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&q=80&w=800',
  description: 'Fiery and complex spice blend essential for Doro Wat. Contains chili, garlic, ginger, basil, and more.'
}, {
  id: 'p7',
  vendorId: '3',
  name: 'Moroccan Ras el Hanout',
  price: 18.0,
  category: 'Food',
  image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?auto=format&fit=crop&q=80&w=800',
  description: "The 'head of the shop' blend. Over 20 spices including rose petals, saffron, and cardamom."
}, {
  id: 'p8',
  vendorId: '3',
  name: 'Dried Hibiscus Flowers',
  price: 12.0,
  category: 'Food',
  image: 'https://images.unsplash.com/photo-1564493393609-b6574d284773?auto=format&fit=crop&q=80&w=800',
  description: 'Premium dried hibiscus for making Bissap or Zobo drink. Tart, floral, and rich in Vitamin C.'
}, {
  id: 'p9',
  vendorId: '4',
  name: 'Ebony Wood Mask',
  price: 150.0,
  category: 'Art',
  image: 'https://images.unsplash.com/photo-1550948537-130a1ce83314?auto=format&fit=crop&q=80&w=800',
  description: 'Hand-carved ebony mask representing protection. Polished to a high sheen with natural beeswax.'
}];
export const categories = [{
  id: 'all',
  name: 'All Market'
}, {
  id: 'textiles',
  name: 'Textiles & Fabrics'
}, {
  id: 'ceramics',
  name: 'Pottery & Ceramics'
}, {
  id: 'food',
  name: 'Spices & Food'
}, {
  id: 'art',
  name: 'Art & Decor'
}];