import React, { useState, useEffect, useContext } from "react";
import Input from "@/components/daisyui/Input/Input";
import Button from "@/components/daisyui/Button/Button";
import Card from "@/components/daisyui/Card/Card";
import CodeMirror from "@uiw/react-codemirror";
import { sql } from "@codemirror/lang-sql";
import { autocompletion } from "@codemirror/autocomplete";
import toast from "react-hot-toast";
import { supabaseSegments } from "../../helpers/supabaseClient";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";

const Formula = ({ instanceId, onSave, contextType = FormContext }) => {
  const context = useContext(contextType || FormContext);
  const { startData } = useContext(contextType || WorkflowTemplateContext);
  const segmentId = startData?.segmentId;
  
  const [attributeName, setAttributeName] = useState("");
  const [formula, setFormula] = useState("");
  const [error, setError] = useState("");
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttributes = async () => {
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
      } catch (err) {
        console.error('Error fetching attributes:', err);
        toast.error('Failed to load attributes');
      } finally {
        setLoading(false);
      }
    };

    if (segmentId) {
      fetchAttributes();
    } else {
      setLoading(false);
      toast.error('No segment ID available. Please select a segment in the Start node first.');
    }
  }, [segmentId]);

  const attributeCompletion = (context) => {
    const word = context.matchBefore(/\{\{(\w*)$/);
    if (!word) return null;

    const options = attributes.map(attr => ({
      label: attr.name,
      type: "variable",
      detail: `Type: ${attr.type}`,
      apply: attr.name + "}}",
    }));

    return {
      from: word.from + 2,
      options,
      validFor: /^\w*$/,
    };
  };

  const customAutocompletion = autocompletion({
    override: [attributeCompletion],
    closeOnBlur: true,
    defaultKeymap: true,
    closeOnAccept: true,
  });

  const validateFormula = (formula) => {
    // Create pattern for {{attribute}} followed by operator and number
    const attributePattern = attributes.map(attr => attr.name).join('|');
    const regex = new RegExp(`^{{(${attributePattern})}}\\s*[+\\-*/]\\s*\\d+(\\.\\d+)?$`);
    return regex.test(formula);
  };

  const handleSave = () => {
    if (!attributeName.match(/^\w+$/)) {
      setError("Attribute name must be alphanumeric with underscores.");
      return;
    }
    if (!validateFormula(formula)) {
      setError("Invalid formula syntax. Please use only available attributes.");
      return;
    }
    setError("");
    onSave(instanceId, { attributeName, formula });
    toast.success("Formula saved successfully!");
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="text-center">Loading attributes...</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <h2 className="text-xl font-bold mb-2">Formula</h2>
      <div className="mb-4">
        <label className="label">Attribute Name</label>
        <div>
          <Input
            type="text"
            value={attributeName}
            onChange={(e) => setAttributeName(e.target.value)}
            placeholder="Enter attribute name"
            className="input input-bordered w-full"
          />
        </div>
      </div>
      <div className="mb-4">
        <label className="label">Formula</label>
        <div className="border rounded-md p-2">
          <CodeMirror
            value={formula}
            extensions={[sql(), customAutocompletion]}
            onChange={(value) => setFormula(value)}
            options={{
              lineNumbers: true,
              mode: sql(),
              autocompletion: true,
              placeholder: "Type {{ to see available attributes",
            }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Available attributes: {attributes.map(attr => attr.name).join(', ')}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Example: {attributes.length > 0 ? `{{${attributes[0].name}}} * 0.85` : 'Loading...'} (to calculate 85% of the value)
        </p>
      </div>
      {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
      <div className="w-full">
        <Button onClick={handleSave} color="primary" className="w-full">Save</Button>
      </div>
    </Card>
  );
}

export default Formula;
