import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { supabaseSegments } from '../../../helpers/supabaseClient.js';
import Badge from '@/components/daisyui/Badge/Badge';  

const operatorLabels = {
  EQ: 'equals to',
  NEQ: 'not equal to',
  GT: 'greater than',
  GTE: 'greater than or equal to',
  LT: 'less than',
  LTE: 'less than or equal to',
  BETWEEN: 'between',
  NOT_BETWEEN: 'not between',
  CONTAINS: 'contains',
  NOT_CONTAINS: 'does not contain',
  STARTS_WITH: 'starts with',
  ENDS_WITH: 'ends with',
  IN: 'in',
  NOT_IN: 'not in',
  IS_EMPTY: 'is empty',
  IS_NOT_EMPTY: 'is not empty',
  IS_TRUE: 'is true',
  IS_FALSE: 'is false',
};

export function CriteriaContent({ segmentId, objectType, operator }) {
  console.log("Received props in CriteriaContent:", { segmentId, objectType, operator });

  const [criteriaData, setCriteriaData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!segmentId) return; 

    const fetchSegmentDetails = async () => {
      try {
        setLoading(true);

        const { data: criteria, error: criteriaError } = await supabaseSegments.rpc(
          'get_segment_criteria',
          { segment_id: segmentId } 
        );

        if (criteriaError) throw criteriaError;

        console.log('Fetched Criteria Data:', criteria);
        setCriteriaData(criteria || []);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSegmentDetails();
  }, [segmentId]);

  if (loading) return <div>Loading criteria...</div>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl text-gray-600 mb-4">
        Segment of <span className="text-black font-semibold">{objectType ?? "N/A"}</span> that
      </h2>
      <p className="text-gray-600 mb-4 mt-2">
        Meet <Badge color="neutral" size="md" className="text-white">{operator ?? "ALL"}</Badge> of the following criteria:
      </p>
      <div className="border border-gray-300 rounded-lg p-4 bg-white">
        {criteriaData.length > 0 ? (
          criteriaData.map((group) => (
            <div key={group?.condition_group_id ?? "N/A"} className="mb-4 border rounded-lg">
              <h3 className="text-md font-semibold bg-white py-2 px-4">
                Meet <Badge color="info" size="md">{group?.condition_group_operator ?? "N/A"}</Badge> of the following criteria in the condition group
              </h3>
              <div className="p-4 bg-white rounded-b-lg">
                <ul className="space-y-3">
                  {(group?.rule_set_groups ?? []).map((ruleSetGroup, idx) => (
                    <div key={idx} className="mb-2">
                      {ruleSetGroup?.rule_sets?.map((ruleSet, ruleSetIdx) => (
                        <div key={ruleSetIdx} className="ml-4 mt-2">
                          <ul className="pl-6 border-l-2 border-gray-300 mt-2">
                            {ruleSet?.rules?.map((rule, ruleIndex) => (
                              <li key={ruleIndex} className="flex items-center space-x-3">
                                <p className="text-gray-800 flex items-center">
                                  <span className="font-bold">{rule?.entity_name ?? "N/A"}</span>
                                  <span className="mx-2 text-gray-700">→</span>
                                  <span className="font-bold">{rule?.attribute_label ?? "N/A"}</span>
                                  <span className="mx-2 text-gray-700">
                                    <Badge variant="outline" size="md">{operatorLabels[rule?.comparison_operator] ?? rule?.comparison_operator ?? "N/A"}</Badge>
                                  </span>
                                 
                                  <span className="text-black mr-2">
  {rule?.value1 instanceof Date ? rule.value1.toLocaleDateString() : rule?.value1 ?? "N/A"}
</span>

{rule?.value2 && (
  <>
    <span>and</span>
    <span className="text-black ml-2">
      {rule.value2 instanceof Date ? rule.value2.toLocaleDateString() : rule.value2}
    </span>
  </>
)}
                        </p>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  ))}
                </ul>
              </div>
            </div>
          ))
        ) : (
          <p>No criteria data available for this segment.</p>
        )}
      </div>
    </div>
  );
}

CriteriaContent.propTypes = {
  segmentId: PropTypes.string.isRequired,
  objectType: PropTypes.string.isRequired,
  operator: PropTypes.string,
};

export default CriteriaContent;
