import { createContext, useState } from 'react';

export const CaptureFXPaymentsContext = createContext();

export const CaptureFXPaymentsProvider = ({ children }) => {
  // Start Node Data
  const [startData, setStartData] = useState({});

  // Aggregate Nodes Data
  const [aggregateLeftData, setAggregateLeftData] = useState({});
  const [aggregateRightData, setAggregateRightData] = useState({});

  // Formula Nodes Data
  const [formulaTopData, setFormulaTopData] = useState({});
  const [formulaBottomData, setFormulaBottomData] = useState({});

  // Filter Node Data
  const [filterData, setFilterData] = useState({});

  // Salesforce Node Data
  const [salesforceData, setSalesforceData] = useState({});

  return (
    <CaptureFXPaymentsContext.Provider
      value={{
        // Start Node
        startData,
        setStartData,

        // Aggregate Nodes
        aggregateLeftData,
        setAggregateLeftData,
        aggregateRightData,
        setAggregateRightData,

        // Formula Nodes
        formulaTopData,
        setFormulaTopData,
        formulaBottomData,
        setFormulaBottomData,

        // Filter Node
        filterData,
        setFilterData,

        // Salesforce Node
        salesforceData,
        setSalesforceData,
      }}
    >
      {children}
    </CaptureFXPaymentsContext.Provider>
  );
}; 