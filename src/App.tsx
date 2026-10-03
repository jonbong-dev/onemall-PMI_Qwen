import { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import InventoryMaster from './components/InventoryMaster';
import Projects from './components/Projects';
import DropTracker from './components/DropTracker';
import ImportExport from './components/ImportExport';
import FileUploads from './components/FileUploads';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <Dashboard />;
      case 'inventory': return <InventoryMaster />;
      case 'projects': return <Projects />;
      case 'drops': return <DropTracker />;
      case 'import-export': return <ImportExport />;
      case 'uploads': return <FileUploads />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onNavigate={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
}
