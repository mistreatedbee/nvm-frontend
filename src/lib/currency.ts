// Currency formatting for South African Rands
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

// Format without symbol
export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Simple format with R
export const formatRands = (amount: number): string => {
  return `R ${formatAmount(amount)}`;
};

export const CURRENCY_SYMBOL = 'R';
export const CURRENCY_CODE = 'ZAR';

// VAT rate applied to order subtotals. Must match TAX_RATE in
// nvm-marketplace-backend/controllers/orderController.js, which is the
// authoritative calculation used when orders are actually created.
export const TAX_RATE = 0.10;
