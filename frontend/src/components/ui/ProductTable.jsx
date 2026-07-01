import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Input, Textarea } from './Input';
import Button from './Button';
import Card from './Card';

export default function ProductTable({ products, onChange, currency = 'USD' }) {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount || 0);
  };

  const handleAdd = () => {
    onChange([...products, { id: Date.now(), name: '', description: '', quantity: 1, price: 0, discount: 0, tax: 0 }]);
  };

  const handleRemove = (id) => {
    onChange(products.filter(p => p.id !== id));
  };

  const handleChange = (id, field, value) => {
    onChange(products.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const calculateSubtotal = () => {
    return products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  };

  const calculateTotalDiscount = () => {
    return products.reduce((sum, p) => sum + (p.quantity * (p.price * (p.discount / 100))), 0);
  };

  const calculateTotalTax = () => {
    return products.reduce((sum, p) => {
      const discountedPrice = p.price - (p.price * (p.discount / 100));
      return sum + (p.quantity * (discountedPrice * (p.tax / 100)));
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const totalDiscount = calculateTotalDiscount();
  const totalTax = calculateTotalTax();
  const grandTotal = subtotal - totalDiscount + totalTax;

  return (
    <div className="w-full">
      <div className="overflow-x-auto mb-4 pb-2">
        <table className="w-full min-w-[800px] text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-800/50">
            <tr>
              <th className="px-4 py-3 w-1/4">Product</th>
              <th className="px-4 py-3 w-1/4">Description</th>
              <th className="px-4 py-3 w-28">Qty</th>
              <th className="px-4 py-3 w-28">Unit Price</th>
              <th className="px-4 py-3 w-28">Disc %</th>
              <th className="px-4 py-3 w-28">Tax %</th>
              <th className="px-4 py-3 w-32 text-right">Amount</th>
              <th className="px-4 py-3 w-12 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const amount = (p.quantity * p.price) - (p.quantity * p.price * (p.discount / 100)) + (p.quantity * (p.price - (p.price * (p.discount / 100))) * (p.tax / 100));
              return (
                <tr key={p.id} className="border-b dark:border-slate-800 align-top">
                  <td className="px-4 py-3">
                    <Input
                      placeholder="Product name"
                      value={p.name}
                      onChange={(e) => handleChange(p.id, 'name', e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Textarea
                      placeholder="Description"
                      value={p.description || ''}
                      onChange={(e) => handleChange(p.id, 'description', e.target.value)}
                      rows={1}
                      className="min-h-[42px]"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number" min="1"
                      value={p.quantity}
                      onChange={(e) => handleChange(p.id, 'quantity', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number" min="0"
                      value={p.price}
                      onChange={(e) => handleChange(p.id, 'price', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number" min="0" max="100"
                      value={p.discount}
                      onChange={(e) => handleChange(p.id, 'discount', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      type="number" min="0" max="100"
                      value={p.tax}
                      onChange={(e) => handleChange(p.id, 'tax', Number(e.target.value))}
                    />
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-white pt-5 block">
                    {formatCurrency(amount)}
                  </td>
                  <td className="px-4 py-3 text-center pt-4">
                    <button
                      onClick={() => handleRemove(p.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                      disabled={products.length === 1}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col md:flex-row items-start justify-between gap-6">
        <Button variant="secondary" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-2" /> Add Product
        </Button>

        <Card className="w-full md:w-80 !p-4 bg-slate-50/50 dark:bg-slate-800/30">
          <div className="space-y-3 text-sm">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Subtotal</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Discount</span>
              <span className="font-medium text-red-500">-{formatCurrency(totalDiscount)}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Tax</span>
              <span className="font-medium text-slate-900 dark:text-white">{formatCurrency(totalTax)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <span className="text-base font-bold text-slate-900 dark:text-white">Grand Total</span>
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
