import { Project, InventoryItem, CableDrop, UsageLog } from '../types';
import { v4 as uuid } from 'uuid';

export const seedProjects: Project[] = [
  {
    id: uuid(),
    name: 'Onemall Level 2 - Office Wing',
    client: 'Onemall Networks',
    location: 'Building A, Level 2',
    status: 'in-progress',
    startDate: '2026-01-15',
    targetDate: '2026-04-30',
    notes: 'Main office cabling for 48 workstations',
  },
  {
    id: uuid(),
    name: 'Onemall Level 3 - Data Center',
    client: 'Onemall Networks',
    location: 'Building A, Level 3',
    status: 'in-progress',
    startDate: '2026-02-01',
    targetDate: '2026-05-15',
    notes: 'High-density data center with 96 racks',
  },
  {
    id: uuid(),
    name: 'Warehouse B - Security System',
    client: 'Onemall Logistics',
    location: 'Building B, Ground Floor',
    status: 'planning',
    startDate: '2026-03-01',
    targetDate: '2026-06-30',
    notes: 'CCTV and access control cabling',
  },
  {
    id: uuid(),
    name: 'Parking Structure - EV Chargers',
    client: 'Onemall Properties',
    location: 'Building C, B1-B3',
    status: 'completed',
    startDate: '2025-10-01',
    targetDate: '2026-01-31',
    notes: 'Completed - 24 EV charging stations',
  },
];

export const seedInventory: InventoryItem[] = [
  { id: uuid(), itemCode: 'CAT6A-LSZH-305', description: 'Cat6A LSZH Cable 305m/box', category: 'Cable', totalStock: 12, unit: 'box', reorderThreshold: 5, costPerUnit: 850, supplier: 'CommScope', lastRestocked: '2026-02-10' },
  { id: uuid(), itemCode: 'CAT6-UTP-305', description: 'Cat6 UTP Cable 305m/box', category: 'Cable', totalStock: 8, unit: 'box', reorderThreshold: 4, costPerUnit: 520, supplier: 'CommScope', lastRestocked: '2026-02-10' },
  { id: uuid(), itemCode: 'FIBER-OS2-12F', description: 'Single-mode Fiber 12F OM4', category: 'Cable', totalStock: 3, unit: 'drum', reorderThreshold: 2, costPerUnit: 2200, supplier: 'Corning', lastRestocked: '2026-01-20' },
  { id: uuid(), itemCode: 'PP-48P-LSA', description: '48-Port Patch Panel LSA', category: 'Patch Panel', totalStock: 6, unit: 'pcs', reorderThreshold: 3, costPerUnit: 380, supplier: 'Panduit', lastRestocked: '2026-02-05' },
  { id: uuid(), itemCode: 'PP-24P-FC', description: '24-Port Patch Panel FC', category: 'Patch Panel', totalStock: 2, unit: 'pcs', reorderThreshold: 2, costPerUnit: 420, supplier: 'Panduit', lastRestocked: '2026-01-15' },
  { id: uuid(), itemCode: 'KS-CAT6A-RJ45', description: 'Cat6A RJ45 Keystone Jack', category: 'Keystone', totalStock: 240, unit: 'pcs', reorderThreshold: 100, costPerUnit: 12, supplier: 'Leviton', lastRestocked: '2026-02-12' },
  { id: uuid(), itemCode: 'KS-CAT6-RJ45', description: 'Cat6 RJ45 Keystone Jack', category: 'Keystone', totalStock: 180, unit: 'pcs', reorderThreshold: 80, costPerUnit: 8, supplier: 'Leviton', lastRestocked: '2026-02-12' },
  { id: uuid(), itemCode: 'FP-SGL-GANG', description: 'Single Gang Faceplate', category: 'Faceplate', totalStock: 150, unit: 'pcs', reorderThreshold: 50, costPerUnit: 5, supplier: 'Clipsal', lastRestocked: '2026-02-08' },
  { id: uuid(), itemCode: 'FP-DBL-GANG', description: 'Double Gang Faceplate', category: 'Faceplate', totalStock: 45, unit: 'pcs', reorderThreshold: 30, costPerUnit: 8, supplier: 'Clipsal', lastRestocked: '2026-02-08' },
  { id: uuid(), itemCode: 'PC-CAT6A-1M', description: 'Cat6A Patch Cord 1m', category: 'Patch Cord', totalStock: 96, unit: 'pcs', reorderThreshold: 40, costPerUnit: 15, supplier: 'Panduit', lastRestocked: '2026-02-14' },
  { id: uuid(), itemCode: 'PC-CAT6A-2M', description: 'Cat6A Patch Cord 2m', category: 'Patch Cord', totalStock: 72, unit: 'pcs', reorderThreshold: 30, costPerUnit: 18, supplier: 'Panduit', lastRestocked: '2026-02-14' },
  { id: uuid(), itemCode: 'PC-CAT6A-3M', description: 'Cat6A Patch Cord 3m', category: 'Patch Cord', totalStock: 15, unit: 'pcs', reorderThreshold: 20, costPerUnit: 22, supplier: 'Panduit', lastRestocked: '2026-02-14' },
  { id: uuid(), itemCode: 'COND-25MM-FLEX', description: '25mm Flexible Conduit 3m', category: 'Conduit', totalStock: 200, unit: 'pcs', reorderThreshold: 50, costPerUnit: 6, supplier: 'Prysmian', lastRestocked: '2026-02-01' },
  { id: uuid(), itemCode: 'LBL-WRAP-BLUE', description: 'Cable Label Wrap Blue', category: 'Label', totalStock: 500, unit: 'pcs', reorderThreshold: 200, costPerUnit: 0.5, supplier: 'Brady', lastRestocked: '2026-02-10' },
];

export function generateSeedDrops(projectId: string, count: number): CableDrop[] {
  const drops: CableDrop[] = [];
  const statuses: Array<'pulled' | 'terminated' | 'tested'> = ['pulled', 'terminated', 'tested'];
  const cableTypes = ['CAT6A-LSZH-305', 'CAT6-UTP-305', 'FIBER-OS2-12F'];
  const technicians = ['Ahmad R.', 'Wei L.', 'Raj P.', 'Carlos M.'];

  for (let i = 0; i < count; i++) {
    const status = statuses[Math.floor(Math.random() * 3)];
    const cableType = cableTypes[Math.floor(Math.random() * cableTypes.length)];
    const tech = technicians[Math.floor(Math.random() * technicians.length)];
    const rackNum = Math.floor(Math.random() * 12) + 1;
    const portNum = Math.floor(Math.random() * 48) + 1;

    drops.push({
      id: uuid(),
      projectId,
      cableId: `D${String(i + 1).padStart(3, '0')}`,
      cableType,
      sourceRack: `MDF-A${rackNum}`,
      sourcePort: `${Math.ceil(portNum / 24)}.${portNum}`,
      destRack: `IDF-B${Math.floor(Math.random() * 6) + 1}`,
      destPort: `${Math.ceil(portNum / 24)}.${portNum}`,
      length: Math.floor(Math.random() * 80) + 15,
      status,
      flukeTestPass: status === 'tested' ? Math.random() > 0.08 : null,
      flukeTestDate: status === 'tested' ? '2026-02-20' : null,
      technician: tech,
      notes: '',
    });
  }
  return drops;
}

export function generateSeedUsageLogs(projectId: string): UsageLog[] {
  const items = ['CAT6A-LSZH-305', 'CAT6-UTP-305', 'KS-CAT6A-RJ45', 'FP-SGL-GANG', 'PC-CAT6A-1M'];
  const technicians = ['Ahmad R.', 'Wei L.', 'Raj P.', 'Carlos M.'];
  const logs: UsageLog[] = [];

  for (let i = 0; i < 15; i++) {
    logs.push({
      id: uuid(),
      projectId,
      itemCode: items[Math.floor(Math.random() * items.length)],
      qtyUsed: Math.floor(Math.random() * 10) + 1,
      technician: technicians[Math.floor(Math.random() * technicians.length)],
      rackLocation: `Rack ${Math.floor(Math.random() * 12) + 1}`,
      timestamp: new Date(2026, 1, Math.floor(Math.random() * 28) + 1).toISOString(),
      notes: '',
    });
  }
  return logs;
}
