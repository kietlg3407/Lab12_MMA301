export const COLORS = {
  primary: '#6200EE',
  primaryDark: '#4A00B0',
  primaryLight: '#EDE7F6',
  background: '#F6F7FB',
  surface: '#FFFFFF',
  text: '#1C1F2E',
  secondaryText: '#757575',
  border: '#E3E7F0',
  success: '#4CAF50',
  warning: '#FF9800',
  danger: '#B00020',
  error: '#B00020',
  featured: '#FF5722',
  gold: '#FFC107',
};

export const CATEGORIES = ['Laptop', 'Desktop', 'Component'];

export function formatCurrency(value) {
  return `$${Number(value || 0).toLocaleString('en-US', {
    maximumFractionDigits: 2,
  })}`;
}

export function formatInteger(value) {
  return Number(value || 0).toLocaleString('en-US');
}

