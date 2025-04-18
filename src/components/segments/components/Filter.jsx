import React from 'react';
import PropTypes from 'prop-types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import Select  from '@/components/daisyui/Select/Select';
import Input from '@/components/daisyui/Input/Input';

// Mapping of Supabase types to operator types
const supabaseToOperatorType = {
  uuid: 'string',
  text: 'string',
  varchar: 'string',
  char: 'string',
  date: 'date',
  timestamp: 'date',
  timestamptz: 'date',
  numeric: 'float',
  int: 'integer',
  integer: 'integer',
  bigint: 'integer',
  float: 'float',
  double: 'float',
  boolean: 'boolean',
  default: 'default',
};

// Operators by data type
const operatorOptions = {
  default: ['=', '!=', '>', '<', '>=', '<=', 'CONTAINS', 'STARTS_WITH', 'ENDS_WITH',"NOT_CONTAINS"],
  numeric: ['=', '!=', '>', '<', '>=', '<=', 'BETWEEN'],
  int4: ['=', '!=', '>', '<', '>=', '<=', 'BETWEEN'],
  float: ['=', '!=', '>', '<', '>=', '<=', 'BETWEEN'],
  date: ['=', '!=', '>', '<', 'BETWEEN'],
  string:["CONTAINS"],
  text:["CONTAINS"],
  varchar:["CONTAINS"]
};


/**
 * Render an operator dropdown based on the data type.
 */
const renderOperatorSelect = (dataType, operator, onChange,uiDetails) => {
  const operators = operatorOptions[dataType] || operatorOptions.default;
  return (
    <Select
      size="sm"
      className={uiDetails?.select || 'select select-bordered w-30'}
      value={operator || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      
      {/* Dropdown options */}
      {operators.map((op) => (
        <option key={op} value={op} className="text-black">
          {op}
        </option>
      ))}
    
    </Select>
  );
};

/**
 * Render the value input field based on the data type.
 */
  const renderValueInput = (dataType, operator, value1, value2, onChange,uiDetails) => {
    if (operator === 'BETWEEN') {
      return (
        <div>
          {renderSingleInput(dataType, value1, (val) => onChange({ value1: val, value2 }),uiDetails)}
          <span className='ml-2 mr-2'>and</span>
          {renderSingleInput(dataType, value2, (val) => onChange({ value1, value2: val }),uiDetails)}
        </div>
      );
    }
  
    return renderSingleInput(dataType, value1, (val) => onChange({ value1: val, value2: '' }),uiDetails);
  };

  const renderSingleInput = (dataType, value, onChange,uiDetails) => {
  switch (dataType) {
    case 'numeric':
    case 'int4':
    case 'float':
      return (
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="number"
          className={uiDetails?.input || 'input input-bordered w-30'}
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^0-9.]/g, ''))}
          size="sm"
        />
      );
    case 'string':
    case 'text':
    case 'varchar':
      return (
        <Input
          type="text"
          placeholder="value"
          className={uiDetails?.input || 'input input-bordered w-30'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          size="sm"
        />
      );
    case 'date':
      return (
        <DatePicker
        selected={value && !isNaN(new Date(value)) ? new Date(value) : null}
        onChange={(date) => onChange(date ? date.toISOString() : '')}
        className={uiDetails?.input || 'input input-bordered w-30 input-sm'}
        dateFormat="yyyy-MM-dd"
        placeholderText="Select date"
        isClearable
        showYearDropdown
      />
      );
    case 'boolean':
      return (
        <div className="flex items-center space-x-4">
          <label>
            <Input
              type="radio"
              name={`booleanFilter-${filterKey}`}
              value="true"
              checked={value === 'true'}
              onChange={() => onChange('true')}
              size="sm"
            />
            True
          </label>
          <label>
            <Input
              type="radio"
              name={`booleanFilter-${filterKey}`}
              value="false"
              checked={value === 'false'}
              onChange={() => onChange('false')}
              size="sm"
            />
            False
          </label>
        </div>
      );
    default:
      return (
        <Input
          type="text"
          placeholder="value"
          className={uiDetails?.input || 'input input-bordered w-30'}
          value={value}
          size="sm"
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

/**
 * Filter Component
 */
/**
 * Filter Component
 */
const Filter = ({ filter, columns = [], onUpdateFilter, onRemoveFilter, uiDetails }) => {
  // Set default attribute and its corresponding data type
  const defaultAttribute = filter.attribute || (columns.length > 0 ? columns[0].label : '');
  const selectedColumn = columns.find((column) => column.label === defaultAttribute);
  const defaultDataType = selectedColumn ? supabaseToOperatorType[selectedColumn.type] : 'default';
  const defaultOperator = filter.operator || (operatorOptions[defaultDataType]?.[0] || '=');

  React.useEffect(() => {
    if (!filter.attribute || !filter.operator) {
      onUpdateFilter({
        ...filter,
        attribute: defaultAttribute,
        dataType: defaultDataType,
        operator: defaultOperator,
        value1: '',
        value2: '',
      });
    }
  }, [defaultAttribute, defaultOperator]);

  const handleAttributeChange = (attribute) => {
    const selectedColumn = columns.find((column) => column.label === attribute);
    const dataType = selectedColumn ? supabaseToOperatorType[selectedColumn.type] : 'default';
    const attributeId = selectedColumn?.id || null;
    const newOperator = operatorOptions[dataType]?.[0] || '=';

    onUpdateFilter({ ...filter, attribute, attributeId, dataType, operator: newOperator, value1: '', value2: '' });
  };

  const handleOperatorChange = (operator) => {
    onUpdateFilter({ ...filter, operator, value1: '', value2: '' });
  };

  const handleValueChange = ({ value1, value2 }) => {
    onUpdateFilter({ ...filter, value1, value2 });
  };

  return (
    <div className="flex items-center gap-4 mb-2">
      {/* Attribute Dropdown */}
      <Select
        className={`${uiDetails?.select || 'select-bordered w-40'} ${
          filter.attribute ? 'text-black' : 'text-gray-400'
        }`}
        value={filter.attribute || defaultAttribute}
        onChange={(e) => handleAttributeChange(e.target.value)}
        size="sm"
      >
        {columns.map((column) => (
          <option key={column.label} value={column.label} className="text-black">
            {column.label}
          </option>
        ))}
      </Select>

      {/* Operator Dropdown */}
      {renderOperatorSelect(filter.dataType || defaultDataType, filter.operator || defaultOperator, handleOperatorChange, uiDetails)}

      {/* Value Input */}
      {renderValueInput(filter.dataType || defaultDataType, filter.operator || defaultOperator, filter.value1, filter.value2, handleValueChange, uiDetails)}

      {/* Remove Filter Button */}
      <button onClick={onRemoveFilter} className="text-gray-500">
        ✕
      </button>
    </div>
  );
};

Filter.propTypes = {
  filter: PropTypes.shape({
    attribute: PropTypes.string.isRequired,
    operator: PropTypes.string.isRequired,
    value1: PropTypes.any,
    value2: PropTypes.any,
    dataType: PropTypes.string.isRequired,
  }).isRequired,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
    })
  ),
  onUpdateFilter: PropTypes.func.isRequired,
  onRemoveFilter: PropTypes.func.isRequired,
};

export default Filter;
