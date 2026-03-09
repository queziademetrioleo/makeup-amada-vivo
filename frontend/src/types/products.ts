export type ProductCategory =
  | 'lipstick'
  | 'blush'
  | 'contour'
  | 'foundation'
  | 'brows'
  | 'eyeshadow'
  | 'corretivo';

export interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  colors: ProductColor[];
  description: string;
  rating: number;
  reviewCount: number;
  badge?: string; // "Novo" | "Top vendas" etc.
}
