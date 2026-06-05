import React from 'react';
import AstraCard from '../ui/AstraCard';
import EmptyState from '../ui/EmptyState';
import { FaUmbrellaBeach } from 'react-icons/fa';

interface RecentLeavesProps {
  leaves: any[];
}

const RecentLeavesCard: React.FC<RecentLeavesProps> = ({ leaves }) => {
  return (
    <AstraCard 
      title="Recent Leaves" 
      icon={<FaUmbrellaBeach />} 
      headerIconStyle={{ color: '#48bb78' }} 
      bodyClass="p-0"
    >
      {leaves.length === 0 ? (
        <EmptyState message="No recent leave requests." />
      ) : (
        leaves.slice(0, 4).map((leave) => (
          <div key={leave._id} className="astra-list-item px-4">
            <div>
              <div className="leave-type-name d-flex align-items-center">
                <span className={`leave-type-dot dot-${leave.type}`}></span>
                {leave.type}
              </div>
              <div className="leave-date">{new Date(leave.createdAt).toLocaleDateString()}</div>
            </div>
            <span className="leave-days-pill">{leave.days} Day{leave.days > 1 ? 's' : ''}</span>
          </div>
        ))
      )}
    </AstraCard>
  );
};

export default RecentLeavesCard;
