import React, { useEffect, useContext, useState } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import { FXExposureContext } from "../../contexts/forms/FXExposureContext";
import SaveButton from "../customs/SaveButton";
import Card from "@/components/daisyui/Card/Card";
import toast from "react-hot-toast";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { autocompletion } from "@codemirror/autocomplete";
import { supabaseSegments } from "../../helpers/supabaseClient";

const OpenAI = ({ instanceId, onSave, flowType = 'workflow' }) => {
  // Choose context based on flow type
  const workflowContext = useContext(FormContext);
  const fxExposureContext = useContext(FXExposureContext);
  
  // Select the appropriate context based on flow type
  const context = flowType === 'fxExposure' ? fxExposureContext : workflowContext;
  console.log('OpenAI Component - Context:', { context, flowType }); // Debug log

  const { openAINodeData, setOpenAINodeData, startData, nodeSequence } = context || {};
  if (!openAINodeData || !setOpenAINodeData || !startData) {
    console.error('Missing required context values:', { openAINodeData, setOpenAINodeData, startData });
    return <div>Error: Missing required context values</div>;
  }

  const startNodeData = Object.entries(startData).find(([key]) => key.startsWith('start'));
  const segmentId = startNodeData ? startNodeData[1].segmentId : null;
  console.log('OpenAI - Start node data:', { startNodeData, segmentId }); // Debug log

  // Handle both array and object data structures
  const nodeData = Array.isArray(openAINodeData[instanceId]) 
    ? openAINodeData[instanceId][0] 
    : openAINodeData[instanceId] || {};
  console.log('OpenAI Component - Node Data:', { instanceId, nodeData }); // Debug node data

  // Fetch segment attributes when segmentId is available
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

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
        toast.error('Failed to load attributes. Please ensure you have selected a segment in the Start node.');
        setAttributes([]);
        setLoading(false);
      }
    };

    fetchAttributes();
  }, [segmentId]);

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

  // Initialize data only once when the component mounts
  useEffect(() => {
    if (!openAINodeData[instanceId]) {
      console.log('Initializing node data for:', instanceId); // Debug initialization
      setOpenAINodeData(instanceId, [{
        chatPrompt: "",
      }]);
    }
  }, [instanceId, setOpenAINodeData]);

  const handleChange = (value) => {
    console.log('OpenAI Component - Handling change:', { instanceId, value }); // Debug changes
    setOpenAINodeData(instanceId, [{
      ...nodeData,
      chatPrompt: value,
    }]);
  };

  const isFormComplete = () => nodeData?.chatPrompt?.trim();

  const handleSave = () => {
    if (!isFormComplete()) {
      toast.error("Please enter a ChatGPT prompt before saving.");
      return;
    }
    
    console.log('OpenAI Component - Saving:', { instanceId, nodeData }); // Debug save
    onSave(instanceId, nodeData);
    toast.success("OpenAI node saved successfully!");
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
      <h3 className="text-lg font-semibold mb-4">OpenAI (Node {instanceId})</h3>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">ChatGPT Prompt</label>
        <CodeMirror
          value={nodeData.chatPrompt || ""}
          height="150px"
          theme="light"
          extensions={[
            sql(),
            autocompletion({
              override: [attributeCompletion],
              activateOnTyping: true,
              closeOnBlur: true
            })
          ]}
          onChange={handleChange}
          className="border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: '100%',
            backgroundColor: 'transparent',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            lineHeight: 'inherit'
          }}
          basicSetup={{
            lineNumbers: false,
            highlightActiveLine: false,
            highlightActiveLineGutter: false,
            highlightSpecialChars: false,
            drawSelection: false,
            closeBrackets: false,
            foldGutter: false,
            dropCursor: false,
            rectangularSelection: false,
            crosshairCursor: false,
            highlightSelectionMatches: false,
            indentOnInput: false
          }}
        />
        <p className="text-xs text-gray-500 mt-2">
          Available attributes will appear in autocomplete as you type.
        </p>
      </div>

      <div className="flex justify-end mt-6">
        <SaveButton onSave={handleSave} isFormComplete={isFormComplete()} />
      </div>
    </Card>
  );
};

export default OpenAI;
