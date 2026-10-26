import React from 'react';

export default function Dashboard({ stats }) {
  const items = [
    { label: 'Total Applications', count: stats?.Total ?? 0, type: 'total' },
    { label: 'Applied', count: stats?.Applied ?? 0, type: 'applied' },
    { label: 'Interview', count: stats?.Interview ?? 0, type: 'interview' },
    { label: 'Selected', count: stats?.Selected ?? 0, type: 'selected' },
    { label: 'Rejected', count: stats?.Rejected ?? 0, type: 'rejected' },
  ];

  return (
    <section className="dashboard-grid">
      {items.map((item) => (
        <div key={item.label} className={`stat-card stat-${item.type}`}>
          <span className="stat-label">{item.label}</span>
          <span className="stat-count">{item.count}</span>
        </div>
      ))}
    </section>
  );
}