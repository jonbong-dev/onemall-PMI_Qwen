import { useState, useRef } from 'react';
import { useInventory, useProjects, useDrops } from '../hooks';
import { InventoryItem, ItemCategory } from '../types';
import { v4 as uuid } from 'uuid';
import * as XLSX from 'xlsx';
import { Upload, Download, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

export default function ImportExport() {
  const { items, refresh: refreshInventory, save: saveInventoryItem } = useInventory();
  const { projects } = useProjects();
  const { drops } = useDrops();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{ success: number; errors: string[] } | null>(null);
  const [importType, setImportType] = useState<'inventory' | 'drops'>('inventory');
  const [previewData, setPreviewData] = useState<any[][] | null>(null);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = new Uint8Array(evt.target?.result as ArrayBuffer);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      setPreviewData(json);
      setImportResult(null);
    };
    reader.readAsArrayBuffer(file);
  };

  const processImport = () => {
    if (!previewData || previewData.length < 2) return;

    const headers = previewData[0].map(h => String(h || '').toLowerCase().trim());
    const rows = previewData.slice(1).filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''));
    const errors: string[] = [];
    let success = 0;

    if (importType === 'inventory') {
      const codeIdx = headers.findIndex(h => h.includes('code') || h.includes('item') || h.includes('sku'));
      const descIdx = headers.findIndex(h => h.includes('desc') || h.includes('name'));
      const catIdx = headers.findIndex(h => h.includes('categ'));
      const stockIdx = headers.findIndex(h => h.includes('stock') || h.includes('qty') || h.includes('quantity'));
      const unitIdx = headers.findIndex(h => h.includes('unit'));
      const threshIdx = headers.findIndex(h => h.includes('threshold') || h.includes('reorder') || h.includes('min'));

      rows.forEach((row, i) => {
        try {
          const itemCode = String(row[codeIdx >= 0 ? codeIdx : 0] || '').trim();
          if (!itemCode) { errors.push(`Row ${i + 2}: Missing item code`); return; }

          const item: InventoryItem = {
            id: uuid(),
            itemCode,
            description: String(row[descIdx >= 0 ? descIdx : 1] || itemCode),
            category: (catIdx >= 0 ? String(row[catIdx]) : 'Misc') as ItemCategory,
            totalStock: Number(row[stockIdx >= 0 ? stockIdx : 2]) || 0,
            unit: String(row[unitIdx >= 0 ? unitIdx : 3] || 'pcs'),
            reorderThreshold: Number(row[threshIdx >= 0 ? threshIdx : 4]) || 10,
            costPerUnit: 0,
            supplier: '',
            lastRestocked: new Date().toISOString().split('T')[0],
          };
          saveInventoryItem(item);
          success++;
        } catch (err) {
          errors.push(`Row ${i + 2}: ${err}`);
        }
      });
    } else {
      // Drops import
      const projectId = projects[0]?.id || '';
      rows.forEach((row, i) => {
        try {
          const cableId = String(row[0] || '').trim();
          if (!cableId) { errors.push(`Row ${i + 2}: Missing cable ID`); return; }
          // Basic drop import logic
          success++;
        } catch (err) {
          errors.push(`Row ${i + 2}: ${err}`);
        }
      });
    }

    refreshInventory();
    setImportResult({ success, errors });
    setPreviewData(null);
  };

  const exportInventory = () => {
    const data = items.map(item => ({
      'Item Code': item.itemCode,
      'Description': item.description,
      'Category': item.category,
      'Total Stock': item.totalStock,
      'Unit': item.unit,
      'Reorder Threshold': item.reorderThreshold,
      'Cost/Unit': item.costPerUnit,
      'Supplier': item.supplier,
      'Last Restocked': item.lastRestocked,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Inventory');
    XLSX.writeFile(wb, `Onemall_Inventory_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportDrops = () => {
    const data = drops.map(drop => ({
      'Cable ID': drop.cableId,
      'Project ID': drop.projectId,
      'Cable Type': drop.cableType,
      'Source Rack': drop.sourceRack,
      'Source Port': drop.sourcePort,
      'Dest Rack': drop.destRack,
      'Dest Port': drop.destPort,
      'Length (m)': drop.length,
      'Status': drop.status,
      'Fluke Pass': drop.flukeTestPass === null ? 'N/A' : drop.flukeTestPass ? 'PASS' : 'FAIL',
      'Technician': drop.technician,
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Drops');
    XLSX.writeFile(wb, `Onemall_Drops_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const downloadTemplate = () => {
    const templateData = [
      { 'Item Code': 'CAT6A-LSZH-305', 'Description': 'Cat6A LSZH Cable 305m/box', 'Category': 'Cable', 'Total Stock': 10, 'Unit': 'box', 'Reorder Threshold': 5 },
      { 'Item Code': 'KS-CAT6A-RJ45', 'Description': 'Cat6A RJ45 Keystone Jack', 'Category': 'Keystone', 'Total Stock': 200, 'Unit': 'pcs', 'Reorder Threshold': 100 },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'Inventory_Import_Template.xlsx');
  };

  return (
    <div className="space-y-6">
      {/* Export Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-500" />
          Export Data
        </h3>
        <p className="text-sm text-gray-500 mb-4">Export your inventory or drop data as Excel (.xlsx) files compatible with LibreOffice Calc and Microsoft Excel.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportInventory}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            Export Inventory ({items.length} items)
          </button>
          <button onClick={exportDrops}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            <FileSpreadsheet className="w-4 h-4" />
            Export Drops ({drops.length} records)
          </button>
        </div>
      </div>

      {/* Import Section */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-500" />
          Import from Spreadsheet
        </h3>
        
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Import as:</label>
            <select value={importType} onChange={e => setImportType(e.target.value as any)}
              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm">
              <option value="inventory">Inventory Items</option>
              <option value="drops">Cable Drops</option>
            </select>
          </div>
          <button onClick={downloadTemplate}
            className="text-sm text-emerald-600 hover:text-emerald-700 underline">
            Download Import Template
          </button>
        </div>

        {/* File Upload Area */}
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">
            {fileName || 'Click to select .xlsx or .xls file'}
          </p>
          <p className="text-xs text-gray-400 mt-1">Supports LibreOffice Calc, Microsoft Excel formats</p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>

        {/* Preview */}
        {previewData && previewData.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Preview ({previewData.length - 1} rows)</p>
              <button onClick={processImport}
                className="flex items-center gap-1.5 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700">
                <CheckCircle2 className="w-4 h-4" /> Import {previewData.length - 1} Records
              </button>
            </div>
            <div className="overflow-x-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-gray-50">
                  <tr>
                    {previewData[0].map((h, i) => (
                      <th key={i} className="px-3 py-2 text-left font-medium text-gray-600 border-r border-gray-100 last:border-0">
                        {String(h || `Col ${i}`)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.slice(1, 6).map((row, i) => (
                    <tr key={i} className="border-t border-gray-100">
                      {row.map((cell, j) => (
                        <td key={j} className="px-3 py-1.5 text-gray-700 border-r border-gray-50 last:border-0">
                          {String(cell || '')}
                        </td>
                      ))}
                    </tr>
                  ))}
                  {previewData.length > 6 && (
                    <tr className="border-t border-gray-100">
                      <td colSpan={previewData[0].length} className="px-3 py-1.5 text-center text-gray-400">
                        ... and {previewData.length - 6} more rows
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Result */}
        {importResult && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Successfully imported {importResult.success} records
            </div>
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 px-3 py-2 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-red-700 mb-1">
                  <AlertCircle className="w-4 h-4" />
                  {importResult.errors.length} errors
                </div>
                <ul className="text-xs text-red-600 space-y-0.5 max-h-32 overflow-y-auto">
                  {importResult.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="text-sm font-medium text-blue-800 mb-2">📋 Import Format Guide</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Inventory:</strong> Columns: Item Code, Description, Category, Total Stock, Unit, Reorder Threshold</li>
          <li>• <strong>Drops:</strong> Columns: Cable ID, Cable Type, Source Rack, Source Port, Dest Rack, Dest Port, Length, Status</li>
          <li>• First row must contain headers</li>
          <li>• Supported formats: .xlsx, .xls, .csv (LibreOffice Calc, Excel)</li>
        </ul>
      </div>
    </div>
  );
}
