// SVG Pattern definitions for African textile inspirations
// These are simple geometric paths that can be tiled

export type PatternType = 'kente' | 'mudcloth' | 'ankara' | 'zigzag' | 'diamonds' | 'geometric';
export const patterns = {
  kente: {
    // Interlocking geometric shapes
    path: `M0 0h20v20H0z M0 0l20 20M20 0L0 20`,
    viewBox: '0 0 20 20',
    name: 'Kente Geometric'
  },
  mudcloth: {
    // Traditional mudcloth symbols (arrows/lines)
    path: `M10 0L20 10L10 20L0 10Z M5 5h10v10H5z`,
    viewBox: '0 0 20 20',
    name: 'Mudcloth Symbols'
  },
  ankara: {
    // Circular/organic motifs
    path: `M10 10m-8 0a8 8 0 1 0 16 0a8 8 0 1 0 -16 0 M10 10m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`,
    viewBox: '0 0 20 20',
    name: 'Ankara Circles'
  },
  zigzag: {
    // Sharp zigzags
    path: `M0 10 L5 0 L10 10 L15 0 L20 10 L20 20 L15 10 L10 20 L5 10 L0 20 Z`,
    viewBox: '0 0 20 20',
    name: 'Zigzag Energy'
  },
  diamonds: {
    // Diamond grid
    path: `M10 0 L20 10 L10 20 L0 10 Z`,
    viewBox: '0 0 20 20',
    name: 'Diamond Grid'
  },
  geometric: {
    // Modern geometric pattern
    path: `M0 0h10v10H0z M10 10h10v10H10z M0 10h5v5H0z M15 0h5v5h-5z`,
    viewBox: '0 0 20 20',
    name: 'Geometric Shapes'
  }
};
export const getPatternStyle = (type: PatternType, color: string = 'currentColor', opacity: number = 0.1) => {
  const pattern = patterns[type];
  // Create a data URI for the SVG pattern
  const svg = `
    <svg width="40" height="40" viewBox="${pattern.viewBox}" xmlns="http://www.w3.org/2000/svg">
      <path d="${pattern.path}" fill="${color}" fill-opacity="${opacity}" />
    </svg>
  `.trim();
  return {
    backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
    backgroundRepeat: 'repeat'
  };
};