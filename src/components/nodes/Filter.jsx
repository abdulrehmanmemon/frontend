import React, { useState, useContext } from 'react';
import Button from '@/components/daisyui/Button/Button';
import { FXExposureContext } from '../../contexts/forms/FXExposureContext';

const SQLFilter = ({ instanceId, onSave, data, flowType = 'fxExposure' }) => {
  const [formData, setFormData] = useState({
    sqlQuery: data?.sqlQuery || '',
    conditions: data?.conditions || [{ column: '', operator: '>', value: '', conjunction: 'AND' }],
    isFormComplete: data?.isFormComplete || false
  });

  // Dynamic fields based on flow type
  const getFieldsForFlow = (type) => {
    switch(type) {
      case 'fxExposure':
        return [
          { value: 'total_fx_exposure', label: 'Total FX Exposure', type: 'number' },
          { value: 'fx_exposure_percentage', label: 'FX Exposure Percentage', type: 'number' },
          { value: 'currency_exposure', label: 'Currency-Specific Exposure', type: 'string' },
          { value: 'transaction_date', label: 'Transaction Date', type: 'date' }
        ];
      case 'payments':
        return [
          { value: 'payment_amount', label: 'Payment Amount', type: 'number' },
          { value: 'payment_status', label: 'Payment Status', type: 'string' },
          { value: 'payment_date', label: 'Payment Date', type: 'date' }
        ];
      default:
        return [];
    }
  };

  const fields = getFieldsForFlow(flowType);

  const operators = [
    { value: '=', label: 'Equals', types: ['string', 'number', 'date'] },
    { value: '!=', label: 'Not Equals', types: ['string', 'number', 'date'] },
    { value: '>', label: 'Greater Than', types: ['number', 'date'] },
    { value: '<', label: 'Less Than', types: ['number', 'date'] },
    { value: '>=', label: 'Greater Than or Equal', types: ['number', 'date'] },
    { value: '<=', label: 'Less Than or Equal', types: ['number', 'date'] },
    { value: 'LIKE', label: 'Contains', types: ['string'] },
    { value: 'NOT LIKE', label: 'Does Not Contain', types: ['string'] },
    { value: 'IN', label: 'In List', types: ['string', 'number'] },
    { value: 'NOT IN', label: 'Not In List', types: ['string', 'number'] },
    { value: 'BETWEEN', label: 'Between', types: ['number', 'date'] },
    { value: 'IS NULL', label: 'Is Empty', types: ['string', 'number', 'date'] },
    { value: 'IS NOT NULL', label: 'Is Not Empty', types: ['string', 'number', 'date'] }
  ];

  const conjunctions = [
    { value: 'AND', label: 'AND' },
    { value: 'OR', label: 'OR' }
  ];

  const handleConditionChange = (index, field, value) => {
    const newConditions = [...formData.conditions];
    newConditions[index] = {
      ...newConditions[index],
      [field]: value
    };

    // Auto-update SQL query
    const sqlQuery = generateSQLQuery(newConditions);
    
    setFormData(prev => ({
      ...prev,
      conditions: newConditions,
      sqlQuery,
      isFormComplete: false
    }));
  };

  const generateSQLQuery = (conditions) => {
    if (!conditions.length) return '';

    const queryParts = conditions.map((condition, index) => {
      if (!condition.column || !condition.operator) return '';

      let queryPart = '';
      const selectedField = fields.find(f => f.value === condition.column);
      
      if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
        queryPart = `${condition.column} ${condition.operator}`;
      } else if (condition.operator === 'BETWEEN' && condition.value.includes(',')) {
        const [start, end] = condition.value.split(',').map(v => v.trim());
        queryPart = `${condition.column} BETWEEN ${selectedField.type === 'string' ? `'${start}'` : start} AND ${selectedField.type === 'string' ? `'${end}'` : end}`;
      } else if (condition.operator === 'IN' || condition.operator === 'NOT IN') {
        const values = condition.value.split(',').map(v => selectedField.type === 'string' ? `'${v.trim()}'` : v.trim());
        queryPart = `${condition.column} ${condition.operator} (${values.join(', ')})`;
      } else {
        const value = selectedField.type === 'string' ? `'${condition.value}'` : condition.value;
        queryPart = `${condition.column} ${condition.operator} ${value}`;
      }

      return index === 0 ? queryPart : `${condition.conjunction} ${queryPart}`;
    }).filter(Boolean);

    return queryParts.join(' ');
  };

  const addCondition = () => {
    setFormData(prev => ({
      ...prev,
      conditions: [...prev.conditions, { column: '', operator: '>', value: '', conjunction: 'AND' }],
      isFormComplete: false
    }));
  };

  const removeCondition = (index) => {
    const newConditions = formData.conditions.filter((_, i) => i !== index);
    const sqlQuery = generateSQLQuery(newConditions);

    setFormData(prev => ({
      ...prev,
      conditions: newConditions,
      sqlQuery,
      isFormComplete: false
    }));
  };

  const validateForm = () => {
    return formData.conditions.every(condition => {
      if (condition.operator === 'IS NULL' || condition.operator === 'IS NOT NULL') {
        return condition.column && condition.operator;
      }
      return condition.column && condition.operator && condition.value;
    });
  };

  const handleSave = () => {
    if (validateForm()) {
      onSave(instanceId, {
        ...formData,
        isFormComplete: true
      });
    } else {
      alert('Please complete all filter conditions');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-semibold mb-4">SQL Filter</h2>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Filter Conditions</label>
        {formData.conditions.map((condition, index) => (
          <div key={index} className="flex flex-col gap-2 mb-4 p-3 border rounded">
            {index > 0 && (
              <select
                className="select select-bordered w-32"
                value={condition.conjunction}
                onChange={(e) => handleConditionChange(index, 'conjunction', e.target.value)}
              >
                {conjunctions.map(conj => (
                  <option key={conj.value} value={conj.value}>
                    {conj.label}
                  </option>
                ))}
              </select>
            )}
            
            <div className="flex gap-2">
              <select
                className="select select-bordered flex-1"
                value={condition.column}
                onChange={(e) => handleConditionChange(index, 'column', e.target.value)}
              >
                <option value="">Select Column</option>
                {fields.map(field => (
                  <option key={field.value} value={field.value}>
                    {field.label}
                  </option>
                ))}
              </select>
              
              <select
                className="select select-bordered w-40"
                value={condition.operator}
                onChange={(e) => handleConditionChange(index, 'operator', e.target.value)}
              >
                <option value="">Select Operator</option>
                {operators
                  .filter(op => !condition.column || 
                    op.types.includes(fields.find(f => f.value === condition.column)?.type))
                  .map(op => (
                    <option key={op.value} value={op.value}>
                      {op.label}
                    </option>
                  ))
                }
              </select>
              
              {condition.operator !== 'IS NULL' && condition.operator !== 'IS NOT NULL' && (
                <input
                  type={fields.find(f => f.value === condition.column)?.type === 'date' ? 'date' : 'text'}
                  className="input input-bordered flex-1"
                  value={condition.value}
                  onChange={(e) => handleConditionChange(index, 'value', e.target.value)}
                  placeholder={condition.operator === 'BETWEEN' ? 'Value1, Value2' : 
                             (condition.operator === 'IN' || condition.operator === 'NOT IN') ? 'Value1, Value2, ...' : 'Value'}
                />
              )}
              
              {index > 0 && (
                <button
                  className="btn btn-error btn-sm"
                  onClick={() => removeCondition(index)}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        
        <button
          className="btn btn-outline btn-sm mt-2"
          onClick={addCondition}
        >
          Add Condition
        </button>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-2">Generated SQL Query</label>
        <div className="bg-gray-100 p-3 rounded">
          <code className="text-sm">
            {formData.sqlQuery || 'No conditions set'}
          </code>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          color="primary"
          variant="solid"
          size="sm"
          onClick={handleSave}
          className="rounded-full"
        >
          Save & Continue
        </Button>
      </div>
    </div>
  );
};

export default SQLFilter; 