import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import RenderTable from "../reuseable/RenderTable";
import Button from "../daisyui/Button/Button";
import Progress from "../daisyui/Progress/Progress";
import insertMetrics from "../../utils/saveMetrics";
import { supabaseSegments } from "../../helpers/supabaseClient";
import toast from 'react-hot-toast';
const Confirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { fileIds, company_id, fileNames } = location.state || {};
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
console.log(fileIds);
  useEffect(() => {
    if (!fileIds || fileIds.length !== 3) {
      setErrorMessage("Invalid file IDs received. Please try again.");
      setLoading(false);
      return;
    }
    const token = localStorage.getItem('sb-access-token');
    const baseUrl = import.meta.env.VITE_API_BASE_URL;
    fetch(`${baseUrl}/extract_metrics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" ,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ file_ids: fileIds }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Server responded with status ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((error) => {
         // Handle different types of errors
         if (error instanceof TypeError) {
          toast.error('Backend server is not running. Please start the backend server on port 8000.');
        } else if (error.message.includes('400')) {
          toast.error('Invalid workflow configuration. Please check your settings and try again.');
        } else if (error.message.includes('401')) {
          toast.error('Unauthorized. Please log in again.');
        } else if (error.message.includes('403')) {
          toast.error('You don\'t have permission to perform this action.');
        } else if (error.message.includes('404')) {
          toast.error('Resource not found. Please check your configuration.');
        } else {
          toast.error('Failed to connect to backend server. Please make sure both frontend and backend servers are running.');
        }
        console.error("Error fetching metrics:", error);
        setErrorMessage("Failed to fetch metrics. Please try again later.");
        setLoading(false);
        
      });
  }, [fileIds]);

  const deleteFiles = async (fileNames, companyId) => {
    if (!fileNames || fileNames.length === 0) {
      console.error("No file names provided for deletion.");
      return { success: false, message: "No file names provided." };
    }
  
    // Construct file paths correctly
    const filePaths = fileNames.map((fileName) => `uploads/${companyId}/${fileName}`);
  
    console.log("Attempting to delete files:", filePaths);
  
    try {
      const { data, error } = await supabaseSegments.storage.from("files").remove(filePaths);
  
      if (error) {
        console.error("Error deleting files:", error.message);
        return { success: false, message: error.message };
      }
  
      console.log("Files deleted successfully:", data);
      return { success: true };
    } catch (err) {
      console.error("Unexpected error deleting files:", err);
      return { success: false, message: err.message };
    }
  };
  
  
  const handleConfirm = async () => {
    if (!metrics) {
      setErrorMessage("No metrics data available to save.");
      toast.error("No metrics data available to save.");
      return;
    }
  
    setSaving(true);
    setErrorMessage(""); // Reset error message before attempt
  
    try {
      const response = await insertMetrics(metrics);
  
      if (response.success) {
        toast.success("Metrics saved successfully!");
        const deleteResult = await deleteFiles(fileNames, company_id);
  
        if (deleteResult.success) {
          navigate(`/companies/${company_id}`);
        } else {
          setErrorMessage(`Failed to delete files: ${deleteResult.message}`);
          toast.error(`Failed to delete files: ${deleteResult.message}`);
        }
      } else {
        setErrorMessage(`Failed to save metrics: ${response.error.message}`);
        toast.error(`Failed to save metrics: ${response.error.message}`);
      }
    } catch (error) {
      console.error("Error in handleConfirm:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };
  

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-purple-50 to-purple-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin h-12 w-12 text-black">⏳</div>
          <p className="text-lg text-black font-semibold">Loading data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-8">
        {/* Progress Bar */}
        <div className="mb-6">
          <Progress value={66} max={100} className="w-full" />
          <p className="text-center text-gray-600 mt-2">Step 2 of 3</p>
        </div>

        <h1 className="text-3xl font-bold mb-6 text-black">Confirmation</h1>

        {/* Error Message with Go Back Button */}
        {errorMessage && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded-md shadow">
            <p>{errorMessage}</p>
            <Button
              onClick={() => navigate(-1)}
              className="mt-3 px-4 py-2 bg-gray-500 text-white rounded-md"
            >
              Go Back
            </Button>
          </div>
        )}

        {metrics ? (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-gray-700">
                Balance Sheet
              </h2>
              <RenderTable
                columns={generateColumns(metrics, "Balance Sheet")}
                data={generateTableData(metrics, "Balance Sheet")}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-gray-700">
                Income Statement
              </h2>
              <RenderTable
                columns={generateColumns(metrics, "Income Statement")}
                data={generateTableData(metrics, "Income Statement")}
              />
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2 text-gray-700">
                Cash Flow
              </h2>
              <RenderTable
                columns={generateColumns(metrics, "Cash Flow")}
                data={generateTableData(metrics, "Cash Flow")}
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-between mt-6">
              <Button
                onClick={() => navigate(-1)}
                className="px-6 py-2 text-white rounded-md"
                color="primary"
              >
                Back
              </Button>
              <Button
                onClick={handleConfirm}
                disabled={saving}
                className="px-6 py-2 bg-blue-600 text-white rounded-md"
              >
                {saving ? "Saving..." : "Confirm & Next"}
              </Button>
            </div>
          </>
        ) : (
          <div className=" flex justify-center text-center text-gray-700 font-semibold">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
};

// Utility functions
const formatValue = (value) => (value === null ? "N/A" : value);

const generateTableData = (metrics, section) => {
  if (!metrics?.file1?.[section]) return [];
  return Object.keys(metrics.file1[section]).map((metric) => ({
    metric,
    year1: formatValue(metrics?.file1?.[section]?.[metric]),
    year2: formatValue(metrics?.file2?.[section]?.[metric]),
    year3: formatValue(metrics?.file3?.[section]?.[metric]),
  }));
};

const generateColumns = (metrics, title) => [
  { label: "Metric", key: "metric" },
  { label: `Year ${metrics?.file1?.Year || "N/A"}`, key: "year1" },
  { label: `Year ${metrics?.file2?.Year || "N/A"}`, key: "year2" },
  { label: `Year ${metrics?.file3?.Year || "N/A"}`, key: "year3" },
];

export default Confirmation;
