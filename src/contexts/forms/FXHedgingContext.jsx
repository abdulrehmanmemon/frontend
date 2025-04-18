import React, { createContext, useState } from "react";

export const FXHedgingContext = createContext();

export const FXHedgingProvider = ({ children }) => {
  // Start Node Data
  const [startData, setStartData] = useState({});

  // Aggregate Nodes Data
  const [aggregateData, setAggregateData] = useState({});

  // Financial Statement Node Data
  const [financialData, setFinancialData] = useState({});

  // Extract Node Data
  const [extractData, setExtractData] = useState({});

  // Formula Node Data
  const [formulaData, setFormulaData] = useState({});

  // Filter Node Data
  const [filterData, setFilterData] = useState({});

  // Salesforce Node Data
  const [salesforceData, setSalesforceData] = useState({});

  // Workflow status tracking
  const [status, setStatus] = useState({
    currentNode: null,
    isComplete: false,
    isDeployed: false,
  });

  const updateNode = (setState, instanceId, newData) => {
    if (!instanceId) return;
    
    setState((prevData) => ({
      ...prevData,
      [instanceId]: {
        ...(prevData[instanceId] || {}),
        ...newData,
      },
    }));
  };

  return (
    <FXHedgingContext.Provider
      value={{
        // Start Node
        startData,
        setStartData: (id, data) => updateNode(setStartData, id, data),

        // Aggregate Nodes
        aggregateData,
        setAggregateData: (id, data) => updateNode(setAggregateData, id, data),

        // Financial Statement Node
        financialData,
        setFinancialData: (id, data) => updateNode(setFinancialData, id, data),

        // Extract Node
        extractData,
        setExtractData: (id, data) => updateNode(setExtractData, id, data),

        // Formula Node
        formulaData,
        setFormulaData: (id, data) => updateNode(setFormulaData, id, data),

        // Filter Node
        filterData,
        setFilterData: (id, data) => updateNode(setFilterData, id, data),

        // Salesforce Node
        salesforceData,
        setSalesforceData: (id, data) => updateNode(setSalesforceData, id, data),

        // Status
        status,
        setStatus,
      }}
    >
      {children}
    </FXHedgingContext.Provider>
  );
}; 