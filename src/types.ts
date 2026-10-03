// Domain Data Models for Structured Cabling Inventory

export type ProjectStatus = 'planning' | 'in-progress' | 'testing' | 'completed' | 'on-hold';
export type DropStatus = 'pulled' | 'terminated' | 'tested';
export type ItemCategory = 'Cable' | 'Patch Panel' | 'Keystone' | 'Faceplate' | 'Patch Cord' | 'Conduit' | 'Label' | 'Misc';

export interface Project {
  id: string;
  name: string;
  client: string;
  location: string;
  status: ProjectStatus;
  startDate: string;
  targetDate: string;
  notes: string;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  description: string;
  category: ItemCategory;
  totalStock: number;
  unit: string;
  reorderThreshold: number;
  costPerUnit: number;
  supplier: string;
  lastRestocked: string;
}

export interface UsageLog {
  id: string;
  projectId: string;
  itemCode: string;
  qtyUsed: number;
  technician: string;
  rackLocation: string;
  timestamp: string;
  notes: string;
}

export interface CableDrop {
  id: string;
  projectId: string;
  cableId: string;
  cableType: string;
  sourceRack: string;
  sourcePort: string;
  destRack: string;
  destPort: string;
  length: number;
  status: DropStatus;
  flukeTestPass: boolean | null;
  flukeTestDate: string | null;
  technician: string;
  notes: string;
}

export interface UploadedFile {
  id: string;
  projectId: string;
  fileName: string;
  fileType: 'photo' | 'rack-diagram' | 'fluke-report' | 'other';
  uploadedAt: string;
  size: number;
  dataUrl: string;
}

export interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  totalInventoryItems: number;
  lowStockItems: number;
  totalDrops: number;
  testedDrops: number;
  passRate: number;
  totalCableUsed: number;
}
