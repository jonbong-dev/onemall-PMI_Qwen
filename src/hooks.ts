import { useState, useCallback } from 'react';
import { store } from './store';
import { Project, InventoryItem, CableDrop, UsageLog, UploadedFile } from './types';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>(store.getProjects());
  const refresh = useCallback(() => setProjects(store.getProjects()), []);
  return { projects, refresh, save: store.saveProject, remove: store.deleteProject };
}

export function useInventory() {
  const [items, setItems] = useState<InventoryItem[]>(store.getInventory());
  const refresh = useCallback(() => setItems(store.getInventory()), []);
  return { items, refresh, save: store.saveInventoryItem, remove: store.deleteInventoryItem };
}

export function useDrops() {
  const [drops, setDrops] = useState<CableDrop[]>(store.getDrops());
  const refresh = useCallback(() => setDrops(store.getDrops()), []);
  return { drops, refresh, save: store.saveDrop, remove: store.deleteDrop };
}

export function useUsageLogs() {
  const [logs, setLogs] = useState<UsageLog[]>(store.getUsageLogs());
  const refresh = useCallback(() => setLogs(store.getUsageLogs()), []);
  return { logs, refresh, save: store.saveUsageLog };
}

export function useFiles() {
  const [files, setFiles] = useState<UploadedFile[]>(store.getFiles());
  const refresh = useCallback(() => setFiles(store.getFiles()), []);
  return { files, refresh, save: store.saveFile, remove: store.deleteFile };
}
