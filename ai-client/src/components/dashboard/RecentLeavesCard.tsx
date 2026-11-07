import React, { useState, useMemo } from 'react';
import AstraCard from '../ui/AstraCard';
import EmptyState from '../ui/EmptyState';
import { FaHistory } from 'react-icons/fa';

interface RecentLeavesProps {
  leaves: any[];
}

const RecentLeavesCard: React.FC<RecentLeavesProps> = ({ leaves }) => {
  const [filterType, setFilterType] = useState<'all' | 'sick' | 'casual' | 'earned'>('all');
  const [showAll, setShowAll] = useState(false);

  const filteredLeaves = useMemo(() => {
    if (filterType === 'all') return leaves;
    return leaves.filter((l) => String(l.type).toLowerCase() === filterType);
  }, [leaves, filterType]);

  const visibleLeaves = showAll ? filteredLeaves : filteredLeaves.slice(0, 4);

  return (
    <AstraCard
      title="Recent Leaves"
      icon={<FaHistory />}
      headerIconStyle={{ color: '#06b6d4' }}
      bodyClass="p-0 d-flex flex-column justify-content-between"
      headerAction={
        <span className="astra-header-pill">
          {leaves.length} {leaves.length === 1 ? 'Request' : 'Requests'}
        </span>
      }
    >
      <div>
        {leaves.length > 0 && (
          <div className="px-3 py-2 d-flex gap-1 flex-wrap" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {(['all', 'sick', 'casual', 'earned'] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFilterType(type)}
                className={`astra-filter-chip ${filterType === type ? 'active' : ''}`}
              >
                {type === 'all' ? 'All' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        {filteredLeaves.length === 0 ? (
          <EmptyState
            message={
              leaves.length === 0
                ? 'No recent leave requests yet. Use the AI Terminal to apply in seconds.'
                : `No ${filterType} leave requests found.`
            }
          />
        ) : (
          visibleLeaves.map((leave) => {
            const status = String(leave.status || 'approved').toLowerCase();
            return (
              <div key={leave._id} className="astra-list-item">
                <div className="pe-2" style={{ minWidth: 0 }}>
                  <div className="leave-type-name d-flex align-items-center flex-wrap gap-2">
                    <span className="d-inline-flex align-items-center">
                      <span className={`leave-type-dot dot-${leave.type}`}></span>
                      {leave.type} Leave
                    </span>
                    <span className={`astra-status-badge status-${status}`}>
                      {status}
                    </span>
                  </div>
                  {leave.reason && leave.reason !== 'Not specified' && (
                    <div className="leave-reason text-truncate" title={leave.reason}>
                      {leave.reason}
                    </div>
                  )}
                  <div className="leave-date">
                    {leave.createdAt ? new Date(leave.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recent'}
                  </div>
                </div>
                <span className="leave-days-pill flex-shrink-0">
                  {leave.days} Day{leave.days > 1 ? 's' : ''}
                </span>
              </div>
            );
          })
        )}
      </div>

      {filteredLeaves.length > 4 && (
        <div className="px-3 py-2 text-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <button
            type="button"
            className="astra-inline-action"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show Less' : `View All ${filteredLeaves.length} Requests`}
          </button>
        </div>
      )}
    </AstraCard>
  );
};

export default React.memo(RecentLeavesCard);
