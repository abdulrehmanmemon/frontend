import React, { useState, useContext } from 'react';
import Card from "@/components/daisyui/Card/Card";
import Select from '@/components/daisyui/Select/Select';
import Input from '@/components/daisyui/Input/Input';
import Textarea from '@/components/daisyui/Textarea/Textarea';
import Button from '@/components/daisyui/Button/Button';
import { FormContext } from '../../contexts/forms/WorkflowTemplateContext';

const FinancialStatement = ({ instanceId, onSave, contextType = FormContext }) => {
  const context = useContext(contextType || FormContext);
  // State for configuration settings
  const [config, setConfig] = useState({
    aiModel: '',
    documentSource: '',
    documentLocation: '',
    prompt: '',
  });

  // Available AI models
  const aiModels = [
    { value: 'gpt4', label: 'GPT-4' },
    { value: 'claude2', label: 'Claude 2' },
    { value: 'palm2', label: 'PaLM 2' },
  ];

  // Document source options
  const documentSources = [
    { value: 'url', label: 'URL' },
    { value: 'sftp', label: 'SFTP' },
  ];

  // Handle input changes
  const handleChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle form submission
  const handleSave = () => {
    // Validate required fields
    if (!config.aiModel || !config.documentSource || !config.documentLocation || !config.prompt) {
      alert('Please fill in all required fields');
      return;
    }

    // Save configuration
    onSave({
      instanceId,
      nodeType: 'FinancialStatement',
      config: {
        ...config,
        inputFormat: ['pdf', 'image'],
        outputFields: ['aiModelResult']
      }
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-6">
      <h2 className="text-xl font-semibold mb-6">Financial Statement Analysis Configuration</h2>

      {/* AI Model Selection */}
      <div className="mb-6">
        <label className="label">
          <span className="label-text font-medium">AI Model</span>
        </label>
        <Select
          value={config.aiModel}
          onChange={(e) => handleChange('aiModel', e.target.value)}
          options={aiModels}
          placeholder="Select AI Model"
          className="w-full"
        />
      </div>

      {/* Document Source */}
      <div className="mb-6">
        <label className="label">
          <span className="label-text font-medium">Document Source</span>
        </label>
        <Select
          value={config.documentSource}
          onChange={(e) => handleChange('documentSource', e.target.value)}
          options={documentSources}
          placeholder="Select Document Source"
          className="w-full"
        />
      </div>

      {/* Document Location */}
      <div className="mb-6">
        <label className="label">
          <span className="label-text font-medium">Document Location</span>
        </label>
        <Input
          type="text"
          value={config.documentLocation}
          onChange={(e) => handleChange('documentLocation', e.target.value)}
          placeholder={config.documentSource === 'url' ? 'Enter URL' : 'Enter SFTP path'}
          className="w-full"
        />
        <p className="text-sm text-gray-500 mt-1">
          You can use {{field}} syntax or string manipulation to specify the location
        </p>
      </div>

      {/* Prompt */}
      <div className="mb-6">
        <label className="label">
          <span className="label-text font-medium">Analysis Prompt</span>
        </label>
        <Textarea
          value={config.prompt}
          onChange={(e) => handleChange('prompt', e.target.value)}
          placeholder="Enter your prompt to guide the AI analysis..."
          className="w-full h-32"
        />
        <p className="text-sm text-gray-500 mt-1">
          Provide instructions or questions for the AI model to analyze the financial statements
        </p>
      </div>

      {/* Input/Output Information */}
      <div className="mb-6">
        <h3 className="font-medium mb-2">Input/Output Information</h3>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="mb-2">
            <span className="font-medium">Supported Input Formats:</span>
            <span className="ml-2">PDF, Images</span>
          </div>
          <div>
            <span className="font-medium">Output:</span>
            <span className="ml-2">AI Model Analysis Results</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          color="primary"
          onClick={handleSave}
          className="w-32"
        >
          Save
        </Button>
      </div>
    </Card>
  );
};

export default FinancialStatement; 