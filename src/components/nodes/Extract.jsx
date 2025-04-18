import { useState, useEffect, useContext } from "react";
import Button from "@/components/daisyui/Button/Button";
import Select from "@/components/daisyui/Select/Select";
import Input from "@/components/daisyui/Input/Input";
import Card from "@/components/daisyui/Card/Card";
import { toast } from "react-hot-toast";
import { supabaseSegments } from "../../helpers/supabaseClient";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";

export default function Extract({ instanceId, onSave, contextType = FormContext }) {
  const context = useContext(contextType || FormContext);
  const [selectedEntity, setSelectedEntity] = useState("");
  const [inputAttribute, setInputAttribute] = useState("");
  const [regexPattern, setRegexPattern] = useState("");
  const [outputAttributeName, setOutputAttributeName] = useState("");
  const [dataType, setDataType] = useState("String");
  const [entities, setEntities] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [regexError, setRegexError] = useState("");

  // Data type options
  const dataTypes = [
    { value: "String", label: "String" },
    { value: "Integer", label: "Integer" },
    { value: "Float", label: "Float" },
    { value: "Boolean", label: "Boolean" },
    { value: "Date", label: "Date" }
  ];

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
          .eq('entity_id', selectedEntity)
          .eq('data_type', 'string'); // Only show string attributes for text extraction

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

  const validateRegex = (pattern) => {
    try {
      new RegExp(pattern);
      setRegexError("");
      return true;
    } catch (error) {
      setRegexError("Invalid regular expression pattern");
      return false;
    }
  };

  const handleRegexChange = (e) => {
    const pattern = e.target.value;
    setRegexPattern(pattern);
    validateRegex(pattern);
  };

  const validateOutputName = (name) => {
    return /^[a-zA-Z0-9_]+$/.test(name);
  };

  const handleSave = () => {
    if (!selectedEntity) {
      toast.error("Please select an entity");
      return;
    }
    if (!inputAttribute) {
      toast.error("Please select an input attribute");
      return;
    }
    if (!regexPattern) {
      toast.error("Please enter a regular expression pattern");
      return;
    }
    if (!validateRegex(regexPattern)) {
      return;
    }
    if (!outputAttributeName) {
      toast.error("Please enter an output attribute name");
      return;
    }
    if (!validateOutputName(outputAttributeName)) {
      toast.error("Output attribute name can only contain letters, numbers, and underscores");
      return;
    }

    const data = {
      entity: selectedEntity,
      inputAttribute,
      regexPattern,
      outputAttributeName,
      dataType,
      // Add metadata for the new column
      outputColumn: {
        name: outputAttributeName,
        type: dataType,
        description: `Extracted from ${inputAttribute} using regex pattern: ${regexPattern}`
      }
    };

    onSave(instanceId, data);
    toast.success("Extract configuration saved successfully!");
  };

  return (
    <Card className="w-full max-w-lg p-4 shadow-lg border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Extract Text</h2>
      <p className="text-sm text-gray-600 mb-4">
        Extract text using regular expressions and cast to specified data type.
      </p>

      <div className="space-y-4">
        {/* Entity Selection */}
        <div>
          <label className="font-medium">Entity</label>
          <Select
            className="w-full"
            value={selectedEntity}
            onChange={(e) => setSelectedEntity(e.target.value)}
          >
            <option value="">Select Entity</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.id}>
                {entity.label}
              </option>
            ))}
          </Select>
        </div>

        {/* Input Attribute Selection */}
        <div>
          <label className="font-medium">Input Attribute</label>
          <Select
            className="w-full"
            value={inputAttribute}
            onChange={(e) => setInputAttribute(e.target.value)}
          >
            <option value="">Select Input Attribute</option>
            {attributes.map((attr) => (
              <option key={attr.id} value={attr.name}>
                {attr.name}
              </option>
            ))}
          </Select>
        </div>

        {/* Regular Expression Input */}
        <div>
          <label className="font-medium">Regular Expression</label>
          <Input
            type="text"
            className="w-full"
            value={regexPattern}
            onChange={handleRegexChange}
            placeholder="Enter regex pattern"
          />
          {regexError && (
            <p className="text-sm text-red-500 mt-1">{regexError}</p>
          )}
          <div className="text-sm text-gray-500 mt-1">
            <p>Example patterns:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>
                <code className="bg-gray-100 px-1 rounded">\[(.*?)\]</code> (Extracts text within square brackets)
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{"\\$(?\\d*\\.?\\d{1,2})"}</code> (Extracts a dollar amount)
              </li>
              <li>
                <code className="bg-gray-100 px-1 rounded">{"\\b(Positive|Negative|Neutral)\\b"}</code> (Extracts specific keywords)
              </li>
            </ul>
          </div>
        </div>

        {/* Output Attribute Name */}
        <div>
          <label className="font-medium">Output Attribute Name</label>
          <Input
            type="text"
            className="w-full"
            value={outputAttributeName}
            onChange={(e) => setOutputAttributeName(e.target.value)}
            placeholder="Enter output attribute name"
          />
          <p className="text-sm text-gray-500 mt-1">
            Use only letters, numbers, and underscores
          </p>
        </div>

        {/* Data Type Selection */}
        <div>
          <label className="font-medium">Data Type</label>
          <Select
            className="w-full"
            value={dataType}
            onChange={(e) => setDataType(e.target.value)}
          >
            {dataTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </Select>
        </div>

        <Button onClick={handleSave} className="btn btn-primary w-full">
          Save Configuration
        </Button>
      </div>
    </Card>
  );
} 