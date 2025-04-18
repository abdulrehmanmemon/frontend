import 'chart.js/auto';
import { Line } from 'react-chartjs-2';

const RatiosChart = ({ data }) => {
  console.log(data)
  if (!Array.isArray(data) || data.length === 0) {
    return <p className="text-gray-500 text-center mt-2 flex justify-center">No chart data available</p>;
  }

  // Filter out invalid entries (must have both year and ratio)
  const cleanedData = data.filter(entry => entry.year && entry.score !== undefined);

  if (cleanedData.length === 0) {
    return <p className="text-gray-500 text-center flex justify-center">No chart data available</p>;
  }

  const chartData = {
    labels: cleanedData.map(entry => entry.year), // Extract years
    datasets: [
      {
        label: 'Current Ratio',
        data: cleanedData.map(entry => entry.score), // Extract ratio values
        backgroundColor: 'rgba(54, 162, 235, 0.5)', 
        borderColor: 'rgba(54, 162, 235, 1)', 
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { beginAtZero: false, title: { display: true, text: 'Score' }, ticks: {
        padding: 10, // Adds space between X-axis values
      }, },
      x: { title: { display: true, text: 'Year' }, ticks: {
        padding: 10, // Adds space between X-axis values
      }, },
    },
  };
  

  return (
    <div className="w-full h-[35vh]">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default RatiosChart;
