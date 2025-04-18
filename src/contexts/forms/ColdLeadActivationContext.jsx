import React, { createContext, useState, useCallback } from "react";

export const FormContext = createContext();

export const FormProvider = ({ children }) => {
  // State for each form section, keyed by instanceId
  const [startData, setStartData] = useState({
    actionName: "",
    actionDescription: "",
    segmentId: "",
    segmentMembers: "All",
    executeEvery: "",
    startDate: "",
    endDate: "",
    
  });
  const [enrichData, setEnrichData] = useState({});
  const [leadScoreData, setLeadScoreData] = useState({});
  const [branchData, setBranchData] = useState({});
  const [openAINodeData, setOpenAINodeData] = useState({});
  const [emailData, setEmailData] = useState({});
  const [slackData, setSlackData] = useState({});

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
        setStartData,
        enrichData,
        setEnrichData: (id, data) => updateNode(setEnrichData, id, data),
        leadScoreData,  
        setLeadScoreData:(id, data) => updateNode(setLeadScoreData, id, data),
        branchData,
        setBranchData: (id, data) => updateNodeData(setBranchData, id, data),
        openAINodeData,
        setOpenAINodeData: (id, data) => updateNode(setOpenAINodeData, id, data),
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
