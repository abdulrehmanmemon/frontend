import { useMemo } from "react";
import ApexChart from "react-apexcharts";

import { useGlobalContext } from "@/contexts/global";

import { useEcommerceDashboard } from "../use-ecommerce-dashboard";

const DashboardTopCountryChart = () => {
  const { state } = useGlobalContext();
  const { topCountries } = useEcommerceDashboard();
  const options = useMemo(() => {
    return {
      theme: {
        mode: state.theme.mode,
      },
      chart: {
        height: 380,
        type: "bar",
        parentHeightOffset: 0,
        background: "transparent",
        toolbar: {
          show: false,
        },
      },
      plotOptions: {
        bar: {
          horizontal: true,
          borderRadius: 4,
          distributed: true,
          borderRadiusApplication: "end",
        },
      },
      dataLabels: {
        enabled: true,
        textAnchor: "start",
        style: {
          colors: ["#fff"],
        },
        formatter: function (val, opt) {
          return opt.w.globals.labels[opt.dataPointIndex] + ":  " + val;
        },
        offsetX: -10,
        dropShadow: {
          enabled: false,
        },
      },
      series: [
        {
          data: topCountries.map((country) => country.orders),
        },
      ],
      legend: {
        show: false,
      },
      stroke: {
        width: 0,
        colors: ["#fff"],
      },
      xaxis: {
        categories: topCountries.map((country) => country.name),
      },
      yaxis: {
        labels: {
          show: false,
        },
      },
      grid: {
        borderColor: "transparent",
        padding: {
          top: -16,
        },
      },

      tooltip: {
        theme: "dark",
        x: {
          show: false,
        },
        y: {
          formatter: (val, opts) => `${val}%`,
          title: {
            formatter: () => "",
          },
        },
      },
      colors: [
        "#3e60d5",
        "#47ad77",
        "#fa5c7c",
        "#6c757d",
        "#39afd1",
        "#2b908f",
        "#ffbc00",
        "#90ee7e",
        "#f48024",
        "#212730",
      ],
    };
  }, [state.theme]);

  return (
    <ApexChart
      options={options}
      height={290}
      type={"bar"}
      series={options.series}
    />
  );
};

export { DashboardTopCountryChart };
