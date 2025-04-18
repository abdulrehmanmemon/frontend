import React, { useContext, useEffect, useState } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import SaveButton from "../customs/SaveButton";
import Input from "@/components/daisyui/Input/Input";
import Select from "@/components/daisyui/Select/Select";
import Card from "@/components/daisyui/Card/Card";
import Filter from "../segments/components/Filter";
import { supabaseSegments } from "../../helpers/supabaseClient";
import Button from "@/components/daisyui/Button/Button";

const operatorLabels = {
  "=": "EQ",
  "!=": "NEQ",
  ">": "GT",
  ">=": "GTE",
  "<": "LT",
  "<=": "LTE",
  "BETWEEN": "BETWEEN",
  "NOT CONTAINS": "NOT_CONTAINS",
  "CONTAINS": "CONTAINS",
};

const allOperators = Object.keys(operatorLabels);

const Branch = ({ instanceId, onSave, flowType = 'workflow' }) => {
  const context = useContext(FormContext);
  const { branchData, setBranchData } = context;
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize branch data for this instance as an array
  useEffect(() => {
    if (!branchData[instanceId]) {
      setBranchData(instanceId, [
        {
          id: crypto.randomUUID(),
          instanceId,
          name: "",
          filters: [
            {
              attribute: "leadscore",
              operator: "EQ",
              value1: "",
              value2: ""
            }
          ],
        },
        {
          id: crypto.randomUUID(),
          instanceId,
          name: "",
          filters: [
            {
              attribute: "leadscore",
              operator: "EQ",
              value1: "",
              value2: ""
            }
          ],
        },
      ]);
    }
  }, [instanceId, branchData, setBranchData]);

  const uiDetails = {
    select: "select-sm text-sm w-32",
    input: "input-sm text-sm input-bordered w-20",
    datepicker: "input-sm input-bordered w-20",
    radio: "radio-sm",
  };

  useEffect(() => {
    const fetchCompanyAttributes = async () => {
      setIsLoading(true);
      try {
        const { data: entities, error: entityError } = await supabaseSegments
          .from("entity")
          .select("id, entity_label")
          .eq("entity_label", "Company");

        if (entityError) throw entityError;
        if (!entities || entities.length === 0) return;

        const companyEntity = entities[0];

        const { data: attributes, error: attributesError } = await supabaseSegments
          .from("attributes")
          .select("id, attribute_name, data_type, entity_id")
          .eq("entity_id", companyEntity.id);

        if (attributesError) throw attributesError;
        if (!attributes) return;

        // Ensure "leadscore" with type "number" is always included
        const fetchedAttributes = attributes.map((attribute) => ({
          name: attribute.attribute_name,
          type: attribute.data_type,
        }));

        const leadscoreAttribute = { name: "leadscore", type: "number" };

        const updatedAttributes = [
          leadscoreAttribute,
          ...fetchedAttributes.filter(attr => attr.name !== "leadscore"), // Avoid duplicates
        ];

        setAttributes(updatedAttributes);
      } catch (error) {
        console.error("Error fetching company attributes:", error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyAttributes();
  }, []);

  const handleConditionChange = (branchIndex, conditionIndex, updatedFilter) => {
    const updatedBranches = [...branchData[instanceId]];
    updatedBranches[branchIndex].filters[conditionIndex] = updatedFilter;
    setBranchData(instanceId, updatedBranches);
  };

  const removeCondition = (branchIndex, conditionIndex) => {
    const updatedBranches = [...branchData[instanceId]];
    updatedBranches[branchIndex].filters.splice(conditionIndex, 1);
    setBranchData(instanceId, updatedBranches);
  };

  const handleBranchChange = (index, field, value) => {
    if (field === "name") {
      const alphanumericRegex = /^[a-zA-Z0-9\s]*$/;
      if (!alphanumericRegex.test(value)) {
        alert("Branch name must be alphanumeric!");
        return;
      }
    }

    const updatedBranches = [...branchData[instanceId]];
    updatedBranches[index][field] = value;
    setBranchData(instanceId, updatedBranches);
  };

  const addCondition = (branchIndex) => {
    const updatedBranches = [...branchData[instanceId]];
    updatedBranches[branchIndex].filters.push({
      attribute: "",
      operator: "",
      value: "",
    });
    setBranchData(instanceId, updatedBranches);
  };

  const isFormComplete = () => {
    return branchData[instanceId].every(
      (branch) => branch.name.trim() && branch.filters.length > 0
    );
  };

  const handleLocalSave = () => {
    if (!isFormComplete()) {
      alert("Please complete all fields before saving.");
      return;
    }

    // Transform operators before saving
    const transformedData = branchData[instanceId].map((branch) => ({
      ...branch,
      filters: branch.filters.map((filter) => ({
        ...filter,
        operator: operatorLabels[filter.operator] || filter.operator, // Map operator
      })),
    }));

    console.log("Saving branch data for", instanceId, transformedData);
    onSave(instanceId, transformedData);
  };

  if (!branchData[instanceId]) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-6 shadow-md rounded-lg">
      <h3 className="text-lg font-semibold mb-4">Branches (Node {instanceId})</h3>

      {branchData[instanceId].map((branch, branchIndex) => (
        <Card key={branch.id} className="p-4 mb-4">
          <label className="block text-sm font-medium mb-1">Branch Name</label>
          <Input
            type="text"
            value={branch.name}
            onChange={(e) => handleBranchChange(branchIndex, "name", e.target.value)}
            placeholder="Enter branch name"
            className="w-full mb-4 input-sm"
          />

          <label className="block text-sm font-medium mt-4">Conditions</label>
          {branch.filters.map((condition, conditionIndex) => (
            <Filter
              key={conditionIndex}
              filter={condition}
              columns={attributes.map((attr) => ({
                label: attr.name,
                type: attr.type,
              }))}
              onUpdateFilter={(updatedFilter) =>
                handleConditionChange(branchIndex, conditionIndex, updatedFilter)
              }
              uiDetails={uiDetails}
            />
          ))}
        </Card>
      ))}

      <div className="flex justify-center mt-4">
        <SaveButton onSave={handleLocalSave} isFormComplete={isFormComplete()} />
      </div>
    </div>
  );
};

export default Branch;
