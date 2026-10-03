import { Project, InventoryItem, CableDrop, UsageLog, UploadedFile } from './types';
import { seedProjects, seedInventory, generateSeedDrops, generateSeedUsageLogs } from './data/seed';

const STORAGE_KEYS = {
  projects: 'pm_inventory_projects',
  inventory: 'pm_inventory_items',
  drops: 'pm_inventory_drops',
  usageLogs: 'pm_inventory_usage_logs',
  files: 'pm_inventory_files',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error(`Failed to load ${key}:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key}:`, e);
  }
}

// Initialize with seed data if empty
function initializeData() {
  const projects = loadFromStorage<Project[]>(STORAGE_KEYS.projects, []);
  if (projects.length === 0) {
    const seededProjects = seedProjects;
    saveToStorage(STORAGE_KEYS.projects, seededProjects);
    saveToStorage(STORAGE_KEYS.inventory, seedInventory);

    const allDrops: CableDrop[] = [];
    seededProjects.forEach(p => {
      const count = p.status === 'completed' ? 24 : p.status === 'in-progress' ? 48 : 0;
      allDrops.push(...generateSeedDrops(p.id, count));
    });
    saveToStorage(STORAGE_KEYS.drops, allDrops);

    const allLogs: UsageLog[] = [];
    seededProjects.forEach(p => {
      if (p.status !== 'planning') {
        allLogs.push(...generateSeedUsageLogs(p.id));
      }
    });
    saveToStorage(STORAGE_KEYS.usageLogs, allLogs);
    saveToStorage(STORAGE_KEYS.files, []);
  }
}

initializeData();

// CRUD Operations
export const store = {
  // Projects
  getProjects: (): Project[] => loadFromStorage(STORAGE_KEYS.projects, []),
  saveProject: (project: Project): void => {
    const projects = store.getProjects();
    const idx = projects.findIndex(p => p.id === project.id);
    if (idx >= 0) projects[idx] = project;
    else projects.push(project);
    saveToStorage(STORAGE_KEYS.projects, projects);
  },
  deleteProject: (id: string): void => {
    const projects = store.getProjects().filter(p => p.id !== id);
    saveToStorage(STORAGE_KEYS.projects, projects);
    // Also delete related drops and logs
    const drops = store.getDrops().filter(d => d.projectId !== id);
    saveToStorage(STORAGE_KEYS.drops, drops);
    const logs = store.getUsageLogs().filter(l => l.projectId !== id);
    saveToStorage(STORAGE_KEYS.usageLogs, logs);
  },

  // Inventory
  getInventory: (): InventoryItem[] => loadFromStorage(STORAGE_KEYS.inventory, []),
  saveInventoryItem: (item: InventoryItem): void => {
    const items = store.getInventory();
    const idx = items.findIndex(i => i.id === item.id);
    if (idx >= 0) items[idx] = item;
    else items.push(item);
    saveToStorage(STORAGE_KEYS.inventory, items);
  },
  deleteInventoryItem: (id: string): void => {
    const items = store.getInventory().filter(i => i.id !== id);
    saveToStorage(STORAGE_KEYS.inventory, items);
  },

  // Drops
  getDrops: (): CableDrop[] => loadFromStorage(STORAGE_KEYS.drops, []),
  saveDrop: (drop: CableDrop): void => {
    const drops = store.getDrops();
    const idx = drops.findIndex(d => d.id === drop.id);
    if (idx >= 0) drops[idx] = drop;
    else drops.push(drop);
    saveToStorage(STORAGE_KEYS.drops, drops);
  },
  deleteDrop: (id: string): void => {
    const drops = store.getDrops().filter(d => d.id !== id);
    saveToStorage(STORAGE_KEYS.drops, drops);
  },

  // Usage Logs
  getUsageLogs: (): UsageLog[] => loadFromStorage(STORAGE_KEYS.usageLogs, []),
  saveUsageLog: (log: UsageLog): void => {
    const logs = store.getUsageLogs();
    const idx = logs.findIndex(l => l.id === log.id);
    if (idx >= 0) logs[idx] = log;
    else logs.push(log);
    saveToStorage(STORAGE_KEYS.usageLogs, logs);
  },

  // Files
  getFiles: (): UploadedFile[] => loadFromStorage(STORAGE_KEYS.files, []),
  saveFile: (file: UploadedFile): void => {
    const files = store.getFiles();
    files.push(file);
    saveToStorage(STORAGE_KEYS.files, files);
  },
  deleteFile: (id: string): void => {
    const files = store.getFiles().filter(f => f.id !== id);
    saveToStorage(STORAGE_KEYS.files, files);
  },
};
