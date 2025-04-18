import React, { useEffect, useState } from 'react';
import { fetchDealData } from '../../../helpers/cubeQueries';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Icon } from "@/components/Icon";
import Card from "@/components/daisyui/Card/Card";
import CardBody from "@/components/daisyui/Card/CardBody";
import trophyIcon from '@iconify/icons-lucide/trophy';
import dollarSignIcon from '@iconify/icons-lucide/dollar-sign';

const DealDashboard = () => {
  const [dealsByStage, setDealsByStage] = useState([]);
  const [dealsByIndustry, setdealsByIndustry] = useState([]);
  
  const [bigNumbers, setBigNumbers] = useState({
    totalDealValue: 0,
    avgDealValue: 0,
    maxDealValue: 0,
    minDealValue: 0,
    totalDeals: 0,
    wonDeals: 0,
    lostDeals: 0,
    winRate: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const data = await fetchDealData(); // Fetch all data in one call
      console.log('Fetched Data:', data); // Debugging: Verify the structure of data

      // Update big numbers
      setBigNumbers({
        totalDealValue: data.totalDealValue?.[0]?.['deal.total_value_deal'] || 0,
        avgDealValue: data.avgDealValue?.[0]?.['deal.avg_value_deal'] || 0,
        maxDealValue: data.maxDealValue?.[0]?.['deal.max_value_deal'] || 0,
        minDealValue: data.minDealValue?.[0]?.['deal.min_value_deal'] || 0,
        totalDeals: data.dealCount?.[0]?.['deal.count_deal'] || 0,
        wonDeals: data.wonDeals?.[0]?.['deal.won_deal'] || 0,
        lostDeals: data.lostDeals?.[0]?.['deal.lost_deal'] || 0,
        winRate: data.winRate?.[0]?.['deal.win_rate_deal'] || 0,
      });

      // Update chart data
      setDealsByStage(data.dealsByStage || []);
      setdealsByIndustry(data.dealsByIndustry || []);
    };

    loadData();
  }, []);

  // Deals by Stage (Bar Chart)
  const dealsByStageData = dealsByStage.reduce((acc, item) => {
    const stage = item['deal.stage'];
    acc[stage] = (acc[stage] || 0) + item['deal.count_deal'];
    return acc;
  }, {});

  const barChartConfig = {
    labels: Object.keys(dealsByStageData),
    datasets: [
      {
        label: 'Number of Deals',
        data: Object.values(dealsByStageData),
        backgroundColor: '#00747D',
        borderColor: 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
          position: 'top',
        },
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Stages', 
          },
          ticks: {
            maxRotation: 45, 
            font: {
              size: 12, 
            },
          },
        },
        y: {
          title: {
            display: true,
            text: 'Number of Deals',
          },
          ticks: {
            beginAtZero: true,
          },
        },
      },
      
    },
  };

  // Revenue by Industry (Doughnut Chart)
  const dealsByIndustryData = dealsByIndustry.reduce((acc, item) => {
    const industry = item['company.industry'];
    acc[industry] = (acc[industry] || 0) + item['deal.count_deal'];
    return acc;
  }, {});

  const  donutChartConfig = {
    labels: Object.keys(dealsByIndustryData),
    datasets: [
      {
        label: 'Number of Deals',
        data: Object.values(dealsByIndustryData),
        backgroundColor: [
          '#00747D', '#88C8D9', '#F4A6B7', '#41B6C4', '#0095A0', '#69D2E7', '#A7DBD8', '#E0E4CC',
          '#F38630', '#005F73', '#0A9396', '#94D2BD', '#EE9B00', '#BB3E03', '#AE2012', '#9B2226',
          '#02735E', '#038C7F', '#56C596', '#FFBA08', '#FF6600', '#E63946', '#F77F00', '#FCBF49',
        ],
      },
    ],
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'left',
          labels: {
            boxWidth: 30, 
            font: {
              size: 13,
            },
            padding: 10, 
          },
        },
      },
      layout: {
        padding: {
          top: 10,
          bottom: 10,
        },
      },
    },
  };
  

  return (
    <div className="p-4 bg-gray-100">
      {/* Big Numbers Section */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        {[
          {
            title: 'Won Deals Value',
            value: Math.round(Number(bigNumbers.totalDealValue) || 0),
            details: {
              avg: Math.round(Number(bigNumbers.avgDealValue) || 0),
              max: Math.round(Number(bigNumbers.maxDealValue) || 0),
              min: Math.round(Number(bigNumbers.minDealValue) || 0),
            },
            icon: dollarSignIcon,
          },
          {
            title: 'Win Rate',
            value: `${(Number(bigNumbers.winRate) || 0).toFixed(2)}%`,
            details: {
              total: Math.round(Number(bigNumbers.totalDeals) || 0),
              won: Math.round(Number(bigNumbers.wonDeals) || 0),
              lost: Math.round(Number(bigNumbers.lostDeals) || 0),
            },
            icon: trophyIcon,
          },
        ].map((data, index) => (
          <Card className="bg-base-100 shadow-lg" bordered={false} key={index}>
            <CardBody>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-base-content/80">{data.title}</p>
                  <div className="mt-4">
                    <p className="text-2xl font-bold">
                      {typeof data.value === 'number' ? `$${data.value.toLocaleString()}` : data.value}
                    </p>
                  </div>
                  <div className="mt-2 text-sm text-base-content/60">
                    {data.details.avg && <p>Avg Deal: ${data.details.avg.toLocaleString()}</p>}
                    {data.details.max && <p>Max Deal: ${data.details.max.toLocaleString()}</p>}
                    {data.details.min && <p>Min Deal: ${data.details.min.toLocaleString()}</p>}
                    {data.details.total && <p>Total Deals: {data.details.total.toLocaleString()}</p>}
                    {data.details.won && <p>Won Deals: {data.details.won.toLocaleString()}</p>}
                    {data.details.lost && <p>Lost Deals: {data.details.lost.toLocaleString()}</p>}
                  </div>
                </div>
                <div className="rounded bg-base-200 p-2">
                  <Icon icon={data.icon} fontSize={20} className="text-base-content/80" />
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full h-auto flex flex-col justify-start">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Deals by Stage</h2>
          <div className="h-[400px]">
            <Bar data={barChartConfig} options={barChartConfig.options} />
          </div>
        </div>

        {/* Doughnut Chart */}
        <div className="bg-white p-6 rounded-lg shadow-lg w-full h-auto flex flex-col justify-start">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 text-center">Deals by Industry</h2>
          <div className="h-[400px] flex items-center justify-center">
            <Doughnut data={donutChartConfig} options={donutChartConfig.options} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DealDashboard;
