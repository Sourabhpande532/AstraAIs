import React from 'react';
import AstraCard from '../ui/AstraCard';
import EmptyState from '../ui/EmptyState';
import { FaCalendarAlt } from 'react-icons/fa';

interface UpcomingMeetingsProps {
  meetings: any[];
}

const UpcomingMeetingsCard: React.FC<UpcomingMeetingsProps> = ({ meetings }) => {
  return (
    <AstraCard 
      title="Upcoming Meetings" 
      icon={<FaCalendarAlt />} 
      headerIconStyle={{ color: '#ed8936' }} 
      bodyClass="p-0"
    >
      {meetings.length === 0 ? (
        <EmptyState message="No upcoming meetings." />
      ) : (
        meetings.map((meeting) => (
          <div key={meeting._id} className="astra-list-item px-4">
            <div>
              <div className="meeting-title">{meeting.title}</div>
              <div className="meeting-date">
                <FaCalendarAlt size={10} className="me-1" />
                {new Date(meeting.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
            </div>
          </div>
        ))
      )}
    </AstraCard>
  );
};

export default UpcomingMeetingsCard;
