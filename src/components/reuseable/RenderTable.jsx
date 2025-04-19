import React from 'react';

const RenderTable = ({ columns, data, renderActions, onRowClick, workflowConfig }) => {
  const handleRowClick = async (row) => {
    if (onRowClick) {
      onRowClick(row);
    }

    if (workflowConfig) {
      try {
        const token = localStorage.getItem('sb-access-token');
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/execute_dynamic_workflow`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            workflow_json: workflowConfig
          })
        });

        if (!response.ok) {
          throw new Error('Failed to execute workflow');
        }

        const result = await response.json();
        console.log('Workflow execution result:', result);
        // You can handle the result here (e.g., show a success message)
      } catch (error) {
        console.error('Error executing workflow:', error);
        // Handle error (e.g., show error message)
      }
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="table w-full">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.label}</th>
            ))}
            {renderActions && <th>Action</th>}
          </tr>
        </thead>
        <tbody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <tr 
                key={rowIndex} 
                onClick={() => handleRowClick(row)} 
                className='cursor-pointer hover:bg-gray-50'
              >
                {columns.map((col, colIndex) => (
                  <td key={colIndex}>{row[col.key]}</td>
                ))}
                {renderActions && (
                  <td>{renderActions(row)}</td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length + (renderActions ? 1 : 0)} className="text-center text-gray-500">
                No records match your search.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default RenderTable;
