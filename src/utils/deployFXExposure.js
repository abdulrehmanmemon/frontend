import { supabaseSegments } from "../helpers/supabaseClient";

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
  openai_node_settings: {
    chatPrompt: "prompt",
  },
  slack_node_settings: {
    messageTarget: "message_target",
    slackChannel: "slack_channel",
    slackUser: "slack_user",
    messageTemplate: "message_template",
  },
};

// Helper function to calculate date range based on time period
const calculateDateRange = (timePeriod, customStartDate, customEndDate) => {
  const today = new Date();
  let startDate, endDate;

  // Normalize the time period to handle case-insensitive matching
  const normalizedPeriod = timePeriod?.toLowerCase().replace(/_/g, ' ');

  switch (normalizedPeriod) {
    case "last month":
      startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      endDate = new Date(today.getFullYear(), today.getMonth(), 0);
      break;
    case "last quarter":
      const currentQuarter = Math.floor(today.getMonth() / 3);
      startDate = new Date(today.getFullYear(), currentQuarter * 3 - 3, 1);
      endDate = new Date(today.getFullYear(), (currentQuarter * 3) - 1, 0);
      break;
    case "year to date":
      startDate = new Date(today.getFullYear(), 0, 1);
      endDate = today;
      break;
    case "custom range":
      startDate = new Date(customStartDate);
      endDate = new Date(customEndDate);
      break;
    default:
      throw new Error(`Invalid time period: ${timePeriod}`);
  }

  return {
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0]
  };
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
    .select("template_node_id, node_type_id, node_type_name")
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
  return nextEdges ? nextEdges.map(edge => edge.target_node_id) : [];
};

const getNodeSettingsFromDB = (currentNode, formData, nodeIdMapping) => {
  console.log("🟢 Current Node:", currentNode);
  console.log("📩 Form Data Received:", formData);
  console.log("📌 Node ID Mapping:", nodeIdMapping);

  const matchedKey = Object.keys(nodeIdMapping).find(
    (key) => nodeIdMapping[key] === currentNode.template_node_id
  );

  if (!matchedKey) {
    console.warn("⚠️ No matching key found in nodeIdMapping.");
    return [];
  }

  const matchedEntry = formData[matchedKey];
  console.log("🎯 Matched Entry from formData:", matchedEntry);

  if (currentNode.node_type_name === "Start") {
    return matchedEntry ? [matchedEntry] : [];
  } else {
    return Array.isArray(matchedEntry) ? matchedEntry : [matchedEntry];
  }
};

// Insert node settings into the correct table
const insertNodeSettings = async (settingsTable, workflowId, settings, typeId) => {
  if (!settings || Object.keys(settings).length === 0) return null;

  const mappedSettings = mapFields(settingsTable, settings);

  const { data, error } = await supabaseSegments
    .from(settingsTable)
    .insert([{ workflow_id: workflowId, template_node_id: typeId, ...mappedSettings }])
    .select();

  if (error) throw error;
  return data[0]?.[`${settingsTable}_id`];
};

// Process nodes sequentially
export const processNodesSequentially = async (templateId, workflowId, formData, nodeMapping) => {
  console.log("🚀 Starting sequential node processing for FX Exposure...");
  
  try {
    let currentNodes = [await getFirstNode(templateId)];

    while (currentNodes.length > 0) {
      let currentNode = currentNodes.shift();

      console.log(`🔄 Processing Node: ${currentNode.template_node_id} (Type: ${currentNode.node_type_name})`);

      if (currentNode.node_type_name === "Start") {
        console.log("🟢 Processing Start Node...");
        const startNodeSettings = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        if (Array.isArray(startNodeSettings)) {
          for (const setting of startNodeSettings) {
            const mappedSettings = mapFields("start_node_settings", setting);
            await insertNodeSettings("start_node_settings", workflowId, mappedSettings, currentNode.template_node_id);
          }
        }
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
      else if (currentNode.node_type_name === "OpenAI") {
        console.log("🤖 Processing OpenAI Node...");
        const openAIData = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        if (openAIData && openAIData[0]) {
          await insertNodeSettings("openai_node_settings", workflowId, openAIData[0], currentNode.template_node_id);
        }
      }
      else if (currentNode.node_type_name === "Slack") {
        console.log("💬 Processing Slack Node...");
        const slackData = getNodeSettingsFromDB(currentNode, formData, nodeMapping);
        if (slackData && slackData[0]) {
          await insertNodeSettings("slack_node_settings", workflowId, slackData[0], currentNode.template_node_id);
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
          .select("template_node_id, node_type_id, node_type_name")
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

        currentNodes.push(nextNode);
      }
    }

    console.log("✅ Sequential node processing complete!");
  } catch (error) {
    console.error("❌ Error during sequential node processing:", error);
  }
};

export default processNodesSequentially;
