// Centralized color palettes for A/B testing
// Access via routes: /1, /2, /3, /4, /5, /6

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

// Palette 4: Royal Violet
// Deep purple luxury with high contrast - regal and distinctive
export const royalViolet: ColorPalette = {
  name: 'Royal Violet',
  description: 'Deep purple luxury - regal, distinctive, premium',
  bg: '#0D0A14',           // Deep Void - near-black purple
  bgAlt: '#1A1525',        // Midnight Grape
  text: '#F5F0FF',         // Lavender White
  textMuted: '#C4B8D9',    // Soft Mauve
  textLight: '#8B7AA8',    // Dusty Violet
  accent: '#9D4EDD',       // Electric Violet - bold accent
  accentLight: '#2D1F42',  // Dark Plum
  border: '#2D1F42',       // Dark Plum
  borderLight: '#1A1525',  // Midnight Grape
  success: '#7CB342',      // Lime success
  highlight: '#E040FB',    // Magenta highlight
  overlay: 'rgba(13, 10, 20, 0.95)',
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

// Palette 6: Cyber Neon
// INSANE cyberpunk palette - electric, bold, futuristic
// Maximum attention for crypto audience
export const cyberNeon: ColorPalette = {
  name: 'Cyber Neon',
  description: 'Cyberpunk insanity - electric neon on void black',
  bg: '#0A0A0F',           // Void Black
  bgAlt: '#12121A',        // Deep Space
  text: '#00FFFF',         // Cyan - main text (yes, colored text!)
  textMuted: '#00D4D4',    // Muted Cyan
  textLight: '#0099AA',    // Dark Cyan
  accent: '#FF00FF',       // Hot Magenta - primary accent
  accentLight: '#1A0A1A',  // Dark Magenta bg
  border: '#1A1A2E',       // Electric Border
  borderLight: '#12121A',  // Deep Space
  success: '#00FF88',      // Neon Green
  highlight: '#FFFF00',    // Electric Yellow
  overlay: 'rgba(10, 10, 15, 0.95)',
};

// All palettes indexed
export const palettes: Record<string, ColorPalette> = {
  '1': modernMinimalism,
  '2': amanLuxury,
  '3': lightSteel,
  '4': royalViolet,
  '5': amanNoir,
  '6': cyberNeon,
};

export const getPalette = (id: string): ColorPalette => {
  return palettes[id] || lightSteel; // Default to Light Steel
};

// Helper to determine if palette is dark mode
export const isDarkPalette = (id: string): boolean => {
  return ['4', '5', '6'].includes(id); // Royal Violet, Aman Noir, Cyber Neon are dark
};
