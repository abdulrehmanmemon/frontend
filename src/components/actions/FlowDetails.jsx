import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabaseSegments } from "../../helpers/supabaseClient";
import ColdLeadActivation from '../flows/ColdLeadActivation';
import FXHedging from '../flows/FXHedging';

export default function FlowDetails() {
  const { id } = useParams(); // Extract the flow ID from the URL
  const navigate = useNavigate();
  const [flow, setFlow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlowDetails = async () => {
      try {
        console.log("Fetching flow details for ID:", id);
        const { data, error } = await supabaseSegments
          .from("workflowtemplates")
          .select("*")
          .eq("template_id", id)
          .single();

        if (error) throw error;
        console.log("Fetched flow data:", data);
        setFlow(data);
      } catch (error) {
        console.error("Error fetching flow details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchFlowDetails();
    }
  }, [id]);

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (!flow) {
    return <div className="p-6 text-gray-600">Flow not found!</div>;
  }

  // Map template IDs to components
  const getFlowComponent = (templateId) => {
    console.log("Getting flow component for template ID:", templateId);
    switch (templateId) {
      case 167: // Cold Lead Activation
        console.log("Rendering ColdLeadActivation");
        return <ColdLeadActivation />;
      case 169: // FX Hedging
        console.log("Rendering FXHedging");
        return (
          <div className="w-full h-[calc(100vh-200px)]">
            <FXHedging />
          </div>
        );
      default:
        console.log("No matching component found for template ID:", templateId);
        return null;
    }
  };

  const flowComponent = getFlowComponent(parseInt(id));
  console.log("Flow component to render:", flowComponent);

  return (
    <div className="h-screen flex flex-col">
      {/* Header Section */}
      <div className="p-6 border-b border-gray-200">
        <button
          onClick={handleBack}
          className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 mb-4"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">{flow.template_name}</h1>
        <p className="text-gray-600">{flow.template_description}</p>
      </div>

      {/* Flow Component Section */}
      <div className="flex-1 overflow-hidden">
        {flowComponent ? (
          flowComponent
        ) : (
          <div className="p-6 text-gray-600">
            No flow component available for this template.
          </div>
        )}
      </div>
    </div>
  );
}