export interface ColorPreset {
  name: string;
  hex: string;
  textColor?: string;
  isLight?: boolean;
}

export const POPULAR_COLOR_PRESETS: ColorPreset[] = [
  { name: 'Black', hex: '#111827' },
  { name: 'Navy Blue', hex: '#1E3A8A' },
  { name: 'Maroon', hex: '#7F1D1D' },
  { name: 'Wine', hex: '#581C87' },
  { name: 'Olive Green', hex: '#3F6212' },
  { name: 'Bottle Green', hex: '#064E3B' },
  { name: 'Royal Blue', hex: '#2563EB' },
  { name: 'Sky Blue', hex: '#38BDF8' },
  { name: 'White', hex: '#FFFFFF', isLight: true },
  { name: 'Cream / Off White', hex: '#FDF6E2', isLight: true },
  { name: 'Beige / Tan', hex: '#D4B996', isLight: true },
  { name: 'Red', hex: '#DC2626' },
  { name: 'Rani Pink / Magenta', hex: '#BE185D' },
  { name: 'Baby Pink', hex: '#F472B6' },
  { name: 'Mustard / Yellow', hex: '#EAB308' },
  { name: 'Orange / Rust', hex: '#EA580C' },
  { name: 'Purple', hex: '#7C3AED' },
  { name: 'Lavender', hex: '#C084FC' },
  { name: 'Teal', hex: '#0D9488' },
  { name: 'Grey / Charcoal', hex: '#4B5563' },
  { name: 'Peach', hex: '#FDBA74', isLight: true },
  { name: 'Brown / Coffee', hex: '#78350F' }
];

export function getColorHexFromName(colorName?: string, defaultHex = '#1E3A8A'): string {
  if (!colorName) return defaultHex;
  const name = colorName.trim().toLowerCase();

  // If already a valid hex code
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(name)) {
    return name;
  }

  // Look for exact or substring match
  if (name.includes('black') || name.includes('jet black')) return '#111827';
  if (name.includes('navy') || name.includes('dark blue')) return '#1E3A8A';
  if (name.includes('royal blue') || name.includes('cobalt')) return '#2563EB';
  if (name.includes('sky blue') || name.includes('light blue') || name.includes('ice blue')) return '#38BDF8';
  if (name.includes('maroon') || name.includes('wine') || name.includes('burgundy')) return '#7F1D1D';
  if (name.includes('olive') || name.includes('army green') || name.includes('mehendi')) return '#3F6212';
  if (name.includes('bottle green') || name.includes('dark green')) return '#064E3B';
  if (name.includes('emerald') || name.includes('mint') || name.includes('pista')) return '#059669';
  if (name.includes('off white') || name.includes('cream') || name.includes('ivory')) return '#FDF6E2';
  if (name.includes('white') || name.includes('pure white')) return '#FFFFFF';
  if (name.includes('beige') || name.includes('khaki') || name.includes('tan') || name.includes('nude')) return '#D4B996';
  if (name.includes('rani') || name.includes('magenta') || name.includes('fuchsia') || name.includes('hot pink')) return '#BE185D';
  if (name.includes('pink') || name.includes('baby pink') || name.includes('rose')) return '#F472B6';
  if (name.includes('red') || name.includes('crimson') || name.includes('scarlet')) return '#DC2626';
  if (name.includes('mustard') || name.includes('haldi') || name.includes('yellow') || name.includes('gold')) return '#EAB308';
  if (name.includes('rust') || name.includes('orange') || name.includes('saffron')) return '#EA580C';
  if (name.includes('purple') || name.includes('violet') || name.includes('plum')) return '#7C3AED';
  if (name.includes('lavender') || name.includes('lilac')) return '#C084FC';
  if (name.includes('teal') || name.includes('peacock blue')) return '#0D9488';
  if (name.includes('charcoal') || name.includes('dark grey') || name.includes('grey') || name.includes('gray')) return '#4B5563';
  if (name.includes('peach') || name.includes('coral') || name.includes('salmon')) return '#FDBA74';
  if (name.includes('brown') || name.includes('chocolate') || name.includes('coffee')) return '#78350F';

  return defaultHex;
}
