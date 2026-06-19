'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Sku {
  id: number;
  specs: Record<string, string>;
  price: number;
  stock: number;
  sku_code: string;
  image?: string;
}

interface Spec {
  id: number;
  name: string;
  values: string[];
}

interface SkuSelectorProps {
  goodsId: number;
  basePrice: number;
  onSkuChange: (sku: Sku | null) => void;
}

export function SkuSelector({ goodsId, basePrice, onSkuChange }: SkuSelectorProps) {
  const [specs, setSpecs] = useState<Spec[]>([]);
  const [skus, setSkus] = useState<Sku[]>([]);
  const [selectedSpecs, setSelectedSpecs] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpecsAndSkus();
  }, [goodsId]);

  const loadSpecsAndSkus = async () => {
    try {
      const [specsRes, skusRes] = await Promise.all([
        fetch(`/api/goods/${goodsId}/specs`),
        fetch(`/api/goods/${goodsId}/skus`),
      ]);
      const specsData = await specsRes.json();
      const skusData = await skusRes.json();
      setSpecs(specsData.specs || []);
      setSkus(skusData.skus || []);
    } catch {
      // 无 SKU 时不报错
    } finally {
      setLoading(false);
    }
  };

  const handleSpecSelect = (specName: string, value: string) => {
    const newSelected = { ...selectedSpecs, [specName]: value };
    setSelectedSpecs(newSelected);

    // 查找匹配的 SKU
    const matchedSku = skus.find((sku) =>
      Object.entries(newSelected).every(([k, v]) => sku.specs[k] === v)
    );
    onSkuChange(matchedSku || null);
  };

  if (loading) return null;
  if (specs.length === 0) return null;

  return (
    <div className="space-y-3">
      {specs.map((spec) => (
        <div key={spec.id}>
          <label className="text-sm font-medium text-foreground mb-1.5 block">
            {spec.name}
          </label>
          <div className="flex flex-wrap gap-2">
            {spec.values.map((value) => (
              <button
                key={value}
                type="button"
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md border transition-colors',
                  selectedSpecs[spec.name] === value
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground hover:border-primary/50'
                )}
                onClick={() => handleSpecSelect(spec.name, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
