import { useProjects, useInventory, useDrops } from '../hooks';
import { 
  Package, AlertTriangle, Cable,
  FolderOpen, TrendingUp, Activity, Shield 
} from 'lucide-react';

export default function Dashboard() {
  const { projects } = useProjects();
  const { items } = useInventory();
  const { drops } = useDrops();

  const activeProjects = projects.filter(p => p.status === 'in-progress').length;
  const lowStockItems = items.filter(i => i.totalStock <= i.reorderThreshold);
  const testedDrops = drops.filter(d => d.status === 'tested');
  const passedTests = testedDrops.filter(d => d.flukeTestPass === true).length;
  const passRate = testedDrops.length > 0 ? (passedTests / testedDrops.length * 100) : 0;

  const statusCounts = {
    pulled: drops.filter(d => d.status === 'pulled').length,
    terminated: drops.filter(d => d.status === 'terminated').length,
    tested: testedDrops.length,
  };
  const totalDrops = drops.length;

  const categoryStock = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + item.totalStock;
    return acc;
  }, {} as Record<string, number>);

  const stats = [
    { label: 'Active Projects', value: activeProjects, total: projects.length, icon: FolderOpen, color: 'bg-blue-500', lightColor: 'bg-blue-50 text-blue-700' },
    { label: 'Low Stock Alerts', value: lowStockItems.length, icon: AlertTriangle, color: 'bg-amber-500', lightColor: 'bg-amber-50 text-amber-700' },
    { label: 'Cable Drops', value: totalDrops, icon: Cable, color: 'bg-purple-500', lightColor: 'bg-purple-50 text-purple-700' },
    { label: 'Fluke Pass Rate', value: `${passRate.toFixed(0)}%`, icon: Shield, color: 'bg-emerald-500', lightColor: 'bg-emerald-50 text-emerald-700' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  {'total' in stat && stat.total && (
                    <p className="text-xs text-gray-400 mt-0.5">of {stat.total} total</p>
                  )}
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.lightColor} flex items-center justify-center`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drop Progress */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-purple-500" />
            Drop Progress Overview
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Pulled</span>
                <span className="font-medium">{statusCounts.pulled} / {totalDrops}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-blue-400 rounded-full transition-all"
                  style={{ width: `${totalDrops ? (statusCounts.pulled / totalDrops * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Terminated</span>
                <span className="font-medium">{statusCounts.terminated} / {totalDrops}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-amber-400 rounded-full transition-all"
                  style={{ width: `${totalDrops ? (statusCounts.terminated / totalDrops * 100) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Tested (Passed)</span>
                <span className="font-medium">{passedTests} / {totalDrops}</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-emerald-400 rounded-full transition-all"
                  style={{ width: `${totalDrops ? (passedTests / totalDrops * 100) : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Inventory by Category */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Package className="w-4 h-4 text-blue-500" />
            Stock by Category
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryStock).map(([cat, qty]) => (
              <div key={cat} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-sm text-gray-700">{cat}</span>
                <span className="text-sm font-semibold text-gray-900">{qty} units</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {lowStockItems.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-sm">
          <h3 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Low Stock Alerts ({lowStockItems.length} items)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="pb-2 font-medium">Item Code</th>
                  <th className="pb-2 font-medium">Description</th>
                  <th className="pb-2 font-medium text-right">Stock</th>
                  <th className="pb-2 font-medium text-right">Threshold</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.map(item => (
                  <tr key={item.id} className="border-b border-gray-50 last:border-0">
                    <td className="py-2 font-mono text-xs text-amber-700">{item.itemCode}</td>
                    <td className="py-2 text-gray-700">{item.description}</td>
                    <td className="py-2 text-right font-semibold text-red-600">{item.totalStock} {item.unit}</td>
                    <td className="py-2 text-right text-gray-500">{item.reorderThreshold} {item.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Projects */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Active Projects
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {projects.filter(p => p.status === 'in-progress' || p.status === 'planning').map(project => {
            const projectDrops = drops.filter(d => d.projectId === project.id);
            const tested = projectDrops.filter(d => d.status === 'tested').length;
            return (
              <div key={project.id} className="border border-gray-100 rounded-lg p-3 hover:border-gray-300 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{project.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{project.location}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                    project.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {project.status}
                  </span>
                </div>
                <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                  <span>{projectDrops.length} drops</span>
                  <span>•</span>
                  <span>{tested} tested</span>
                  <span>•</span>
                  <span>Due: {project.targetDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
