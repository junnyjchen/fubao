'use client';

import { useState, useEffect, createContext, useContext, useCallback } from 'react';

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: number;
  is_default: number;
}

interface CurrencyContextType {
  currency: Currency;
  currencies: Currency[];
  setCurrency: (c: Currency) => void;
  formatPrice: (price: number) => string;
  convertPrice: (price: number) => number;
  loading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: { id: 1, code: 'TWD', name: '新台幣', symbol: 'NT$', rate: 1, is_default: 1 },
  currencies: [],
  setCurrency: () => {},
  formatPrice: () => '',
  convertPrice: (p) => p,
  loading: true,
});

export function useCurrency() {
  return useContext(CurrencyContext);
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>({
    id: 1, code: 'TWD', name: '新台幣', symbol: 'NT$', rate: 1, is_default: 1,
  });
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load currencies from API
    fetch('/api/currencies')
      .then(res => res.json())
      .then(data => {
        if (data.currencies) {
          setCurrencies(data.currencies);
          const def = data.currencies.find((c: Currency) => c.is_default === 1);
          if (def) setCurrencyState(def);
        }
      })
      .catch(() => {
        // Fallback to default
        setCurrencies([{ id: 1, code: 'TWD', name: '新台幣', symbol: 'NT$', rate: 1, is_default: 1 }]);
      })
      .finally(() => setLoading(false));

    // Restore saved currency
    const saved = localStorage.getItem('preferred_currency');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCurrencyState(parsed);
      } catch {}
    }
  }, []);

  const setCurrency = useCallback((c: Currency) => {
    setCurrencyState(c);
    localStorage.setItem('preferred_currency', JSON.stringify(c));
  }, []);

  const convertPrice = useCallback((price: number) => {
    return Math.round(price * currency.rate * 100) / 100;
  }, [currency.rate]);

  const formatPrice = useCallback((price: number) => {
    const converted = convertPrice(price);
    return `${currency.symbol}${converted.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }, [convertPrice, currency.symbol]);

  return (
    <CurrencyContext.Provider value={{ currency, currencies, setCurrency, formatPrice, convertPrice, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function CurrencySelector() {
  const { currency, currencies, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);

  if (currencies.length <= 1) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-border bg-background hover:bg-muted text-sm transition-colors"
      >
        <span className="font-medium">{currency.code}</span>
        <span className="text-muted-foreground">{currency.symbol}</span>
        <svg className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 w-48 bg-card border border-border rounded-lg shadow-lg py-1">
            {currencies.map(c => (
              <button
                key={c.id}
                onClick={() => { setCurrency(c); setOpen(false); }}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors flex items-center justify-between ${
                  c.code === currency.code ? 'bg-primary/10 text-primary font-medium' : ''
                }`}
              >
                <span>{c.name}</span>
                <span className="text-muted-foreground text-xs">{c.code}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
