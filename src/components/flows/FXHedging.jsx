import { useState, useContext, useRef } from 'react';
import Button from '@/components/daisyui/Button/Button';
import Card from '@/components/daisyui/Card/Card';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import Aggregate from '../nodes/Aggregate';
import Start from '../nodes/Start';
import Extract from '../nodes/Extract';
import Filter from '../nodes/SQLFilter';
import Formula from '../nodes/Formula';
import SalesForce from '../nodes/SalesForce';
import { nanoid } from 'nanoid';
import FinancialStatement from '../nodes/FinancialStatement';
import { FXHedgingContext } from '../../contexts/forms/FXHedgingContext';

const generateInstanceId = (label) => {
  const sanitizedLabel = label.toLowerCase().replace(/\s+/g, '-');
  return `${sanitizedLabel}-${nanoid(6)}`;
};

const startId = generateInstanceId('Start');
const aggregateTopId = generateInstanceId('Aggregate Transactions');
const aggregateBottomId = generateInstanceId('Aggregate Transactions');
const financialStatementsId = generateInstanceId('Financial Statements');
const extractMetricsId = generateInstanceId('Extract');
const formulaId = generateInstanceId('Formula');
const filterOppsId = generateInstanceId('Filter');
const salesForceId = generateInstanceId('Push to Salesforce');

const nodeStyle = {
  padding: '10px',
  borderRadius: '8px',
  backgroundColor: '#ffffff',
  border: '1px solid #e5e7eb',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  fontSize: '14px',
  color: '#374151',
  width: '250px',
  textAlign: 'center',
};

const inputNodeStyle = {
  ...nodeStyle,
  backgroundColor: '#f3f4f6',
  borderColor: '#9ca3af',
};

const initialNodes = [
  {
    id: startId,
    type: 'input',
    data: { label: 'Start' },
    position: { x: 400, y: 5 },
    style: inputNodeStyle,
  },
  {
    id: aggregateTopId,
    type: 'aggregate',
    data: { label: 'Aggregate Transactions' },
    position: { x: 200, y: 100 },
    style: nodeStyle,
  },
  {
    id: aggregateBottomId,
    type: 'aggregate',
    data: { label: 'Aggregate Transactions' },
    position: { x: 600, y: 100 },
    style: nodeStyle,
  },
  {
    id: financialStatementsId,
    type: 'financialstatement',
    data: { label: 'Filter' },
    position: { x: 200, y: 200 },
    style: nodeStyle,
  },
  {
    id: extractMetricsId,
    type: 'extract',
    data: { label: 'Extract' },
    position: { x: 600, y: 200 },
    style: nodeStyle,
  },
  {
    id: formulaId,
    type: 'formula',
    data: { label: 'Formula' },
    position: { x: 400, y: 300 },
    style: nodeStyle,
  },
  {
    id: filterOppsId,
    type: 'filter',
    data: { label: 'Filter' },
    position: { x: 400, y: 400 },
    style: nodeStyle,
  },
  {
    id: salesForceId,
    type: 'salesforce',
    data: { label: 'Push to Salesforce' },
    position: { x: 400, y: 500 },
    style: nodeStyle,
  },
];

const edgeStyle = {
  stroke: '#9ca3af',
  strokeWidth: 2,
};

const initialEdges = [
  { id: `e-${startId}-${aggregateTopId}`, source: startId, target: aggregateTopId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${startId}-${aggregateBottomId}`, source: startId, target: aggregateBottomId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${aggregateTopId}-${financialStatementsId}`, source: aggregateTopId, target: financialStatementsId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${aggregateBottomId}-${extractMetricsId}`, source: aggregateBottomId, target: extractMetricsId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${financialStatementsId}-${formulaId}`, source: financialStatementsId, target: formulaId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${extractMetricsId}-${formulaId}`, source: extractMetricsId, target: formulaId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${formulaId}-${filterOppsId}`, source: formulaId, target: filterOppsId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${filterOppsId}-${salesForceId}`, source: filterOppsId, target: salesForceId, type: 'smoothstep', style: edgeStyle },
];

export default function FXHedging() {
  const [nodeDetails, setNodeDetails] = useState({});
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState(initialNodes);
  const reactFlowInstance = useRef(null);

  const handleNodeDataSave = (nodeId, data) => {
    setNodeDetails((prev) => ({ ...prev, [nodeId]: data }));
    
    // Update the node's data in the nodes state
    setNodes((nds) =>
      nds.map((n) =>
        n.id === nodeId
          ? { ...n, data: { ...n.data, ...data } }
          : n
      )
    );
  };

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  
    // Highlight the selected node
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { 
              ...n, 
              style: { 
                ...n.style, 
                border: '2px solid #3b82f6',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              } 
            }
          : { 
              ...n, 
              style: { 
                ...n.style, 
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
              } 
            }
      )
    );
  };

  const renderNodeDetails = (node) => {
    if (!node) return null;
  
    switch (node.data.label) {
      case 'Start':
        return <Start instanceId={node.id} onSave={handleNodeDataSave} contextType={FXHedgingContext} />;
      case 'Aggregate Transactions':
        return <Aggregate instanceId={node.id} onSave={handleNodeDataSave} contextType={FXHedgingContext} />;
      case 'Extract':
        return <Extract instanceId={node.id} onSave={handleNodeDataSave} contextType={FXHedgingContext} />;
      case 'Financial Statements':
        return <FinancialStatement instanceId={node.id} onSave={handleNodeDataSave} contextType={FXHedgingContext} />;
      case 'Formula':
        return <Formula instanceId={node.id} onSave={handleNodeDataSave} contextType={FXHedgingContext} />;
      case 'Filter':
        return <Filter instanceId={node.id} onSave={handleNodeDataSave} contextType={FXHedgingContext} />; 
      case 'Push to Salesforce':
        return <SalesForce instanceId={node.id} onSave={handleNodeDataSave} contextType={FXHedgingContext} />;
      default:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Action details</h3>
            <p className="mb-4 text-sm text-gray-500">{node?.data?.label}</p>
          </div>
        );
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-y-hidden">
      {/* Top Section */}
      <div className="flex items-center justify-between bg-white px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            color="secondary"
            variant="outline"
            shape="circle"
            size="sm"
            onClick={() => navigate(-1)}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </Button>
          <div className="text-sm breadcrumbs">
            <ul className="text-gray-500">
              <li>Action Configuration</li>
              <li>Select action</li>
              <li>FX Hedging</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => {}}
            className="rounded-full text-sm"
          >
            Save & Close
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="sm"
            onClick={() => {}}
            className="rounded-full text-sm"
          >
            Deploy
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-y-auto gap-6 pt-4 bg-white">
        {/* Flow Panel */}
        <div className="flex-1 h-full flex justify-start items-start overflow-hidden bg-white relative">
          <div className="w-full h-full flex justify-start items-start overflow-hidden">
            <Card className="w-full h-full p-6 shadow-md flex justify-start items-start">
              <div className="relative w-full h-full max-h-full">
                <ReactFlow
                  ref={reactFlowInstance}
                  nodes={nodes}
                  edges={initialEdges}
                  onNodeClick={onNodeClick}
                  style={{ width: '100%', height: '100%' }}
                  fitView
                >
                  <Controls />
                  <Background color="#aaa" gap={16} />
                </ReactFlow>
              </div>
            </Card>
          </div>
        </div>

        {/* Configuration Panel */}
        {selectedNode && (
          <Card className="flex-1 h-full max-w-lg overflow-y-auto bg-white">
            {renderNodeDetails(selectedNode)}
          </Card>
        )}
      </div>
    </div>
  );
}
