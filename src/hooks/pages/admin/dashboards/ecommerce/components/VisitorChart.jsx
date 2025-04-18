import { useMemo } from "react";
import ApexChart from "react-apexcharts";

import { useGlobalContext } from "@/contexts/global";

const DashboardVisitorChart = () => {
  const { state } = useGlobalContext();

  const options = useMemo(() => {
    return {
      theme: {
        mode: state.theme.mode,
      },
      chart: {
        height: 270,
        type: "area",
        background: "transparent",
        sparkline: {
          enabled: true,
        },
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
      },
      grid: {
        show: false,
      },

      stroke: {
        curve: ["smooth", "straight"],
        width: 2,
        dashArray: [0, 6],
      },
      series: [
        {
          name: "Sessions",
          type: "area",
          data: [10, 14, 16, 14, 12, 15, 18, 21, 24, 23, 21, 17, 19, 22],
        },
      ],
      legend: {
        show: false,
      },
      xaxis: {
        categories: [],
        tooltip: {
          enabled: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          show: false,
          formatter: (val) => {
            return `Day ${val}`;
          },
        },
        axisTicks: {
          show: false,
        },
      },
      yaxis: {
        labels: {
          show: false,
        },
      },

      fill: {
        type: "gradient",
        opacity: 1,
        gradient: {
          shadeIntensity: 1,

          type: "horizontal",
          colorStops: [
            {
              offset: 0,
              color: "rgba(75,134,255,0.1)",
              opacity: 1,
            },
            {
              offset: 30,
              color: "rgba(255,54,54,0.1)",
              opacity: 1,
            },
            {
              offset: 35,
              color: "rgba(255,54,138,0.08)",
              opacity: 1,
            },
            {
              offset: 50,
              color: "rgba(51,84,250,0.2)",
              opacity: 1,
            },
            {
              offset: 80,
              color: "rgba(64,96,255,0.16)",
              opacity: 1,
            },
            {
              offset: 100,
              color: "rgba(75,99,255,0.1)",
              opacity: 1,
            },
          ],
        },
      },
    };
  }, [state.theme]);

  return (
    <ApexChart
      options={options}
      height={210}
      type={"area"}
      series={options.series}
    ></ApexChart>
  );
};

export { DashboardVisitorChart };
