export const colors = {
  primary: '#1AA6A6',
  primaryDark: '#128585',
  primaryLight: '#E3F6F6',
  background: '#F3F7FA',
  surface: '#FFFFFF',
  border: '#E1E8ED',
  text: '#1F2A33',
  textMuted: '#6B7C86',
  textFaint: '#9AABB4',
  danger: '#D64545',
  warning: '#E0A82E',
  success: '#2FA66A',
  pendingBg: '#FFF4DE',
  pendingText: '#B9811E',
  acceptedBg: '#E3F6EF',
  acceptedText: '#1F8A5C',
  overlay: 'rgba(15, 30, 36, 0.45)',
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 20,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

export const typography = {
  h1: { fontSize: 24, fontWeight: '700' as const, color: colors.text },
  h2: { fontSize: 19, fontWeight: '700' as const, color: colors.text },
  body: { fontSize: 15, fontWeight: '400' as const, color: colors.text },
  bodyMuted: { fontSize: 14, fontWeight: '400' as const, color: colors.textMuted },
  label: { fontSize: 13, fontWeight: '600' as const, color: colors.textMuted },
  question: { fontSize: 20, fontWeight: '600' as const, color: colors.text, lineHeight: 28 },
};

export const shadow = {
  card: {
    shadowColor: '#0F1E24',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
};
