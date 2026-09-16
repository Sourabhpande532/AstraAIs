import React from 'react';
import AstraCard from '../ui/AstraCard';
import EmptyState from '../ui/EmptyState';
import { FaCalendarAlt } from 'react-icons/fa';

interface UpcomingMeetingsProps {
  meetings: any[];
}

const UpcomingMeetingsCard: React.FC<UpcomingMeetingsProps> = ({ meetings }) => {
  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    } catch {
      return dateStr;
    }
  };

  return (
    <AstraCard 
      title="Upcoming Meetings" 
      icon={<FaCalendarAlt />} 
      headerIconStyle={{ color: '#f59e0b' }} 
      bodyClass="p-0"
    >
      {meetings.length === 0 ? (
        <EmptyState message="No upcoming meetings." />
      ) : (
        meetings.map((meeting) => (
          <div key={meeting._id} className="astra-list-item">
            <div>
              <div className="meeting-title">{meeting.title}</div>
              <div className="meeting-date">
                <FaCalendarAlt size={10} className="me-1" />
                {formatDate(meeting.date)}
              </div>
            </div>
          </div>
        ))
      )}
    </AstraCard>
  );
};

export default React.memo(UpcomingMeetingsCard);
