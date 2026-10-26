import React from 'react';

export default function SearchFilterBar({
  search,
  setSearch,
  status,
  setStatus,
  sort,
  setSort,
  onReset,
}) {
  return (
    <div className="filter-bar">
      <div className="field flex-grow">
        <label htmlFor="search-input">Search</label>
        <input
          id="search-input"
          type="text"
          placeholder="Filter by company or job role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="field">
        <label htmlFor="status-select">Status</label>
        <select
          id="status-select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Selected">Selected</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="field">
        <label htmlFor="sort-select">Sort by Date</label>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
      </div>

      <button type="button" className="btn btn-secondary reset-btn" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}