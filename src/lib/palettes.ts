// Centralized color palettes for A/B testing
// Access via routes: /1, /2, /3, /4, /5

export interface ColorPalette {
  name: string;
  description: string;
  bg: string;
  bgAlt: string;
  text: string;
  textMuted: string;
  textLight: string;
  accent: string;
  accentLight: string;
  border: string;
  borderLight: string;
  success: string;
  // Optional extras
  highlight?: string;
  overlay?: string;
}

// Palette 1: Modern Minimalism
// Clean, contemporary with Carbon Black accents
export const modernMinimalism: ColorPalette = {
  name: 'Modern Minimalism',
  description: 'Clean contemporary design with Carbon Black accents',
  bg: '#fafaff',           // Ghost White
  bgAlt: '#eef0f2',        // Platinum
  text: '#1c1c1c',         // Carbon Black
  textMuted: '#4a4a4a',    // Dark gray
  textLight: '#7a7a7a',    // Medium gray
  accent: '#1c1c1c',       // Carbon Black
  accentLight: '#daddd8',  // Dust Grey
  border: '#daddd8',       // Dust Grey
  borderLight: '#ecebe4',  // Parchment
  success: '#2d8a4e',
  highlight: '#ecebe4',    // Parchment
};

// Palette 2: Aman Luxury
// Warm earth tones inspired by Aman resorts
export const amanLuxury: ColorPalette = {
  name: 'Aman Luxury',
  description: 'Warm earth tones inspired by uber-luxury Aman resorts',
  bg: '#F7F5F0',           // Warm Linen
  bgAlt: '#EDE9E1',        // Soft Sand
  text: '#2C2926',         // Charcoal Teak
  textMuted: '#5C534A',    // Warm Stone
  textLight: '#8A7F72',    // Desert Sand
  accent: '#6B5344',       // Burnished Bronze
  accentLight: '#C4B8A8',  // River Stone
  border: '#D8D0C4',       // Sandstone
  borderLight: '#E8E3DA',  // Morning Mist
  success: '#5C7A5C',      // Sage green
  highlight: '#A69471',    // Aged Gold
};

// Palette 3: Light Steel
// Cool grays with professional feel
export const lightSteel: ColorPalette = {
  name: 'Light Steel',
  description: 'Cool grays with professional, tech-forward feel',
  bg: '#f8f9fa',           // Bright Snow
  bgAlt: '#e9ecef',        // Platinum
  text: '#212529',         // Shadow Grey
  textMuted: '#495057',    // Iron Grey
  textLight: '#6c757d',    // Slate Grey
  accent: '#343a40',       // Gunmetal
  accentLight: '#ced4da',  // Pale Slate
  border: '#dee2e6',       // Alabaster Grey
  borderLight: '#e9ecef',  // Platinum
  success: '#2d8a4e',
  highlight: '#adb5bd',    // Pale Slate dark
};

// Palette 4: Stormy Academic
// Deep blues and teals with scholarly prestige
export const stormyAcademic: ColorPalette = {
  name: 'Stormy Academic',
  description: 'Deep blues and teals with scholarly prestige',
  bg: '#ffffff',           // White - clean canvas
  bgAlt: '#d9d9d9',        // Dust Grey
  text: '#353535',         // Graphite
  textMuted: '#284b63',    // Yale Blue
  textLight: '#3c6e71',    // Stormy Teal
  accent: '#284b63',       // Yale Blue - primary accent
  accentLight: '#3c6e71',  // Stormy Teal
  border: '#d9d9d9',       // Dust Grey
  borderLight: '#e8e8e8',  // Light grey
  success: '#3c6e71',      // Stormy Teal
  highlight: '#3c6e71',    // Stormy Teal
};

// Palette 5: Aman Noir
// High-contrast luxury dark theme for crypto audience
// Inspired by Aman elegance but with bold drama to capture attention
export const amanNoir: ColorPalette = {
  name: 'Aman Noir',
  description: 'High-contrast luxury dark theme - refined elegance meets crypto boldness',
  bg: '#0C0C0C',           // Obsidian - deep dramatic black
  bgAlt: '#1A1A1A',        // Charcoal - subtle elevation
  text: '#FAF8F5',         // Warm Ivory - luxurious white
  textMuted: '#B8B0A8',    // Stone - warm muted
  textLight: '#7A756E',    // Dusk - subtle text
  accent: '#C9A962',       // Burnished Gold - premium accent
  accentLight: '#2A2520',  // Dark Bronze - subtle accent bg
  border: '#2A2520',       // Dark Bronze - borders
  borderLight: '#1A1A1A',  // Charcoal - light borders
  success: '#7A9E7A',      // Sage - success state
  highlight: '#C9A962',    // Burnished Gold
  overlay: 'rgba(12, 12, 12, 0.95)', // For modals
};

// All palettes indexed
export const palettes: Record<string, ColorPalette> = {
  '1': modernMinimalism,
  '2': amanLuxury,
  '3': lightSteel,
  '4': stormyAcademic,
  '5': amanNoir,
};

export const getPalette = (id: string): ColorPalette => {
  return palettes[id] || lightSteel; // Default to Light Steel
};

// Helper to determine if palette is dark mode
export const isDarkPalette = (id: string): boolean => {
  return id === '5'; // Aman Noir is dark
};
