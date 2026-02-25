// Auto-generated from tokens.json - DO NOT EDIT

export const colors = {
  gray: {
    '01': '#5F5D57',
    '02': '#6D6B65',
    '03': '#7E7C76',
    '04': '#8D8B85',
    '05': '#9B9993',
    '06': '#A8A6A0',
    '07': '#B9B7B1',
    '08': '#CDCBC5',
    '09': '#DCDAD4',
    '10': '#E8E5DE',
    '11': '#ECE9E3',
    '12': '#F3F1ED',
    '13': '#F9F8F6',
    '14': '#FCFCFC',
  },
  accent: {
    'pink': '#FFC4E1',
    'pink-light': '#FFD6D2',
    'yellow': '#FFF0CE',
    'yellow-bright': '#FFFBBC',
    'lime': '#EEFFAF',
    'lime-light': '#E1FFD0',
    'green': '#C1F2CE',
    'blue': '#BEF1FF',
    'purple': '#E1E1FF',
    'lavender': '#F0E6FF',
  },
  semantic: {
    'error': '#E67853',
    'warning': '#E8A540',
    'success': '#6EC18E',
  },
} as const

export type GrayScale = keyof typeof colors.gray
export type AccentColor = keyof typeof colors.accent
export type SemanticColor = keyof typeof colors.semantic
export type ColorToken = GrayScale | AccentColor | SemanticColor
