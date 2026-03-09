export type ProductType = 'batom' | 'blush' | 'base' | 'contour' | 'brows';

export interface ColorSwatch {
  name: string;
  hex: string;
}

export interface ProductInfo {
  label: string;
  description: string;
  swatches: ColorSwatch[];
  defaultOpacity: number;
  defaultColor: string;
}

export const PRODUCT_CONFIG: Record<ProductType, ProductInfo> = {
  batom: {
    label: 'Batom',
    description: 'Matte, cremoso e brilhante',
    defaultOpacity: 0.85,
    defaultColor: '#C4637A',
    swatches: [
      { name: 'Classic Red',   hex: '#C02030' },
      { name: 'Berry Bold',    hex: '#8B1A4A' },
      { name: 'Wine Night',    hex: '#6B2A3A' },
      { name: 'Rose Nude',     hex: '#C4637A' },
      { name: 'Coral Summer',  hex: '#E06040' },
      { name: 'Peach Glow',    hex: '#D4845A' },
      { name: 'Nude Rose',     hex: '#C09080' },
      { name: 'Mauve Dream',   hex: '#B8748A' },
    ],
  },
  blush: {
    label: 'Blush',
    description: 'Matte e cintilante',
    defaultOpacity: 0.6,
    defaultColor: '#E8A0A8',
    swatches: [
      { name: 'Peach Glow',    hex: '#F0A070' },
      { name: 'Rose Petal',    hex: '#E8A0A8' },
      { name: 'Coral Flush',   hex: '#E87060' },
      { name: 'Berry Blush',   hex: '#C46378' },
      { name: 'Mauve Rose',    hex: '#D07080' },
      { name: 'Bronze Glow',   hex: '#C89060' },
      { name: 'Warm Nude',     hex: '#DBAAA0' },
      { name: 'Deep Rose',     hex: '#B85870' },
    ],
  },
  base: {
    label: 'Base',
    description: 'Matte, natural, luminosa e HD',
    defaultOpacity: 0.45,
    defaultColor: '#E8C9B0',
    swatches: [
      { name: 'Porcelana',     hex: '#F5E8D8' },
      { name: 'Bege Claro',    hex: '#F0D8C0' },
      { name: 'Natural',       hex: '#E8C9B0' },
      { name: 'Dourado',       hex: '#D4AF8C' },
      { name: 'Mel',           hex: '#C4906A' },
      { name: 'Caramelo',      hex: '#A0704A' },
      { name: 'Cacau',         hex: '#8A5A3A' },
      { name: 'Ebano',         hex: '#6B4020' },
    ],
  },
  contour: {
    label: 'Contorno',
    description: 'Esculpe e define o rosto',
    defaultOpacity: 0.5,
    defaultColor: '#9A7060',
    swatches: [
      { name: 'Taupe Suave',   hex: '#A08070' },
      { name: 'Nude Marrom',   hex: '#9A7060' },
      { name: 'Tawny',         hex: '#8B6B5A' },
      { name: 'Terracotta',    hex: '#9A6850' },
      { name: 'Bronze',        hex: '#885040' },
      { name: 'Mogno',         hex: '#7A5038' },
      { name: 'Café',          hex: '#6B4020' },
      { name: 'Vinho',         hex: '#7A4855' },
    ],
  },
  brows: {
    label: 'Sobrancelha',
    description: 'Define e preenche',
    defaultOpacity: 0.7,
    defaultColor: '#5A3D2B',
    swatches: [
      { name: 'Loiro',         hex: '#C4A882' },
      { name: 'Castanho Claro',hex: '#8A6558' },
      { name: 'Marrom Natural',hex: '#6B4B3E' },
      { name: 'Marrom Escuro', hex: '#5A3D2B' },
      { name: 'Café Intenso',  hex: '#6B4020' },
      { name: 'Cinza',         hex: '#6A6A6A' },
      { name: 'Preto Suave',   hex: '#3D1F2A' },
      { name: 'Preto',         hex: '#2A1A12' },
    ],
  },
};

export const PRODUCT_CATALOG: { type: ProductType; image: string; subtitle: string }[] = [
  { type: 'batom',   image: '💄', subtitle: 'Matte, cremoso e brilhante' },
  { type: 'blush',   image: '🌸', subtitle: 'Matte e cintilante' },
  { type: 'base',    image: '✦',  subtitle: 'Matte, natural, luminosa e HD' },
  { type: 'contour', image: '◐',  subtitle: 'Esculpe e define o rosto' },
  { type: 'brows',   image: '〜',  subtitle: 'Define e preenche' },
];
