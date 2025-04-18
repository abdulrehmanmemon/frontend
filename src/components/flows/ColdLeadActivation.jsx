import { useState, useContext, useRef} from 'react';
import Button from '@/components/daisyui/Button/Button';
import Card from '@/components/daisyui/Card/Card';
import ReactFlow, { Controls, Background } from 'reactflow';
import 'reactflow/dist/style.css';
import { useNavigate } from 'react-router-dom';
import Start from '../nodes/Start';
import Enrich from '../nodes/Enrich';
import LeadScore from '../nodes/LeadScore';
import Branch from '../nodes/Branch';
import OpenAI from '../nodes/OpenAI';
import Email from '../nodes/Email';
import Slack from '../nodes/Slack';
import { supabaseSegments } from '../../helpers/supabaseClient';
import { FormContext } from '../../contexts/forms/WorkflowTemplateContext';
import { nanoid } from 'nanoid';
import processNodesSequentially from '../../utils/deployFlow';
const generateInstanceId = (label) => {
  const sanitizedLabel = label.toLowerCase().replace(/\s+/g, '-'); // Convert label to lowercase and replace spaces with dashes
  return `${sanitizedLabel}-${nanoid(6)}`; // Append a unique 6-character ID
};


const startId = generateInstanceId('Start');
const enrichId = generateInstanceId('Enrich');
const leadScoreId = generateInstanceId('Lead Score');
const branchId = generateInstanceId('Branch');
const openAiLeftId = generateInstanceId('OpenAI');
const openAiRightId = generateInstanceId('OpenAI');
const slackId = generateInstanceId('Slack');
const emailId = generateInstanceId('Email');

const initialNodes = [
  { id: startId, type: 'input', data: { label: 'Start' }, position: { x: 250, y: 5 } },
  { id: enrichId, data: { label: 'Enrich' }, position: { x: 250, y: 100 } },
  { id: leadScoreId, data: { label: 'Lead Score' }, position: { x: 250, y: 200 } },
  { id: branchId, data: { label: 'Branch' }, position: { x: 250, y: 300 } },
  { id: openAiLeftId, data: { label: 'OpenAI' }, position: { x: 150, y: 400 } },
  { id: openAiRightId, data: { label: 'OpenAI' }, position: { x: 350, y: 400 } },
  { id: slackId, data: { label: 'Slack' }, position: { x: 150, y: 500 } },
  { id: emailId, data: { label: 'Email' }, position: { x: 350, y: 500 } },
];

const initialEdges = [
  { id: `e-${startId}-${enrichId}`, source: startId, target: enrichId, type: 'smoothstep' },
  { id: `e-${enrichId}-${leadScoreId}`, source: enrichId, target: leadScoreId, type: 'smoothstep' },
  { id: `e-${leadScoreId}-${branchId}`, source: leadScoreId, target: branchId, type: 'smoothstep' },
  { id: `e-${branchId}-${openAiLeftId}`, source: branchId, target: openAiLeftId, type: 'smoothstep' }, // Branch to OpenAI Left
  { id: `e-${branchId}-${openAiRightId}`, source: branchId, target: openAiRightId, type: 'smoothstep' }, // Branch to OpenAI Right
  { id: `e-${openAiLeftId}-${slackId}`, source: openAiLeftId, target: slackId, type: 'smoothstep' }, // OpenAI Left to Slack
  { id: `e-${openAiRightId}-${emailId}`, source: openAiRightId, target: emailId, type: 'smoothstep' }, // OpenAI Right to Email
];



const ColdLeadActivation = () => {
  const [nodeDetails, setNodeDetails] = useState({});
  const navigate = useNavigate();
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodes, setNodes] = useState(initialNodes);
 

  const reactFlowInstance = useRef(null); // ReactFlow reference

  // Accessing form data from context
  const { startData, setStartData, enrichData, leadScoreData, branchData, openAINodeData, emailData, slackData } = useContext(FormContext);
  const formData = {
    ...startData,
    ...enrichData,
    ...leadScoreData,
    ...branchData,
    ...openAINodeData,
    ...emailData,
    ...slackData,
  };
  console.log(formData)

  const handleNodeDataSave = (nodeId, data) => {
    setNodeDetails((prev) => ({ ...prev, [nodeId]: data }));
  };

  const onNodeClick = (event, node) => {
    setSelectedNode(node);
  
    if (reactFlowInstance.current) {
      const nodeWidth = 100;
      const nodeHeight = 50; 
      
      const bounds = {
        x: node.position.x - nodeWidth / 2,
        y: node.position.y - nodeHeight / 2,
        width: nodeWidth,
        height: nodeHeight,
      };
  
    }
  
    // Highlight the selected node
    setNodes((nds) =>
      nds.map((n) =>
        n.id === node.id
          ? { ...n, style: { ...n.style, border: '2px solid blue' } }
          : { ...n, style: { ...n.style, border: 'none' } }
      )
    );
  };
  
  

  const handleSave = async (status,formData) => {
    console.log(formData)
    try {
      // Step 1: Validate user session
      const { data: sessionData, error: sessionError } = await supabaseSegments.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error("User not logged in or session invalid");
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
      const { data: templateNodes, error: templateNodesError } = await supabaseSegments
        .from("templatenodes")
        .select("template_node_id, node_name")
        .eq("template_id", 1);  // Fetch only template_id = 1
  
      if (templateNodesError) throw templateNodesError;
      console.log("Fetched template nodes:", templateNodes);
  
    
      const nodeIdMap = {};
  
      // Step 5: Group DB nodes by name (ignoring numbering)
      const dbNodeGroups = {};
      templateNodes.forEach(dbNode => {
        const baseName = dbNode.node_name.replace(/\s*\(\d+\)$/, '');
        if (!dbNodeGroups[baseName]) dbNodeGroups[baseName] = [];
        dbNodeGroups[baseName].push(dbNode);
      });
  
      // Step 6: Map ReactFlow nodes in order
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
  
      // Step 7: Insert workflow and link nodes using mapped IDs
      const { data: workflowData, error: workflowError } = await supabaseSegments
        .from("workflows")
        .insert([
          {
            workflow_name: formData.actionName, 
            user_id: userId,
            template_id: 1,
            status,
          },
        ])
        .select();
  
      if (workflowError) throw workflowError;
      const workflowId = workflowData[0].workflow_id;
      await processNodesSequentially(1,workflowId,formData,nodeIdMap)
      console.log(`Workflow ${status === 'active' ? 'deployed' : 'saved as draft'} successfully!`);
      setStartData({});
     navigate('/actions');
    } catch (error) {
      alert('Error saving workflow. Check the console for more details.');
      console.error(error);
    }
  };
  

  const renderNodeDetails = (node) => {
    if (!node) return null;
  
    switch (node.data.label) {
      case 'Start':
        return <Start />;
      case 'Enrich':
        return <Enrich instanceId={node.id} onSave={handleNodeDataSave} />;
      case 'Lead Score':
        return <LeadScore  instanceId={node.id} onSave={handleNodeDataSave}/>;
      case 'Branch':
        return <Branch instanceId={node.id} onSave={handleNodeDataSave} />;
      case 'OpenAI':
        return <OpenAI instanceId={node.id} onSave={handleNodeDataSave} />;
      case 'Email':
        return <Email instanceId={node.id} onSave={handleNodeDataSave} />;
      case 'Slack':
        return <Slack instanceId={node.id} onSave={handleNodeDataSave} />;
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
      <div className="flex items-center justify-between bg-white px-6 py-4">
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
              <li>Cold Lead Activation</li>
            </ul>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button
            color="secondary"
            variant="outline"
            size="sm"
            onClick={() => handleSave('draft',formData)}
            className="rounded-full text-sm"
          >
            Save & Close
          </Button>
          <Button
            color="primary"
            variant="solid"
            size="sm"
            onClick={() => handleSave('active',formData)}
            className="rounded-full text-sm"
          >
            Deploy
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-y-auto gap-6 pt-4 bg-white">
        {/* Flow Panel */}
        <div className="flex-1 h-full flex justify-center items-center overflow-hidden bg-white relative">
  <div className="w-full h-full flex justify-center items-center overflow-hidden">
    <Card className="w-full h-full p-6 shadow-md flex justify-center items-center">
      <div className="relative w-full h-full max-h-full">
        <ReactFlow
          ref={reactFlowInstance} // Attach the reference to ReactFlow
          nodes={nodes}
          edges={initialEdges}
          onNodeClick={onNodeClick}
          style={{ width: '100%', height: '100%' }} // Make ReactFlow responsive
          fitView // Ensures the diagram scales to fit the view
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

export default ColdLeadActivation;
