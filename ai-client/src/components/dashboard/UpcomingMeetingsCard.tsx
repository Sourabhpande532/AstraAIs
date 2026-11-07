import React from 'react';
import AstraCard from '../ui/AstraCard';
import EmptyState from '../ui/EmptyState';
import { FaCalendarAlt, FaClock } from 'react-icons/fa';

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

  const getRelativeBadge = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Scheduled';
      const now = new Date();
      const diffHours = (d.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours <= 24 && d.getDate() === now.getDate()) return 'Today';
      if (diffHours <= 48) return 'Tomorrow';
      return 'Upcoming';
    } catch {
      return 'Scheduled';
    }
  };

  return (
    <AstraCard
      title="Upcoming Meetings"
      icon={<FaCalendarAlt />}
      headerIconStyle={{ color: '#f59e0b' }}
      bodyClass="p-0 d-flex flex-column justify-content-between"
      headerAction={
        <span className="astra-header-pill">
          {meetings.length} {meetings.length === 1 ? 'Event' : 'Events'}
        </span>
      }
    >
      <div>
        {meetings.length === 0 ? (
          <EmptyState message="No upcoming meetings scheduled." />
        ) : (
          meetings.map((meeting) => (
            <div key={meeting._id} className="astra-list-item">
              <div className="pe-2">
                <div className="meeting-title">{meeting.title}</div>
                <div className="meeting-date">
                  <FaClock size={11} className="me-1" />
                  {formatDate(meeting.date)}
                </div>
              </div>
              <span className="astra-meeting-tag flex-shrink-0">
                {getRelativeBadge(meeting.date)}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="px-3 py-2 d-flex justify-content-between align-items-center" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <span className="leave-subtext">Synced with AI Scheduler</span>
        <button
          type="button"
          className="astra-inline-action"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('astra:open-terminal', {
                detail: { prompt: 'Schedule a team sync for tomorrow at 3pm', autoSend: false },
              })
            )
          }
        >
          + Schedule Sync
        </button>
      </div>
    </AstraCard>
  );
};

export default React.memo(UpcomingMeetingsCard);
