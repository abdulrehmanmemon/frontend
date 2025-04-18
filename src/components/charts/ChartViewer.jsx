import React from 'react';
import 'chart.js/auto';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import { ResultSet} from '@cubejs-client/core';

/**
 * ChartViewer Component
 *
 * @param {Object} props - Component props
 * @param {ResultSet} props.resultSet - Cube.js result set object
 * @param {PivotConfig} props.pivotConfig - Pivot configuration for the chart
 * @param {string} props.chartType - Type of chart to render (e.g., 'line', 'bar', 'doughnut', 'pie', etc.)
 * @returns {JSX.Element} A rendered Chart.js chart component
 */
const ChartViewer = ({ resultSet, pivotConfig, chartType }) => {
  const data = {
    labels: resultSet.chartPivot(pivotConfig).map((row) => row.x),
    datasets: resultSet.series(pivotConfig).map((item) => ({
      fill: chartType === 'area',
      label: item.title,
      data: item.series.map(({ value }) => value),
    })),
  };

  // Map chart types to corresponding Chart.js components
  const ChartElement = {
    area: Line,
    bar: Bar,
    doughnut: Doughnut,
    line: Line,
    pie: Pie,
  }[chartType];

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0, // Adjust as needed
    },
  };

  if (!ChartElement) {
    return <div>Unsupported chart type: {chartType}</div>;
  }

  return <ChartElement data={data} options={options} />;
};

export {ChartViewer};
