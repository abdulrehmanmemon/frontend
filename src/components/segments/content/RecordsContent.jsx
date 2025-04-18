import React, { useState, useMemo } from 'react';
import RenderTable from '../../reuseable/RenderTable';

export function RecordsContent() {
  const [records, setRecords] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRecords = useMemo(() => {
    return records.filter((record) =>
      Object.values(record).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [records, searchQuery]);

  const columns = [
    { label: 'User ID', key: 'userId' },
    { label: 'Company', key: 'company' },
    { label: 'Last Visit', key: 'lastVisit' },
    { label: 'Profile ID', key: 'profileId' },
  ];

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <RenderTable 
        columns={columns} 
        data={filteredRecords} 
        renderActions={(row) => (
          <button className="btn btn-ghost btn-sm" aria-label={`Actions for user ${row.userId}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="12" cy="12" r="1" />
              <circle cx="6" cy="12" r="1" />
              <circle cx="18" cy="12" r="1" />
            </svg>
          </button>
        )}
      />
    </div>
  );
}

export default RecordsContent;
