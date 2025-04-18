import { useState, useMemo,useContext,useEffect } from 'react';
import ReactFlow, { Controls, Background, useNodesState, useEdgesState, ReactFlowProvider, useUpdateNodeInternals } from 'reactflow';
import 'reactflow/dist/style.css';
import _ from 'lodash';
import { BaseNode } from '../templates/Nodes/BaseNode';
import Start from '../nodes/Start';
import toast from 'react-hot-toast';
import Enrich from '../nodes/Enrich';
import LeadScore from '../nodes/LeadScore';
import Branch from '../nodes/Branch';
import OpenAI from '../nodes/OpenAI';
import Email from '../nodes/Email';
import Slack from '../nodes/Slack';
import CaptureExposure from '../nodes/CaptureExposure';
import SQLFilter from '../nodes/SQLFilter';
import Button from '@/components/daisyui/Button/Button';
import { FaProjectDiagram, FaChartLine, FaEnvelope, FaSlack, FaTable } from 'react-icons/fa';
import { AiOutlineRobot } from 'react-icons/ai';
import { FaRegLightbulb } from 'react-icons/fa'
import { FaCalculator } from "react-icons/fa"
import { BiFilterAlt } from "react-icons/bi";
import { supabaseSegments, supabaseCompanies } from '../../helpers/supabaseClient';
import { useLocation } from "react-router-dom";
import { FormContext, WorkflowFormProvider } from '../../contexts/forms/WorkflowTemplateContext';
import processNodesSequentially, { 
  processNodesRealTime, 
  sendConfigurationToBackend, 
  deleteWorkflowTableIfExists 
} from '../../utils/deployFlow';
import { useNavigate } from 'react-router-dom';
import Card from "@/components/daisyui/Card/CardBody";
import { FaMapMarkerAlt, FaIndustry, FaExclamationCircle, FaUser, FaTag, FaBuilding, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CardBody from '../daisyui/Card/CardBody';
import Badge from "@/components/daisyui/Badge/Badge";

const availableNodes = [
  { id: 'enrich', label: 'Enrich', description:"Enriches the lead data by appending additional information."},
  { id: 'leadScore', label: 'Lead Score',description:"Calculates the lead score based on multiple attributes." },
  { id: 'branch', label: 'Branch',description:"Evaluates the lead score and directs leads to different paths based on predefined conditions." },
  { id: 'openAI', label: 'OpenAI', description:"Generates an AI-composed personalized message for high-priority leads and prepares it for sending." },
  { id: 'email', label: 'Email', description:"Sends an alert to the Account Executive's Slack channel for immediate follow-up on high-priority leads."},
  { id: 'slack', label: 'Slack', description:"Sends an AI-generated message via email, offering an incentive"},
  { id: 'calculate-fx-exposure', label: 'Calculate FX Exposure', description:"Sends an AI-generated message via email, offering an incentive"},
  { id: 'filter', label: 'Filter', description:"Sends an AI-generated message via email, offering an incentive"},
  
];

const WorkflowCanvas = () => {

  const [nodeDetails, setNodeDetails] = useState({});
  const [savedNodes, setSavedNodes] = useState([]);
  const navigate=useNavigate();
  const [activeTab, setActiveTab] = useState('editor');
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [backendResults, setBackendResults] = useState(null);
  const [tableData, setTableData] = useState(null);
const [cachedResults, setCachedResults] = useState(null);

  const fetchTableData = async (tableName) => {
    try {
      const { data, error } = await supabaseCompanies
        .from(tableName)
        .select('*')
        .limit(5); // Limit to 5 rows for display

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching table data:', error);
      return null;
    }
  };

  const handleTabChange = async (tab) => {
    setActiveTab(tab);
    if (tab === 'results') {
      // Check if any nodes have saved data
      // if (savedNodes.length === 0) {
      //   toast.error('No nodes have saved data yet. Please configure and save some nodes first.');
      //   setActiveTab('editor');
      //   return;
      // }
      if (!allNodesSaved){
      toast.error('Please configure and save all nodes first');
      setActiveTab('editor');
      return;
      }
      // Log current and previous form data for debugging
      console.log("Checking for changes...");
      console.log("Previous FormData:", JSON.stringify(previousFormData, null, 2));
      console.log("Current FormData:", JSON.stringify(formData, null, 2));
      
      // Compare current formData with previous FormData
      if (previousFormData && !hasFormDataChanged(previousFormData, formData)) {
        console.log("No changes detected in form data. Using cached results.");
        setActiveTab(tab);
        return;
      }
      
      setIsLoadingResults(true);
      try{
        const templateConfig = {
          template_id: flowData?.template_id,
          template_name: flowData?.template_name,
          description: flowData?.description,
        };

        // Create a mapping of node IDs to their unique names using the stored nodeNameCounts
        const nodeUniqueNames = {};
        const tempNodeNameCounts = {}; // Temporary counter for this session

        // First pass: Count occurrences of each node type
        nodes.forEach(node => {
          if (node.data.type !== 'floating') {
            const baseName = node.data.label;
            tempNodeNameCounts[baseName] = (tempNodeNameCounts[baseName] || 0) + 1;
          }
        });

        // Second pass: Assign unique names based on order of appearance
        const nodeTypeCounts = {}; // Track how many of each type we've seen
        nodes.forEach(node => {
          if (node.data.type !== 'floating') {
            const baseName = node.data.label;
            nodeTypeCounts[baseName] = (nodeTypeCounts[baseName] || 0) + 1;
            const count = nodeTypeCounts[baseName];
            
            // First occurrence gets base name, subsequent ones get numbered suffix
            if (count === 1) {
              nodeUniqueNames[node.id] = baseName;
            } else {
              nodeUniqueNames[node.id] = `${baseName}_${count - 1}`; // Subtract 1 to start numbering from 1
            }
          }
        });

        console.log('Generated unique names:', nodeUniqueNames);

        // Send configuration to backend with unique names
        const results = await sendConfigurationToBackend(
          nodes,
          edges,
          nodeDetails,
          templateConfig,
          nodeUniqueNames
        );
        setBackendResults(results);
    
        setCachedResults(results);
       setPreviousFormData({ ...formData });

        // Fetch table data if workflow_table is available
        if (results?.workflow_table) {
          const data = await fetchTableData(results.workflow_table);
          setTableData(data);
        }

        setActiveTab(tab);
      } catch (error) {
        console.error('Error processing results:', error);
        alert('Error processing results. Please try again.');
      } finally {
        setIsLoadingResults(false);
      }
    } else {
      setActiveTab(tab);
    }
  };

  const [currentRecordIndex, setCurrentRecordIndex] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);

  // Function to get company data from tableData
  const getCompanyData = (index) => {
    if (!tableData || index < 0 || index >= tableData.length) return null;
    return tableData[index];
  };

  // Function to handle next record
  const handleNextRecord = () => {
    if (currentRecordIndex < totalRecords - 1) {
      setCurrentRecordIndex(prev => prev + 1);
    }
  };

  // Function to handle previous record
  const handlePreviousRecord = () => {
    if (currentRecordIndex > 0) {
      setCurrentRecordIndex(prev => prev - 1);
    }
  };

  const renderResultsView = () => {
    const resultsToDisplay = backendResults || cachedResults;
    
    if (isLoadingResults) {
      return (
        <div className="flex justify-center items-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-current"></div>
        </div>
      );
    }

    if (!resultsToDisplay) {
      return (
        <div className="text-center p-4">
          <p>No results available yet. Please configure and save the workflow first.</p>
        </div>
      );
    }

    const company = getCompanyData(currentRecordIndex);
    const workflow_table = resultsToDisplay?.workflow_table;

    return (
      <div className="h-full bg-white p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-sm text-gray-500 shadow-md rounded-lg p-2">
            <FaTable className="text-gray-400" />
            <div>Table: {workflow_table}</div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 ${currentRecordIndex === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handlePreviousRecord}
              disabled={currentRecordIndex === 0}
            >
              <FaChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm text-gray-500">Record {currentRecordIndex + 1} of {totalRecords}</span>
            <button
              className={`p-2 rounded-full text-gray-500 hover:bg-gray-100 ${currentRecordIndex === totalRecords - 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleNextRecord}
              disabled={currentRecordIndex === totalRecords - 1}
            >
              <FaChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-6 h-[calc(100vh-200px)]">
          {/* Left Column: Company Overview */}
          <Card className="h-full bg-white shadow-xl rounded-lg overflow-hidden">
            <div className="p-5 bg-white text-gray-900 flex items-start justify-between">
              <h1 className="text-xl font-bold">{company?.name || 'Loading...'}</h1>
              <FaBuilding className="text-4xl text-gray-600" />
            </div>
            <CardBody className="space-y-3">
              <div className="space-y-3 text-md">
                {/* Location */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaMapMarkerAlt />
                    </span>
                    <h3 className="text-gray-700 text-sm">Location</h3>
                    <Badge className="ml-2 font-semibold text-sm">{company?.location || "N/A"}</Badge>
                  </p>
                </div>

                {/* Industry */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaIndustry />
                    </span>
                    <h3 className="text-gray-700 text-sm">Industry</h3>
                    <Badge size="md" className="ml-2 font-semibold text-sm">{company?.industry}</Badge>
                  </p>
                </div>

                {/* Risk Rating */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaExclamationCircle />
                    </span>
                    <h3 className="text-gray-700 text-sm">Risk Rating</h3>
                    <Badge size="md" className="ml-2 font-semibold text-sm">{company?.risk_rating || "N/A"}</Badge>
                  </p>
                </div>

                {/* Account Executive */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaUser />
                    </span>
                    <h3 className="text-gray-700 text-sm">Account Executive</h3>
                    <Badge size="md" className="ml-2 font-semibold text-sm">{company?.ae_name}</Badge>
                  </p>
                </div>

                {/* Segment */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaTag />
                    </span>
                    <h3 className="text-gray-700 text-sm">Segment</h3>
                    <Badge color="secondary" className="text-sm">{company?.segment}</Badge>
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Right Column: Execution Nodes */}
          <Card className="h-full bg-white shadow-xl rounded-lg overflow-y-auto">
            <CardBody>
              <h2 className="text-xl font-semibold mb-4">Executed Nodes</h2>
              <div className="space-y-4">
                {resultsToDisplay?.executed_nodes?.map((nodeResult, index) => {
                  const [nodeType, columns] = Object.entries(nodeResult)[0];
                  const currentNodeData = getCompanyData(currentRecordIndex);
                  
                  return (
                    <div key={index} className="bg-white rounded-lg shadow-sm">
                      <div className="p-4 border-b">
                        <h3 className="text-lg font-medium">{nodeType}</h3>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              {columns.map((column, colIndex) => (
                                <th key={colIndex} className="px-4 py-2 text-left text-xs font-medium text-gray-500 tracking-wider">
                                  {column.toLowerCase()}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            <tr className="hover:bg-gray-50">
                              {columns.map((column, colIndex) => (
                                <td key={colIndex} className="px-4 py-2 text-sm text-gray-900 whitespace-pre-wrap">
                                  {currentNodeData?.[column] || 'N/A'}
                                </td>
                              ))}
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </div>
      </div>
    );
  };

  // Update total records when tableData changes
  useEffect(() => {
    if (tableData) {
      setTotalRecords(tableData.length);
    }
  }, [tableData]);

  const [nodeResults, setNodeResults] = useState(null);

  
const renderNodeDetails = (node) => {
  if (!node) return null;

  const nodeData = nodeDetails[node.id] || {}; // Retrieve stored data if available

  switch (node.data.type) {
    case 'start':
      return <Start instanceId={node.id} onSave={handleNodeDataSave} flowType="workflow" />;
    case 'enrich':
      return <Enrich instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    case 'leadScore':
      return <LeadScore instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    case 'branch':
      return <Branch instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    case 'openAI':
      return <OpenAI instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    case 'email':
      return <Email instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    case 'slack':
      return <Slack instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    case 'calculate-fx-exposure':
      return <CaptureExposure instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    case 'filter':
      return <SQLFilter instanceId={node.id} onSave={handleNodeDataSave} data={nodeData} flowType="workflow" />;
    default:
      return <div>No data</div>;
  }
};



const handleNodeDataSave = (nodeId, data) => {
  setNodeDetails(prev => {
    const newDetails = { ...prev, [nodeId]: { ...data} };
    
    // Update formData reference immediately after state update
    const newFormData = {
      ...formData,
      [nodeId]: { ...data}
    };
    
    // Force a re-render with the new data
    setTimeout(() => {
      setPreviousFormData(prevFormData => {
        if (!prevFormData || !_.isEqual(prevFormData[nodeId], newFormData[nodeId])) {
          console.log(`Node data changed for ${nodeId}`);
          return newFormData;
        }
        return prevFormData;
      });
    }, 0);
    
    return newDetails;
  });
  
  setSavedNodes(prev => prev.includes(nodeId) ? prev : [...prev, nodeId]);
};

  const location = useLocation();
  const flowData = location.state?.flowData; // Check if state exists

  console.log("Received flowData:", flowData);
  console.log("Received flow data:", flowData);
  const updateNodeInternals = useUpdateNodeInternals();
  const [nodes, setNodesState] = useNodesState([
    { id: 'start', type: 'base', data: { label: 'Start', type: 'start' }, position: { x: 100, y: 100 } },
    { id: 'floating', type: 'base', data: { label: '+', type: 'floating' }, position: { x: 100, y: 200 } },
  ]);

  const [edges, setEdgesState] = useEdgesState([
    { id: 'e-start-floating', source: 'start', target: 'floating', type: 'smoothstep' },
  ]);

  useEffect(() => {
    nodes.forEach(node => updateNodeInternals(node.id));
  }, [nodes]);
  
  const [selectedFloatingNode, setSelectedFloatingNode] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);

  const handleNodeClick = (nodeId, nodeData) => {
    if (!nodeData || !nodeData.type) return; // Prevent undefined errors
  
    if (nodeData.type === 'floating') {
      setSelectedFloatingNode(nodeId);
      setSelectedNode(null);
    } else {
      setSelectedFloatingNode(null);
      setSelectedNode({ id: nodeId, data: nodeData });
    }
  };
  
  const handleNodeSelection = (nodeType) => {
    if (!selectedFloatingNode) return;

    const floatingNode = nodes.find((n) => n.id === selectedFloatingNode);
    if (!floatingNode) return;

    const prevNode = edges.find((e) => e.target === selectedFloatingNode)?.source;
    if (!prevNode) return;

    const newNodeId = `${nodeType.id}-${Math.random().toString(36).substr(2, 6)}`;
    const newNode = {
      id: newNodeId,
      type: 'base',
      data: { label: nodeType.label, type: nodeType.id },
      position: { x: floatingNode.position.x, y: floatingNode.position.y + 100 },
    };

    let newFloatingNodes = [];
    let newEdges = [];

    if (nodeType.id === 'branch') {
      const leftFloatingId = `floating-${Math.random().toString(36).substr(2, 6)}`;
      const rightFloatingId = `floating-${Math.random().toString(36).substr(2, 6)}`;

      newFloatingNodes = [
        {
          id: leftFloatingId,
          type: 'base',
          data: { label: '+', type: 'floating' },
          position: { x: floatingNode.position.x - 150, y: floatingNode.position.y + 200 },
        },
        {
          id: rightFloatingId,
          type: 'base',
          data: { label: '+', type: 'floating' },
          position: { x: floatingNode.position.x + 150, y: floatingNode.position.y + 200 },
        },
      ];

      newEdges = [
        { id: `e-${newNodeId}-${leftFloatingId}`, source: newNodeId, target: leftFloatingId, type: 'smoothstep' },
        { id: `e-${newNodeId}-${rightFloatingId}`, source: newNodeId, target: rightFloatingId, type: 'smoothstep' },
      ];
    } else {
      const singleFloatingId = `floating-${Math.random().toString(36).substr(2, 6)}`;
      newFloatingNodes.push({
        id: singleFloatingId,
        type: 'base',
        data: { label: '+', type: 'floating' },
        position: { x: floatingNode.position.x, y: floatingNode.position.y + 200 },
      });

      newEdges.push({
        id: `e-${newNodeId}-${singleFloatingId}`,
        source: newNodeId,
        target: singleFloatingId,
        type: 'smoothstep',
      });
    }

    setNodesState((nds) => [...nds.filter((n) => n.id !== selectedFloatingNode), newNode, ...newFloatingNodes]);
    setEdgesState((eds) => [
      ...eds.filter((e) => e.target !== selectedFloatingNode),
      { id: `e-${prevNode}-${newNodeId}`, source: prevNode, target: newNodeId, type: 'smoothstep' },
      ...newEdges,
    ]);

    updateNodeInternals(newNodeId);
    setSelectedFloatingNode(null);
    console.log("New edges:", newEdges);
    console.log("Mapped node IDs:", nodeIdMap);

  };
  
  const deleteNodeAndEdges = (targetNodeId, sourceNodeId) => {
    // Find all nodes that need to be deleted
    const nodesToDelete = new Set();
    const edgesToDelete = new Set();

    // Add the target node to be deleted
    nodesToDelete.add(targetNodeId);

    // Find all descendant nodes and their edges
    const findDescendants = (nodeId) => {
      edges.forEach((edge) => {
        if (edge.source === nodeId) {
          edgesToDelete.add(edge.id);
          if (!nodesToDelete.has(edge.target)) {
            nodesToDelete.add(edge.target);
            findDescendants(edge.target);
          }
        }
      });
    };

    // Start finding descendants from the target node
    findDescendants(targetNodeId);

    // Get the source node's position for the new floating node
    const sourceNode = nodes.find(n => n.id === sourceNodeId);
    if (!sourceNode) return;

    // Check if this is a branch node
    const isBranchNode = sourceNode.data.type === 'branch';
    
    // If it's a branch node, find the other path's position
    let newFloatingPosition;
    if (isBranchNode) {
      // Find the other edge from the branch node
      const otherEdge = edges.find(e => 
        e.source === sourceNodeId && 
        e.target !== targetNodeId && 
        !edgesToDelete.has(e.id)
      );

      if (otherEdge) {
        // Find the first node in the other path
        const otherPathNode = nodes.find(n => n.id === otherEdge.target);
        if (otherPathNode) {
          // Calculate the opposite position based on the other path
          const xOffset = otherPathNode.position.x - sourceNode.position.x;
          newFloatingPosition = {
            x: sourceNode.position.x - xOffset, // Opposite side of the other path
            y: sourceNode.position.y + 100
          };
        }
      }
    }

    // If not a branch node or couldn't find other path, use default position
    if (!newFloatingPosition) {
      newFloatingPosition = {
        x: sourceNode.position.x,
        y: sourceNode.position.y + 100
      };
    }

    // Create a new floating node at the calculated position
    const newFloatingId = `floating-${Math.random().toString(36).substr(2, 6)}`;
    const newFloatingNode = {
      id: newFloatingId,
      type: 'base',
      data: { label: '+', type: 'floating' },
      position: newFloatingPosition,
    };

    // Update nodes state
    setNodesState((nds) => {
      // Filter out nodes to be deleted
      const remainingNodes = nds.filter((node) => !nodesToDelete.has(node.id));
      
      // Add the new floating node
      remainingNodes.push(newFloatingNode);

      return remainingNodes;
    });

    // Update edges state
    setEdgesState((eds) => {
      // Filter out edges to be deleted
      const remainingEdges = eds.filter((edge) => !edgesToDelete.has(edge.id));
      
      // Add new edge from source to floating node
      remainingEdges.push({
        id: `e-${sourceNodeId}-${newFloatingId}`,
        source: sourceNodeId,
        target: newFloatingId,
        type: 'smoothstep'
      });

      return remainingEdges;
    });

    // Remove the node from saved nodes
    setSavedNodes(prev => prev.filter(id => !nodesToDelete.has(id)));
  
    // Remove node data from nodeDetails
    setNodeDetails(prev => {
      const updatedDetails = { ...prev };
      nodesToDelete.forEach(nodeId => {
        delete updatedDetails[nodeId];
      });
      return updatedDetails;
    });

    // Update currentFormData
    const currentFormData = {
      start: startData?.start || {},
      ...nodeDetails
    };
    setPreviousFormData(_.cloneDeep(currentFormData));

    // Update cached results to remove only the deleted node's results
    setCachedResults(prev => {
      if (!prev) return null;
      return {
        ...prev,
        results: prev.results?.filter(result => !nodesToDelete.has(result.nodeId))
      };
    });

    // Update backend results to remove only the deleted node's results
    setBackendResults(prev => {
      if (!prev) return null;
      return {
        ...prev,
        results: prev.results?.filter(result => !nodesToDelete.has(result.nodeId))
      };
    });
  };    
  
  const handleEdgeClick = (event, edge) => {
    deleteNodeAndEdges(edge.target, edge.source);
  };
  

  const nodeTypes = useMemo(
    () => ({
      base: (props) => <BaseNode {...props} onNodeClick={handleNodeClick} />,
    }),
    []
  );

  const { startData, setStartData,enrichData, leadScoreData, branchData, openAINodeData, emailData, slackData ,filterData,captureExposureData } = useContext(FormContext);
  const formData = {
    start: startData?.start || startData['start'] || {}, // Get start data from the correct path
    ...enrichData,
    ...leadScoreData,
    ...branchData,
    ...openAINodeData,
    ...emailData,
    ...slackData,
    ...filterData,
    ...captureExposureData,
  };
  const [previousFormData, setPreviousFormData] = useState(null);

  // Add change detection function
  const hasFormDataChanged = (prevData, currentData) => {
    if (!prevData) return true;
    
    const prevKeys = Object.keys(prevData);
    const currentKeys = Object.keys(currentData);
    
    if (prevKeys.length !== currentKeys.length) return true;
    
    for (const key of prevKeys) {
      if (!_.isEqual(prevData[key], currentData[key])) {
        console.log(`Change detected in node: ${key}`);
        return true;
      }
    }
    
    return false;
  };

  // Add debugging helpers
  useEffect(() => {
    console.log("FormData updated:", formData);
  }, [formData]);

  useEffect(() => {
    console.log("NodeDetails updated:", nodeDetails);
  }, [nodeDetails]);

  useEffect(() => {
    console.log("PreviousFormData updated:", previousFormData);
  }, [previousFormData]);

  const handleSave = async (flowData,status,formData) => {
    try {
      await deleteWorkflowTableIfExists();
      
      console.log("Form Data being saved:", formData);
      console.log("Start Data:", formData.start);
      const currentFormData = {
        start: startData?.start || {},
        ...nodeDetails
      };
      setPreviousFormData(_.cloneDeep(currentFormData));
      setCachedResults(null);
         // Validate start node data first
         if (!formData.start || !formData.start.actionName) {
           alert("Please fill in all required fields in the Start node.");
           return;
         }
   
         // Step 1: Get user session
         const { data: sessionData, error: sessionError } = await supabaseSegments.auth.getSession();
         if (sessionError || !sessionData.session) throw new Error("User not logged in or session invalid");
     
         const userId = sessionData.session.user.id;
         const username = sessionData.session.user.user_metadata?.full_name || sessionData.session.user.email;
     
         console.log("User session retrieved:", { userId, username });
     
         // Step 2: Insert or update user in "w_users" table
         const { error: userInsertError } = await supabaseSegments
           .from("w_users")
           .upsert({ id: userId, username: username }, { onConflict: "id" });
     
         if (userInsertError) throw userInsertError;
     
         // Step 3: Insert new workflow template
         if (!flowData) {
           console.error("flowData is undefined!");
           return;
         }
         
         const { data: workflow, error: workflowError } = await supabaseSegments
           .from("workflowtemplates")
           .select("template_id")
           .eq("template_name", flowData.template_name)
           .maybeSingle(); // ✅ Prevents crashing if no row found
         
         if (workflowError) throw workflowError;
         if (!workflow) {
           console.error("No workflow found with the given template name.");
           return;
         }
         
         const templateId = workflow.template_id;
         
         console.log("Workflow template created:", workflow);
     
         // Step 4: Fetch node_type_id for each node dynamically
         const nodeTypeIds = {};
         const nodeNames = {};
         for (const node of nodes) {
           if (node.data.type !== "floating") {
             const { data: nodeType, error: nodeTypeError } = await supabaseSegments
               .from("nodetypes")
               .select("node_type_id")
               .eq("node_type_name", node.data.label)
               .single();
     
             if (nodeTypeError || !nodeType) {
               console.warn(`Node type not found for: ${node.data.label}`);
               continue;
             }
     
             nodeTypeIds[node.id] = nodeType.node_type_id;
             nodeNames[node.id] = node.data.label
           }
         }
     
         console.log("Fetched node types:", nodeTypeIds);
     
         // Step 5: Track unique node names and create node mapping
         const nodeNameCounts = {}; // Helps generate unique names
         const nodeTypeToDbNodes = {}; // Maps node types to their DB nodes
   
         const templateNodes = nodes
           .filter(node => node.data.type !== "floating") // Exclude floating nodes
           .map(node => {
             let baseName = node.data.label;
             let uniqueName = baseName;
   
             // Ensure unique node_name per template
             if (nodeNameCounts[baseName] !== undefined) {
               nodeNameCounts[baseName] += 1;
               uniqueName = `${baseName}_${nodeNameCounts[baseName]}`;
             } else {
               nodeNameCounts[baseName] = 0;
             }
   
             return {
               template_id: templateId,
               node_type_id: nodeTypeIds[node.id] || null,
               node_name: uniqueName,
               node_type_name: nodeNames[node.id]
             };
           });
   
         // Insert nodes
         let insertedNodes = [];
         if (templateNodes.length > 0) {
           const { data: nodesData, error: nodesError } = await supabaseSegments
             .from("templatenodes")
             .insert(templateNodes)
             .select();
   
           if (nodesError) throw nodesError;
           insertedNodes = nodesData;
   
           // Group inserted nodes by type
           insertedNodes.forEach(dbNode => {
             if (!nodeTypeToDbNodes[dbNode.node_type_name]) {
               nodeTypeToDbNodes[dbNode.node_type_name] = [];
             }
             nodeTypeToDbNodes[dbNode.node_type_name].push(dbNode);
           });
         }
   
         console.log("Inserted nodes:", insertedNodes);
   
         // Create node ID mapping based on node type and order
         const nodeIdMap = {};
         const processedCounts = {};
   
         nodes
           .filter(n => n.data.type !== "floating")
           .forEach(node => {
             const nodeType = node.data.label;
             
             if (!processedCounts[nodeType]) {
               processedCounts[nodeType] = 0;
             }
   
             const dbNodes = nodeTypeToDbNodes[nodeType] || [];
             const dbNode = dbNodes[processedCounts[nodeType]];
   
             if (dbNode) {
               nodeIdMap[node.id] = dbNode.template_node_id;
               processedCounts[nodeType]++;
             } else {
               console.warn(`No DB node found for ${nodeType} at index ${processedCounts[nodeType]}`);
             }
           });
   
         console.log("Node ID mapping:", nodeIdMap);
     
         // Debugging: Ensure edges reference valid nodes
         edges.forEach(edge => {
           console.log(
             `Edge Source: ${edge.source} (DB ID: ${nodeIdMap[edge.source]}) → ` +
             `Target: ${edge.target} (DB ID: ${nodeIdMap[edge.target]})`
           );
     
           if (!nodeIdMap[edge.source] || !nodeIdMap[edge.target]) {
             console.warn(`Missing source/target node in nodeIdMap for edge:`, edge);
           }
         });
     
         // Step 7: Insert edges with correct node IDs
         const templateEdges = edges
           .filter(edge => nodeIdMap[edge.source] && nodeIdMap[edge.target]) // Ensure both nodes exist in DB
           .map(edge => ({
             template_id: templateId,
             source_node_id: nodeIdMap[edge.source], 
             target_node_id: nodeIdMap[edge.target], 
             
           }));
     
         let insertedEdges = [];
         if (templateEdges.length > 0) {
           const { data: edgesData, error: edgesError } = await supabaseSegments
             .from("templateedges")
             .insert(templateEdges)
             .select();
     
           if (edgesError) throw edgesError;
           insertedEdges = edgesData;
         }
     
         console.log("Inserted edges:", insertedEdges);
         
           // Step 4: Create a Workflow
           const { data: workflowData, error: workflowInsertError } = await supabaseSegments
               .from("workflows")
               .insert([{ 
                 workflow_name: formData.start.actionName || startData.actionName, // Handle both data structures
                 template_id: templateId,
                 user_id: userId, 
                 status: status 
               }])
               .select()
               .single();
   
           if (workflowInsertError) throw workflowInsertError;
           const workflowId = workflowData.workflow_id;
              console.log(formData)
     
      await processNodesSequentially(templateId, workflowId,formData,nodeIdMap);
      alert(`Workflow ${status === 'active' ? 'deployed' : 'saved as draft'} successfully!`);
      navigate('/actions');
      setStartData({});
    return {
      workflow,
      nodes: insertedNodes,
      edges: insertedEdges,
    };
    } catch (error) {
      console.error("Save error:", error);
      throw error;
    }
    }
  
  const allNodesSaved = useMemo(() => {
    // Get all non-floating node IDs
    const nonFloatingNodeIds = nodes
      .filter(node => node.data.type !== 'floating')
      .map(node => node.id);
    
    // Check if all non-floating nodes are in savedNodes
    return nonFloatingNodeIds.every(id => savedNodes.includes(id));
  }, [nodes, savedNodes]);

  return (
    <section className='h-screen flex flex-col'>
      {/* Top Section with Navigation and Buttons */}
      <div className="bg-white px-6 py-4 border-b">
        <div className="flex items-center justify-between mb-4">
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
                <li>New Action</li>
              </ul>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button
              color="secondary"
              variant="outline"
              size="sm"
              onClick={() => handleSave(flowData,"draft",formData)}
              className="rounded-full text-sm"
              disabled={!allNodesSaved}
            >
              Save & Close
            </Button>
            <Button
              color="primary"
              variant="solid"
              size="sm"
              onClick={() => handleSave(flowData,"active",formData)}
              className="rounded-full text-sm"
              disabled={!allNodesSaved}
            >
              Deploy
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mt-6">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 shadow-sm">
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                activeTab === 'editor'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('editor')}
            >
              <FaProjectDiagram className="text-lg" />
              <span>Editor</span>
            </button>
            <button
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ease-in-out ${
                activeTab === 'results'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => handleTabChange('results')}
              // disabled={!allNodesSaved}
              title={!allNodesSaved ? 'Please configure and save all nodes first' : ''}
            >
              {isLoadingResults ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FaChartLine className="text-lg" />
                  <span>Results</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 h-full relative bg-gray-50">
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              fitView
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ type: 'smoothstep' }}
              onNodeClick={(_, node) => handleNodeClick(node.id, node.data)}
              onEdgeClick={handleEdgeClick}
            >
              <Controls />
              <Background color="#aaa" gap={16} />

              {/* Results View Overlay */}
              {activeTab === 'results' && (
                <div className="absolute inset-0 bg-white z-20 overflow-y-auto">
                  {renderResultsView()}
                </div>
              )}
            </ReactFlow>
          </ReactFlowProvider>
        </div>

        {/* Side Panels - Only show when in editor mode */}
        {activeTab === 'editor' && (
          <>
            {selectedFloatingNode && (
              <div className="w-1/3 bg-white p-4 overflow-auto border-l">
                <h3 className="mb-4 text-lg font-semibold">Select a Node</h3>
                {availableNodes.map((node) => (
                  <div
                    key={node.id}
                    className="card bg-white shadow-md my-1 cursor-pointer w-full"
                    onClick={() => handleNodeSelection(node)}  
                  >
                    <div className="card-body flex items-start">
                      {/* Flex Row for Icon and Title */}
                      <div className="flex items-center justify-center space-x-4">
                        {/* Icon on the left */}
                        <div className="flex-shrink-0">
                          {node.id === 'enrich' && <FaRegLightbulb className="text-blue-500 text-2xl" />}
                          {node.id === 'leadScore' && <FaChartLine className="text-blue-500 text-2xl" />}
                          {node.id === 'branch' && <FaProjectDiagram className="text-blue-500 text-2xl" />}
                          {node.id === 'openAI' && <AiOutlineRobot className="text-blue-500 text-2xl" />}
                          {node.id === 'email' && <FaEnvelope className="text-blue-500 text-2xl" />}
                          {node.id === 'slack' && <FaSlack className="text-blue-500 text-2xl" />}
                          {node.id === 'filter' && <BiFilterAlt className="text-blue-500 text-2xl" />}
                          {node.id === 'calculate-fx-exposure' && <FaCalculator className="text-blue-500 text-2xl" />}
                          
                        </div>

                        {/* Flex Column for Title and Description */}
                        <div className="flex flex-col justify-center">
                          <h4 className="text-md font-semibold">{node.label}</h4>
                          <p className="text-sm text-gray-500">{node.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedNode && (
              <div className="w-1/3 bg-white overflow-y-auto border-l">
                {renderNodeDetails(selectedNode)}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export const WorkflowTemplate = () => (
  <WorkflowFormProvider>
  <ReactFlowProvider>
    <WorkflowCanvas />
  </ReactFlowProvider>
  </WorkflowFormProvider>
);
