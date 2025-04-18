import React, { useState, useEffect, useContext } from "react";
import SaveButton from "../customs/SaveButton";
import Card from "@/components/daisyui/Card/Card";
import Filter from "../segments/components/Filter";
import { supabaseSegments } from "../../helpers/supabaseClient";
import toast from "react-hot-toast";
import { FormContext } from "../../contexts/forms/WorkflowTemplateContext";
import { FXExposureContext } from "../../contexts/forms/FXExposureContext";

const TIME_PERIOD_OPTIONS = [
  { label: "Last Month", value: "last_month" },
  { label: "Last Quarter", value: "last_quarter" },
  { label: "Year-to-Date", value: "ytd" },
  { label: "Custom Range", value: "custom" },
];

const CaptureExposure = ({ instanceId, onSave, flowType = 'workflow' }) => {
  // Choose context based on flow type
  const workflowContext = useContext(FormContext);
  const fxExposureContext = useContext(FXExposureContext);
  
  // Select the appropriate context based on flow type
  const context = flowType === 'fxExposure' ? fxExposureContext : workflowContext;
  console.log('CaptureExposure Component - Context:', { context, flowType });

  const { captureExposureData, setCaptureExposureData } = context || {};
  if (!captureExposureData || !setCaptureExposureData) {
    console.error('Missing required context values:', { captureExposureData, setCaptureExposureData });
    return <div>Error: Missing required context values</div>;
  }

  const nodeData = captureExposureData[instanceId] || {};
  console.log('CaptureExposure Component - Node Data:', { instanceId, nodeData });

  const [baseCurrencySource, setBaseCurrencySource] = useState(nodeData.baseCurrencySource || "");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState(nodeData.timePeriod || "last_month");
  const [customStartDate, setCustomStartDate] = useState(nodeData.customStartDate || "");
  const [customEndDate, setCustomEndDate] = useState(nodeData.customEndDate || "");
  const [filters, setFilters] = useState(nodeData.filters || []);
  const [transactionColumns, setTransactionColumns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize data in context if empty
  useEffect(() => {
    if (!nodeData || Object.keys(nodeData).length === 0) {
      console.log('CaptureExposure - Initializing node data:', instanceId);
      const initialData = {
        baseCurrencySource: "",
        timePeriod: "last_month",
        customStartDate: "",
        customEndDate: "",
        filters: [],
      };
      setCaptureExposureData(instanceId, initialData);
    }
  }, [instanceId, nodeData, setCaptureExposureData]);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        const { data: entities, error: entityError } = await supabaseSegments
          .from("entity")
          .select("id, entity_label")
          .eq("entity_label", "Transaction");
  
        if (entityError) throw entityError;
        if (!entities || entities.length === 0) return;
  
        const transactionEntity = entities[0];
  
        const { data: attributes, error: attributesError } = await supabaseSegments
          .from("attributes")
          .select("id, attribute_name, data_type, entity_id")
          .eq("entity_id", transactionEntity.id);
  
        if (attributesError) throw attributesError;
        if (!attributes) return;

        setTransactionColumns(
          attributes.map(attr => ({
            label: attr.attribute_name,
            type: attr.data_type,
            id: attr.id
          }))
        );
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchColumns();
  }, []);

  const handleAddFilter = () => {
    setFilters([...filters, {
      attribute: transactionColumns[0]?.label || '',
      operator: '=',
      value1: '',
      value2: '',
      dataType: 'default'
    }]);
  };

  const handleUpdateFilter = (index, updatedFilter) => {
    const newFilters = [...filters];
    newFilters[index] = updatedFilter;
    setFilters(newFilters);
  };

  const handleRemoveFilter = (index) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!isFormValid()) {
      toast.error("Please fill out all required fields before saving.");
      return;
    }

    const updatedData = {
      baseCurrencySource,
      timePeriod: selectedTimePeriod,
      customStartDate: selectedTimePeriod === "custom" ? customStartDate : null,
      customEndDate: selectedTimePeriod === "custom" ? customEndDate : null,
      filters,
      
    };

    console.log('CaptureExposure - Saving node data:', { instanceId, updatedData });
    setCaptureExposureData(instanceId, updatedData);
    
    if (onSave) {
      onSave(instanceId, updatedData);
    }
    
    toast.success("Configuration saved successfully!");
  };

  const isFormValid = () => {
    return (
      baseCurrencySource.trim() !== "" &&
      (selectedTimePeriod !== "custom" ||
        (customStartDate && customEndDate && new Date(customStartDate) < new Date(customEndDate))) &&
      filters.length > 0
    );
  };

  if (loading) {
    return (
      <Card className="p-6 shadow-md rounded-lg">
        <div className="text-center">Loading transaction attributes...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6 shadow-md rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Calculate FX Exposure</h2>

      {/* Base Currency Source */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Base Currency Source</span>
        </label>
        <input
          type="text"
          placeholder="Enter static currency (e.g. USD) or template (e.g. {{base_currency}})"
          className="input input-bordered w-full input-sm"
          value={baseCurrencySource}
          onChange={(e) => setBaseCurrencySource(e.target.value)}
        />
      </div>

      {/* Time Period */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Time Period</span>
        </label>
        <select
          className="select select-bordered w-full select-sm"
          value={selectedTimePeriod}
          onChange={(e) => setSelectedTimePeriod(e.target.value)}
        >
          {TIME_PERIOD_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {selectedTimePeriod === "custom" && (
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Start Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">End Date</span>
              </label>
              <input
                type="date"
                className="input input-bordered input-sm"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}
      </div>

      {/* Filter Criteria */}
      <div className="form-control">
        <label className="label">
          <span className="label-text font-medium">Filter Criteria</span>
        </label>
        <div className="space-y-4">
          {filters.map((filter, index) => (
            <Filter
              key={index}
              filter={filter}
              columns={transactionColumns}
              onUpdateFilter={(updatedFilter) => handleUpdateFilter(index, updatedFilter)}
              onRemoveFilter={() => handleRemoveFilter(index)}
            />
          ))}
          <button
            className="btn btn-sm btn-outline"
            onClick={handleAddFilter}
          >
            Add Filter
          </button>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <SaveButton isFormComplete={isFormValid()} onSave={handleSave} />
      </div>
    </Card>
  );
};

export default CaptureExposure;