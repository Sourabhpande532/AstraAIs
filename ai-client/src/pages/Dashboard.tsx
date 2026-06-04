import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchDashboardData } from '../store/dashboardSlice';
import { FaCalendarAlt, FaUmbrellaBeach, FaRobot } from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { leaves, meetings, status } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (status === 'loading') return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
      <div className="spinner-border text-info" style={{ width: '3rem', height: '3rem', opacity: 0.5 }} />
    </div>
  );

  return (
    <div className="astra-page fade-up">
      <h1 className="astra-page-title">My Dashboard</h1>
      <p className="astra-page-subtitle">Overview of your leaves, meetings, and activities.</p>
      
      <div className="row g-4">
        {/* Leave Balances */}
        <div className="col-lg-4">
          <div className="astra-card h-100">
            <div className="astra-card-header">
              <FaUmbrellaBeach className="astra-card-icon text-info" />
              <h3 className="astra-card-title">Leave Balances</h3>
            </div>
            <div className="astra-card-body">
              <div className="leave-balance-item">
                <div className="leave-label">
                  <span className="leave-name">Sick Leave</span>
                  <span className="leave-badge leave-badge-sick">{user?.leaveBalance.sick} Days</span>
                </div>
                <div className="leave-bar-track">
                  <div className="leave-bar-fill leave-bar-sick" style={{ width: `${Math.min(100, (user?.leaveBalance.sick || 0) * 10)}%` }}></div>
                </div>
              </div>
              
              <div className="leave-balance-item">
                <div className="leave-label">
                  <span className="leave-name">Casual Leave</span>
                  <span className="leave-badge leave-badge-casual">{user?.leaveBalance.casual} Days</span>
                </div>
                <div className="leave-bar-track">
                  <div className="leave-bar-fill leave-bar-casual" style={{ width: `${Math.min(100, (user?.leaveBalance.casual || 0) * 10)}%` }}></div>
                </div>
              </div>
              
              <div className="leave-balance-item">
                <div className="leave-label">
                  <span className="leave-name">Earned Leave</span>
                  <span className="leave-badge leave-badge-earned">{user?.leaveBalance.earned} Days</span>
                </div>
                <div className="leave-bar-track">
                  <div className="leave-bar-fill leave-bar-earned" style={{ width: `${Math.min(100, (user?.leaveBalance.earned || 0) * 5)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Requests */}
        <div className="col-lg-4">
          <div className="astra-card h-100">
            <div className="astra-card-header">
              <FaUmbrellaBeach className="astra-card-icon" style={{ color: '#48bb78' }} />
              <h3 className="astra-card-title">Recent Leaves</h3>
            </div>
            <div className="astra-card-body p-0">
              {leaves.length === 0 ? (
                <div className="astra-empty">No recent leave requests.</div>
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
            </div>
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="col-lg-4">
          <div className="astra-card h-100">
            <div className="astra-card-header">
              <FaCalendarAlt className="astra-card-icon" style={{ color: '#ed8936' }} />
              <h3 className="astra-card-title">Upcoming Meetings</h3>
            </div>
            <div className="astra-card-body p-0">
              {meetings.length === 0 ? (
                <div className="astra-empty">No upcoming meetings.</div>
              ) : (
                meetings.map((meeting) => (
                  <div key={meeting._id} className="astra-list-item px-4">
                    <div>
                      <div className="meeting-title">{meeting.title}</div>
                      <div className="meeting-date">
                        <FaCalendarAlt size={10} />
                        {new Date(meeting.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="astra-ai-banner">
        <div className="astra-ai-banner-icon"><FaRobot style={{ color: '#63b3ed' }} /></div>
        <div>
          <div className="astra-ai-banner-title">AI HR Assistant is Active</div>
          <p className="astra-ai-banner-text">Use the terminal widget on the bottom right to schedule meetings, apply for leave, or ask about company policies.</p>
        </div>
        <div className="astra-ai-badge">ASTRA READY</div>
      </div>
    </div>
  );
};

export default Dashboard;
