import React, { createContext, useState, useContext } from 'react';

export const BaseFlowContext = createContext();

export const BaseFlowProvider = ({ children }) => {
  // Shared node data across all flows - using empty object for dynamic IDs
  const [sharedNodeData, setSharedNodeData] = useState({});

  // Flow-specific data - using empty objects for dynamic IDs
  const [flowSpecificData, setFlowSpecificData] = useState({
    fxExposure: {},
    payments: {}
  });

  const getNodeType = (nodeId = '') => {
    // Extract the base type from nodeId (e.g., 'openai' from 'openai-y526Bp')
    return nodeId.split('-')[0];
  };

  const updateNodeData = (nodeId, data, flowType = null) => {
    const nodeType = getNodeType(nodeId);
    const sharedTypes = ['start', 'filter', 'openai', 'slack'];
    
    if (sharedTypes.includes(nodeType)) {
      setSharedNodeData(prev => ({
        ...prev,
        [nodeId]: {
          ...prev[nodeId],
          ...data
        }
      }));
    } else if (flowType && flowType in flowSpecificData) {
      setFlowSpecificData(prev => ({
        ...prev,
        [flowType]: {
          ...prev[flowType],
          [nodeId]: {
            ...prev[flowType]?.[nodeId],
            ...data
          }
        }
      }));
    }
  };

  const getNodeData = (nodeId, flowType = null) => {
    const nodeType = getNodeType(nodeId);
    const sharedTypes = ['start', 'filter', 'openai', 'slack'];
    
    if (sharedTypes.includes(nodeType)) {
      return sharedNodeData[nodeId] || {};
    } else if (flowType && flowType in flowSpecificData) {
      return flowSpecificData[flowType]?.[nodeId] || {};
    }
    return {};
  };

  return (
    <BaseFlowContext.Provider
      value={{
        sharedNodeData,
        flowSpecificData,
        updateNodeData,
        getNodeData
      }}
    >
      {children}
    </BaseFlowContext.Provider>
  );
};

// Custom hook for using the base flow context
export const useBaseFlow = () => {
  const context = useContext(BaseFlowContext);
  if (!context) {
    throw new Error('useBaseFlow must be used within a BaseFlowProvider');
  }
  return context;
}; 