import React, { useState, useEffect, useContext } from "react";
import Button from "@/components/daisyui/Button/Button";
import Select from "@/components/daisyui/Select/Select";
import Card from "@/components/daisyui/Card/Card";
import { toast } from "react-hot-toast";
import { supabaseSegments } from "../../helpers/supabaseClient";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";

const SalesForce = ({ instanceId, onSave, contextType = FormContext }) => {
  const context = useContext(contextType || FormContext);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [matchKey, setMatchKey] = useState("");
  const [mappings, setMappings] = useState([]);
  const [entities, setEntities] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEntities = async () => {
      try {
        const { data, error } = await supabaseSegments
          .from('entity')
          .select('id, entity_label')
          .eq('enable', true)
          .in('entity_label', ['Account', 'Person', 'Deal', 'Company']);

        if (error) throw error;

        setEntities(data.map((entity) => ({
          id: entity.id,
          label: entity.entity_label,
        })));
      } catch (error) {
        console.error('Error fetching entities:', error.message);
        toast.error("Failed to fetch entities");
      }
    };

    fetchEntities();
  }, []);

  useEffect(() => {
    const fetchAttributes = async () => {
      if (!selectedEntity) return;
      
      setIsLoading(true);
      try {
        const { data, error } = await supabaseSegments
          .from('attributes')
          .select('id, attribute_label, data_type')
          .eq('enable', true)
          .eq('entity_id', selectedEntity);

        if (error) throw error;

        setAttributes(data.map((attribute) => ({
          id: attribute.id,
          name: attribute.attribute_label,
          type: attribute.data_type,
        })));
      } catch (error) {
        console.error("Error fetching attributes:", error.message);
        toast.error("Failed to fetch attributes");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAttributes();
  }, [selectedEntity]);

  const handleEntityChange = (entityId) => {
    setSelectedEntity(entityId);
    setMatchKey("");
    setMappings([]); // Reset mappings when entity changes
  };

  const handleMappingChange = (index, field, value) => {
    const newMappings = [...mappings];
    newMappings[index] = { ...newMappings[index], [field]: value };
    setMappings(newMappings);
  };

  const addMapping = () => {
    setMappings([...mappings, { workflowField: "", salesforceField: "" }]);
  };

  const removeMapping = (index) => {
    setMappings(mappings.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedEntity) {
      toast.error("Please select an entity");
      return;
    }
    if (!matchKey) {
      toast.error("Please select a match key");
      return;
    }
    if (!mappings.length) {
      toast.error("Please add at least one field mapping");
      return;
    }

    const data = {
      entity: selectedEntity,
      matchKey,
      mappings
    };

    onSave(instanceId, data);
    toast.success("Salesforce configuration saved successfully!");
  };

  return (
    <Card className="w-full max-w-lg p-4 shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Push to SalesForce</h2>
      <p className="text-sm text-gray-600 mb-4">
        Configure Salesforce integration settings and field mappings.
      </p>

      <div className="space-y-4">
        {/* Entity Selection */}
        <div>
          <label className="font-medium">Entity</label>
          <Select
            className="w-full"
            value={selectedEntity}
            onChange={(e) => handleEntityChange(e.target.value)}
          >
            <option value="">Select Entity</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Match Key Selection */}
        <div>
          <label className="font-medium">Match Key</label>
          <Select
            className="w-full"
            value={matchKey}
            onChange={(e) => setMatchKey(e.target.value)}
          >
            <option value="">Select Match Key</option>
            {attributes.map((attr) => (
              <option key={attr.id} value={attr.name}>
                {attr.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Field Mapping */}
        <div>
          <h3 className="font-medium mb-2">Field Mapping</h3>
          {mappings.map((map, index) => (
            <div key={index} className="flex items-center gap-2 mb-2">
              <Select
                className="flex-1"
                value={map.workflowField}
                onChange={(e) => handleMappingChange(index, "workflowField", e.target.value)}
              >
                <option value="">Workflow Field</option>
                {attributes.map((attr) => (
                  <option key={attr.id} value={attr.name}>
                    {attr.name}
                  </option>
                ))}
              </Select>
              <span className="font-bold">→</span>
              <Select
                className="flex-1"
                value={map.salesforceField}
                onChange={(e) => handleMappingChange(index, "salesforceField", e.target.value)}
              >
                <option value="">Salesforce Field</option>
                {attributes.map((attr) => (
                  <option key={attr.id} value={attr.name}>
                    {attr.name}
                  </option>
                ))}
              </Select>
              <button
                onClick={() => removeMapping(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}
          <Button onClick={addMapping} className="btn btn-outline btn-sm mt-2">
            + Add Mapping
          </Button>
        </div>

        <Button onClick={handleSave} className="btn btn-primary w-full">
          Save Configuration
        </Button>
      </div>
    </Card>
  );
};

export default SalesForce;
