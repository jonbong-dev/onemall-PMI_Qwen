import { useState, useRef } from 'react';
import { useFiles, useProjects } from '../hooks';
import { UploadedFile } from '../types';
import { v4 as uuid } from 'uuid';
import { Upload, FileText, Trash2, X, Eye, Download, Image } from 'lucide-react';

export default function FileUploads() {
  const { files, refresh, save, remove } = useFiles();
  const { projects } = useProjects();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedProject, setSelectedProject] = useState(projects[0]?.id || '');
  const [fileType, setFileType] = useState<'photo' | 'rack-diagram' | 'fluke-report' | 'other'>('photo');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);

  const filteredFiles = files.filter(f => !selectedProject || f.projectId === selectedProject);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    Array.from(fileList).forEach(file => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const uploadedFile: UploadedFile = {
          id: uuid(),
          projectId: selectedProject || projects[0]?.id || '',
          fileName: file.name,
          fileType,
          uploadedAt: new Date().toISOString(),
          size: file.size,
          dataUrl: evt.target?.result as string,
        };
        save(uploadedFile);
        refresh();
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this file?')) {
      remove(id);
      refresh();
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'photo': return <Image className="w-4 h-4 text-blue-500" />;
      case 'rack-diagram': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'fluke-report': return <FileText className="w-4 h-4 text-emerald-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'photo': return 'bg-blue-100 text-blue-700';
      case 'rack-diagram': return 'bg-purple-100 text-purple-700';
      case 'fluke-report': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Upload className="w-4 h-4 text-blue-500" />
          Upload Files
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Upload site photos, rack diagrams, and Fluke test PDF reports. Files are stored locally in the browser.
        </p>

        <div className="flex flex-wrap gap-3 mb-4">
          <select value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <select value={fileType} onChange={e => setFileType(e.target.value as any)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm">
            <option value="photo">📷 Site Photo</option>
            <option value="rack-diagram">📐 Rack Diagram</option>
            <option value="fluke-report">📊 Fluke Test Report</option>
            <option value="other">📄 Other</option>
          </select>
        </div>

        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600 font-medium">Click to upload files</p>
          <p className="text-xs text-gray-400 mt-1">Photos, PDFs, diagrams • Max 10MB per file</p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.png,.jpg,.jpeg"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>

      {/* Files Grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-4">
          Uploaded Files ({filteredFiles.length})
        </h3>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No files uploaded yet
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredFiles.map(file => (
              <div key={file.id} className="border border-gray-200 rounded-lg p-3 hover:border-gray-300 transition-colors">
                {/* Preview */}
                <div className="aspect-video bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                  {file.fileType === 'photo' && file.dataUrl ? (
                    <img src={file.dataUrl} alt={file.fileName} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center">
                      {getFileIcon(file.fileType)}
                      <p className="text-[10px] text-gray-400 mt-1">{file.fileType}</p>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-1">
                  <p className="text-xs font-medium text-gray-800 truncate">{file.fileName}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getTypeColor(file.fileType)}`}>
                      {file.fileType}
                    </span>
                    <span className="text-[10px] text-gray-400">{formatSize(file.size)}</span>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 mt-2 pt-2 border-t border-gray-100">
                  <button onClick={() => setPreviewFile(file)}
                    className="flex-1 text-[10px] py-1 rounded hover:bg-gray-100 text-gray-600 flex items-center justify-center gap-1">
                    <Eye className="w-3 h-3" /> View
                  </button>
                  {file.dataUrl && (
                    <a href={file.dataUrl} download={file.fileName}
                      className="flex-1 text-[10px] py-1 rounded hover:bg-gray-100 text-gray-600 flex items-center justify-center gap-1">
                      <Download className="w-3 h-3" /> Save
                    </a>
                  )}
                  <button onClick={() => handleDelete(file.id)}
                    className="flex-1 text-[10px] py-1 rounded hover:bg-red-50 text-red-500 flex items-center justify-center gap-1">
                    <Trash2 className="w-3 h-3" /> Del
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setPreviewFile(null)}>
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <div>
                <p className="font-medium text-sm text-gray-800">{previewFile.fileName}</p>
                <p className="text-xs text-gray-400">{formatSize(previewFile.size)} • {previewFile.fileType}</p>
              </div>
              <button onClick={() => setPreviewFile(null)} className="p-1 rounded hover:bg-gray-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex items-center justify-center min-h-[300px] bg-gray-50">
              {previewFile.fileType === 'photo' && previewFile.dataUrl ? (
                <img src={previewFile.dataUrl} alt={previewFile.fileName} className="max-w-full max-h-[60vh] object-contain" />
              ) : (
                <div className="text-center">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Preview not available for this file type</p>
                  <a href={previewFile.dataUrl} download={previewFile.fileName}
                    className="inline-flex items-center gap-1 mt-3 text-sm text-emerald-600 hover:text-emerald-700">
                    <Download className="w-4 h-4" /> Download File
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
