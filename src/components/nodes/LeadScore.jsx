import React, { useContext, useState, useEffect } from "react";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import { supabaseSegments } from "../../helpers/supabaseClient";
import SaveButton from "../customs/SaveButton";
import Button from "@/components/daisyui/Button/Button";
import Input from "@/components/daisyui/Input/Input";
import Select from "@/components/daisyui/Select/Select";
import Card from "@/components/daisyui/Card/Card";
import Filter from "../segments/components/Filter";

const operatorLabels = {
  "=": "EQ",
  "!=": "NEQ",
  ">": "GT",
  ">=": "GTE",
  "<": "LT",
  "<=": "LTE",
  "BETWEEN": "BETWEEN",
  "NOT BETWEEN": "NOT_BETWEEN",
  "IN": "IN",
  "NOT IN": "NOT_IN",
  "IS TRUE": "IS_TRUE",
  "IS FALSE": "IS_FALSE",
  "CONTAINS": "CONTAINS",
  "NOT CONTAINS": "NOT_CONTAINS",
  "STARTS WITH": "STARTS_WITH",
  "ENDS WITH": "ENDS_WITH"
};

const LeadScore = ({ instanceId, onSave, flowType = 'workflow' }) => {
  const context = useContext(FormContext);
  const { leadScoreData, setLeadScoreData } = context;
  const [attributes, setAttributes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Ensure `leadScoreData[instanceId]` is initialized on first render
  useEffect(() => {
    if (!leadScoreData[instanceId]) {
      setLeadScoreData(instanceId, {
        demographs: [
          {
            name: "",
            leadscore: "",
            logical_operator: "ALL",
            conditions: [
              {
                attribute: "",
                operator: "",
                value1: "",
                value2: "",
              },
            ],
          },
        ],
      });
    }
  }, [instanceId, leadScoreData, setLeadScoreData]);

  // Ensure `currentLeadScoreData` is always defined
  const currentLeadScoreData = leadScoreData[instanceId] || { demographs: [] };

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

  const handleNameChange = (demographIndex, value) => {
    if (/^[a-zA-Z0-9 ]*$/.test(value)) {
      const updatedDemographs = [...currentLeadScoreData.demographs];
      updatedDemographs[demographIndex].name = value;
      setLeadScoreData(instanceId, { demographs: updatedDemographs });
    }
  };

  const handleConditionChange = (demographIndex, conditionIndex, updatedFilter) => {
    const updatedDemographs = [...currentLeadScoreData.demographs];
    updatedDemographs[demographIndex].conditions[conditionIndex] = updatedFilter;
    setLeadScoreData(instanceId, { demographs: updatedDemographs });
  };

  const addCondition = (demographIndex) => {
    const updatedDemographs = [...currentLeadScoreData.demographs];
    updatedDemographs[demographIndex].conditions.push({
      attribute: "",
      operator: "",
      value1: "",
      value2: "",
    });
    setLeadScoreData(instanceId, { demographs: updatedDemographs });
  };

  const removeCondition = (demographIndex, conditionIndex) => {
    const updatedDemographs = [...currentLeadScoreData.demographs];
    updatedDemographs[demographIndex].conditions.splice(conditionIndex, 1);
    setLeadScoreData(instanceId, { demographs: updatedDemographs });
  };

  const addFilter = () => {
    setLeadScoreData(instanceId, {
      demographs: [
        ...currentLeadScoreData.demographs,
        {
          name: "",
          leadscore: "",
          logical_operator: "ALL",
          conditions: [
            {
              attribute: "",
              operator: "",
              value1: "",
              value2: "",
            },
          ],
        },
      ],
    });
  };

  const removeDemograph = (demographIndex) => {
    const updatedDemographs = [...currentLeadScoreData.demographs];
    updatedDemographs.splice(demographIndex, 1);
    setLeadScoreData(instanceId, { demographs: updatedDemographs });
  };

  const isFormComplete = () =>
    currentLeadScoreData.demographs.every(
      (demograph) =>
        demograph.name &&
        demograph.leadscore &&
        demograph.conditions.every(
          (condition) =>
            condition.operator &&
            condition.attribute &&
            (condition.operator === "BETWEEN"
              ? condition.value1 !== "" && condition.value2 !== ""
              : condition.value1 !== "")
        )
    );

  const handleSave = () => {
    if (isFormComplete()) {
      // Map operator labels before saving
      const transformedData = {
        demographs: currentLeadScoreData.demographs.map((demograph) => ({
          ...demograph,
          conditions: demograph.conditions.map((condition) => ({
            ...condition,
            operator: operatorLabels[condition.operator] || condition.operator, // Map operator
          })),
        })),
      };
      onSave(instanceId, transformedData);
      console.log("Lead Score Data saved for instanceId:", instanceId, transformedData);
      setLeadScoreData(instanceId, transformedData);
    } else {
      alert("Please fill out all required fields before proceeding.");
    }
  };

  const uiDetails = {
    select: "select-sm text-sm w-32",
    input: "input-sm text-sm input-bordered w-20",
    datepicker: "input-sm input-bordered w-20",
    radio: "radio-sm",
  };

  return (
    <Card className="p-4 border-none">
      <h3 className="text-lg font-semibold mb-4">Lead Score</h3>

      {currentLeadScoreData.demographs.map((demograph, demographIndex) => (
        <Card key={demographIndex} className="mb-6 p-4">
          <Button
            className="btn btn-ghost btn-circle absolute right-0 top-1 btn-sm"
            onClick={() => removeDemograph(demographIndex)}
          >
            ✖
          </Button>

          <label className="block text-sm font-medium mb-1">Name</label>
          <Input
            type="text"
            value={demograph.name}
            onChange={(e) => handleNameChange(demographIndex, e.target.value)}
            placeholder="Enter name"
            className="w-full input-sm"
          />

          <label className="block text-sm font-medium mt-4">Conditions</label>
          {demograph.conditions.map((condition, conditionIndex) => (
            <Filter
              key={conditionIndex}
              filter={condition}
              columns={attributes.map((attr) => ({
                label: attr.name,
                type: attr.type,
              }))}
              onUpdateFilter={(updatedFilter) =>
                handleConditionChange(demographIndex, conditionIndex, updatedFilter)
              }
              onRemoveFilter={() => removeCondition(demographIndex, conditionIndex)}
              uiDetails={uiDetails}
            />
          ))}

          <Button color="secondary" variant="outline" size="xs" onClick={() => addCondition(demographIndex)} className="w-1/2">
            + Add Filter
          </Button>
          <div className="mt-4">
            <label className="block">Leadscore</label>
            <Input
              type="number"
              value={demograph.leadscore}
              onChange={(e) => {
                const value = e.target.value === "" ? "" : Number(e.target.value); // Allow empty input
                const updatedDemographs = [...currentLeadScoreData.demographs];
                updatedDemographs[demographIndex].leadscore = value;
                setLeadScoreData(instanceId, { demographs: updatedDemographs });
              }}
              placeholder="Enter lead score"
              size="sm"
              pattern="[0-9]*"
            />
          </div>
        </Card>
      ))}

      <Button color="primary" variant="solid" size="sm" onClick={addFilter}>
        + Add Condition
      </Button>

      <div className="flex justify-center mt-2">
        <SaveButton isFormComplete={isFormComplete()} onSave={handleSave} />
      </div>
    </Card>
  );
};

export default LeadScore;
