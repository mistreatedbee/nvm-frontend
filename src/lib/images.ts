export const DEFAULT_IMAGE_DATA_URI =
  // Simple gray placeholder SVG (no network dependency).
  `data:image/svg+xml;charset=utf-8,` +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <path d="M70 210l55-65 45 52 35-40 55 53v20H70z" fill="#d1d5db"/>
      <circle cx="120" cy="110" r="18" fill="#d1d5db"/>
      <text x="50%" y="92%" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#9ca3af">No image</text>
    </svg>`
  );

