import React, { useContext, useEffect } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import SaveButton from "../customs/SaveButton";
import Card from "@/components/daisyui/Card/Card";
import Select from "@/components/daisyui/Select/Select";
import Input from "@/components/daisyui/Input/Input";

const Enrich = ({ instanceId, onSave, contextType = FormContext }) => {
  const context = useContext(contextType || FormContext);
  const { enrichData, setEnrichData } = context;

  // Initialize enrich data for this instance if not present
  useEffect(() => {
    if (!enrichData[instanceId]) {
      setEnrichData(instanceId, {
        objectType: "",
        identifier: "",
        fieldsToEnrich: "",
      });
    }
  }, [instanceId, enrichData, setEnrichData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setEnrichData(instanceId, {
      ...enrichData[instanceId],
      [name]: value,
    });
  };

  const isFormComplete = () => {
    const data = enrichData[instanceId];
    if (!data) return false;

    const { objectType, identifier, fieldsToEnrich } = data;
    return (
      objectType?.trim() &&
      identifier?.trim() &&
      (Array.isArray(fieldsToEnrich)
        ? fieldsToEnrich.length > 0
        : fieldsToEnrich?.trim())
    );
  };

  const handleSave = () => {
    if (!isFormComplete()) {
      alert("Please fill out all required fields before saving.");
      return;
    }

    onSave(instanceId, {
      ...enrichData[instanceId],
      isFormComplete: true
    });
  };

  if (!enrichData[instanceId]) {
    return <div>Loading...</div>;
  }

  return (
    <Card className="p-6 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Enrich (Node {instanceId})</h3>
      <form>
        {/* Object to Enrich */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-sm font-medium">Object to Enrich</span>
          </label>
          <Select
            name="objectType"
            value={enrichData[instanceId]?.objectType || ""}
            onChange={handleChange}
            className="w-full select-sm text-sm"
          >
            <option value="">Select a type</option>
            <option value="Person">Person</option>
            <option value="Organization">Organization</option>
          </Select>
        </div>

        {/* Identifier */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-sm font-medium">Identifier</span>
          </label>
          <Input
            type="text"
            name="identifier"
            value={enrichData[instanceId]?.identifier || ""}
            onChange={handleChange}
            placeholder="Enter the identifier (e.g., Email, Phone)"
            className="w-full input-sm"
          />
        </div>

        {/* Fields to Enrich */}
        <div className="form-control mb-4">
          <label className="label">
            <span className="label-text text-sm font-medium">Fields to Enrich</span>
          </label>
          <Input
            type="text"
            name="fieldsToEnrich"
            value={enrichData[instanceId]?.fieldsToEnrich || ""}
            onChange={handleChange}
            placeholder="Enter fields to enrich (comma-separated)"
            className="w-full input-sm"
          />
        </div>

        {/* Save Button */}
        <div className="flex justify-center mt-6">
          <SaveButton isFormComplete={isFormComplete()} onSave={handleSave} />
        </div>
      </form>
    </Card>
  );
};

export default Enrich;
