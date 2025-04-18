import React, { useState, useEffect, useContext } from 'react';
import SaveButton from "../customs/SaveButton";
import Input from "@/components/daisyui/Input/Input";
import Select from "@/components/daisyui/Select/Select";
import Card from "@/components/daisyui/Card/Card";
import Filter from "../segments/components/Filter";
import Button from "@/components/daisyui/Button/Button";
import { supabaseSegments } from '../../helpers/supabaseClient';
import { FormContext } from '../../contexts/forms/WorkflowTemplateContext';

const Aggregate = ({ instanceId, onSave, contextType = FormContext }) => {
  const context = useContext(contextType || FormContext);
  const [metricName, setMetricName] = useState("");
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("Last Month");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [filters, setFilters] = useState([{}]);
  const [columns, setColumns] = useState([]);
  const [aggregationAttributes, setAggregationAttributes] = useState([]);
  const [selectedAggregationFunction, setSelectedAggregationFunction] = useState("SUM");
  const [selectedAggregationAttribute, setSelectedAggregationAttribute] = useState("");

  const uiDetails = {
    select: "select-sm text-sm w-32",
    input: "input-sm text-sm input-bordered w-20",
    datepicker: "input-sm input-bordered w-20",
    radio: "radio-sm",
  };

  useEffect(() => {
    const fetchColumns = async () => {
      const { data: entityData, error: entityError } = await supabaseSegments
        .from('entity')
        .select('id')
        .eq('entity_label', 'Transaction')
        .single();

      if (entityError || !entityData) {
        console.error("Error fetching entity:", entityError);
        return;
      }

      const entityId = entityData.id;

      const { data: attributesData, error: attributesError } = await supabaseSegments
        .from('attributes')
        .select('id, attribute_label, data_type')
        .eq('entity_id', entityId);

      if (attributesError || !attributesData) {
        console.error("Error fetching attributes:", attributesError);
        return;
      }

      setColumns(attributesData.map(attr => ({ label: attr.attribute_label, type: attr.data_type })));
      setAggregationAttributes(attributesData.map(attr => attr.attribute_label));
    };

    fetchColumns();
  }, []);

  const addFilter = () => setFilters([...filters, {}]);
  const updateFilter = (index, updatedFilter) => {
    const newFilters = [...filters];
    newFilters[index] = updatedFilter;
    setFilters(newFilters);
  };
  const removeFilter = (index) => {
    if (filters.length > 1) {
      setFilters(filters.filter((_, i) => i !== index));
    }
  };

  const handleSave = () => {
    const data = {
      metricName,
      timePeriod: selectedTimePeriod,
      customStartDate: selectedTimePeriod === "Custom Range" ? customStartDate : null,
      customEndDate: selectedTimePeriod === "Custom Range" ? customEndDate : null,
      filters,
      aggregationFunction: selectedAggregationFunction,
      aggregationAttribute: selectedAggregationAttribute,
    };
    onSave(instanceId, data);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Aggregate Transactions</h3>
        <p className="text-sm text-gray-500">Configure how to aggregate transaction data</p>
      </div>

      <div className="space-y-6">
        {/* Metric Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
          <Input
            type="text"
            placeholder="Enter metric name"
            className="w-full"
            value={metricName}
            onChange={(e) => setMetricName(e.target.value)}
          />
        </div>
        
        {/* Time Period */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
          <Select
            className="w-full"
            value={selectedTimePeriod}
            onChange={(e) => setSelectedTimePeriod(e.target.value)}
          >
            <option value="Last Month">Last Month</option>
            <option value="Last Quarter">Last Quarter</option>
            <option value="Year-to-Date">Year-to-Date</option>
            <option value="Custom Range">Custom Range</option>
          </Select>

          {selectedTimePeriod === "Custom Range" && (
            <div className="mt-2 flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <Input
                  type="date"
                  className="w-full"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <Input
                  type="date"
                  className="w-full"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Filter Criteria */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Filter Criteria</label>
          <div className="space-y-4">
            {filters.map((filter, index) => (
              <div key={index} className="flex items-start gap-2">
                <Filter
                  filter={filter}
                  columns={columns}
                  onUpdateFilter={(updatedFilter) => updateFilter(index, updatedFilter)}
                  onRemoveFilter={() => removeFilter(index)}
                  uiDetails={uiDetails}
                />
                {filters.length > 1 && (
                  <Button
                    color="error"
                    variant="outline"
                    size="sm"
                    onClick={() => removeFilter(index)}
                    className="mt-1"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button
              color="primary"
              variant="outline"
              onClick={addFilter}
              className="w-full"
            >
              + Add Filter
            </Button>
          </div>
        </div>
        
        {/* Aggregation Function */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation Function</label>
          <Select
            className="w-full"
            value={selectedAggregationFunction}
            onChange={(e) => setSelectedAggregationFunction(e.target.value)}
          >
            <option value="SUM">SUM</option>
            <option value="COUNT">COUNT</option>
            <option value="MIN">MIN</option>
            <option value="MAX">MAX</option>
            <option value="AVG">AVG</option>
          </Select>
        </div>
        
        {/* Aggregation Attribute */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Aggregation Attribute</label>
          <Select
            className="w-full"
            value={selectedAggregationAttribute}
            onChange={(e) => setSelectedAggregationAttribute(e.target.value)}
          >
            <option value="">Select an attribute</option>
            {aggregationAttributes.map(attr => (
              <option key={attr} value={attr}>{attr}</option>
            ))}
          </Select>
        </div>
        
        {/* Save Button */}
        <Button
          color="primary"
          variant="solid"
          onClick={handleSave}
          className="w-full"
        >
          Save Configuration
        </Button>
      </div>
    </div>
  );
};

export default Aggregate;
