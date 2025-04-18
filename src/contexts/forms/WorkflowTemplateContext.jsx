import React, { createContext, useState, useCallback } from "react";

export const FormContext = createContext();

export const WorkflowFormProvider = ({ children }) => {
  // State for each form section, keyed by instanceId
  const [startData, setStartData] = useState({});
  const [enrichData, setEnrichData] = useState({});
  const [leadScoreData, setLeadScoreData] = useState({});
  const [branchData, setBranchData] = useState({});
  const [openAINodeData, setOpenAINodeData] = useState({});
  const [emailData, setEmailData] = useState({});
  const [slackData, setSlackData] = useState({});
  const [captureExposureData, setCaptureExposureData] = useState({});
  const [filterData, setFilterData] = useState({});

  // Workflow status tracking
  const [status, setStatus] = useState({
    currentNode: null, // Tracks the current active node
    isComplete: false, // Workflow completion flag
    isDeployed: false, // Deployment status flag
  });

  const updateNode = useCallback((setState, instanceId, newData) => {
    if (!instanceId) return; // Ensure valid instanceId
  
    setState((prevData) => ({
      ...prevData,
      [instanceId]: {
        ...(prevData[instanceId] || {}), // Ensure existing instance data isn't lost
        ...newData,
      },
    }));
  }, []);

  // Utility function to update specific instance data
  const updateNodeData = useCallback((setState, instanceId, newData) => {
    if (!instanceId) return; // Ensure valid instanceId
  
    setState((prevData) => ({
      ...prevData,
      [instanceId]: Array.isArray(newData) ? newData : [newData], // Ensure it replaces, not appends
    }));
  }, []);

  return (
    <FormContext.Provider
      value={{
        startData,
        setStartData: (id, data) => updateNode(setStartData, id, data),
        enrichData,
        setEnrichData: (id, data) => updateNode(setEnrichData, id, data),
        leadScoreData,  
        setLeadScoreData: (id, data) => updateNode(setLeadScoreData, id, data),
        branchData,
        captureExposureData,
        setCaptureExposureData: (id, data) => updateNode(setCaptureExposureData, id, data),
        filterData,
        setFilterData: (id, data) => updateNode(setFilterData, id, data),
        setBranchData: (id, data) => updateNodeData(setBranchData, id, data),
        openAINodeData,
        setOpenAINodeData: (id, data) => updateNodeData(setOpenAINodeData, id, data),
        emailData,
        setEmailData: (id, data) => updateNode(setEmailData, id, data),
        slackData,
        setSlackData: (id, data) => updateNode(setSlackData, id, data),
        status,
        setStatus,
      }}
    >
      {children}
    </FormContext.Provider>
  );
};
