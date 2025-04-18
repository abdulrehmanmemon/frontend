import React, { createContext, useState, useContext, useCallback } from "react";

export const FXExposureContext = createContext();

export const useFXExposure = () => {
  const context = useContext(FXExposureContext);
  if (!context) {
    throw new Error('useFXExposure must be used within a FXExposureProvider');
  }
  return context;
};

export const FXExposureProvider = ({ children }) => {
  // State for each form section, keyed by instanceId
  const [startData, setStartData] = useState({});
  const [captureExposureData, setCaptureExposureData] = useState({});
  const [filterData, setFilterData] = useState({});
  const [openAINodeData, setOpenAINodeData] = useState({});
  const [slackData, setSlackData] = useState({});

  // Workflow status tracking
  const [status, setStatus] = useState({
    currentNode: null,
    isComplete: false,
    isDeployed: false,
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
    <FXExposureContext.Provider
      value={{
        startData,
        setStartData: (id, data) => updateNode(setStartData, id, data),
        captureExposureData,
        setCaptureExposureData: (id, data) => updateNode(setCaptureExposureData, id, data),
        filterData,
        setFilterData: (id, data) => updateNode(setFilterData, id, data),
        openAINodeData,
        setOpenAINodeData: (id, data) => updateNodeData(setOpenAINodeData, id, data),
        slackData,
        setSlackData: (id, data) => updateNode(setSlackData, id, data),
        status,
        setStatus,
      }}
    >
      {children}
    </FXExposureContext.Provider>
  );
}; 