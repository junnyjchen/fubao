'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2, X } from 'lucide-react';

interface Spec {
  id?: number;
  goods_id?: number;
  name: string;
  values: string[];
}

interface Sku {
  id?: number;
  goods_id?: number;
  specs: Record<string, string>;
  price: number;
  stock: number;
  sku_code: string;
  image?: string;
}

interface SkuManagerProps {
  goodsId?: number;
  basePrice: number;
  baseStock: number;
  onSkusChange: (skus: Sku[]) => void;
  initialSkus?: Sku[];
  initialSpecs?: Spec[];
}

export function SkuManager({
  goodsId,
  basePrice,
  baseStock,
  onSkusChange,
  initialSkus = [],
  initialSpecs = [],
}: SkuManagerProps) {
  const [specs, setSpecs] = useState<Spec[]>(initialSpecs.length > 0 ? initialSpecs : []);
  const [skus, setSkus] = useState<Sku[]>(initialSkus.length > 0 ? initialSkus : []);
  const [newSpecName, setNewSpecName] = useState('');
  const [newSpecValue, setNewSpecValue] = useState('');

  // Sync to parent
  useEffect(() => {
    onSkusChange(skus);
  }, [skus, onSkusChange]);

  // Auto-generate SKU combinations when specs change
  useEffect(() => {
    if (specs.length === 0) {
      setSkus([]);
      return;
    }

    const validSpecs = specs.filter(s => s.values.length > 0);
    if (validSpecs.length === 0) {
      setSkus([]);
      return;
    }

    // Generate all combinations
    const combinations = generateCombinations(validSpecs);
    const newSkus: Sku[] = combinations.map(combo => {
      // Try to find existing SKU with same specs
      const existing = skus.find(s => {
        const keys = Object.keys(combo);
        return keys.every(k => s.specs[k] === combo[k]) && keys.length === Object.keys(s.specs).length;
      });
      if (existing) return existing;
      return {
        specs: combo,
        price: basePrice,
        stock: baseStock,
        sku_code: '',
      };
    });

    setSkus(newSkus);
  }, [specs, basePrice, baseStock]);

  function generateCombinations(specs: Spec[]): Record<string, string>[] {
    if (specs.length === 0) return [{}];
    const [first, ...rest] = specs;
    const restCombos = generateCombinations(rest);
    const result: Record<string, string>[] = [];
    for (const value of first.values) {
      for (const combo of restCombos) {
        result.push({ [first.name]: value, ...combo });
      }
    }
    return result;
  }

  function addSpec() {
    if (!newSpecName.trim()) return;
    if (specs.find(s => s.name === newSpecName.trim())) return;
    setSpecs([...specs, { name: newSpecName.trim(), values: [] }]);
    setNewSpecName('');
  }

  function addSpecValue(specIndex: number) {
    if (!newSpecValue.trim()) return;
    const updated = [...specs];
    if (!updated[specIndex].values.includes(newSpecValue.trim())) {
      updated[specIndex].values = [...updated[specIndex].values, newSpecValue.trim()];
      setSpecs(updated);
    }
    setNewSpecValue('');
  }

  function removeSpecValue(specIndex: number, valueIndex: number) {
    const updated = [...specs];
    updated[specIndex].values = updated[specIndex].values.filter((_, i) => i !== valueIndex);
    if (updated[specIndex].values.length === 0) {
      updated.splice(specIndex, 1);
    }
    setSpecs(updated);
  }

  function removeSpec(specIndex: number) {
    setSpecs(specs.filter((_, i) => i !== specIndex));
  }

  function updateSku(index: number, field: string, value: string | number) {
    const updated = [...skus];
    updated[index] = { ...updated[index], [field]: value };
    setSkus(updated);
  }

  return (
    <div className="space-y-4">
      {/* Specs Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">商品規格</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Add new spec */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="規格名稱（如：顏色、尺寸）"
                value={newSpecName}
                onChange={e => setNewSpecName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addSpec()}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addSpec}>
              <Plus className="w-4 h-4 mr-1" /> 新增規格
            </Button>
          </div>

          {/* Existing specs */}
          {specs.map((spec, si) => (
            <div key={si} className="border rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{spec.name}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeSpec(si)}
                  className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {spec.values.map((val, vi) => (
                  <span
                    key={vi}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs"
                  >
                    {val}
                    <button
                      type="button"
                      onClick={() => removeSpecValue(si, vi)}
                      className="hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="輸入規格值"
                  value={newSpecValue}
                  onChange={e => setNewSpecValue(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addSpecValue(si)}
                  className="h-8 text-sm"
                />
                <Button type="button" variant="outline" size="sm" onClick={() => addSpecValue(si)} className="h-8">
                  添加
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* SKU Table */}
      {skus.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SKU 管理（共 {skus.length} 個變體）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {specs.filter(s => s.values.length > 0).map(spec => (
                      <th key={spec.name} className="text-left py-2 px-2 font-medium text-muted-foreground">
                        {spec.name}
                      </th>
                    ))}
                    <th className="text-left py-2 px-2 font-medium text-muted-foreground">SKU 編碼</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">價格</th>
                    <th className="text-right py-2 px-2 font-medium text-muted-foreground">庫存</th>
                  </tr>
                </thead>
                <tbody>
                  {skus.map((sku, i) => (
                    <tr key={i} className="border-b last:border-0">
                      {specs.filter(s => s.values.length > 0).map(spec => (
                        <td key={spec.name} className="py-2 px-2">{sku.specs[spec.name]}</td>
                      ))}
                      <td className="py-2 px-2">
                        <Input
                          className="h-8 w-28 text-sm"
                          placeholder="SKU-001"
                          value={sku.sku_code}
                          onChange={e => updateSku(i, 'sku_code', e.target.value)}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          className="h-8 w-24 text-sm text-right"
                          value={sku.price}
                          onChange={e => updateSku(i, 'price', parseFloat(e.target.value) || 0)}
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          className="h-8 w-20 text-sm text-right"
                          value={sku.stock}
                          onChange={e => updateSku(i, 'stock', parseInt(e.target.value) || 0)}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
