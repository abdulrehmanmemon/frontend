import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Filter from './Filter';
import { supabaseSegments } from '../../../helpers/supabaseClient.js';
import Button from '@/components/daisyui/Button/Button';
import Select  from '@/components/daisyui/Select/Select';
import { AiOutlineClose } from 'react-icons/ai';


const ConditionGroup = ({ conditionGroup, onUpdate, onRemove }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [tableNames, setTableNames] = useState([]);

  // Fetch entities from Supabase
  const fetchEntities = async () => {
    try {
      const { data, error } = await supabaseSegments
        .from('entity')
        .select('id, entity_label')
        .eq('enable', true)
        .in('entity_label', ['Account', 'Person', 'Deal', 'Company']); // Filter for specific labels
  
      if (error) throw error;
  
      setTableNames(
        data.map((entity) => ({
          id: entity.id,
          label: entity.entity_label,
        }))
      );
    } catch (error) {
      console.error('Error fetching entities:', error.message);
    }
  };
  

  const toggleDropdown = async () => {
    if (!showDropdown) {
      await fetchEntities();
    }
    setShowDropdown(!showDropdown);
  };

  // Add a new condition
  const addCondition = async (entityId, entityLabel) => {
    try {
      // Fetch attributes for the selected entity
      const { data: attributes, error } = await supabaseSegments
        .from('attributes')
        .select('id, attribute_label, data_type')
        .eq('enable', true)
        .eq('entity_id', entityId);

      if (error) throw error;

      // Create a new condition with its attributes
      const newCondition = {
        type: entityLabel,
        filters: [
          {
            attribute: '',
            operator: '',
            value1: '',
            value2: '',
            dataType: '',
          },
        ],
        attributes: attributes.map((attr) => ({
          id: attr.id,
          label: attr.attribute_label,
          type: attr.data_type,
        })),
      };

      console.log('Adding condition:', newCondition); // Debug log

      const newConditions = [...conditionGroup.conditions, newCondition];
      onUpdate({ ...conditionGroup, conditions: newConditions });
      setShowDropdown(false);
    } catch (error) {
      console.error('Error adding condition:', error.message);
    }
  };

  // Add a new filter to a specific condition
  const addFilter = (conditionIndex) => {
    const newFilters = [
      ...conditionGroup.conditions[conditionIndex].filters,
      { attribute: '', operator: '', value1: '',value2:'', dataType: '' },
    ];
    const updatedConditions = conditionGroup.conditions.map((condition, index) =>
      index === conditionIndex ? { ...condition, filters: newFilters } : condition
    );
    onUpdate({ ...conditionGroup, conditions: updatedConditions });
  };

  // Update a specific filter
  
  const updateFilter = (conditionIndex, filterIndex, updatedFilter) => {
    const attribute = conditionGroup.conditions[conditionIndex].attributes
      .find(attr => attr.label === updatedFilter.attribute);
    
    const updatedConditions = conditionGroup.conditions.map((condition, index) =>
      index === conditionIndex
        ? {
            ...condition,
            filters: condition.filters.map((filter, idx) =>
              idx === filterIndex
                ? {
                    ...updatedFilter,
                    attribute: attribute?.label || updatedFilter.attribute,
                    attributeName: attribute?.name || updatedFilter.attribute,
                    attributeId: attribute?.id || null,
                    dataType: attribute?.type || filter.dataType
                  }
                : filter
            ),
          }
        : condition
    );
  
    onUpdate({ ...conditionGroup, conditions: updatedConditions });
  };
  // Remove a specific filter
  const removeFilter = (conditionIndex, filterIndex) => {
    const newFilters = conditionGroup.conditions[conditionIndex].filters.filter(
      (_, i) => i !== filterIndex
    );
    const updatedConditions = conditionGroup.conditions.map((condition, index) =>
      index === conditionIndex ? { ...condition, filters: newFilters } : condition
    );
    onUpdate({ ...conditionGroup, conditions: updatedConditions });
  };

  // Remove a condition
  const removeCondition = (index) => {
    const updatedConditions = conditionGroup.conditions.filter((_, i) => i !== index);
    onUpdate({ ...conditionGroup, conditions: updatedConditions });
  };

  // Handle match type change
  const handleMatchTypeChange = (e) => {
    onUpdate({ ...conditionGroup, matchType: e.target.value });
  };

  return (
    <div className="relative bg-gray-100 p-4 rounded mb-4 border border-gray-300">
      {/* Match Type Selection */}
      <div className="flex items-center space-x-2 mb-4">
        <span>Meet</span>
        <Select
          value={conditionGroup.matchType}
          onChange={handleMatchTypeChange}
          className="w-25"
          size="sm"
        >
          <option value="all">All</option>
          <option value="any">Any</option>
        </Select>
        <span>of the following criteria</span>
        <button onClick={onRemove} className="absolute top-2 right-2">
          <AiOutlineClose size={18} />
        </button>
      </div>

      {/* Condition and Filters */}
      {conditionGroup.conditions.map((condition, conditionIndex) => (
        <div
          key={conditionIndex}
          className="bg-white border border-gray-300 rounded-md p-4 mb-4 shadow-sm"
        >
          <div className="flex justify-between items-center bg-gray-800 text-white px-4 py-2 rounded-t-md">
            <span>{condition.type}</span>
            <button onClick={() => removeCondition(conditionIndex)} className="text-white">
              <AiOutlineClose size={16} />
            </button>
          </div>

          <div className="p-4">
            {condition.filters.map((filter, filterIndex) => (
              <Filter
                key={filterIndex}
                filter={filter}
                columns={condition.attributes} // Use condition-specific attributes
                onUpdateFilter={(updatedFilter) =>
                  updateFilter(conditionIndex, filterIndex, updatedFilter)
                }
                onRemoveFilter={() => removeFilter(conditionIndex, filterIndex)}
              />
            ))}
            <Button
              onClick={() => addFilter(conditionIndex)}
              variant="outline"
              size="sm"
              color="secondary"
            >
              + Add filter
            </Button>
          </div>
        </div>
      ))}

      {/* Add Condition Dropdown */}
      <div className="relative">
        <Button onClick={toggleDropdown} className="mt-2" size="sm" color="primary" variant="outline">
          + Add condition
        </Button>
        {showDropdown && (
          <div className="absolute bg-white border border-gray-300 rounded mt-2 shadow-lg w-48 z-10">
            <ul className="py-2">
              {tableNames.length > 0 ? (
                tableNames.map((entity) => (
                  <li
                    key={entity.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => addCondition(entity.id, entity.label)}
                  >
                    {entity.label}
                  </li>
                ))
              ) : (
                <li className="px-4 py-2 text-gray-500">No entities found</li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

ConditionGroup.propTypes = {
  conditionGroup: PropTypes.shape({
    matchType: PropTypes.string,
    conditions: PropTypes.arrayOf(
      PropTypes.shape({
        type: PropTypes.string,
        filters: PropTypes.arrayOf(
          PropTypes.shape({
            attribute: PropTypes.string,
            operator: PropTypes.string,
            value1: PropTypes.any,
            value2: PropTypes.any,
            dataType: PropTypes.string,
          })
        ),
        attributes: PropTypes.arrayOf(
          PropTypes.shape({
            id: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
            type: PropTypes.string.isRequired,
          })
        ),
      })
    ),
  }).isRequired,
  onUpdate: PropTypes.func.isRequired,
  onRemove: PropTypes.func.isRequired,
};

export default ConditionGroup;