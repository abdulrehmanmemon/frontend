import React, { useContext } from 'react';
import { FormContext } from '../../contexts/forms/WorkflowTemplateContext';

const WorkflowTemplate = () => {
  const { context, flowType } = useContext(FormContext);
  console.log('WorkflowTemplate - Full Context:', { context, flowType }); // Debug full context

  const {
    startData,
    setStartData,
    enrichData,
    setEnrichData,
    leadScoreData,
    setLeadScoreData,
    branchData,
    setBranchData,
    openAINodeData,
    setOpenAINodeData,
    emailData,
    setEmailData,
    slackData,
    setSlackData,
    status,
    setStatus,
  } = context;

  // Debug individual state values
  console.log('WorkflowTemplate - State Values:', {
    startData,
    enrichData,
    leadScoreData,
    branchData,
    openAINodeData,
    emailData,
    slackData,
    status
  });

  return (
    <div>
      {/* Rest of the component code */}
    </div>
  );
};

export default WorkflowTemplate; 