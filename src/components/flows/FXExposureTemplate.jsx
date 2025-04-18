import { useState, useContext, useRef,useEffect, useMemo} from 'react';
import Button from '@/components/daisyui/Button/Button';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import Start from '../nodes/Start';
import CaptureExposure from '../nodes/CaptureExposure';
import SQLFilter from '../nodes/SQLFilter';
import OpenAI from '../nodes/OpenAI';
import Slack from '../nodes/Slack';
import { supabaseSegments } from '../../helpers/supabaseClient';
import { FormContext, WorkflowFormProvider } from '../../contexts/forms/WorkflowTemplateContext';
import { nanoid } from 'nanoid';
import processNodesSequentially from '../../utils/deployFlow';
import { FaProjectDiagram , FaChartLine} from 'react-icons/fa';
import { sendConfigurationToBackend } from '../../utils/deployFlow';
import { deleteWorkflowTableIfExists } from '../../utils/deployFlow';
import { FaTable } from 'react-icons/fa';
import { supabaseCompanies } from '../../helpers/supabaseClient';
import Card from "@/components/daisyui/Card/CardBody";
import { FaMapMarkerAlt, FaIndustry, FaExclamationCircle, FaUser, FaTag, FaBuilding, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CardBody from '../daisyui/Card/CardBody';
import Badge from "@/components/daisyui/Badge/Badge";
import _ from 'lodash';
const generateInstanceId = (label) => {
  const sanitizedLabel = label.toLowerCase().replace(/\s+/g, '-');
  return `${sanitizedLabel}-${nanoid(6)}`;
};


const captureExposureId = generateInstanceId('Calculate FX Exposure');
const filterId = generateInstanceId('Filter');
const openaiId = generateInstanceId('OpenAI');
const slackId = generateInstanceId('Slack');

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
const startId="start"
const initialNodes = [
  { 
    id: startId,  
    data: { label: 'Start', type: 'base' }, 
    position: { x: 250, y: 5 },
    style: inputNodeStyle,
  },
  { 
    id: captureExposureId, 
    data: { label: 'Calculate FX Exposure', type: 'base' }, 
    position: { x: 250, y: 100 },
    style: nodeStyle,
  },
  { 
    id: filterId, 
    data: { label: 'Filter', type: 'base' }, 
    position: { x: 250, y: 200 },
    style: nodeStyle,
  },
  { 
    id: openaiId,
    data: { label: 'OpenAI', type: 'base' }, 
    position: { x: 250, y: 300 },
    style: nodeStyle,
  },
  { 
    id: slackId, 
    data: { label: 'Slack',type: 'base' }, 
    position: { x: 250, y: 400 },
    style: nodeStyle,
  },
];

const edgeStyle = {
  stroke: '#9ca3af',
  strokeWidth: 2,
};

const initialEdges = [
  { id: `e-${startId}-${captureExposureId}`, source: startId, target: captureExposureId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${captureExposureId}-${filterId}`, source: captureExposureId, target: filterId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${filterId}-${openaiId}`, source: filterId, target: openaiId, type: 'smoothstep', style: edgeStyle },
  { id: `e-${openaiId}-${slackId}`, source: openaiId, target: slackId, type: 'smoothstep', style: edgeStyle },
];

const FXExposureTemplate = () => {
  const [nodeDetails, setNodeDetails] = useState({});
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [savedNodes, setSavedNodes] = useState([]);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges,setEdges] =useState(initialEdges);
  const reactFlowInstance = useRef(null);
  const [activeTab, setActiveTab] = useState('editor');
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [backendResults, setBackendResults] = useState(null);
  const [tableData, setTableData] = useState(null);
  const [previousFormData, setPreviousFormData] = useState(null);
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
      if (savedNodes.length !== 5) {
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
          template_id: 209,
          template_name: 'FX Exposure from transactions',
          
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
       setPreviousFormData(_.cloneDeep(formData));

        // Fetch table data if workflow_table is available
        if (results?.workflow_table) {
          const data = await fetchTableData(results.workflow_table);
          setTableData(data);
        }

        setActiveTab(tab);
      } catch (error) {
        console.error('Error processing results:', error);
      
          console.error('Error processing results:', error);
          
          // Handle different types of errors
          if (error instanceof TypeError) {
            toast.error('Backend server is not running. Please start the backend server on port 8000.');
          } else if (error.message.includes('400')) {
            toast.error('Invalid workflow configuration. Please check your settings and try again.');
          } else if (error.message.includes('401')) {
            toast.error('Unauthorized. Please log in again.');
          } else if (error.message.includes('403')) {
            toast.error('You don\'t have permission to perform this action.');
          } else if (error.message.includes('404')) {
            toast.error('Resource not found. Please check your configuration.');
          } else {
            toast.error('Failed to connect to backend server. Please make sure both frontend and backend servers are running.');
          }
          
          setActiveTab('editor');
        }
      finally {
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
          <Card className="h-full bg-white shadow-xl rounded-lg">
            <div className="p-5 bg-white text-gray-900 flex items-start justify-between">
              <h1 className="text-xl font-bold">{getCompanyData(currentRecordIndex)?.name || 'Loading...'}</h1>
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
                    <Badge className="ml-2 font-semibold text-sm">{getCompanyData(currentRecordIndex)?.location || "N/A"}</Badge>
                  </p>
                </div>

                {/* Industry */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaIndustry />
                    </span>
                    <h3 className="text-gray-700 text-sm">Industry</h3>
                    <Badge size="md" className="ml-2 font-semibold text-sm">{getCompanyData(currentRecordIndex)?.industry}</Badge>
                  </p>
                </div>

                {/* Risk Rating */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaExclamationCircle />
                    </span>
                    <h3 className="text-gray-700 text-sm">Risk Rating</h3>
                    <Badge size="md" className="ml-2 font-semibold text-sm">{getCompanyData(currentRecordIndex)?.risk_rating || "N/A"}</Badge>
                  </p>
                </div>

                {/* Account Executive */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaUser />
                    </span>
                    <h3 className="text-gray-700 text-sm">Account Executive</h3>
                    <Badge size="md" className="ml-2 font-semibold text-sm">{getCompanyData(currentRecordIndex)?.ae_name}</Badge>
                  </p>
                </div>

                {/* Segment */}
                <div>
                  <p className="flex items-center space-x-3">
                    <span className="bg-white p-2 rounded-full text-gray-600 shadow-md text-xs">
                      <FaTag />
                    </span>
                    <h3 className="text-gray-700 text-sm">Segment</h3>
                    <Badge color="secondary" className="text-sm">{getCompanyData(currentRecordIndex)?.segment}</Badge>
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
  // Accessing form data from context
  const { startData,enrichData,leadScoreData, branchData, openAINodeData, emailData, slackData ,filterData,captureExposureData } = useContext(FormContext);
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
  
    const commonProps = {
      instanceId: node.id,
      onSave: handleNodeDataSave,
      flowType: 'fxExposure'
    };
  
    switch (node.data.label) {
      case 'Start':
        return <Start {...commonProps} />;
      case 'Calculate FX Exposure':
        return <CaptureExposure {...commonProps} />;
      case 'Filter':
        return <SQLFilter {...commonProps} />;
      case 'OpenAI':
        return <OpenAI {...commonProps} />;
      case 'Slack':
        return <Slack {...commonProps} />;
      default:
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Action details</h3>
            <p className="mb-4 text-sm text-gray-500">{node?.data?.label}</p>
          </div>
        );
    }
  };
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

  const handleSave = async (status,nodeDetails) => {
    try {
      await deleteWorkflowTableIfExists();
      
      // Get current form data
      const currentFormData = {
        start: startData?.start || {},
        ...nodeDetails
      };
      setPreviousFormData(_.cloneDeep(currentFormData));
      setCachedResults(null);
    // Get current form data
      // Ensure workflow name is not null
      const workflowName = nodeDetails.start?.actionName;
      if (!workflowName) {
        toast.error('Please provide a workflow name in the Start node');
        return;
      }


      const requiredNodes = ['start', 'calculateFxExposure', 'filter', 'openai', 'slack'];
      const missingNodes = requiredNodes.filter(node => !nodeDetails[node]);
      if (missingNodes.length > 0) {
        toast.error(`Please configure the following nodes: ${missingNodes.join(', ')}`);
        return;
      }
      
      if (previousFormData && !hasFormDataChanged(previousFormData, currentFormData)) {
        console.log("No changes detected - skipping save");
        return;
      }
      
      const { data: sessionData, error: sessionError } = await supabaseSegments.auth.getSession();
      if (sessionError || !sessionData.session) {
        toast.error("User not logged in or session invalid");
      }

      const userId = sessionData.session.user.id;
      const username = sessionData.session.user.user_metadata?.full_name || sessionData.session.user.email;
      console.log("User session retrieved:", { userId, username });

      // Step 2: Insert or update user in "w_users" table
      const { error: userInsertError } = await supabaseSegments
        .from("w_users")
        .upsert({ id: userId, username: username }, { onConflict: "id" });

      if (userInsertError) throw userInsertError;
      console.log("User inserted/updated in w_users");

      // Step 3: Fetch template nodes for the given template_id
      const { data: template, error: templateError } = await supabaseSegments
        .from("workflowtemplates")
        .select("template_id")
        .eq("template_name", "FX Exposure from transactions")
        .single();

      if (templateError) throw templateError;
      const templateId = template.template_id;

      const { data: templateNodes, error: templateNodesError } = await supabaseSegments
        .from("templatenodes")
        .select("template_node_id, node_name")
        .eq("template_id", templateId);

      if (templateNodesError) throw templateNodesError;
      console.log("Fetched template nodes:", templateNodes);

      const nodeIdMap = {};

      // Step 4: Group DB nodes by name (ignoring numbering)
      const dbNodeGroups = {};
      templateNodes.forEach(dbNode => {
        const baseName = dbNode.node_name.replace(/\s*\(\d+\)$/, '');
        if (!dbNodeGroups[baseName]) dbNodeGroups[baseName] = [];
        dbNodeGroups[baseName].push(dbNode);
      });

      // Step 5: Map ReactFlow nodes in order
      Object.keys(dbNodeGroups).forEach(baseName => {
        const dbNodes = dbNodeGroups[baseName];
        const matchingNodes = nodes
          .filter(n => n.data.label.replace(/\s*\(\d+\)$/, '') === baseName)
          .sort((a, b) => a.id.localeCompare(b.id)); // Sort by ID to maintain order

        console.log(`🔍 Matching DB Node Group: ${baseName}`, { dbNodes, matchingNodes });

        if (matchingNodes.length === dbNodes.length) {
          matchingNodes.forEach((node, index) => {
            nodeIdMap[node.id] = dbNodes[index].template_node_id;
          });
        } else {
          console.warn(`⚠️ Mismatch in counts for ${baseName}:`, { dbNodes, matchingNodes });
        }
      });

      console.log("Node ID mapping:", nodeIdMap);

      // Step 6: Insert workflow and link nodes using mapped IDs
      const { data: workflowData, error: workflowError } = await supabaseSegments
        .from("workflows")
        .insert([
          {
            workflow_name: nodeDetails.start.actionName,
            user_id: userId,
            template_id: templateId,
            status,
          },
        ])
        .select();

      if (workflowError) throw workflowError;
      const workflowId = workflowData[0].workflow_id;

    

      await processNodesSequentially(templateId, workflowId,nodeDetails,nodeIdMap);
      // Show success message
      const statusText = status === 'active' ? 'deployed' : 'saved as draft';
      toast.success(`FX Exposure workflow ${statusText} successfully!`);
      
      // Navigate to actions page
      navigate('/actions');
     
    } catch (error) {
      if (error.message.includes('workflow name')) {
        toast.error('Please provide a valid workflow name');
      } else if (error.message.includes('configuration')) {
        toast.error('Error in workflow configuration. Please check all node settings.');
      } else {
        toast.error('Error saving workflow. Please try again.');
      }
    }
    
  };

  const allNodesSaved = useMemo(() => {
    // Get all non-floating node IDs
    const nonFloatingNodeIds = nodes
      .filter(node => node.data.type !== 'floating')
      .map(node => node.id);
    
    // Check if all non-floating nodes are in savedNodes
    return nonFloatingNodeIds.every(id => savedNodes.includes(id));
  }, [nodes, savedNodes]);

  return (
    <div className="h-screen flex flex-col overflow-y-hidden bg-white">
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
              <li>FX Exposure</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft',nodeDetails)}
            className="rounded-full text-sm"
            disabled={!allNodesSaved}
          >
            Save & Close
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="sm"
            onClick={() => handleSave('active',nodeDetails)}
            className="rounded-full text-sm"
            disabled={!allNodesSaved}
          >
            Deploy
          </Button>
        </div>
      </div>
    {/*Tabs*/}
      <div className="flex justify-center mt-6 bg-white">
          <div className="inline-flex rounded-lg border bg-white p-1 shadow-sm">
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
              disabled={isLoadingResults}
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
      
      {/* Main Content */}
      <div className="flex flex-1 overflow-y-auto gap-6 pt-4 bg-white">
        {/* Flow Panel */}
        <div className="flex-1 h-full flex justify-start items-start overflow-hidden bg-white relative">
          <div className="w-full h-full flex justify-start items-start overflow-hidden">
            <Card className="w-full h-full p-6 shadow-md flex justify-start items-start">
              <div className="relative w-full h-full max-h-full">
                <WorkflowFormProvider>
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
                  {/* Results View Overlay */}
              {activeTab === 'results' && (
                <div className="absolute inset-0 bg-white z-20 overflow-y-auto">
                  {renderResultsView()}
                </div>
              )}
                </ReactFlow>
                </WorkflowFormProvider>
              </div>
            </Card>

          </div>
          
        </div>
         
        {/* Configuration Panel */}
        {activeTab === 'editor' && (
          <>
        {selectedNode && (
          <Card className="flex-1 h-full max-w-2xl w-full overflow-y-auto bg-white">
            {renderNodeDetails(selectedNode)}
          </Card>
        )}
        </>)}
      </div>

    </div>
  );
};

export { FXExposureTemplate };