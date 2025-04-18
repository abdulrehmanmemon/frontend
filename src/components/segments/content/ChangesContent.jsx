import { useState, useEffect, useMemo } from 'react';
import { supabaseSegments } from '../../../helpers/supabaseClient';

export function ChangesContent({ segmentId }) {
  const [changesData, setChangesData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchSegmentExecutionStatus() {
      if (!segmentId) return;
      const { data, error } = await supabaseSegments
        .from('segment_execution_status')
        .select('segment_id, created_at, number_of_records, number_of_added')
        .eq('segment_id', segmentId);

      if (error) {
        console.error('Error fetching data:', error);
      } else {
        console.log('Fetched Data:', data); // Debugging log
        setChangesData(data || []);
      }
    }

    fetchSegmentExecutionStatus();
  }, [segmentId]);

  const filteredChanges = useMemo(() => {
    return changesData.filter((change) =>
      Object.values(change).some((value) =>
        value?.toString().toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [changesData, searchQuery]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm">
      <div className="overflow-x-auto">
        <table className="table table-zebra w-full" role="table">
          <thead>
            <tr>
              <th>Created At</th>
              <th>Total Records</th>
              <th>Added Records</th>
            </tr>
          </thead>
          <tbody>
            {filteredChanges.length > 0 ? (
              filteredChanges.map((change, index) => (
                <tr key={index}>
                  <td>{new Date(change.created_at).toLocaleString()}</td>
                  <td>{change.number_of_records}</td>
                  <td>{change.number_of_added}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="text-center text-gray-500">
                  No changes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ChangesContent;
