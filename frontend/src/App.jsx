import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';
import SearchFilterBar from './components/SearchFilterBar';
import ApplicationList from './components/ApplicationList';
import ApplicationModal from './components/ApplicationModal';
import {
  getStats,
  getApplications,
  createApplication,
  updateApplication,
  deleteApplication,
} from './api.js';

export default function App() {
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('desc');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [currentApp, setCurrentApp] = useState(null);

  // Delete Confirmation State
  const [deletingApp, setDeletingApp] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const notify = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, appsRes] = await Promise.all([
        getStats(),
        getApplications({ search, status, sort }),
      ]);
      setStats(statsRes);
      setApplications(appsRes);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, status, sort]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setSort('desc');
  };

  const handleOpenAdd = () => {
    setCurrentApp(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (app) => {
    setCurrentApp(app);
    setModalOpen(true);
  };

  const handleSave = async (formData) => {
    if (currentApp) {
      await updateApplication(currentApp.id, formData);
      notify('Application updated successfully.');
    } else {
      await createApplication(formData);
      notify('Application added successfully.');
    }
    loadAll();
  };

  const handleConfirmDelete = async () => {
    if (!deletingApp) return;
    setDeleteLoading(true);
    try {
      await deleteApplication(deletingApp.id);
      notify('Application deleted successfully.');
      setDeletingApp(null);
      loadAll();
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="layout">
      <header className="navbar">
        <div>
          <h2>Job Application Tracker</h2>
          <p className="subtitle">Manage and track your recruitment pipeline</p>
        </div>
        <button className="btn btn-primary" onClick={handleOpenAdd}>
          + Add Application
        </button>
      </header>

      {notification && (
        <div className={`alert alert-${notification.type}`}>
          {notification.msg}
        </div>
      )}

      {/* Dashboard Section */}
      <Dashboard stats={stats} />

      {/* Search and Filters */}
      <SearchFilterBar
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        sort={sort}
        setSort={setSort}
        onReset={handleResetFilters}
      />

      {/* Table Section */}
      <section className="card">
        {loading ? (
          <div className="loader">Loading applications...</div>
        ) : (
          <ApplicationList
            applications={applications}
            onEdit={handleOpenEdit}
            onDeletePrompt={(app) => setDeletingApp(app)}
          />
        )}
      </section>

      {/* Create / Edit Modal */}
      <ApplicationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        application={currentApp}
      />

      {/* Delete Confirmation Dialog */}
      {deletingApp && (
        <div className="modal-overlay" onClick={() => setDeletingApp(null)}>
          <div className="modal-card confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Application</h3>
            <p>
              Are you sure you want to delete the record for{' '}
              <strong>{deletingApp.job_role}</strong> at{' '}
              <strong>{deletingApp.company_name}</strong>?
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setDeletingApp(null)}
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}