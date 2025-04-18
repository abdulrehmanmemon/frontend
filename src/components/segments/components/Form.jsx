import React from 'react';
import PropTypes from 'prop-types';
import Input from '@/components/daisyui/Input/Input';
import Textarea from '@/components/daisyui/Textarea/Textarea';

const generateRandomString = () => {
  return Math.random().toString(36).substr(2, 6);
};

const Form = ({ segment, setSegment }) => {
  const handleNameChange = (e) => {
    const newName = e.target.value;
    // Allow only alphanumeric characters (letters and numbers) and spaces
    const baseName = newName.replace(/[^a-zA-Z0-9\s]/g, '');
    
    // Add suffix immediately when name changes
    const randomString = generateRandomString();
    const suffix = `_${randomString}`;
    setSegment({ 
      ...segment, 
      name: `${baseName}${suffix}`,
      baseName: baseName,
      json_name: `${segment.json_name || baseName}_json${suffix}`
    });
  };

  const handleDescriptionChange = (e) => {
    const newDescription = e.target.value;
    setSegment({ ...segment, description: newDescription });
  };

  return (
    <div className="mb-4">
      {/* Segment Name Input */}
      <div className="relative">
      <Input
  type="text"
  placeholder="Segment name"
  value={segment.name || ''}
  onChange={e => setSegment({ ...segment, name: e.target.value })}
  className="input-bordered w-full mb-2"
  size="md"
/>
      </div>
      {/* Description Input */}
      <Textarea
        placeholder="Description"
        value={segment.description}
        onChange={handleDescriptionChange}
        className="textarea-bordered w-full mb-4"
        size="md"
      />
    </div>
  );
};

Form.propTypes = {
  segment: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
  }).isRequired,
  setSegment: PropTypes.func.isRequired,
};

export default Form;
