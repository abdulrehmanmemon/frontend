import React, { useContext, useEffect, useState } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import { FXExposureContext } from "../../contexts/forms/FXExposureContext";
import SaveButton from "../customs/SaveButton";
import Card from "@/components/daisyui/Card/Card";
import Textarea from "@/components/daisyui/Textarea/Textarea";
import Input from "@/components/daisyui/Input/Input";
import { supabaseSegments } from "../../helpers/supabaseClient";
import toast from "react-hot-toast";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { autocompletion } from "@codemirror/autocomplete";
import { CaptureFXPaymentsContext } from "../../contexts/forms/CaptureFXPaymentsContext";

// Add FX exposure calculated attributes
const FX_EXPOSURE_ATTRIBUTES = [

  {
    label: 'total_fx_exposure',
    type: 'variable',
    detail: 'Type: numeric - Total FX exposure in base currency'
  },
  {
    label: 'fx_exposure_percentage',
    type: 'variable',
    detail: 'Type: numeric - FX exposure as percentage of revenue'
  }
];

const SQLFilter = ({ instanceId, onSave, flowType = 'workflow' }) => {
  // Choose context based on flow type
  const workflowContext = useContext(FormContext);
  const fxExposureContext = useContext(FXExposureContext);
  
  // Select the appropriate context based on flow type
  const context = flowType === 'fxExposure' ? fxExposureContext : workflowContext;
  console.log('SQLFilter Component - Context:', { context, flowType }); // Debug log

  const { filterData, setFilterData, startData, nodeSequence } = context || {};
  if (!filterData || !setFilterData || !startData) {
    console.error('Missing required context values:', { filterData, setFilterData, startData });
    return <div>Error: Missing required context values</div>;
  }

  const startNodeData = Object.entries(startData).find(([key]) => key.startsWith('start'));
  const segmentId = startNodeData ? startNodeData[1].segmentId : null;
  console.log('SQLFilter - Start node data:', { startNodeData, segmentId }); // Debug log
  
  const nodeData = filterData[instanceId] || {};
  console.log('SQLFilter Component - Node Data:', { instanceId, nodeData }); // Debug node data

  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFXExposureAttributes, setShowFXExposureAttributes] = useState(false);

  // Check if the previous node is Calculate FX Exposure
  useEffect(() => {
    if (nodeSequence) {
      const currentIndex = nodeSequence.findIndex(node => node.instanceId === instanceId);
      if (currentIndex > 0) {
        const previousNode = nodeSequence[currentIndex - 1];
        setShowFXExposureAttributes(previousNode.nodeType === 'Calculate FX Exposure');
      }
    }
  }, [nodeSequence, instanceId]);

  // Fetch segment attributes when segmentId is available
  useEffect(() => {
    const fetchAttributes = async () => {
      if (!segmentId) {
        setLoading(false);
        toast.error('No segment selected. Please select a segment in the Start node first.');
        return;
      }

      try {
        const { data, error } = await supabaseSegments.rpc('fetch_segment_attributes', {
          'segment_id': segmentId
        });
        
        if (error) throw error;
        
        // Transform the data into the required format
        const formattedAttributes = data.map(attr => ({
          name: attr.attribute_name,
          type: attr.data_type
        }));
        
        setAttributes(formattedAttributes);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching attributes:', err);
        toast.error('Failed to load attributes');
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [segmentId]);

  // Initialize SQL filter data for this instance if empty
  useEffect(() => {
    if (Object.keys(nodeData).length === 0) {
      console.log('Initializing node data for:', instanceId); // Debug initialization
      setFilterData(instanceId, {
        sqlQuery: "",
        description: ""
      });
    }
  }, [instanceId, nodeData, setFilterData]);

  // Add SQL operators for autocompletion
  const sqlOperators = [
    { label: "=", type: "operator", info: "Equal to" },
    { label: ">", type: "operator", info: "Greater than" },
    { label: "<", type: "operator", info: "Less than" },
    { label: ">=", type: "operator", info: "Greater than or equal to" },
    { label: "<=", type: "operator", info: "Less than or equal to" },
    { label: "<>", type: "operator", info: "Not equal to" },
    { label: "LIKE", type: "operator", info: "Pattern matching" },
    { label: "IN", type: "operator", info: "Match any value in a list" },
    { label: "BETWEEN", type: "operator", info: "Between two values" },
    { label: "IS NULL", type: "operator", info: "Is null check" },
    { label: "IS NOT NULL", type: "operator", info: "Is not null check" },
    { label: "AND", type: "keyword", info: "Logical AND" },
    { label: "OR", type: "keyword", info: "Logical OR" },
    { label: "NOT", type: "keyword", info: "Logical NOT" },
    { label: "->", type: "operator", info: "JSONB object field access" },
    { label: "->>", type: "operator", info: "JSONB object field text access" }
  ];

  const attributeCompletion = (context) => {
    const word = context.matchBefore(/[[\w.{}]+/);
    if (!word) return null;

    const suggestions = [];

    // Add attribute suggestions with curly braces
    attributes.forEach(attr => {
      suggestions.push({
        label: `{{${attr.name}}}`,
        type: "variable",
        detail: `Type: ${attr.type}`
      });
    });

    return {
      from: word.from,
      options: suggestions,
      span: /^[[\w.{}]+$/
    };
  };

  const handleChange = (value) => {
    console.log('SQLFilter Component - Handling change:', { instanceId, value }); // Debug changes
    
    setFilterData(instanceId, {
      ...nodeData,
      sqlQuery: value,
    });
  };

  const isFormComplete = () => {
    return nodeData.sqlQuery?.trim() !== "";
  };

 
  const handleSave = () => {
    if (!isFormComplete()) {
      toast.error("Please fill out all required fields before saving.");
      return;
    }
  
    if (!segmentId) {
      toast.error("Please select a segment in the Start node first.");
      return;
    }
    onSave(instanceId, nodeData);
    toast.success("Filter saved successfully!");
  };
  

  if (loading) {
    return (
      <Card className="p-6 shadow-md rounded-lg">
        <div className="text-center">Loading attributes...</div>
      </Card>
    );
  }

  if (!segmentId) {
    return (
      <Card className="p-6 shadow-md rounded-lg">
        <div className="text-center text-red-500">
          Please select a segment in the Start node first.
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-md rounded-lg">
      <h2 className="text-lg font-bold mb-4">SQL Filter (Node {instanceId})</h2>

      {/* SQL Query */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">SQL Query</label>
        <div className="border rounded-md border-gray-300">
          <CodeMirror
            value={nodeData?.sqlQuery || ""}
            height="150px"
            theme="light"
            extensions={[
              sql(),
              autocompletion({
                override: [attributeCompletion],
                activateOnTyping: true,
                closeOnBlur: true,
                
              })
            ]}
            onChange={handleChange}
            className="border rounded-md"
            basicSetup={{
              closeBrackets: false,
            }}
          />
        </div>
        <div className="mt-2">
          <p className="text-xs font-medium text-gray-700 mb-1">Available Operators:</p>
          <div className="flex flex-wrap gap-2">
            {sqlOperators.map((op, index) => (
              <span 
                key={index}
                className="px-2 py-1 text-xs bg-gray-100 rounded-md cursor-pointer hover:bg-gray-200"
                onClick={() => {
                  const currentValue = nodeData.sqlQuery || "";
                  const newValue = currentValue + (currentValue ? " " : "") + op.label;
        
                  handleChange(newValue);
                }}
              >
                {op.label}
              </span>
            ))}
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Available attributes will appear in autocomplete as you type.
        </p>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <SaveButton isFormComplete={isFormComplete()} onSave={handleSave} />
      </div>
    </Card>
  );
};

export default SQLFilter;
