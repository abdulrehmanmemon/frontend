import React, { useContext, useEffect, useState } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import { FXExposureContext } from "../../contexts/forms/FXExposureContext";
import SaveButton from "../customs/SaveButton";
import Card from "@/components/daisyui/Card/Card";
import Select from "@/components/daisyui/Select/Select";
import Input from "@/components/daisyui/Input/Input";
import Textarea from "@/components/daisyui/Textarea/Textarea";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { autocompletion } from "@codemirror/autocomplete";
import { supabaseSegments } from "../../helpers/supabaseClient";
import toast from "react-hot-toast";

const Slack = ({ instanceId, onSave, flowType = 'workflow' }) => {
  // Choose context based on flow type
  const workflowContext = useContext(FormContext);
  const fxExposureContext = useContext(FXExposureContext);
  
  // Select the appropriate context based on flow type
  const context = flowType === 'fxExposure' ? fxExposureContext : workflowContext;
  console.log('Slack Component - Context:', { context, flowType }); // Debug log

  const { slackData, setSlackData, startData, nodeSequence } = context || {};
  if (!slackData || !setSlackData || !startData) {
    console.error('Missing required context values:', { slackData, setSlackData, startData });
    return <div>Error: Missing required context values</div>;
  }

  const startNodeData = Object.entries(startData).find(([key]) => key.startsWith('start'));
  const segmentId = startNodeData ? startNodeData[1].segmentId : null;
  console.log('Slack - Start node data:', { startNodeData, segmentId }); // Debug log
  
  const nodeData = slackData[instanceId] || {};
  console.log('Slack Component - Node Data:', { instanceId, nodeData }); // Debug node data
  
  const channels = ["#general", "#random", "#support"];

  // Fetch segment attributes when segmentId is available
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

   // Initialize slack data for this instance if empty
   useEffect(() => {
    if (Object.keys(nodeData).length === 0) {
      console.log('Initializing node data for:', instanceId); // Debug initialization
      setSlackData(instanceId, {
        messageTarget: "",
        slackUser: "",
        slackChannel: "",
        messageTemplate: "",
      });
    }
  }, [instanceId, nodeData, setSlackData]);


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

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log('Slack Component - Handling change:', { instanceId, name, value }); // Debug changes
    setSlackData(instanceId, {
      ...nodeData,
      [name]: value,
    });
  };

  const isFormComplete = () => {
    return (
      nodeData.messageTarget?.trim() !== "" &&
      ((nodeData.messageTarget === "User" && nodeData.slackUser?.trim() !== "") ||
        (nodeData.messageTarget === "Channel" && nodeData.slackChannel?.trim() !== "")) &&
      nodeData.messageTemplate?.trim() !== ""
    );
  };

  const handleSave = () => {
    if (!isFormComplete()) {
      alert("Please fill out all required fields before saving.");
      return;
    }

    console.log('Slack Component - Saving:', { instanceId, nodeData }); // Debug save
    onSave(instanceId, nodeData);
  };

 
  return (
    <Card className="p-6 shadow-md rounded-lg">
      <h2 className="text-lg font-bold mb-4">Slack (Node {instanceId})</h2>

      {/* Message Target */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Message Target</label>
        <Select
          name="messageTarget"
          value={nodeData?.messageTarget || ""}
          onChange={handleChange}
          className="w-full select-sm text-sm"
        >
          <option value="">Select Target</option>
          <option value="User">User</option>
          <option value="Channel">Channel</option>
        </Select>
      </div>

      {/* Slack Channel or Slack User based on selection */}
      {nodeData?.messageTarget === "Channel" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Slack Channel</label>
          <Select
            name="slackChannel"
            value={nodeData?.slackChannel || ""}
            onChange={handleChange}
            className="w-full select-sm text-sm"
          >
            <option value="">Select Channel</option>
            {channels.map((channel, index) => (
              <option key={index} value={channel}>
                {channel}
              </option>
            ))}
          </Select>
        </div>
      )}

      {nodeData?.messageTarget === "User" && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Slack User</label>
          <Input
            type="text"
            name="slackUser"
            value={nodeData?.slackUser || ""}
            onChange={handleChange}
            placeholder="{customer.ae_slack_userid}"
            className="w-full input-sm"
          />
        </div>
      )}

      {/* Message Template */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Message Template</label>
        <CodeMirror
          value={nodeData?.messageTemplate || ""}
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
          onChange={(value) => {
            console.log('Slack Component - Handling change:', { instanceId, value }); // Debug changes
            setSlackData(instanceId, {
              ...nodeData,
              messageTemplate: value
            });
          }}
          className="border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{
            width: '100%',
            backgroundColor: 'transparent',
           
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

      {/* Save Button */}
      <div className="flex justify-center mt-6">
        <SaveButton isFormComplete={isFormComplete()} onSave={handleSave} />
      </div>
    </Card>
  );
};

export default Slack;
