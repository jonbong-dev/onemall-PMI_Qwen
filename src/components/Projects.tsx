import { useState } from 'react';
import { useProjects, useDrops } from '../hooks';
import { Project, ProjectStatus } from '../types';
import { v4 as uuid } from 'uuid';
import { Plus, Edit2, Trash2, X, MapPin, Calendar } from 'lucide-react';

const statuses: ProjectStatus[] = ['planning', 'in-progress', 'testing', 'completed', 'on-hold'];

const statusColors: Record<ProjectStatus, string> = {
  'planning': 'bg-gray-100 text-gray-700',
  'in-progress': 'bg-blue-100 text-blue-700',
  'testing': 'bg-amber-100 text-amber-700',
  'completed': 'bg-emerald-100 text-emerald-700',
  'on-hold': 'bg-red-100 text-red-700',
};

export default function Projects() {
  const { projects, refresh, save, remove } = useProjects();
  const { drops } = useDrops();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filtered = projects.filter(p => filterStatus === 'all' || p.status === filterStatus);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this project and all associated data?')) {
      remove(id);
      refresh();
    }
  };

  const handleSave = (project: Project) => {
    save(project);
    refresh();
    setShowForm(false);
    setEditingProject(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm"
          >
            <option value="all">All Statuses</option>
            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button
          onClick={() => { setEditingProject(null); setShowForm(true); }}
          className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
        >
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(project => {
          const projectDrops = drops.filter(d => d.projectId === project.id);
          const tested = projectDrops.filter(d => d.status === 'tested').length;
          const terminated = projectDrops.filter(d => d.status === 'terminated').length;
          const progress = projectDrops.length > 0 ? ((tested + terminated) / projectDrops.length * 100) : 0;

          return (
            <div key={project.id} className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-800 text-sm leading-tight">{project.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${statusColors[project.status]}`}>
                  {project.status}
                </span>
              </div>
              <div className="space-y-1.5 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> {project.location}
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> {project.startDate} → {project.targetDate}
                </div>
                <div className="text-gray-700 font-medium">Client: {project.client}</div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                  <span>{projectDrops.length} drops</span>
                  <span>{tested} tested</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden flex">
                  <div className="bg-emerald-400 h-full" style={{ width: `${projectDrops.length ? (tested / projectDrops.length * 100) : 0}%` }} />
                  <div className="bg-amber-400 h-full" style={{ width: `${projectDrops.length ? (terminated / projectDrops.length * 100) : 0}%` }} />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{progress.toFixed(0)}% complete</p>
              </div>

              <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100">
                <button onClick={() => handleEdit(project)} className="flex-1 text-xs py-1.5 rounded hover:bg-gray-100 text-gray-600 flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> Edit
                </button>
                <button onClick={() => handleDelete(project.id)} className="flex-1 text-xs py-1.5 rounded hover:bg-red-50 text-red-500 flex items-center justify-center gap-1">
                  <Trash2 className="w-3 h-3" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">No projects found</div>
      )}

      {showForm && (
        <ProjectFormModal
          project={editingProject}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingProject(null); }}
        />
      )}
    </div>
  );
}

function ProjectFormModal({ project, onSave, onClose }: { project: Project | null; onSave: (p: Project) => void; onClose: () => void }) {
  const [form, setForm] = useState<Project>(project || {
    id: uuid(),
    name: '',
    client: '',
    location: '',
    status: 'planning',
    startDate: new Date().toISOString().split('T')[0],
    targetDate: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-lg">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h3 className="font-semibold text-gray-800">{project ? 'Edit Project' : 'New Project'}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Project Name</label>
            <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Client</label>
              <input required value={form.client} onChange={e => setForm({...form, client: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
              <input required value={form.location} onChange={e => setForm({...form, location: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm({...form, status: e.target.value as ProjectStatus})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20">
                {statuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => setForm({...form, startDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Target Date</label>
              <input type="date" value={form.targetDate} onChange={e => setForm({...form, targetDate: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20" rows={2} />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Save Project</button>
          </div>
        </form>
      </div>
    </div>
  );
}
