import { v4 as uuidv4 } from 'uuid';
import { supabaseSegments } from './supabaseClient';
import toast from 'react-hot-toast';
const operatorEnumMap = {
  "=": "EQ",
  "!=": "NEQ",
  ">": "GT",
  "<": "LT",
  ">=": "GTE",
  "<=" : "LTE",
  "CONTAINS": "CONTAINS",
  "STARTS_WITH": "STARTS_WITH",
  "ENDS_WITH": "ENDS_WITH",
  "IN": "IN",
  "NOT_IN": "NOT_IN",
  "IS_EMPTY": "IS_EMPTY",
  "IS_NOT_EMPTY": "IS_NOT_EMPTY",
  "IS_TRUE": "IS_TRUE",
  "IS_FALSE": "IS_FALSE",
  "BETWEEN":"BETWEEN"
};

export const saveOrDeploySegment = async (segment, status) => {
  try {
    const objectTypeId = segment.objectTypeId;
    if (!objectTypeId) {
      toast.error('Object Type ID is missing. Please select a valid object type.');
    }

    const segmentId = uuidv4();
    const { error: segmentError } = await supabaseSegments
      .from('segments')
      .insert({
        id: segmentId,
        name: segment.name,
        description: segment.description,
        object_type_id: objectTypeId,
        status: status, 
        size: 0,
        last_executed: new Date(),
        logical_operator: segment.outerMatchType.toUpperCase()
      })
      .single();

    if (segmentError) toast.error(`Error inserting segment: ${segmentError.message}`);
    
    console.log(`Segment "${segment.name}" created with ID: ${segmentId} and status "${status}"`);

    for (const group of segment.conditionGroups) {
      const conditionGroupId = uuidv4();
      const { error: conditionGroupError } = await supabaseSegments
        .from('condition_groups')
        .insert({
          id: conditionGroupId,
          segment_id: segmentId,
          logical_operator: (group.matchType || 'ANY').toUpperCase(),
        })
        .single();

      if (conditionGroupError) throw new Error(`Error inserting condition group: ${conditionGroupError.message}`);
      console.log(`Condition group created with ID: ${conditionGroupId}`);

      for (const condition of group.conditions) {
        const ruleSetGroupId = uuidv4();
        const { error: ruleSetGroupError } = await supabaseSegments
          .from('rule_set_groups')
          .insert({
            id: ruleSetGroupId,
            condition_group_id: conditionGroupId,
            logical_operator: (condition.matchType || 'ANY').toUpperCase(),
          })
          .single();
        if (ruleSetGroupError) throw new Error(`Error inserting rule set group: ${ruleSetGroupError.message}`);
        console.log(`Rule set group created with ID: ${ruleSetGroupId}`);

        const ruleSetId = uuidv4();
        const { error: ruleSetError } = await supabaseSegments
          .from('rule_sets')
          .insert({
            id: ruleSetId,
            rule_set_group_id: ruleSetGroupId,
            logical_operator: 'ALL',
          })
          .single();
        if (ruleSetError) throw new Error(`Error inserting rule set: ${ruleSetError.message}`);
        console.log(`Rule set created with ID: ${ruleSetId}`);

        for (const filter of condition.filters) {
          const attributeId = filter.attributeId;
          if (!attributeId) {
            toast.error(
              `Attribute ID is missing for filter with attribute "${filter.attribute}". Please select a valid attribute.`
            );
          }

          const { error: ruleError } = await supabaseSegments
            .from('rules')
            .insert({
              id: uuidv4(),
              rule_set_id: ruleSetId,
              attribute_id: attributeId,
              comparison_operator: operatorEnumMap[filter.operator] || filter.operator,
              value1:filter.value1,
              value2:filter.value2
            });
          if (ruleError) throw new Error(`Error inserting rule: ${ruleError.message}`);
          console.log(
            `Rule created for attribute "${filter.attribute}" with operator "${filter.operator}" and value "${filter.value}"`
          );
        }
      }
    }

    toast.success(`Segment ${status === 'DRAFT' ? 'saved' : 'deployed'} successfully.`);
    console.log(`Segment ${status === 'DRAFT' ? 'save' : 'deployment'} completed successfully.`);
    
    return segmentId;
  } catch (error) {
    toast.error(`Error processing segment: ${error.message}`);
    throw error;
  }
};