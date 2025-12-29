// Anuma AI Color Palette
// Primary: #93653D (Copper/Bronze)
// Secondary: #C57741 (Warm Copper)

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
  highlight?: string;
  overlay?: string;
}

// Anuma Sanctuary - The one and only palette
export const anumaSanctuary: ColorPalette = {
  name: 'Anuma Sanctuary',
  description: 'Warm cognitive sanctuary with copper/bronze elegance',
  bg: '#F5F3EE',           // Warm off-white
  bgAlt: '#EBE8E1',        // Soft cream
  text: '#93653D',         // Primary copper/bronze
  textMuted: '#A67B4F',    // Lighter bronze
  textLight: '#C4A77D',    // Muted tan
  accent: '#93653D',       // Primary copper
  accentLight: '#E8E3DA',  // Light sand
  border: '#DDD8CE',       // Warm border
  borderLight: '#EBE8E1',  // Light border
  success: '#6B8E5A',      // Sage green
  highlight: '#C57741',    // Secondary copper/orange
  overlay: 'rgba(245, 243, 238, 0.95)',
};

// Export the single palette for all routes (backwards compatibility)
export const palettes: Record<string, ColorPalette> = {
  '1': anumaSanctuary,
  '2': anumaSanctuary,
  '3': anumaSanctuary,
  '4': anumaSanctuary,
  '5': anumaSanctuary,
  '6': anumaSanctuary,
};

export const getPalette = (id: string): ColorPalette => {
  return anumaSanctuary;
};

// No dark mode - Anuma is always light
export const isDarkPalette = (id: string): boolean => {
  return false;
};
