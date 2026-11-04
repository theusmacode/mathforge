export type ToolStatus = 'available' | 'planned'
export interface Category { id: string; name: string; description: string; glyph: string; hue: string; subcategories: string[] }
export interface Tool {
  id: string; name: string; description: string
  category: string; subcategory: string; glyph: string
  keywords: string[]; status: ToolStatus
}
