import { useState } from 'react';
import { useInventory } from '../hooks';
import { InventoryItem, ItemCategory } from '../types';
import { v4 as uuid } from 'uuid';
import { Plus, Search, AlertTriangle, Edit2, Trash2, X } from 'lucide-react';

const categories: ItemCategory[] = ['Cable', 'Patch Panel', 'Keystone', 'Faceplate', 'Patch Cord', 'Conduit', 'Label', 'Misc'];

export default function InventoryMaster() {
  const { items, refresh, save, remove } = useInventory();
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  const filtered = items.filter(item => {
    const matchSearch = item.itemCode.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    const matchCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchSearch && matchCategory;
  });

  const lowStockCount = items.filter(i => i.totalStock <= i.reorderThreshold).length;

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this inventory item?')) {
      remove(id);
      refresh();
    }
  };

  const handleSave = (item: InventoryItem) => {
    save(item);
    refresh();
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500">{items.length} items • {lowStockCount} low stock</p>
          {lowStockCount > 0 && (
            <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              <AlertTriangle className="w-3 h-3" /> Alerts
            </span>
          )}
        </div>
        <button
          onClick={() => { setEditingItem(null); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Item
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by code or description..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          />
        </div>
        <select
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        >
          <option value="all">All Categories</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Item Code</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Stock</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Threshold</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Supplier</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const isLow = item.totalStock <= item.reorderThreshold;
                return (
                  <tr key={item.id} className={`border-b border-gray-50 last:border-0 ${isLow ? 'bg-amber-50/50' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-gray-100 px-1.5 py-0.5 rounded">{item.itemCode}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-800">{item.description}</td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{item.category}</span>
                    </td>
                    <td className={`px-4 py-3 text-right font-semibold ${isLow ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.totalStock} {item.unit}
                      {isLow && <AlertTriangle className="w-3 h-3 inline ml-1 text-amber-500" />}
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden sm:table-cell">{item.reorderThreshold}</td>
                    <td className="px-4 py-3 text-right text-gray-500 hidden lg:table-cell">{item.supplier}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => handleEdit(item)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-blue-600">
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(item.id)} className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-red-600">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No items found</div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <ItemFormModal
          item={editingItem}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingItem(null); }}
        />
      )}
    </div>
  );
}

function ItemFormModal({ item, onSave, onClose }: { item: InventoryItem | null; onSave: (item: InventoryItem) => void; onClose: () => void }) {
  const [form, setForm] = useState<InventoryItem>(item || {
    id: uuid(),
    itemCode: '',
    description: '',
    category: 'Cable',
    totalStock: 0,
    unit: 'pcs',
    reorderThreshold: 10,
    costPerUnit: 0,
    supplier: '',
    lastRestocked: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">{item ? 'Edit Item' : 'Add New Item'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Item Code</label>
              <input required value={form.itemCode} onChange={e => setForm({...form, itemCode: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="CAT6A-LSZH-305" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
              <select value={form.category} onChange={e => setForm({...form, category: e.target.value as ItemCategory})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <input required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Stock</label>
              <input type="number" value={form.totalStock} onChange={e => setForm({...form, totalStock: +e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Unit</label>
              <input value={form.unit} onChange={e => setForm({...form, unit: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="pcs, box, m" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reorder At</label>
              <input type="number" value={form.reorderThreshold} onChange={e => setForm({...form, reorderThreshold: +e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cost/Unit</label>
              <input type="number" step="0.01" value={form.costPerUnit} onChange={e => setForm({...form, costPerUnit: +e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Supplier</label>
              <input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Item</button>
          </div>
        </form>
      </div>
    </div>
  );
}
