import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabaseSegments } from '../../helpers/supabaseClient.js';
import { CriteriaContent } from './content/CriteriaContent';
import { RecordsContent } from './content/RecordsContent';
import { ChangesContent } from './content/ChangesContent';
import { ActionsContent } from './content/ActionsContent';
import Badge from '@/components/daisyui/Badge/Badge'; 
import Button from '@/components/daisyui/Button/Button'; 
import Breadcrumbs from '@/components/daisyui/Breadcrumbs/Breadcrumbs'; 
import BreadcrumbsItem from '../daisyui/Breadcrumbs/BreadcrumbsItem.jsx';

export default function SegmentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [segment, setSegment] = useState(null);
  const [objectName, setObjectName] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('Criteria');

  // Function to archive a segment
  const handleArchive = async () => {
    try {
      setLoading(true);
      const { error } = await supabaseSegments
        .from('segments')
        .update({ status: 'ARCHIVED' })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setSegment(prev => prev ? { ...prev, status: 'ARCHIVED' } : null);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchSegment = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabaseSegments
          .from('segments')
          .select('name, description, status, logical_operator, object_type_id')
          .eq('id', id)
          .single();

        if (error) throw error;
        setSegment(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSegment();
  }, [id]);

  console.log(segment);
  useEffect(() => {
    const fetchObjectTypes = async () => {
      if (!segment?.object_type_id) return; // Ensure object_type_id is available

      try {
        setLoading(true);
        const { data, error } = await supabaseSegments
          .from('object_types')
          .select('name')
          .eq('id', segment.object_type_id)
          .single();

        if (error) throw error;
        setObjectName(data?.name || 'Unknown'); // Store object name
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchObjectTypes();
  }, [segment?.object_type_id]); // Run only when object_type_id changes

  const renderTabContent = useCallback(() => {
    if (!segment || !objectName) return null; // Ensure segment and objectName are loaded

    switch (activeTab) {
      case 'Criteria':
        return (
          <CriteriaContent
            segmentId={id}
            objectType={objectName}
            operator={segment?.logical_operator}
          />
        );
      case 'Records':
        return <RecordsContent />;
      case 'Changes':
        return <ChangesContent segmentId={id}/>;
      case 'Actions':
        return <ActionsContent segmentId={id}/>;
      default:
        return null;
    }
  }, [activeTab, id, segment, objectName]); // Include dependencies

  if (loading) return <div className="loading loading-spinner loading-lg text-center">Loading segment details...</div>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6 bg-white min-h-screen">
      {/* Breadcrumb Navigation */}
      <Breadcrumbs>
        <BreadcrumbsItem href="/segments">Segments</BreadcrumbsItem>
        <BreadcrumbsItem active>{segment?.name || 'Unknown Segment'}</BreadcrumbsItem>
      </Breadcrumbs>
  
      {/* Title and Status */}
      <div className="flex items-center justify-between mt-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">{segment?.name || 'Unnamed Segment'}</h1>
          <p className="text-gray-600 mt-2">
            {segment?.description || 'No description available.'}
          </p>
        </div>
  
        {/* Status and Archive Button */}
        <div className="flex items-center space-x-4 text-sm">
          <Badge 
            size="md"
            className={`text-white ${segment?.status === 'ACTIVE' ? 'badge-success' : 'badge-error'} p-2`}
          > 
            {segment?.status ? segment.status.charAt(0).toUpperCase() + segment.status.slice(1).toLowerCase() : 'Unknown'}
          </Badge>
          {segment?.status !== 'ARCHIVED' && (
            <Button 
              size="sm" 
              color="secondary" 
              variant="outline" 
              aria-label="Archive segment"
              onClick={handleArchive}
            >
              Archive
            </Button>
          )}
        </div>
      </div>
  
      {/* Tabs */}
      
      <div className="tabs tabs-boxed w-fit flex mb-4 mt-4 p-2">
  {['Criteria', 'Records', 'Changes', 'Actions'].map((tab) => (
    <a
      key={tab}
      href="#"
      className={`tab ${activeTab === tab ? "tab-active" : "text-black hover:bg-gray-200"} text-md`}
      onClick={(e) => {
        e.preventDefault(); // Prevent default link behavior
        setActiveTab(tab);
      }}
    >
      {tab}
    </a>
  ))}
</div>

  
      {/* Tab Content */}
      <div className="mt-6">{renderTabContent()}</div>
    </div>
  );  
    
   
}
