import React, { useEffect, useState } from 'react';
import { fetchBigNumbers, fetchBarChartData } from '../../../helpers/cubeQueries';
import { Bar } from 'react-chartjs-2';
import { Icon } from "@/components/Icon";
import Card from "@/components/daisyui/Card/Card";
import CardBody from "@/components/daisyui/Card/CardBody";
import Badge from "@/components/daisyui/Badge/Badge";
import arrowDownIcon from '@iconify/icons-lucide/arrow-down';
import arrowUpIcon from '@iconify/icons-lucide/arrow-up';
import dollarSignIcon from '@iconify/icons-lucide/dollar-sign';
import userIcon from '@iconify/icons-lucide/user';
import boxIcon from '@iconify/icons-lucide/box';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';


const RevenueDashboard = () => {
  const [bigNumbers, setBigNumbers] = useState({
    totalRevenue: 0,
    totalActiveCustomers: 0,
    revenuePerCharge: 0,
  });
  const [selectedMetric, setSelectedMetric] = useState('revenueByProduct');
  const [barChartData, setBarChartData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const loadBigNumbers = async () => {
      const data = await fetchBigNumbers();
      setBigNumbers(data);
    };
    loadBigNumbers();
  }, []);

  useEffect(() => {
    const loadBarChartData = async () => {
      const data = await fetchBarChartData(selectedMetric);
      setBarChartData(data);
    };
    loadBarChartData();
  }, [selectedMetric]);

  // Ensure barChartData is available before generating the chart
  if (barChartData.length === 0) {
    return <p className="text-center text-gray-500">Loading chart...</p>;
  }

  // Extract unique months for the X-axis labels and format them
  const labels = [
    ...new Set(
      barChartData.map((item) =>
        format(new Date(item['charge.charge_date']), "MMM")
      )
    ),
  ];

  // Transform data into stacked dataset format
  const categoryData = barChartData.reduce((acc, item) => {
    const category = item[Object.keys(item)[0]] || 'Unknown'; // Category (product, charge type, etc.)
    const month = format(new Date(item['charge.charge_date']), "MMM");
    const revenue = item['charge.total_revenue_charge'] || 0;

    if (!acc[category]) acc[category] = {};
    acc[category][month] = revenue;
    return acc;
  }, {});

  const datasetColors = [
      '#00747D', // Dark teal
      '#88C8D9', // Pale blue
      '#F4A6B7', // Soft pink
      '#41B6C4', // Light teal
      '#0095A0', // Medium teal
  ];
  
  const datasets = Object.entries(categoryData).map(([category, monthData], index) => ({
    label: category,
    data: labels.map((month) => monthData[month] || 0),
    backgroundColor: datasetColors[index % datasetColors.length],
    borderColor: 'rgba(0, 0, 0, 0.1)',
    borderWidth: 1,
    stack: 'RevenueStack',
  }));
  
  

  const barChartConfig = {
    labels,
    datasets,
    options: {
      responsive: true,
      maintainAspectRatio: false, // Allows full container usage
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            boxWidth: 12,
            padding: 10,
            font: {
              size: 12,
            },
          },
        },
        layout: {
          padding: {
            top: 20,
            bottom: 10,
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          ticks: {
            maxRotation: 0,
          },
        },
        y: {
          stacked: true,
          title: {
            display: true,
            text: 'Revenue ($)',
          },
          ticks: {
            beginAtZero: true,
            callback: (value) => `$${value.toLocaleString()}`,
          },
        },
      },
    },
  };
  
  
  
  return (
    <div className="p-4 bg-gray-100">
      {/* Big Numbers Section */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          {
            title: 'Total Revenue',
            value: Math.round(Number(bigNumbers.totalRevenue) || 0),
            change: (Number(bigNumbers.percentMoM) || 0).toFixed(2),
            isPositive: Number(bigNumbers.MoMRevenue) > 0,
            changeAmount: (Number(bigNumbers.MoMRevenue) || 0).toFixed(2),
            icon: dollarSignIcon,
          },
          {
            title: 'Active Customers',
            value: Math.round(Number(bigNumbers.totalActiveCustomers) || 0),
            change: (Number(bigNumbers.percentMoMActive) || 0).toFixed(2),
            isPositive: Number(bigNumbers.MoMActive) > 0,
            changeAmount: (Number(bigNumbers.MoMActive) || 0).toFixed(2),
            icon: userIcon,
          },
          {
            title: 'Revenue per Sale',
            value: Math.round(Number(bigNumbers.revenuePerCharge) || 0),
            change: (Number(bigNumbers.percentMoMrpc) || 0).toFixed(2),
            isPositive: Number(bigNumbers.MoMrpc) > 0,
            changeAmount: (Number(bigNumbers.MoMrpc) || 0).toFixed(2),
            icon: boxIcon,
          }

        ].map((data, index) => (
          <Card className="bg-base-100 shadow" bordered={false} key={index}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-base-content/80">{data.title}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <p className="text-2xl font-bold">
                      ${data.value.toLocaleString()}
                    </p>
                    <Badge
                      className={`gap-1 border-0 py-1.5 text-xs font-semibold rounded-full ${
                        data.isPositive ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                      }`}
                    >
                      <Icon
                        icon={data.isPositive ? arrowUpIcon : arrowDownIcon}
                        fontSize={12}
                      />
                      {Math.abs(data.change)}%
                    </Badge>
                  </div>
                </div>
                <div className="rounded bg-base-200 p-2">
                  <Icon
                    icon={data.icon}
                    fontSize={20}
                    className="text-base-content/80"
                  />
                </div>
              </div>
              <p className="mt-3 text-sm font-medium">
                <span
                  className={`${
                    data.isPositive ? 'text-success' : 'text-error'
                  }`}
                >
                  {data.isPositive ? '+' : '-'}$
                  {Math.abs(data.changeAmount).toLocaleString()}
                </span>
                <span className="ml-1.5 text-base-content/60">than last month</span>
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Bar Chart Section */}
      <div className="grid gap-4">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full h-[500px] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">
            Revenue Trends over 12 months
          </h2>
          <select
            className="select select-bordered w-50 rounded-lg border-gray-300 bg-white shadow focus:outline-none focus:ring-2 text-sm"
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
          >
            <option value="revenueByProduct">Revenue by Product</option>
            <option value="revenueByChargeType">Revenue by Charge Type</option>
            <option value="revenueByCustomerLifeCycle">Revenue by Customer Life Cycle</option>
          </select>
        </div>
        <div className="h-[400px]">
          <Bar data={barChartConfig} options={barChartConfig.options} />
        </div>
        



      </div>
    </div>
      </div>


      

  );
};

export default RevenueDashboard;