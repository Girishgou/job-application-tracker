import React from 'react';

export default function ApplicationList({ applications, onEdit, onDeletePrompt }) {
  if (!applications || applications.length === 0) {
    return (
      <div className="empty-state">
        <p>No job applications found matching your criteria.</p>
      </div>
    );
  }

  const badgeClass = (st) => `badge badge-${st.toLowerCase()}`;

  return (
    <div className="table-wrapper">
      <table className="app-table">
        <thead>
          <tr>
            <th>Company</th>
            <th>Role</th>
            <th>Date Applied</th>
            <th>Status</th>
            <th>Job Link</th>
            <th className="actions-header">Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr key={app.id}>
              <td className="fw-bold">{app.company_name}</td>
              <td>{app.job_role}</td>
              <td>{app.application_date}</td>
              <td>
                <span className={badgeClass(app.status)}>{app.status}</span>
              </td>
              <td>
                {app.job_url ? (
                  <a href={app.job_url} target="_blank" rel="noreferrer" className="link-ext">
                    Link &#8599;
                  </a>
                ) : (
                  <span className="muted-text">—</span>
                )}
              </td>
              <td className="actions-cell">
                <button className="btn-sm btn-outline" onClick={() => onEdit(app)}>
                  Edit
                </button>
                <button className="btn-sm btn-danger" onClick={() => onDeletePrompt(app)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}