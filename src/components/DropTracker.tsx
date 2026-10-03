import { useState } from 'react';
import { useDrops, useProjects } from '../hooks';
import { CableDrop, DropStatus } from '../types';
import { v4 as uuid } from 'uuid';
import { Plus, Search, X, CheckCircle2, XCircle } from 'lucide-react';

export default function DropTracker() {
  const { drops, refresh, save, remove } = useDrops();
  const { projects } = useProjects();
  const [search, setSearch] = useState('');
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingDrop, setEditingDrop] = useState<CableDrop | null>(null);

  const filtered = drops.filter(d => {
    const matchSearch = d.cableId.toLowerCase().includes(search.toLowerCase()) ||
      d.sourceRack.toLowerCase().includes(search.toLowerCase()) ||
      d.destRack.toLowerCase().includes(search.toLowerCase());
    const matchProject = filterProject === 'all' || d.projectId === filterProject;
    const matchStatus = filterStatus === 'all' || d.status === filterStatus;
    return matchSearch && matchProject && matchStatus;
  });

  const statusCounts = {
    pulled: drops.filter(d => d.status === 'pulled').length,
    terminated: drops.filter(d => d.status === 'terminated').length,
    tested: drops.filter(d => d.status === 'tested').length,
  };

  const handleSave = (drop: CableDrop) => {
    save(drop);
    refresh();
    setShowForm(false);
    setEditingDrop(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this drop record?')) {
      remove(id);
      refresh();
    }
  };

  const statusBadge = (status: DropStatus) => {
    const colors = {
      pulled: 'bg-blue-100 text-blue-700',
      terminated: 'bg-amber-100 text-amber-700',
      tested: 'bg-emerald-100 text-emerald-700',
    };
    return <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-blue-700">{statusCounts.pulled}</p>
          <p className="text-xs text-blue-600">Pulled</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-amber-700">{statusCounts.terminated}</p>
          <p className="text-xs text-amber-600">Terminated</p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-emerald-700">{statusCounts.tested}</p>
          <p className="text-xs text-emerald-600">Tested</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search cable ID, source, destination..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
          <option value="all">All Statuses</option>
          <option value="pulled">Pulled</option>
          <option value="terminated">Terminated</option>
          <option value="tested">Tested</option>
        </select>
        <button
          onClick={() => { setEditingDrop(null); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" /> Add Drop
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Cable ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Source</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Destination</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Type</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Length</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Fluke</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map(drop => (
                <tr key={drop.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-4 py-2.5">
                    <span className="font-mono text-xs font-medium">{drop.cableId}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-gray-700">{drop.sourceRack}</span>
                    <span className="text-[10px] text-gray-400 ml-1">:{drop.sourcePort}</span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-xs text-gray-700">{drop.destRack}</span>
                    <span className="text-[10px] text-gray-400 ml-1">:{drop.destPort}</span>
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell">
                    <span className="text-xs text-gray-500">{drop.cableType.split('-').slice(0,2).join('-')}</span>
                  </td>
                  <td className="px-4 py-2.5 hidden lg:table-cell text-xs text-gray-500">{drop.length}m</td>
                  <td className="px-4 py-2.5 text-center">{statusBadge(drop.status)}</td>
                  <td className="px-4 py-2.5 text-center hidden sm:table-cell">
                    {drop.status === 'tested' ? (
                      drop.flukeTestPass ? 
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 inline" /> : 
                        <XCircle className="w-4 h-4 text-red-500 inline" />
                    ) : <span className="text-gray-300">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditingDrop(drop); setShowForm(true); }}
                        className="text-xs px-2 py-1 rounded hover:bg-gray-100 text-gray-500">Edit</button>
                      <button onClick={() => handleDelete(drop.id)}
                        className="text-xs px-2 py-1 rounded hover:bg-red-50 text-red-500">Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">No drops found</div>
        )}
        {filtered.length > 100 && (
          <div className="text-center py-2 text-xs text-gray-400 border-t">
            Showing 100 of {filtered.length} records
          </div>
        )}
      </div>

      {showForm && (
        <DropFormModal
          drop={editingDrop}
          projects={projects}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingDrop(null); }}
        />
      )}
    </div>
  );
}

function DropFormModal({ drop, projects, onSave, onClose }: { drop: CableDrop | null; projects: any[]; onSave: (d: CableDrop) => void; onClose: () => void }) {
  const [form, setForm] = useState<CableDrop>(drop || {
    id: uuid(),
    projectId: projects[0]?.id || '',
    cableId: '',
    cableType: 'CAT6A-LSZH-305',
    sourceRack: '',
    sourcePort: '',
    destRack: '',
    destPort: '',
    length: 0,
    status: 'pulled',
    flukeTestPass: null,
    flukeTestDate: null,
    technician: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">{drop ? 'Edit Drop' : 'Add Cable Drop'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Project</label>
              <select value={form.projectId} onChange={e => setForm({...form, projectId: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cable ID</label>
              <input required value={form.cableId} onChange={e => setForm({...form, cableId: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" placeholder="D001" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source Rack</label>
              <input required value={form.sourceRack} onChange={e => setForm({...form, sourceRack: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Source Port</label>
              <input value={form.sourcePort} onChange={e => setForm({...form, sourcePort: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dest Rack</label>
              <input required value={form.destRack} onChange={e => setForm({...form, destRack: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Dest Port</label>
              <input value={form.destPort} onChange={e => setForm({...form, destPort: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Cable Type</label>
              <select value={form.cableType} onChange={e => setForm({...form, cableType: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="CAT6A-LSZH-305">Cat6A LSZH</option>
                <option value="CAT6-UTP-305">Cat6 UTP</option>
                <option value="FIBER-OS2-12F">Fiber OS2</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Length (m)</label>
              <input type="number" value={form.length} onChange={e => setForm({...form, length: +e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as DropStatus})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                <option value="pulled">Pulled</option>
                <option value="terminated">Terminated</option>
                <option value="tested">Tested</option>
              </select>
            </div>
          </div>
          {form.status === 'tested' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Fluke Test Result</label>
                <select value={form.flukeTestPass === null ? '' : form.flukeTestPass ? 'pass' : 'fail'}
                  onChange={e => setForm({...form, flukeTestPass: e.target.value === 'pass', flukeTestDate: new Date().toISOString().split('T')[0]})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                  <option value="">Not tested</option>
                  <option value="pass">PASS</option>
                  <option value="fail">FAIL</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Technician</label>
                <input value={form.technician} onChange={e => setForm({...form, technician: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Drop</button>
          </div>
        </form>
      </div>
    </div>
  );
}
