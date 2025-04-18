import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '@/components/daisyui/Badge/Badge';  
import Button from '@/components/daisyui/Button/Button';
import { supabaseSegments } from '../../../helpers/supabaseClient.js';
import RenderTable from '../../reuseable/RenderTable.jsx';

export function ActionsContent({ segmentId }) {
  const navigate = useNavigate();

  console.log("Segment ID:", segmentId);

  const [actions, setActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActions = async (segmentId) => {
    if (!segmentId) {
      console.warn("No segmentId provided!"); 
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log("Fetching actions for segment:", segmentId); 

      const { data: actionsData, error: actionsError } = await supabaseSegments.rpc(
        "get_workflow_actions_by_segment", { p_segment_id: segmentId }
      );

      if (actionsError) throw actionsError;
      
      console.log("Fetched Actions:", actionsData); 

      setActions(actionsData || []);
    } catch (error) {
      console.error("Error fetching actions:", error.message); 
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (segmentId) fetchActions(segmentId);
  }, [segmentId]);

  const columns = [
    { label: 'Name', key: 'name' },
    { label: 'Action Type', key: 'actiontype' },
    { label: 'Size', key: 'size' },
    { 
      label: 'Last Executed', 
      key: 'lastexecuted', 
      format: (value) => 
        value ? new Date(value).toLocaleString() : 'N/A'
    }, 
    { label: 'Status', key: 'status' },
  ];
  
  

  return (
    <div className="p-4 bg-white rounded-lg">
      <div className="flex justify-end items-center mb-4">
        <Button
          className="btn btn-primary"
          onClick={() => navigate('/create-action')}
          aria-label="Add a new action"
        >
          Add Action
        </Button>
      </div>

      <RenderTable 
        columns={columns} 
        data={actions} 
        renderActions={(row) => (
          <Badge className="text-xs uppercase">
            {row.status.charAt(0).toUpperCase() + row.status.slice(1).toLowerCase()}
          </Badge>
        )}
      />
    </div>
  );
}

export default ActionsContent;
