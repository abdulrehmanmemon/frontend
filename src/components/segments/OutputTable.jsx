export default function OutputTable({ data }) {
  const formatValue = (value) => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'object') {
      // Handle JSON objects (like fx_exposure)
      return JSON.stringify(value);
    }
    return value.toString();
  };

  return (
    <div className="w-full overflow-auto max-h-[800px] border border-gray-300 shadow-sm">
      <div className="w-full overflow-auto">
        <table className="border-collapse table table-compact">
          <thead className="bg-gray-200 sticky top-0 text-xs">
            <tr>
              {data.length > 0 &&
                Object.keys(data[0]).map((key) => (
                  <th key={key} className="px-2 py-2 border border-gray-300 text-left text-sm">
                    {key}
                  </th>
                ))}
            </tr>
          </thead>
          <tbody>
            {data.length > 0 ? (
              data.map((row, index) => (
                <tr key={index} className="odd:bg-white even:bg-gray-100">
                  {Object.values(row).map((value, idx) => (
                    <td key={idx} className="px-2 py-2 border border-gray-300 text-xs">
                      {formatValue(value)}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="100%" className="text-center py-4">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
