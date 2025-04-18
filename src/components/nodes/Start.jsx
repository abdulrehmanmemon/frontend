import React, { useContext, useState, useEffect } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import { FXExposureContext } from "../../contexts/forms/FXExposureContext";
import { supabaseSegments } from "../../helpers/supabaseClient";
import Input from "@/components/daisyui/Input/Input";
import Textarea from "@/components/daisyui/Textarea/Textarea";
import Select from "@/components/daisyui/Select/Select";
import SaveButton from "../customs/SaveButton";
import { toast } from "react-hot-toast";

const Start = ({ instanceId, onSave, flowType = 'workflow' }) => {
  // Choose context based on flow type
  const workflowContext = useContext(FormContext);
  const fxExposureContext = useContext(FXExposureContext);
  
  // Select the appropriate context based on flow type
  const context = flowType === 'fxExposure' ? fxExposureContext : workflowContext;
  console.log('Start Component - Context:', { context, flowType }); // Debug log

  const { startData, setStartData } = context || {};
  if (!startData || !setStartData) {
    console.error('Missing required context values:', { startData, setStartData });
    return <div>Error: Missing required context values</div>;
  }

  const nodeData = startData[instanceId] || {};
  console.log('Start Component - Node Data:', { instanceId, nodeData }); // Debug node data

  const [segments, setSegments] = useState([]);
  const [loadingSegments, setLoadingSegments] = useState(true);

  useEffect(() => {
    const fetchSegments = async () => {
      try {
        const { data, error } = await supabaseSegments
          .from("segments")
          .select("id, name")
          .eq("status", "ACTIVE");

        if (error) throw error;

        setSegments(data || []);
        setLoadingSegments(false);
      } catch (error) {
        console.error("Error fetching segments:", error);
        toast.error("Failed to load segments. Please try again.");
      }
    };

    fetchSegments();
  }, []);

  useEffect(() => {
    // Initialize node data if empty
    if (Object.keys(nodeData).length === 0) {
      console.log('Initializing node data for:', instanceId); // Debug initialization
      setStartData(instanceId, {
        actionName: "",
        actionDescription: "",
        segmentId: "",
        segmentMembers: "All",
        executeEvery: "",
        startDate: "",
        endDate: ""
      });
    }
  }, [instanceId, nodeData, setStartData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    console.log('Start Component - Handling change:', { instanceId, name, value, type }); // Debug changes
    
    let updatedValue = type === "checkbox" ? checked : value;

    if (name === "actionName" && !/^[a-zA-Z0-9\s]*$/.test(value)) {
      toast.error("Action Name must be alphanumeric!");
      return;
    }

    if (["startDate", "endDate"].includes(name)) {
      updatedValue = value ? new Date(value).toISOString() : "";
    }

    const updatedData = { ...nodeData, [name]: updatedValue };
    
    if (updatedData.startDate && updatedData.endDate && 
        new Date(updatedData.startDate) > new Date(updatedData.endDate)) {
      toast.error("Start Date cannot be after End Date!");
      return;
    }

    setStartData(instanceId, updatedData);
  };

  const isFormComplete = () => {
    return ["actionName", "actionDescription", "segmentId", "segmentMembers", "executeEvery", "startDate", "endDate"].every(
      (key) => nodeData?.[key] !== undefined && nodeData?.[key] !== ""
    );
  };

  const handleSave = async () => {
    if (!isFormComplete()) {
      toast.error("Please fill out all required fields before saving.");
      return;
    }

    try {
      // Check if action name already exists
      const { data: existingActions, error: checkError } = await supabaseSegments
        .from('workflows')
        .select('workflow_id')
        .eq('workflow_name', nodeData.actionName)
        .single();

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking existing actions:', checkError);
        toast.error('Failed to check existing actions');
        return;
      }

      if (existingActions) {
        toast.error('An action with this name already exists. Please choose a different name.');
        return;
      }

      // If no existing action found, proceed with save
      if (onSave) {
        onSave(instanceId, nodeData);
        toast.success('Action saved successfully!');
      }
    } catch (error) {
      console.error('Error saving action:', error);
      toast.error('Failed to save action');
    }
  };

  return (
    <div className="p-6 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Start</h3>
      <form className="space-y-6">
        {/* Action Name */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-sm">Action Name</span>
          </label>
          <Input
            type="text"
            name="actionName"
            value={nodeData?.actionName || ""}
            onChange={handleChange}
            placeholder="Enter action name"
            className="w-full input-sm"
          />
        </div>

        {/* Action Description */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-sm">Action Description</span>
          </label>
          <Textarea
            name="actionDescription"
            value={nodeData?.actionDescription || ""}
            onChange={handleChange}
            placeholder="Description for action"
            className="w-full text-sm"
          />
        </div>

        {/* Select Segment */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-sm">Select Segment</span>
          </label>
          {loadingSegments ? (
            <p>Loading segments...</p>
          ) : (
            <Select
              name="segmentId"
              value={nodeData?.segmentId || ""}
              onChange={handleChange}
              className="w-full select-sm text-sm"
            >
              <option value="">Select segment</option>
              {segments.map((segment) => (
                <option key={segment.id} value={segment.id}>
                  {segment.name}
                </option>
              ))}
            </Select>
          )}
        </div>

        {/* Segment Members (Default: All) */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-sm">Segment Members</span>
          </label>
          <Select
            name="segmentMembers"
            value={nodeData?.segmentMembers || "All"}
            onChange={handleChange}
            className="w-full select-sm text-sm"
          >
            <option value="All">All</option>
            <option value="New">New</option>
            <option value="Previous">Previous</option>
          </Select>
        </div>

        {/* Execute Every */}
        <div className="form-control">
          <label className="label">
            <span className="label-text font-medium text-sm">Execute Every</span>
          </label>
          <Select
            name="executeEvery"
            value={nodeData?.executeEvery || ""}
            onChange={handleChange}
            className="w-full select-sm text-sm"
          >
            <option value="">Select</option>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </Select>
        </div>

        {/* Start & End Date */}
        <div className="grid grid-cols-2 gap-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-sm">Start Date</span>
            </label>
            <Input
              type="date"
              name="startDate"
              value={nodeData?.startDate?.split("T")[0] || ""}
              onChange={handleChange}
              className="w-full input-sm text-sm"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text font-medium text-sm">End Date</span>
            </label>
            <Input
              type="date"
              name="endDate"
              value={nodeData?.endDate?.split("T")[0] || ""}
              onChange={handleChange}
              className="w-full input-sm text-sm"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-6">
          <SaveButton isFormComplete={isFormComplete()} onSave={handleSave} />
        </div>
      </form>
    </div>
  );
};

export default Start;
