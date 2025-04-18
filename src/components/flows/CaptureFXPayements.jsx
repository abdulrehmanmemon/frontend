import { useState, useContext, useRef} from 'react';
import Button from '@/components/daisyui/Button/Button';
import Card from '@/components/daisyui/Card/Card';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import Start from '../nodes/Start';
import Aggregate from '../nodes/Aggregate';
import Filter from '../nodes/SQLFilter';
import Formula from '../nodes/Formula';
import SalesforceEnrich from '../nodes/SalesForce';
import { supabaseSegments } from '../../helpers/supabaseClient';
import { CaptureFXPaymentsContext } from '../../contexts/forms/CaptureFXPaymentsContext';
import { nanoid } from 'nanoid';
import processNodesSequentially from '../../utils/deployFlow';

const generateInstanceId = (label) => {
  const sanitizedLabel = label.toLowerCase().replace(/\s+/g, '-');
  return `${sanitizedLabel}-${nanoid(6)}`;
};

const startId = generateInstanceId('Start');
const aggregateLeftId = generateInstanceId('Aggregate Transactions');
const aggregateRightId = generateInstanceId('Aggregate Transactions');
const formulaTopId = generateInstanceId('Formula');
const formulaBottomId = generateInstanceId('Formula');
const filterId = generateInstanceId('Filter');
const salesForceId = generateInstanceId('Push to SalesForce');

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
    position: { x: 250, y: 5 },
    style: inputNodeStyle,
  },
  { 
    id: aggregateLeftId, 
    data: { label: 'Aggregate Transactions\n(aggregate outflows to selected beneficiary)' }, 
    position: { x: 100, y: 100 },
    style: nodeStyle,
  },
  { 
    id: aggregateRightId, 
    data: { label: 'Aggregate Transactions\n(aggregate all FX outflows)' }, 
    position: { x: 400, y: 100 },
    style: nodeStyle,
  },
  { 
    id: formulaTopId, 
    data: { label: 'Formula' }, 
    position: { x: 250, y: 300 },
    style: nodeStyle,
  },
  { 
    id: formulaBottomId, 
    data: { label: 'Formula' }, 
    position: { x: 250, y: 400 },
    style: nodeStyle,
  },
  { 
    id: filterId, 
    data: { label: 'Filter' }, 
    position: { x: 250, y: 500 },
    style: nodeStyle,
  },
  { 
    id: salesForceId, 
    data: { label: 'Push to Salesforce' }, 
    position: { x: 250, y: 600 },
    style: nodeStyle,
  },
];

const edgeStyle = {
  stroke: '#9ca3af',
  strokeWidth: 2,
};

const initialEdges = [
  { id: `e-${startId}-${aggregateLeftId}`, source: startId, target: aggregateLeftId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${startId}-${aggregateRightId}`, source: startId, target: aggregateRightId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${aggregateLeftId}-${formulaTopId}`, source: aggregateLeftId, target: formulaTopId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${aggregateRightId}-${formulaTopId}`, source: aggregateRightId, target: formulaTopId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${formulaTopId}-${formulaBottomId}`, source: formulaTopId, target: formulaBottomId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${formulaBottomId}-${filterId}`, source: formulaBottomId, target: filterId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${filterId}-${salesForceId}`, source: filterId, target: salesForceId, type: 'smoothstep', style: edgeStyle },
];

const CaptureFXPayements = () => {
  const [nodeDetails, setNodeDetails] = useState({});
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState(initialNodes);
  const reactFlowInstance = useRef(null);

  // Accessing form data from context
  const { 
    startData, 
    aggregateLeftData, 
    aggregateRightData, 
    formulaTopData, 
    formulaBottomData, 
    filterData, 
    salesforceData 
  } = useContext(CaptureFXPaymentsContext);

  const formData = {
    ...startData,
    ...aggregateLeftData,
    ...aggregateRightData,
    ...formulaTopData,
    ...formulaBottomData,
    ...filterData,
    ...salesforceData,
  };

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
        return <Start instanceId={node.id} onSave={handleNodeDataSave} contextType={CaptureFXPaymentsContext} />;
      case 'Aggregate Transactions\n(aggregate outflows to selected beneficiary)':
        return <Aggregate instanceId={node.id} onSave={handleNodeDataSave} contextType={CaptureFXPaymentsContext} />;
      case 'Aggregate Transactions\n(aggregate all FX outflows)':
        return <Aggregate instanceId={node.id} onSave={handleNodeDataSave} contextType={CaptureFXPaymentsContext} />;
      case 'Filter':
        return <Filter instanceId={node.id} onSave={handleNodeDataSave} contextType={CaptureFXPaymentsContext} />;
      case 'Formula':
        return <Formula instanceId={node.id} onSave={handleNodeDataSave} contextType={CaptureFXPaymentsContext} />;
      case 'Push to Salesforce':
        return <SalesforceEnrich instanceId={node.id} onSave={handleNodeDataSave} contextType={CaptureFXPaymentsContext} />;
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
              <li>Capture FX Payments</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft', formData)}
            className="rounded-full text-sm"
          >
            Save & Close
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="sm"
            onClick={() => handleSave('active', formData)}
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
};

export default CaptureFXPayements;
