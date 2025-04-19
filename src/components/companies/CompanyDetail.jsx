import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabaseCompanies } from "../../helpers/supabaseClient";
import Card from "../daisyui/Card/CardBody";
import Button from "@/components/daisyui/Button/Button";
import Badge from "@/components/daisyui/Badge/Badge";
import CardBody from "../daisyui/Card/CardBody";
import RatiosChart from "./styling/RatiosChart";
import MetricCard from "./styling/MetricCard";
import toast from 'react-hot-toast';

import { FaMapMarkerAlt, FaIndustry, FaExclamationCircle, FaUser, FaTag, FaBuilding } from "react-icons/fa";

const CompanyDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get company ID from URL
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentRatio, setCurrentRatio] = useState(null); // Store current ratio
  const [ratiosData, setRatiosData] = useState([]);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [daysWorking,setDaysWorking]=useState([]);
  const [daysSales,setDaysSales]=useState([]);
  const [equity,setEquity]=useState([]);
  const [assets,setAssets]=useState([]);
  const [ebitda,setEbitda]=useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const { data, error } = await supabaseCompanies
          .from("company")
          .select("*")
          .eq("company_id", id)
          .single();

        if (error) throw error;
        setCompany(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        toast.error('Error fetching company details. Please try again later.');
        console.error('Error fetching company:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id]);

  // Fetch Derived Metrics **AFTER** company is fetched
  useEffect(() => {
    if (!company) return; // Ensure company is fetched before calling API
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    const fetchDerivedMetrics = async () => {
      setFinancialLoading(true);
      try {
        const token = localStorage.getItem('sb-access-token');
        const response = await fetch(`${baseUrl}/derived_metrics`, {
          method: "POST",
          headers: { "Content-Type": "application/json",
             "Authorization": `Bearer ${token}`
           },
          body: JSON.stringify({ company_id: company.company_id }),
        });

        if (!response.ok) throw new Error("Failed to fetch derived metrics");

        const data = await response.json();
        console.log("Derived Metrics Data:", data);

        if (data.current_ratio && data.current_ratio.length > 0) {
          const formattedData = data.current_ratio.map((item) => ({
            year: item.year,
            score: item.score,
            metrics: { 
              current_assets: item.current_assets, 
              current_liabilities: item.current_liabilities 
            }
          }));
          setRatiosData(formattedData);
        }
        
        if (data.days_working_capital && data.days_working_capital.length > 0) {
          setDaysWorking(data.days_working_capital.map((item) => ({
            year: item.year,
            score: item.score,
            metrics: { 
              current_assets: item.current_assets, 
              current_liabilities: item.current_liabilities, 
              revenue: item.revenue 
            }
          })));
        }
        
        if (data.day_sales_outstanding && data.day_sales_outstanding.length > 0) {
          setDaysSales(data.day_sales_outstanding.map((item) => ({
            year: item.year,
            score: item.score,
            metrics: { 
              account_receivable: item.account_receivable, 
              revenue: item.revenue 
            }
          })));
        }
        
        if (data.debt_to_equity && data.debt_to_equity.length > 0) {
          setEquity(data.debt_to_equity.map((item) => ({
            year: item.year,
            score: item.score,
            metrics: { 
              total_liabilities: item.total_liabilities, 
              total_equity: item.total_equity 
            }
          })));
        }
        
        if (data.debt_to_total_assets && data.debt_to_total_assets.length > 0) {
          setAssets(data.debt_to_total_assets.map((item) => ({
            year: item.year,
            score: item.score,
            metrics: { 
              total_liabilities: item.total_liabilities, 
              total_assets: item.total_assets 
            }
          })));
        }
        

         if (data.ebitda_margin && data.ebitda_margin.length > 0) {
          const formattedEbitda = data.ebitda_margin
            .filter((item) => !item.error) // Exclude items with errors
            .map((item) => ({
              year: item.year,
              ratio: item.score,
            }));
        
          if (formattedEbitda.length > 0) {
            setEbitda(formattedEbitda);
          } else {
            setEbitda([]); // Set null if no valid entries exist
          }
        }
        

        else {
          setDaysWorking([]);
          setRatiosData([]);
          setCurrentRatio("N/A");
          setDaysSales([]);
          setEquity([]);
          setAssets([]);
          setEbitda([]);
        }
      } catch (error) {
        setError(error.message);
        toast.error('Error fetching derived metrics. Please try again later.');
        console.error('Error fetching derived metrics:', error);
        setRatiosData([]);
        setCurrentRatio("N/A");
        setDaysSales([]);
        setEquity([]);
        setAssets([]);
        setEbitda([]);
      }
      finally {
        setFinancialLoading(false); // Stop loading
      }
    };

    fetchDerivedMetrics();
  }, [company]);

  if (loading)
    return (
      <div className="flex justify-center mt-10">
        <div>Loading...</div>
      </div>
    );

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!company) return <div className="text-center mt-10">Company not found.</div>;
    console.log(currentRatio)
  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2">

      {/* Left Column: Company Overview */}
      <Card className="bg-white shadow-xl rounded-lg overflow-hidden md:col-span-1 h-[500px]">
    <div className="p-5 bg-white text-gray-900 flex items-start justify-between">
      <h1 className="text-xl font-bold">{company.name}</h1>
      <FaBuilding className="text-4xl text-gray-600" />
    </div>
    <CardBody className="space-y-3">
      <div className="space-y-3 text-md">
        {/* Location */}
        <div>
          <p className="flex items-center space-x-3">
            <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
              <FaMapMarkerAlt />
            </span>
            <h3 className="text-gray-700 text-sm">Location</h3>
            <Badge className="ml-2 font-semibold text-sm">{company.location || "N/A"}</Badge>
          </p>
        </div>

        {/* Industry */}
        <div>
          <p className="flex items-center space-x-3">
            <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
              <FaIndustry />
            </span>
            <h3 className="text-gray-700 text-sm">Industry</h3>
            <Badge size="md" className="ml-2 font-semibold text-sm">{company.industry}</Badge>
          </p>
        </div>

        {/* Risk Rating */}
        <div>
        <p className="flex items-center space-x-3">
            <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
              <FaExclamationCircle />
            </span>
            <h3 className="text-gray-700 text-sm">Risk Rating</h3>
            <Badge size="md" className="ml-2 font-semibold text-sm">{company.risk_rating || "N/A"}</Badge>
          </p>
        </div>

        {/* Account Executive */}
        <div>
          <p className="flex items-center space-x-3">
            <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
              <FaUser />
            </span>
            <h3 className="text-gray-700 text-sm">Account Executive</h3>
            <Badge size="md" className="ml-2 font-semibold text-sm">{company.ae_name}</Badge>
          </p>
        </div>

        {/* Segment */}
        <div>
          <p className="flex items-center space-x-3">
            <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
              <FaTag />
            </span>
            <h3 className="text-gray-700 text-sm">Segment</h3>  
            <Badge color="secondary" className="text-sm">{company.segment}</Badge>
          </p>
        </div>
      </div>

      <Button className="mt-6 w-full" size="sm" color="secondary" variant="outline">
        Explore
      </Button>
    </CardBody>
  </Card>

      {/* Right Column: Financial Analysis */}
     

        <Card className="bg-base-100 shadow-lg md:col-span-3">
  <div className="flex items-center justify-between pl-5 pr-5 gap-6 mt-4">
    <h1 className="font-bold text-2xl">Financial Analysis</h1>
    <Button
      color="primary"
      size="md"
      onClick={() =>
        navigate("/start-analysis", {
          state: { company_id: company.company_id, name: company.name },
        })
      }
    >
      Create New
    </Button>
  </div>
  <CardBody>
    {/* Show message if no analysis exists */}
    {financialLoading ? (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500">Loading financial analysis...</p>
      </div>
    ) : currentRatio === "N/A" && ratiosData.length === 0 ? (
      <p className="text-gray-500 text-center mt-4">No analysis exists for this company.</p>
    ) : (
      <>
        <h2 className="font-semibold text-xl mt-4 mb-4">Cash Flow & Liquidity</h2>

        {/* ✅ Current Ratio */}
        <MetricCard
          title="Current Ratio"
          value={ratiosData.length > 0 ? ratiosData[ratiosData.length - 1].score : "N/A"}
          description={`Current ratio of a company's liquidity risk and possible short-term cash crunch.`}
          thresholds={[
            { min: null, max: 1.0, color: "bg-red-500 text-white", note:`${company.name} struggle to cover short term liabilities` }, // Red
            { min: 1.0, max: 1.5, color: "bg-yellow-500 text-black",note:`${company.name}'s liquidity position is tight but manageable, needs monitoring` }, // Yellow
            { min: 1.5, max: null, color: "bg-green-500 text-white",note:`${company.name} has healthy liquidity, can easily cover short-term liabilities` }, // Green
          ]}
          chartData={ratiosData}
          formula={"Current Liabilities / Current Assets"}
          metrics={ratiosData.length > 0 ? ratiosData[ratiosData.length - 1].metrics : {}}

        />

        {/* ✅ Days Working Capital */}
        <MetricCard
          title="Days Working Capital"
          value={daysWorking.length > 0 ? daysWorking[daysWorking.length - 1].score : "N/A"}
          description={`Indicates how many days a company can operate using its working capital before running out of cash.`}
          thresholds={[
            { min: 90, max: null, color: "bg-red-500 text-white",note:"Too much capital tied up, poor efficiency." }, // Red
            { min: 30, max: 90, color: "bg-yellow-400 text-black",note:"Some inefficiencies, room for improvement." }, // Yellow
            { min: null, max: 30, color: "bg-green-500 text-white",note:"Efficient working capital use." }, // Green
          ]}
          chartData={daysWorking}
          formula={"{ (Current Assets - Current Liabilities) / Revenue } * 360"}
          metrics={daysWorking.length > 0 ? daysWorking[daysWorking.length - 1].metrics : {}}
        />

        
        {/* ✅ Days Sales Outstanding */}
        <MetricCard
          title="Days Sales Outstanding"
          value={daysSales.length > 0 ? daysSales[daysSales.length - 1].score : "N/A"}
          description={`Measures how longs it takes a company to collect payments after a sale. Lower is better.`}
          thresholds={[
            { min: 60, max: null, color: "bg-red-500 text-white",note:"Slow collections, potential cash flow issues." }, // Red
            { min: 30, max: 60, color: "bg-yellow-400 text-black",note:"Moderate efficiency, but could be improved." }, // Yellow
            { min: null, max: 30, color: "bg-green-500 text-white",note:"Strong cash collection efficiency." }, // Green
          ]}
          chartData={daysSales}
          formula={"(Accounts Receivable / Revenue) * 360"}
          metrics={daysSales.length > 0 ? daysSales[daysSales.length - 1].metrics : {}}
        />
        <div>
        <h2 className="font-semibold text-xl mt-4 mb-2">Leverage and Solvency</h2>
        <MetricCard
          title="Debt to Equity Ratio"
          value={equity.length > 0 ? equity[equity.length - 1].score : "N/A"}
          description={`Shows how much a company relies on debt vs. equity for financing. A high ratio signals higher financial risk.`}
          thresholds={[
            { min: 2.0, max: null, color: "bg-red-500 text-white",note:"Highly leveraged, high financial risk." }, // Red
            { min: 1.0, max: 2.0, color: "bg-yellow-400 text-black",note:"Moderate risk, depends on industry." }, // Yellow
            { min: null, max: 1.0, color: "bg-green-500 text-white",note:"Financially stable, lower reliance on debt." }, // Green
          ]}
          chartData={equity}
          formula={"(Total Debt / Total Equity)"}
          metrics={equity.length > 0 ? equity[equity.length - 1].metrics : {}}
        />
         <MetricCard
          title="Debt to Total Assets"
          value={assets.length > 0 ? assets[assets.length - 1].score : "N/A"}
          description={`Indicates the percentage of company's assets that are financed by debt. Higher ratios suggest higher financial leverage.`}
          thresholds={[
            { min: 50, max: null, color: "bg-red-500 text-white",note:"High debt load, potential solvency risk." }, // Red
            { min: 25, max: 50, color: "bg-yellow-400 text-black",note:"Moderate debt, manageable but should be monitored." }, // Yellow
            { min: null, max: 25, color: "bg-green-500 text-white",note:"Low debt, financially secure." }, // Green
          ]}
          chartData={assets}
          formula={"(Total Debt / Total Assets)"}
          metrics={assets.length > 0 ? assets[assets.length - 1].metrics : {}}
        />
        </div>
        <div>
        <h2 className="font-semibold text-xl mt-4 mb-2">Revenue Growth and Profitability</h2>
        <MetricCard
          title="EBITDA Margin"
          value={ebitda.length > 0 ? ebitda[ebitda.length - 1].score : "N/A"}
          description={`Measures core profitability before accounting for interest, taxes, depreciation, and amortization. Higher is better.`}
          thresholds={[
            { min: 10, max: null, color: "bg-red-500 text-white",note:"Weak profitability, may struggle with debt servicing." }, // Red
            { min: 10, max: 20, color: "bg-yellow-400 text-black",note:"Moderate profitability, room for improvement." }, // Yellow
            { min: null, max: 20, color: "bg-green-500 text-white",note:"Strong profitability, good operational efficiency." }, // Green
          ]}
          chartData={ebitda}
          formula={"(Ebitda / Revenue) * 100"}
         
        />
        </div>
      </>
    )}
  </CardBody>
</Card>

    </div>
  );
};

export default CompanyDetail;
