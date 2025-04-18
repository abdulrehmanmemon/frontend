import { CubeProvider } from '@cubejs-client/react';
import { ChartViewer } from '/src/components/charts/ChartViewer.jsx';
import extractHashConfig from '../../helpers/hashConfig.js';
import QueryRenderer from './QueryRenderer.jsx';
import cube from '@cubejs-client/core';

const Table = ({ resultSet }) => {
  if (!resultSet) return <p>Loading...</p>;

  const data = resultSet.tablePivot();
  const columns = resultSet.tableColumns();

  return (
    <div className="overflow-x-auto">
      <div className="overflow-y-auto" style={{ maxHeight: 'calc(6 * 2rem)' }}>
        <table className="table text-xs w-full">
          <thead>
            <tr className='text-xs'>
              {columns.map((col) => (
                <th key={col.key}>{col.title}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map((col) => (
                  <td key={col.key}>{row[col.key]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function ChartDisplay({ d_query, d_pivotConfig, d_chartType }) {
  // Extract parameters from the URL or provided props
  const { apiUrl, apiToken, query, pivotConfig, chartType, useSubscription } = extractHashConfig({
    apiUrl: import.meta.env.VITE_CUBE_API_URL || '',
    apiToken: import.meta.env.VITE_CUBE_API_TOKEN || '',
    query: typeof d_query === 'string' ? JSON.parse(d_query) : d_query,
    pivotConfig: typeof d_pivotConfig === 'string' ? JSON.parse(d_pivotConfig) : d_pivotConfig,
    chartType: d_chartType,
    websockets: import.meta.env.VITE_CUBE_API_USE_WEBSOCKETS === 'true',
    subscription: import.meta.env.VITE_CUBE_API_USE_SUBSCRIPTION === 'true',
  });

  // Change chart type to 'bar' if it's 'large number'
  const normalizedChartType = chartType === 'large number' ? 'bar' : chartType;

  const cubeApi = cube(apiToken, { apiUrl });

  return (
    <CubeProvider cubeApi={cubeApi}>
      <QueryRenderer query={query} subscribe={useSubscription}>
        {({ resultSet }) => (
          normalizedChartType === 'table' ? (
            <Table resultSet={resultSet} />
          ) : (
            <ChartViewer
              chartType={normalizedChartType}
              resultSet={resultSet}
              pivotConfig={pivotConfig}
            />
          )
        )}
      </QueryRenderer>
    </CubeProvider>
  );
}

export default ChartDisplay;
