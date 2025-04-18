import { supabaseSegments } from "../helpers/supabaseClient";

// Remove the global variable and add localStorage functions
const WORKFLOW_TABLE_KEY = 'current_workflow_table';

const getWorkflowTable = () => {
  return localStorage.getItem(WORKFLOW_TABLE_KEY);
};

const setWorkflowTable = (tableName) => {
  if (tableName) {
    localStorage.setItem(WORKFLOW_TABLE_KEY, tableName);
  } else {
    localStorage.removeItem(WORKFLOW_TABLE_KEY);
  }
};

// Field mappings for different node settings tables
const fieldMappings = {
  start_node_settings: {
    actionName: "action_name",
    actionDescription: "action_description",
    segmentId: "segment_id",
    segmentMembers: "segment_members",
    executeEvery: "execute_every",
    startDate: "start_date",
    endDate: "end_date",
    
  },
  enrich_node_settings: {
    fieldsToEnrich: "fields_to_enrich",
    identifier: "identifier",
    objectType: "object_to_enrich",
  },
  lead_score_node_settings: {
    leadScore: "lead_score",
    threshold: "threshold",
  },
  openai_node_settings: {
    chatPrompt: "prompt",
  },
  slack_node_settings: {
    messageTarget: "message_target",
    slackChannel: "slack_channel",
    slackUser: "slack_user",
    messageTemplate: "message_template",
  },
  send_email_node_settings: {
    recipientEmail: "recipient_email",
    emailSubject: "subject_template",
    emailTemplate: "body_template",
  },
  calculate_fx_exposure_node_settings: {
    baseCurrencySource: "base_currency",
    filters: "filter_criteria",  // This will be stored as JSONB
    timePeriod: "time_period",   // Store time period directly
    customStartDate: "custom_start_date",  // Only store if custom range is selected
    customEndDate: "custom_end_date"       // Only store if custom range is selected
  },
  filter_node_settings: {
    filterCriteria: "filter_criteria",
  },
};

// Map frontend field names to database column names
const mapFields = (settingsTable, settings) => {
  if (!settings || Object.keys(settings).length === 0) return {}; 
  const mapping = fieldMappings[settingsTable] || {};
  return Object.keys(settings).reduce((mapped, key) => {
    const dbField = mapping[key] || key;
    mapped[dbField] = settings[key];
    return mapped;
  }, {});
};

// Fetch the first node in the flow
const getFirstNode = async (templateId) => {
  const { data: allEdges, error: edgesError } = await supabaseSegments
    .from("templateedges")
    .select("source_node_id, target_node_id")
    .eq("template_id", templateId);

  if (edgesError) throw edgesError;

  const targetNodeIds = new Set(allEdges.map(edge => edge.target_node_id));

  const { data: allNodes, error: nodesError } = await supabaseSegments
    .from("templatenodes")
    .select("template_node_id, node_type_id,node_type_name")
    .eq("template_id", templateId);

  if (nodesError) throw nodesError;

  return allNodes.find(node => !targetNodeIds.has(node.template_node_id));
};

// Fetch next node in sequence
const getNextNodes = async (currentNodeId, templateId) => {
  const { data: nextEdges, error } = await supabaseSegments
    .from("templateedges")
    .select("target_node_id")
    .eq("source_node_id", currentNodeId)
    .eq("template_id", templateId);

  if (error) throw error;
  console.log(nextEdges)
  return nextEdges ? nextEdges.map(edge => edge.target_node_id) : [];
};


const getNodeSettingsFromDB = (currentNode, formData, nodeIdMapping) => {
  console.log("🟢 Current Node:", currentNode);
  console.log("📩 Form Data Received:", formData);
  console.log("📌 Node ID Mapping:", nodeIdMapping);

  if (currentNode.node_type_name === "Start") {
    // For Start node, we look for data with key 'start'
    const startData = formData['start'];
    console.log("🎯 Start Node Data:", startData);
    
    if (!startData) {
      console.warn("⚠️ No start node data found in formData");
      return [];
    }
    
    return [startData];
  }

  // For other nodes, find the key in nodeIdMapping
  const matchedKey = Object.keys(nodeIdMapping).find(
    (key) => nodeIdMapping[key] === currentNode.template_node_id
  );

  console.log("🔑 Matched Key in nodeIdMapping:", matchedKey);

  if (!matchedKey) {
    console.warn("⚠️ No matching key found in nodeIdMapping.");
    return [];
  }

  // Find the corresponding formData entry using the matched key
  const matchedEntry = formData[matchedKey];
  console.log("🎯 Matched Entry from formData:", matchedEntry);

  // For other nodes, we expect an array of settings or a single object
  if (Array.isArray(matchedEntry)) {
    return matchedEntry;
  } else if (matchedEntry) {
    return [matchedEntry];
  }

  console.warn("⚠️ No data found for node:", currentNode.node_type_name);
  return [];
};



// Insert node settings into the correct table
const insertNodeSettings = async (settingsTable, workflowId, settings,typeId) => {
  if (!settings || Object.keys(settings).length === 0) return null;

  // Apply field mappings before inserting
  const mappedSettings = mapFields(settingsTable, settings);

  // Ensure all required fields exist in `settings

  const { data, error } = await supabaseSegments
    .from(settingsTable)
    .insert([{ workflow_id: workflowId, template_node_id:typeId, ...mappedSettings }])
    .select();

  if (error) throw error;
  return data[0]?.[`${settingsTable}_id`];
};

// Handle branch node processing
const processBranchNode = async (workflowId, branchData, typeId, templateId) => {
  try {
    console.log("🔄 Processing branch node...");
    console.log("Branch Data:", branchData);

    // Insert entry into branch_node_settings
    const { data, error: insertError } = await supabaseSegments
      .from("branch_node_settings")
      .insert([{ workflow_id: workflowId, template_node_id: typeId }])
      .select();

    if (insertError) {
      console.error(`❌ Error inserting into branch_node_settings`, insertError);
      return;
    }

    const branchNodeId = data?.[0]?.branch_node_settings_id;
    console.log("Branch Node Settings ID:", branchNodeId);

    // Fetch edges related to this branch node
    const { data: edges, error: fetchEdgesError } = await supabaseSegments
      .from("templateedges")
      .select("template_edge_id")
      .eq("source_node_id", typeId)
      .eq("template_id", templateId);

    if (fetchEdgesError) {
      console.error(`❌ Error fetching template edges for Node ${branchNodeId}:`, fetchEdgesError);
      return;
    }

    if (!edges || edges.length === 0) {
      console.warn(`⚠️ No template edges found for Branch Node ${branchNodeId}.`);
      return;
    }

    console.log(`🔗 Found ${edges.length} template edges for Branch Node ${branchNodeId}.`);
    
    // branchData is now an array of branch configurations
    const branchConfigs = branchData; // Get the first item since it contains the array of configurations

    // Process each edge with its corresponding branch configuration
    for (let i = 0; i < edges.length; i++) {
      const edge = edges[i];
      const branchConfig = branchConfigs[i];

      console.log(`Processing edge ${i}:`, edge);
      console.log(`With branch config:`, branchConfig);

      if (!branchConfig || !branchConfig.name || !branchConfig.filters) {
        console.warn(`⚠️ Invalid branch configuration for edge ${i}`);
        continue;
      }

      const conditionJson = JSON.stringify({
        name: branchConfig.name,
        filters: branchConfig.filters
      });

      console.log(`📝 Updating edge ${edge.template_edge_id} with condition:`, conditionJson);

      const { data: configData, error: updateError } = await supabaseSegments
        .from("templateedges_configuration")
        .insert({
          template_edge_id: edge.template_edge_id,
          workflow_id: workflowId,
          configuration: conditionJson
        })
        .select();

      if (updateError) {
        console.error(`❌ Error updating edge ${edge.template_edge_id}:`, updateError);
        continue;
      }

      console.log(`✅ Successfully updated edge ${edge.template_edge_id}`, configData);
    }

    console.log(`🎉 Successfully processed Branch Node ${branchNodeId}`);
  } catch (error) {
    console.error("🚨 Unexpected error in processBranchNode:", error);
    throw error; // Rethrow to handle it in the calling function
  }
};


const processLeadScoreNode = async (workflowId, leadScoreData,typeId) => {
  try {
    console.log("🔄 Processing Lead Score Node...");

    // Insert lead score node settings
    const { data, error } = await supabaseSegments
    .from("lead_score_node_settings")
    .insert([{ workflow_id: workflowId, template_node_id:typeId }])
    .select(); // Ensures the inserted row is returned
  
  if (error) {
    console.error("❌ Error inserting lead score node settings:", error);
    throw error;
  }
  
  const leadScoreNodeSettingsId = data?.[0]?.lead_score_node_settings_id; // Extract the inserted ID
  console.log("✅ Inserted ID:", leadScoreNodeSettingsId);
  

    console.log("✅ Lead Score Node settings inserted with ID:", leadScoreNodeSettingsId);

    if (Array.isArray(leadScoreData)) {
      for (const data of leadScoreData) {
        console.log("💡 Data Object:", data);
    
        if (data?.demographs && Array.isArray(data.demographs)) {
          console.log("✅ Processing Demographs for:", data);
          for (const demograph of data.demographs) {
            const { name, leadscore, logical_operator, conditions } = demograph;
    
            // Insert into leadscore_demographs
            const { data: demographData, error: demographError } = await supabaseSegments
              .from("leadscore_demographs")
              .insert([
                {
                  name,
                  leadscore,
                  logical_operator,
                  leadscorenodesettings_id: leadScoreNodeSettingsId,
                },
              ])
              .select();
    
            if (demographError) {
              console.error("❌ Error inserting demograph:", demographError);
              continue; // Don't stop processing other demographs
            }
    
            const leadscoreDemographId = demographData[0]?.leadscore_demographs_id;
            console.log("✅ Inserted Demograph ID:", leadscoreDemographId);
    
            // Insert conditions if available
            if (conditions && Array.isArray(conditions)) {
              for (const condition of conditions) {
                const { attribute, operator, value1, value2 } = condition;
                console.log("📝 Condition:", condition);
    
                if (leadscoreDemographId) {
                  const { error: conditionError } = await supabaseSegments
                    .from("leadscore_conditions")
                    .insert([
                      {
                        attribute,
                        operator,
                        leadscore_demographs_id: leadscoreDemographId,
                        value1,
                        value2,
                      },
                    ]);
    
                  if (conditionError) {
                    console.error("❌ Error inserting condition:", conditionError);
                    continue;
                  }
                }
              }
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error("❌ Error processing Lead Score Node:", error);
  }
};

// Process nodes sequentially
export const processNodesSequentially = async (templateId, workflowId, formData, nodeMapping) => {
  console.log("🚀 Starting sequential node processing...");
  console.log("📩 Initial formData:", formData);
  
  try {
    let currentNodes = [await getFirstNode(templateId)]; // Queue of nodes to process

    // Validate start node data first
    if (!formData.start || !formData.start.actionName) {
      throw new Error("Start node data is missing or incomplete. Please fill in the required fields.");
    }

    while (currentNodes.length > 0) {
      let currentNode = currentNodes.shift(); // Get the first node in the queue

      console.log(`🔄 Processing Node: ${currentNode.template_node_id} (Type: ${currentNode.node_type_name})`);

      if (currentNode.node_type_name === "Start") { 
        console.log("🟢 Processing Start Node...");
        const startNodeSettings = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        
        // Additional validation for start node data
        if (!startNodeSettings || startNodeSettings.length === 0) {
          throw new Error("Start node settings are missing. Please configure the start node.");
        }

        const startData = startNodeSettings[0];
        if (!startData.actionName || !startData.segmentId || !startData.executeEvery) {
          throw new Error("Start node is missing required fields (Action Name, Segment, or Execution Schedule).");
        }

        // Process start node settings
        const mappedSettings = mapFields("start_node_settings", startData);
        await insertNodeSettings("start_node_settings", workflowId, mappedSettings, currentNode.template_node_id);
      } 
      else if (currentNode.node_type_name === "Lead Score") { 
        console.log("⚡ Processing Lead Score Node...");
        const leadScoreData = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        console.log(leadScoreData)
        await processLeadScoreNode(workflowId, leadScoreData, currentNode.template_node_id);
      } 
      else if (currentNode.node_type_name === "Branch") {  
        console.log("🔀 Processing Branch Node...");
        const branchData = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        await processBranchNode(workflowId, branchData, currentNode.template_node_id,templateId);
      } 
      else if (currentNode.node_type_name === "Calculate FX Exposure") {
        console.log("💱 Processing Capture Exposure Node...");
        const captureExposureData = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        if (captureExposureData && captureExposureData[0]) {
          const { 
            baseCurrencySource, 
            timePeriod, 
            customStartDate, 
            customEndDate, 
            filters
          } = captureExposureData[0];
          
          console.log("📥 Received node data:", captureExposureData[0]);
          
          // Convert filters to JSONB format
          const filterCriteria = {
            filters: filters.map(filter => ({
              attribute: filter.attribute,
              operator: filter.operator,
              value1: filter.value1,
              value2: filter.value2,
              dataType: filter.dataType
            }))
          };
          
          // Only include fields that exist in the database
          const settings = {
            baseCurrencySource,      // Will be mapped to base_currency
            filter_criteria: filterCriteria,  // Will be stored as JSONB
            time_period: timePeriod,  // Store time period directly
            ...(timePeriod === "custom" && {  // Only include custom dates if custom range is selected
              custom_start_date: customStartDate,
              custom_end_date: customEndDate
            })
          };
          
          console.log("⚙️ Settings to be inserted:", settings);
          
          await insertNodeSettings("calculate_fx_exposure_node_settings", workflowId, settings, currentNode.template_node_id);
        }
      }
      else if (currentNode.node_type_name === "Filter") {
        console.log("🔍 Processing Filter Node...");
        const filterData = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        if (filterData && filterData[0]) {
          // Only save the filter_criteria field
          const filterSettings = {
            filter_criteria: filterData[0].filterCriteria || filterData[0].sqlQuery
          };
          await insertNodeSettings("filter_node_settings", workflowId, filterSettings, currentNode.template_node_id);
        }
      } 
      else { 
        const settingsTable = getSettingsTableForNodeType(currentNode.node_type_name);
        if (!settingsTable) {
          console.warn(`⚠️ No settings table found for node type ${currentNode.node_type_name}, skipping.`);
        } else {
          const nodeSettings = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
          
          if (Array.isArray(nodeSettings)) {
            for (const setting of nodeSettings) {
              await insertNodeSettings(settingsTable, workflowId, setting, currentNode.template_node_id);
            }
          } else {
            await insertNodeSettings(settingsTable, workflowId, nodeSettings, currentNode.template_node_id);
          }
        }
      }

      const nextNodeIds = await getNextNodes(currentNode.template_node_id, templateId);

      if (!nextNodeIds || nextNodeIds.length === 0) {
        console.log("🏁 No more nodes to process. Workflow execution complete!");
        continue;
      }

      for (const nodeId of nextNodeIds) {
        const { data: nextNode, error: fetchError } = await supabaseSegments
          .from("templatenodes")
          .select("template_node_id, node_type_id,node_type_name")
          .eq("template_node_id", nodeId)
          .maybeSingle();

        if (fetchError) {
          console.error(`❌ Error fetching node ${nodeId}:`, fetchError);
          continue;
        }

        if (!nextNode) {
          console.warn(`⚠️ Node ${nodeId} not found, skipping.`);
          continue;
        }

        console.log(`🔄 Adding next node to queue: ${nextNode.template_node_id}`);
        currentNodes.push(nextNode);
      }
    }

    console.log("✅ Sequential node processing complete!");
  } catch (error) {
    console.error("❌ Error during sequential node processing:", error);
    throw error; // Rethrow the error to be handled by the calling function
  }
};



// Mapping node type IDs to settings tables
const getSettingsTableForNodeType = (nodeTypeName) => {
  const mapping = {
    "Start": "start_node_settings",
    "Enrich": "enrich_node_settings",
    "Lead Score": "lead_score_node_settings",
    "Branch": "branch_node_settings",
    "OpenAI": "openai_node_settings",
    "Slack": "slack_node_settings",
    "Email": "send_email_node_settings",
  };
  return mapping[nodeTypeName] || null;
};

export async function sendConfigurationToBackend(nodes, edges, formData, templateConfig, nodeUniqueNames) {
  try {
    console.log('📥 Received formData:', formData);
    console.log('📝 Node Unique Names:', nodeUniqueNames);
    console.log('📋 Template Config:', templateConfig);
    
    // Create a mapping of node IDs to their data
    const nodeMap = nodes.reduce((acc, node) => {
      if (node.data.type !== 'floating') {
        // Remove isFormComplete and position from the data
        const { isFormComplete, position, ...nodeData } = formData[node.id] || {};
        
        // Find all edges where this node is the target (incoming connections)
        const sourceEdges = edges.filter(edge => edge.target === node.id);
        // Find all edges where this node is the source (outgoing connections)
        const targetEdges = edges.filter(edge => edge.source === node.id);
        
        acc[node.id] = {
          type: node.data.type,
          label: node.data.label,
          nodeName: nodeUniqueNames[node.id] || node.data.label,
          data: {
            ...nodeData,
            nodeName: nodeUniqueNames[node.id] || node.data.label
          },
          source: sourceEdges.map(edge => edge.source),
          target: targetEdges.map(edge => edge.target)
        };
      } else {
        acc[node.id] = {
          type: node.data.type,
          label: node.data.label,
          nodeName: node.data.label,
          data: {},
          source: null,
          target: null
        };
      }
      return acc;
    }, {});

    console.log('📋 Node Map:', JSON.stringify(nodeMap, null, 2));

    // Create a mapping of branch nodes to their conditions
    const branchConditions = {};
    nodes.forEach(node => {
      if (node.data.type === 'branch') {
        console.log('🔍 Found branch node:', node.id);
        console.log('Branch data:', formData[node.id]);
        branchConditions[node.id] = formData[node.id];
      }
    });

    console.log('🌳 Branch Conditions:', JSON.stringify(branchConditions, null, 2));

    // Get all edges from each branch node
    const branchEdges = {};
    edges.forEach(edge => {
      if (branchConditions[edge.source]) {
        if (!branchEdges[edge.source]) {
          branchEdges[edge.source] = [];
        }
        branchEdges[edge.source].push(edge);
      }
    });

    console.log('🔗 Branch Edges:', JSON.stringify(branchEdges, null, 2));

    // Prepare edges with configurations
    const processedEdges = edges
      .filter(edge => {
        const sourceNode = nodes.find(n => n.id === edge.source);
        const targetNode = nodes.find(n => n.id === edge.target);
        return sourceNode?.data.type !== 'floating' && targetNode?.data.type !== 'floating';
      })
      .map(edge => {
        const edgeConfig = {
          source: edge.source,
          target: edge.target,
          type: edge.type,
          configuration: {}
        };

        if (branchConditions[edge.source]) {
          const branchData = branchConditions[edge.source];
          const edgesFromBranch = branchEdges[edge.source] || [];
          const edgeIndex = edgesFromBranch.findIndex(e => e.target === edge.target);
          
          if (branchData.data && branchData.data[edgeIndex]) {
            const branchConfig = branchData.data[edgeIndex];
            edgeConfig.configuration = {
              id: branchConfig.id,
              instanceId: edge.source,
              name: branchConfig.name,
              filters: branchConfig.filters.map(filter => ({
                attribute: filter.attribute,
                operator: filter.operator,
                value1: filter.value1,
                value2: filter.value2,
                attributeId: filter.attributeId,
                dataType: filter.dataType
              }))
            };
          }
        }

        return edgeConfig;
      });

    console.log('✅ Processed Edges:', JSON.stringify(processedEdges, null, 2));

    // Prepare the configuration data
    const configurationData = {
      template: templateConfig || {}, // Provide empty object as fallback
      nodes: Object.entries(nodeMap).map(([id, data]) => ({
        id,
        ...data
      })),
      edges: processedEdges,
      timestamp: new Date().toISOString()
    };

    // Detailed logging of the final configuration
    console.log('🔍 Final Configuration Data:');
    console.log('📦 Template:', JSON.stringify(configurationData.template, null, 2));
    console.log('📊 Nodes:', JSON.stringify(configurationData.nodes, null, 2));
    console.log('🔗 Edges:', JSON.stringify(configurationData.edges, null, 2));
    console.log('⏰ Timestamp:', configurationData.timestamp);
    console.log('📦 Full Configuration:', JSON.stringify(configurationData, null, 2));

    // Log the actual request being sent
    const requestBody = { workflow_json: configurationData };
    console.log('🚀 Request Body:', JSON.stringify(requestBody, null, 2));

    // Send to backend endpoint
    const token = localStorage.getItem('sb-access-token');
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/execute_dynamic_workflow`, {
      method: 'POST',
      headers: { "Content-Type": "application/json" ,
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Backend Response:', JSON.stringify(result, null, 2));
    
    // Store the workflow table name if it exists in the response
    if (result?.workflow_table) {
      setWorkflowTable(result.workflow_table);
      console.log('📊 Stored workflow table:', result.workflow_table);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error sending configuration to backend:', error);
    
    // Check if it's a network error
    if (error instanceof TypeError) {
      console.error('Backend server is not running. Please start the backend server on port 8000.');
    } else if (error.message.includes('400')) {
      console.error('Invalid workflow configuration. Please check your settings and try again.');
    } else if (error.message.includes('401')) {
      console.error('Unauthorized. Please log in again.');
    } else if (error.message.includes('403')) {
      console.error('You don\'t have permission to perform this action.');
    } else if (error.message.includes('404')) {
      console.error('Resource not found. Please check your configuration.');
    } else {
      console.error('Failed to connect to backend server. Please make sure both frontend and backend servers are running.');
    }
    
    throw error;
  }
};

export const deleteWorkflowTableIfExists = async () => {
  const currentTable = localStorage.getItem('current_workflow_table');
  if (currentTable) {
    try {
      console.log('🗑️ Deleting workflow table:', currentTable);
      const token = localStorage.getItem('sb-access-token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/delete_workflow_table`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" ,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ table_name: currentTable })
      });

      if (!response.ok) {
        throw new Error(`Failed to delete workflow table: ${response.statusText}`);
      }

      console.log('✅ Successfully deleted workflow table');
      localStorage.removeItem('current_workflow_table');
    } catch (error) {
      console.error('❌ Error deleting workflow table:', error);
      throw error;
    }
  }
};

export const processNodesRealTime = async (nodes, edges, formData) => {
  try {
    const results = [];
    let currentNode = nodes.find(node => node.data.type === 'start');
    
    while (currentNode) {
      const nodeData = formData[currentNode.id] || {};
      const nodeResult = {
        nodeId: currentNode.id,
        type: currentNode.data.type,
        output: {}
      };

      // Process based on node type
      switch (currentNode.data.type) {
        case 'start':
          nodeResult.output = {
            actionName: nodeData.actionName,
            segmentId: nodeData.segmentId,
            executeEvery: nodeData.executeEvery
          };
          break;
        case 'enrich':
          nodeResult.output = {
            fieldsEnriched: nodeData.fieldsToEnrich,
            identifier: nodeData.identifier
          };
          break;
        case 'leadScore':
          nodeResult.output = {
            demographs: nodeData.demographs,
            totalScore: calculateTotalScore(nodeData.demographs)
          };
          break;
        case 'branch':
          nodeResult.output = {
            conditions: nodeData.conditions,
            branches: nodeData.branches
          };
          break;
        case 'openAI':
          nodeResult.output = {
            prompt: nodeData.chatPrompt,
            generatedContent: "Simulated AI response"
          };
          break;
        case 'email':
          nodeResult.output = {
            recipient: nodeData.recipientEmail,
            subject: nodeData.subject,
            body: nodeData.body
          };
          break;
        case 'slack':
          nodeResult.output = {
            channel: nodeData.slackChannel,
            message: nodeData.messageTemplate
          };
          break;
      }

      results.push(nodeResult);

      // Find next node
      const nextEdge = edges.find(edge => edge.source === currentNode.id);
      if (!nextEdge) break;
      
      currentNode = nodes.find(node => node.id === nextEdge.target);
    }

    return {
      success: true,
      nodesProcessed: results.length,
      processingTime: 500, // Simulated processing time
      nodeResults: results
    };
  } catch (error) {
    console.error('Error in real-time processing:', error);
    return {
      success: false,
      error: error.message,
      nodesProcessed: 0,
      processingTime: 0,
      nodeResults: []
    };
  }
};

// Helper function to calculate total lead score
const calculateTotalScore = (demographs) => {
  if (!demographs || !Array.isArray(demographs)) return 0;
  return demographs.reduce((total, demograph) => total + (demograph.leadscore || 0), 0);
};

export default processNodesSequentially;