import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PropTypes from 'prop-types';
import { HiUserGroup, HiClock } from 'react-icons/hi';

import Card from '@/components/daisyui/Card/Card';
import Alert from '@/components/daisyui/Alert/Alert';
import { supabaseSegments } from '@/helpers/supabaseClient';

// Remove mock data as we'll fetch from the database

const OpportunityCard = ({ opportunity, onClick }) => {
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => onClick(opportunity)}>
      <div className="p-4">
        <h2 className="text-base font-semibold text-base-content/80 mb-2">
          {opportunity.name}
        </h2>
        <p className="text-base-content/70 mb-4">
          {opportunity.description}
        </p>
        <div className="flex justify-between items-center mt-4 pt-3 border-t border-base-300">
          <div className="flex items-center gap-1">
            <HiUserGroup className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">{opportunity.size.toLocaleString()}</span>
            <span className="text-sm text-base-content/60">accounts</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-base-content/60">
            <HiClock className="h-4 w-" />
            <span>Updated {format(new Date(opportunity.last_updated), 'MMM d, yyyy')}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

OpportunityCard.propTypes = {
  opportunity: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    size: PropTypes.number.isRequired,
    last_updated: PropTypes.string.isRequired,
    segment_structure: PropTypes.object.isRequired
  }).isRequired,
  onClick: PropTypes.func.isRequired
};

export default function AutoSegment() {
  const navigate = useNavigate();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        setLoading(true);
        console.log('Fetching opportunities from Supabase...');
        const { data, error } = await supabaseSegments
          .from('opportunities')
          .select('id, name, description, size, last_updated, segment_structure');
        
        console.log('Supabase response:', { data, error });
        
        if (error) {
          throw error;
        }
        
        console.log('Setting opportunities:', data);
        setOpportunities(data || []);
      } catch (error) {
        console.error('Error fetching opportunities:', error);
        setError('Failed to load opportunities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchOpportunities();
  }, []);

  const handleOpportunityClick = (opportunity) => {
    // Navigate to segment builder with the opportunity data
    navigate('/segment-builder', { 
      state: { 
        opportunityId: opportunity.id,
        segmentStructure: opportunity.segment_structure
      } 
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>Loading opportunities...</Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert type="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2">Auto-Segment</h1>
      <p className="text-base-content/70 mb-8">
        Select an opportunity to start building your segment
      </p>
      
      {opportunities.length === 0 ? (
        <Alert>No opportunities found. Please check back later.</Alert>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opportunity) => (
            <div key={opportunity.id}>
              <OpportunityCard 
                opportunity={opportunity} 
                onClick={handleOpportunityClick}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}