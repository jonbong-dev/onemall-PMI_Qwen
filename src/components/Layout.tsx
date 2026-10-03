import { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Cable, 
  FolderOpen, 
  FileSpreadsheet, 
  Upload, 
  Menu, 
  X,
  Zap
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory Master', icon: Package },
  { id: 'projects', label: 'Projects', icon: FolderOpen },
  { id: 'drops', label: 'Drop Tracker', icon: Cable },
  { id: 'import-export', label: 'Import / Export', icon: FileSpreadsheet },
  { id: 'uploads', label: 'Files & Reports', icon: Upload },
];

export default function Layout({ children, currentPage, onNavigate }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 bg-slate-900 text-white flex flex-col
        transform transition-transform duration-200
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-700">
          <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">Onemall PM</h1>
            <p className="text-[10px] text-slate-400">Cabling Inventory</p>
          </div>
          <button className="ml-auto lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { onNavigate(item.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-5 py-2.5 text-sm transition-colors
                  ${isActive 
                    ? 'bg-emerald-600/20 text-emerald-400 border-r-2 border-emerald-400' 
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'}
                `}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="px-5 py-3 border-t border-slate-700 text-[10px] text-slate-500">
          v1.0.0 • Structured Cabling PM
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-3 lg:px-6">
          <button 
            className="lg:hidden p-1.5 rounded-md hover:bg-gray-100"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-semibold text-gray-800">
            {navItems.find(n => n.id === currentPage)?.label || 'Dashboard'}
          </h2>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
