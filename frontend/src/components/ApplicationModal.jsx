import React, { useState, useEffect } from 'react';

export default function ApplicationModal({ isOpen, onClose, onSave, application }) {
  const [formData, setFormData] = useState({
    company_name: '',
    job_role: '',
    application_date: new Date().toISOString().split('T')[0],
    job_url: '',
    status: 'Applied',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        company_name: application.company_name || '',
        job_role: application.job_role || '',
        application_date: application.application_date || new Date().toISOString().split('T')[0],
        job_url: application.job_url || '',
        status: application.status || 'Applied',
      });
    } else {
      setFormData({
        company_name: '',
        job_role: '',
        application_date: new Date().toISOString().split('T')[0],
        job_url: '',
        status: 'Applied',
      });
    }
    setErrors({});
  }, [application, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.company_name.trim()) {
      errs.company_name = 'Company name cannot be blank';
    }
    if (!formData.job_role.trim()) {
      errs.job_role = 'Job role cannot be blank';
    }
    if (!formData.application_date) {
      errs.application_date = 'Application date is required';
    }
    if (formData.job_url && formData.job_url.trim()) {
      const url = formData.job_url.trim();
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        errs.job_url = 'URL must start with http:// or https://';
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      await onSave({
        company_name: formData.company_name.trim(),
        job_role: formData.job_role.trim(),
        application_date: formData.application_date,
        job_url: formData.job_url.trim() ? formData.job_url.trim() : null,
        status: formData.status,
      });
      onClose();
    } catch (err) {
      setErrors({ server: err.message });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{application ? 'Edit Application' : 'Add Application'}</h3>
          <button className="icon-btn" onClick={onClose}>&times;</button>
        </div>

        {errors.server && <div className="alert alert-error">{errors.server}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="e.g. Google"
            />
            {errors.company_name && <span className="field-error">{errors.company_name}</span>}
          </div>

          <div className="form-group">
            <label>Job Role *</label>
            <input
              type="text"
              value={formData.job_role}
              onChange={(e) => setFormData({ ...formData, job_role: e.target.value })}
              placeholder="e.g. Software Engineer"
            />
            {errors.job_role && <span className="field-error">{errors.job_role}</span>}
          </div>

          <div className="form-row">
            <div className="form-group flex-grow">
              <label>Application Date *</label>
              <input
                type="date"
                value={formData.application_date}
                onChange={(e) => setFormData({ ...formData, application_date: e.target.value })}
              />
              {errors.application_date && <span className="field-error">{errors.application_date}</span>}
            </div>

            <div className="form-group flex-grow">
              <label>Status *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Selected">Selected</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Job Posting URL (Optional)</label>
            <input
              type="text"
              value={formData.job_url}
              onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
              placeholder="https://company.com/careers/123"
            />
            {errors.job_url && <span className="field-error">{errors.job_url}</span>}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Saving...' : application ? 'Save Changes' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}