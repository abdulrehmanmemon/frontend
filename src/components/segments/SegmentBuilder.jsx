import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { supabaseSegments } from '../../helpers/supabaseClient';
import Form from './components/Form';
import toast from 'react-hot-toast';
import ConditionGroup from './components/ConditionGroup';
import OutputTable from './OutputTable';
import { saveOrDeploySegment } from '../../helpers/savedeploySegments';
import Button from '@/components/daisyui/Button/Button';
import Select from '@/components/daisyui/Select/Select';
import Card from '../daisyui/Card/Card';
import Tabs from '../daisyui/Tabs/Tabs';
import Tab from '../daisyui/Tabs/Tab';

function generateRandomString() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  let result = '';
  for (let i = 0; i < 4; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export default function SegmentBuilder() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize segment with empty values or from location state
  const [segment, setSegment] = useState(() => {
    const randomSuffix = () => `_${generateRandomString()}`;
    // Regex to check if the name ends with _XXXX where X is a letter
    const hasRandomSuffix = name => /_[A-Za-z]{4}$/.test(name);
    if (location.state?.segmentStructure) {
      let editedName = location.state.segmentStructure.name;
      if (!hasRandomSuffix(editedName)) {
        editedName += randomSuffix();
      }
      return { ...location.state.segmentStructure, name: editedName };
    } else {
      return {
        name: '',
        description: '',
        entity: 'Companies',
        outerMatchType: 'all',
        conditionGroups: [{ matchType: 'all', conditions: [] }],
      };
    }
  });

  const [objectTypes, setObjectTypes] = useState([]);
  const [activeTab, setActiveTab] = useState('segment');
  const [segmentData, setSegmentData] = useState([]);
  const [existingSegmentId, setExistingSegmentId] = useState(location.state?.opportunityId || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeTab === 'output') {
      checkAndFetchSegment();
    }
  }, [activeTab]);


useEffect(() => {
  const transformSegmentStructure = async (segmentStructure) => {
  // Preserve the original name with its suffix
  const originalName = segmentStructure.name;
  
  const transformedGroups = await Promise.all(
    segmentStructure.conditionGroups.map(async (group) => {
      const transformedConditions = await Promise.all(
        group.conditions.map(async (condition) => {
          try {
            // First, find the entity ID for this condition type
            const { data: entity, error: entityError } = await supabaseSegments
              .from('entity')
              .select('id')
              .eq('entity_label', condition.type)
              .single();

            if (entityError) throw entityError;
            if (!entity) return condition;

            // Then fetch all attributes for this entity
            const { data: attributes, error: attributesError } = await supabaseSegments
              .from('attributes')
              .select('id, attribute_name, attribute_label, data_type')
              .eq('entity_id', entity.id)
              .eq('enable', true);

            if (attributesError) throw attributesError;

            // Transform filters while preserving original values
            const transformedFilters = await Promise.all(
              condition.filters.map(async (filter) => {
                // Find the matching attribute
                const attribute = attributes?.find(a => 
                  a.attribute_name === filter.attribute 
                  
                );
                console.log(attribute)
                return {
                  ...filter,
                  // Display the label in UI but keep the original name for backend
                  attribute: attribute?.attribute_label,
                  attributeName: attribute?.attribute_name || filter.attribute,
                  attributeId: attribute?.id || null,
                  // Preserve original values
                  value1: filter.value1,
                  value2: filter.value2,
                  operator: filter.operator
                };
              })
            );

            console.log(transformedFilters);

            return {
              ...condition,
              attributes: attributes?.map(attr => ({
                id: attr.id,
                name: attr.attribute_name,
                label: attr.attribute_label,
                type: attr.data_type
              })) || [],
              filters: transformedFilters
            };
          } catch (error) {
            console.error("Error transforming condition:", error);
            return {
              ...condition,
              attributes: [],
              filters: condition.filters.map(f => ({
                ...f,
                attributeName: f.attribute,
                attribute: f.attributeName,
                attributeId: null
              }))
            };
          }
        })
      );
      return { 
        ...group, 
        conditions: transformedConditions,
        // Preserve original matchType
        matchType: group.matchType || 'all'
      };
    })
  );

  return {
    ...segmentStructure,
    name: originalName, // Keep the original name with suffix
    conditionGroups: transformedGroups,
    // Preserve other original properties
    outerMatchType: segmentStructure.outerMatchType || 'all',
    entity: segmentStructure.entity || 'Companies',
    description: segmentStructure.description || ''
  };
};


if (location.state?.segmentStructure) {
transformSegmentStructure(location.state.segmentStructure)
  .then(transformed => {
    setSegment(prev => ({
      ...transformed,
      name: prev?.name || transformed.name // Preserve edited name if exists
    }));
    if (location.state.opportunityId) {
      setExistingSegmentId(location.state.opportunityId);
    }
  });
}


}, [location.state]);


  const transformConditionsToBackend = (conditionGroups, outerMatchType) => {
    const operatorMapping = {
      all: "ALL",
      any: "ANY"
    };

    const operatorLabels = {
      "=": "EQ",
      "!=": "NEQ",
      ">": "GT",
      ">=": "GTE",
      "<": "LT",
      "<=": "LTE",
      "BETWEEN": "BETWEEN",
      "NOT BETWEEN": "NOT_BETWEEN",
      "IN": "IN",
      "NOT IN": "NOT_IN",
      "IS TRUE": "IS_TRUE",
      "IS FALSE": "IS_FALSE",
      "CONTAINS": "CONTAINS",
      "NOT CONTAINS": "NOT_CONTAINS",
      "STARTS WITH": "STARTS_WITH",
      "ENDS WITH": "ENDS_WITH"
    };

    let globalOperator = operatorMapping[outerMatchType?.toLowerCase()] || "ALL";
    let backendQuery = { global_operator: globalOperator };

    conditionGroups.forEach((group, groupIndex) => {
      let ruleSetId = `R${groupIndex + 1}`;
      let conditionsMap = {};
      let conditionOperator = operatorMapping[group.matchType.toLowerCase()] || "ALL";

      group.conditions.forEach((condition, conditionIndex) => {
        let conditionId = `C${conditionIndex + 1}`;

        let filters = condition.filters.map(filter => [
          filter.attributeName.toLowerCase().replace(/\s/g,"_"),
          condition.type.toLowerCase(),
          operatorLabels[filter.operator] || filter.operator.toUpperCase(),
          filter.value1,
          filter.value2
        ]);

        conditionsMap[conditionId] = filters;
      });

      backendQuery[ruleSetId] = [conditionOperator, conditionsMap];
    });

    return backendQuery;
  };

  useEffect(() => {
    const fetchObjectTypes = async () => {
      try {
        const { data, error } = await supabaseSegments.from('object_types').select('id, name');
        if (error) throw error;
        setObjectTypes(data);
      } catch (err) {
        console.error('Error fetching object types:', err.message);
      }
    };
    fetchObjectTypes();
  }, []);

  const checkSegmentExists = async () => {
    try {
      const { data, error } = await supabaseSegments
        .from('segments')
        .select('id')
        .eq('name', segment.name)
        .limit(1);
  
      if (error) throw error;
  
      if (data.length > 0) {
        // Don't set setExistingSegmentId here!
        return data[0].id;
      }
  
      return null;
    } catch (err) {
      toast.error("Error checking for existing segment:", err);
      return null;
    }
  };
  const handleOuterMatchTypeChange = (e) => {
    setSegment({ ...segment, outerMatchType: e.target.value });
  };

  const handleEntityChange = (e) => {
    setSegment({ ...segment, entity: e.target.value });
  };

  const handleSaveAndDeploy = async (status) => {
    try {
      const isValid = await validateConditions();
      if (!isValid) return;

      const segmentId = await checkSegmentExists();
      if (segmentId) {
        alert(`Segment with the same name already exists.`);
        return;
      }

      const selectedObjectType = objectTypes.find((type) => type.name === segment.entity);
      if (!selectedObjectType) {
        alert('Please select a valid object type.');
        return null;
      }

      const updatedSegment = { 
        ...segment, 
        objectTypeId: selectedObjectType.id,
        ...(location.state?.opportunityId && { id: location.state.opportunityId })
      };

      const newSegmentId = await saveOrDeploySegment(updatedSegment, status);

      if (newSegmentId) {
        // If status is 'ACTIVE', call the endpoint
        if (status === 'ACTIVE') {
          const token = localStorage.getItem('sb-access-token');
          const baseUrl = import.meta.env.VITE_API_BASE_URL;
          const response = await fetch(`${baseUrl}/activate_segment`, {
            method: 'POST',
            headers: { "Content-Type": "application/json" ,
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ segment_id: newSegmentId }),
          });

          if (response.status !== 200) {
            toast.error('Failed to activate segment');
          }
        }
        toast.success(`Segment Activated Sucessfully`);
        setExistingSegmentId(newSegmentId);
        navigate('/segments');
        return newSegmentId;
      }
    } catch (error) {
      console.error(`Error ${status === 'ACTIVE' ? 'deploying' : 'saving'} segment:`, error);
      return null;
    }
  };

  const addGroup = () => {
    setSegment((prevSegment) => ({
      ...prevSegment,
      conditionGroups: [...prevSegment.conditionGroups, { matchType: 'all', conditions: [] }],
    }));
  };

  const updateGroup = (index, updatedGroup) => {
    setSegment((prevSegment) => {
      const updatedGroups = [...prevSegment.conditionGroups];
      updatedGroups[index] = updatedGroup;
      return { ...prevSegment, conditionGroups: updatedGroups };
    });
  };

  const removeGroup = (index) => {
    setSegment((prevSegment) => ({
      ...prevSegment,
      conditionGroups: prevSegment.conditionGroups.filter((_, i) => i !== index),
    }));
  };

  const checkAndFetchSegment = async () => {
    try {
      setLoading(true); 
      if (!segment.outerMatchType) {
        console.error("outerMatchType is undefined");
        alert("Please select an outer match type.");
        return;
      }

      const backendConditions = transformConditionsToBackend(segment.conditionGroups, segment.outerMatchType);
      console.log("Transformed Conditions:", backendConditions);
      await fetchSegmentSample({ backendConditions });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSegmentSample = async ({ backendConditions }) => {
    try {
      const token = localStorage.getItem('sb-access-token');
      const baseUrl = import.meta.env.VITE_API_BASE_URL;
      const response = await fetch(`${baseUrl}/get_segment_sample`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" ,
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ segment_info: backendConditions }), 
      });

      const data = await response.json();
      console.log(data);

      if (data.status === 'success') {
        setSegmentData(data.segment_companies);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const validateConditions = async () => {
    if (!segment.name || !segment.entity) {
      alert('Please fill in all required fields.');
      return false;
    }

    if (!segment.outerMatchType) {
      alert('Please select an outer match type (ALL or ANY).');
      return false;
    }

    if (segment.conditionGroups.length === 0) {
      alert('Please add at least one condition group.');
      return false;
    }

    for (const group of segment.conditionGroups) {
      if (group.conditions.length === 0) {
        alert('Each condition group must have at least one condition.');
        return false;
      }

      for (const condition of group.conditions) {
        if (!condition.filters || condition.filters.length === 0) {
          alert('Each condition must have at least one valid filter.');
          return false;
        }

        for (const filter of condition.filters) {
          if (!filter.attribute || !filter.operator || !filter.value1) {
            alert('Each filter must have a valid attribute and value.');
            return false;
          }

          if (filter.operator === "BETWEEN" && !filter.value2) {
            alert('Filter with "BETWEEN" operator must have both value1 and value2.');
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleOutputTableClick = async () => {
    const isValid = await validateConditions();
    if (!isValid) {
      console.error("Validation failed! Output Table won't load.");
      return;
    }

    console.log("Validation passed. Fetching segment sample...");
    setActiveTab('output');
    await checkAndFetchSegment();
  };

  return (
    <div className="min-h-screen bg-white p-6 flex flex-col items-center">
      <div className="w-full max-w-full flex justify-between items-center mb-6">
        <div className="breadcrumbs text-sm">
          <ul>
            <li>
              <a onClick={() => navigate('/')} className="cursor-pointer">
                Home
              </a>
            </li>
            <li>
              <a onClick={() => navigate('/segments')} className="cursor-pointer">
                Segments
              </a>
            </li>
            <li>Segment Builder</li>
          </ul>
        </div>

        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => handleSaveAndDeploy('DRAFT')} 
            size="sm" 
            className="rounded-full"
          >
            {existingSegmentId ? 'Update' : 'Save & Close'}
          </Button>
          <Button 
            color="primary" 
            onClick={() => handleSaveAndDeploy('ACTIVE')} 
            size="sm" 
            className="rounded-full"
          >
            {existingSegmentId ? 'Update & Deploy' : 'Deploy'}
          </Button>
        </div>
      </div>

      <Card className="card w-full max-w-max bg-base-100 shadow-lg p-6 border">
        <h1 className="text-2xl font-bold text-gray-700 mb-4">
          {existingSegmentId ? 'Edit Segment' : 'Build Segment'}
        </h1>
        <p className="text-gray-600 mb-6">
          Group and filter contacts in your lead database, enabling targeted segmentation and activity tracking for use in automated actions.
        </p>

        <Form segment={segment} setSegment={setSegment} />

        <Tabs className="tabs w-full mb-4 border-b">
          <Tab 
            className={`tab tab-bordered ${activeTab === 'segment' ? 'tab-active bg-blue-600 text-white w-full' : ''}`} 
            onClick={() => setActiveTab('segment')}
          >
            Segment Builder
          </Tab>
          <Tab 
            className={`tab tab-bordered ${activeTab === 'output' ? 'tab-active bg-blue-600 text-white w-full' : ''}`} 
            onClick={handleOutputTableClick} 
            disabled={loading}
          >
            {loading ? "Fetching..." : "Output Table"}
          </Tab>
        </Tabs>

        {activeTab === 'segment' ? (
          <>
            <div className="flex items-center space-x-2 mb-4">
              <span>Meet</span>
              <Select
                value={segment.outerMatchType}
                onChange={handleOuterMatchTypeChange}
                className="select-bordered w-25 select-sm"
              >
                <option value="all">All</option>
                <option value="any">Any</option>
              </Select>
              <span>of the following criteria</span>
            </div>

            {segment.conditionGroups.map((group, index) => (
              <ConditionGroup
                key={index}
                conditionGroup={group}
                onUpdate={(updatedGroup) => updateGroup(index, updatedGroup)}
                onRemove={() => removeGroup(index)}
                index={index}
              />
            ))}
            <Button 
              onClick={addGroup} 
              className="btn-block mt-4" 
              variant="outline" 
              color="primary" 
              size="md"
            >
              + Add Group
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <span className="loading loading-spinner loading-lg text-blue-600"></span>
                <span className="text-blue-600 mt-2">Fetching output data...</span>
              </div>
            ) : error ? (
              <span className="text-red-500">{error}</span>
            ) : segmentData && segmentData.length > 0 ? (
              <OutputTable data={segmentData} />
            ) : (
              <span className="text-gray-400">No data available. Please save or deploy the segment first.</span>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}