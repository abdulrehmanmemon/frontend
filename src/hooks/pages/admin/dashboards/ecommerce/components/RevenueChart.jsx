import { useMemo } from "react";
import ApexChart from "react-apexcharts";

import { useGlobalContext } from "@/contexts/global";
import { currencyHelper, dateHelper, stringHelper } from "@/helpers";

import { useEcommerceDashboard } from "../use-ecommerce-dashboard";

const DashboardRevenueChart = () => {
  const { state } = useGlobalContext();
  const { overviewStat, overviewDuration } = useEcommerceDashboard();

  const options = useMemo(() => {
    return {
      theme: {
        mode: state.theme.mode,
      },
      chart: {
        height: 380,
        type: "bar",
        stacked: true,
        background: "transparent",
        toolbar: {
          show: false,
        },
      },

      plotOptions: {
        bar: {
          borderRadius: 8,
          borderRadiusApplication: "end",
          borderRadiusWhenStacked: "last",
          colors: {
            backgroundBarColors: ["rgba(127,127,127,0.06)"],
            backgroundBarRadius: 4,
          },
          columnWidth: "50%",
          barHeight: "100%",
        },
      },
      dataLabels: {
        enabled: false,
      },
      colors: ["#3e60d5", "#3ed5b9"],
      legend: {
        show: true,
        horizontalAlign: "center",
        offsetX: 0,
        offsetY: 6,
      },
      series: [
        {
          name: "Orders",
          data: overviewStat.series.map((r) => r.orders),
        },
        {
          name: "Revenue",
          data: overviewStat.series.map((r) => r.revenues),
        },
      ],
      xaxis: {
        categories: overviewStat.series.map((r) => r.date),
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          formatter: (val) => {
            return dateHelper.formatted(new Date(val), {
              format:
                overviewDuration == "day"
                  ? "DD MMM"
                  : overviewDuration == "month"
                  ? "MMM YY"
                  : "YYYY",
            });
          },
        },
      },
      yaxis: {
        axisBorder: {
          show: false,
        },
        axisTicks: {
          show: false,
        },
        labels: {
          show: false,
          formatter: function (val, e) {
            if (e) {
              if (e.seriesIndex == 0) {
                return val.toString();
              }
              return (
                currencyHelper.sign + stringHelper.convertToFixed(val) + "K"
              );
            }
            return val.toString();
          },
        },
      },

      tooltip: {
        enabled: true,
        shared: true,
        intersect: false,
      },
      grid: {
        show: false,
      },
    };
  }, [overviewStat, state.theme]);

  return (
    <ApexChart
      options={options}
      height={280}
      type={"bar"}
      series={options.series}
    ></ApexChart>
  );
};

export { DashboardRevenueChart };
