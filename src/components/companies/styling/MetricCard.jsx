import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import Card from "../../daisyui/Card/Card";
import RatiosChart from "./RatiosChart";
import Badge from "../../daisyui/Badge/Badge";
import { supabaseSegments } from "../../../helpers/supabaseClient";

export default function MetricCard({ title, value, description, thresholds, chartData, formula, metrics, type }) {
  const [benchmark, setBenchmark] = useState(null);

  // Fetch benchmark range from Supabase
  useEffect(() => {
    const fetchBenchmark = async () => {
      const { data, error } = await supabaseSegments
        .from("benchmark_comparisons")
        .select("benchmark_range")
        .eq("metric_name", title)
        .single();

      if (error) {
        console.error("Error fetching benchmark:", error);
      } else {
        setBenchmark(data?.benchmark_range);
      }
    };

    fetchBenchmark();
  }, [title]);

  // Ensure `metrics` is always an object
  const safeMetrics = metrics || {};
  const safeValue = value !== null && value !== undefined ? value : "N/A";

  // Remove `metrics` field from chartData
  const safeChartData = chartData?.length > 0 
    ? chartData.map(({ metrics, ...rest }) => rest) 
    : [];

  // Determine the color based on thresholds
  const getColor = (val) => {
    if (val === "N/A") return "bg-gray-400 text-white";
    for (const { min, max, color } of thresholds) {
      if ((min === null || val >= min) && (max === null || val < max)) {
        return color;
      }
    }
    return "bg-gray-400 text-white";
  };

  const getNotes = (val) => {
    if (val === "N/A") return "No data available for this metric.";
    for (const { min, max, note } of thresholds) {
      if ((min === null || val >= min) && (max === null || val < max)) {
        return note;
      }
    }
    return "No specific note available for this value.";
  };

  return (
    <Card className="p-6 flex flex-row items-start gap-6 justify-between mt-2 mb-2 max-w-full flex-1">
      {/* Left Section: Title & Chart */}
      <div className="flex-1 flex flex-col gap-2 w-1/2">
        <div className="flex justify-between">
          <h2 className="text-xl font-semibold">{title}</h2>
          <div className={`font-bold px-4 py-2 rounded-lg text-md mr-4 ${getColor(value)}`}>
            {value}
          </div>
        </div>
        <p className="text-md">{getNotes(value)}</p>
        <div className="flex-grow">
          {safeChartData.length > 0 ? (
            <RatiosChart data={safeChartData} />
          ) : (
            <p className="text-gray-500 text-center h-[35vh] w-[30vw]">No chart data available</p>
          )}
        </div>
      </div>

      {/* Right Section: Calculation, Metrics, and Notes */}
      <div className="flex-1 flex flex-col gap-2 text-md w-1/2">
        <div className="pl-3 pr-3">
          <h3 className="font-semibold text-lg">How it's calculated?</h3>
          <p className="text-md">{title} = {formula}</p>
        </div>

        {/* Safely map over metrics */}
        {Object.keys(safeMetrics).length > 0 ? (
          <div className="flex gap-2">
            {Object.entries(safeMetrics).map(([key, val]) =>
              key !== "year" && (
                <div key={key} className="flex flex-col gap-2 p-3">
                  <div className="text-gray-500 capitalize block">{key.replace(/_/g, " ")}</div>
                  <Badge className="font-bold" color="secondary">{val !== null && val !== undefined ? `$${val}` : "N/A"}</Badge>
                </div>
              )
            )}
          </div>
        ) : (
          <p className="text-gray-500 text-center">No metrics available</p>
        )}

        {/* Benchmark Comparison Section */}
        <div className="bg-gray-100 p-3 rounded-lg">
          <h3 className="font-semibold">Benchmark Comparison</h3>
          <p>
            Companies in this industry have {title.toLowerCase()} in {benchmark ? benchmark : "X.X-Y.Y"} range.
          </p>
        </div>

        {description && (
          <div className="p-3">
            <h3 className="font-semibold text-lg">What does it mean?</h3>
            <p>{description}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
