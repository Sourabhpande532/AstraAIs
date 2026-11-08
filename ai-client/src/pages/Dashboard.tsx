import { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchDashboardData } from '../store/dashboardSlice';
import LeaveBalanceCard from '../components/dashboard/LeaveBalanceCard';
import RecentLeavesCard from '../components/dashboard/RecentLeavesCard';
import UpcomingMeetingsCard from '../components/dashboard/UpcomingMeetingsCard';
import AiBanner from '../components/dashboard/AiBanner';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { FaSyncAlt, FaTerminal, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { leaves, meetings, status, error } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  const metrics = useMemo(() => {
    const sick = user?.leaveBalance?.sick ?? 0;
    const casual = user?.leaveBalance?.casual ?? 0;
    const earned = user?.leaveBalance?.earned ?? 0;
    const totalAvailable = sick + casual + earned;
    const totalUsedDays = leaves.reduce((acc, item) => acc + (Number(item.days) || 0), 0);
    return {
      totalAvailable,
      totalUsedDays,
      leaveCount: leaves.length,
      meetingCount: meetings.length,
    };
  }, [user?.leaveBalance, leaves, meetings]);

  if (status === 'loading' && leaves.length === 0 && meetings.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <div className="astra-page fade-up">
      {/* Aligned Page Header */}
      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3 mb-4">
        <div>
          <h1 className="astra-page-title mb-1">My Dashboard</h1>
          <p className="astra-page-subtitle mb-0">
            Overview of your leaves, meetings, and activities.
          </p>
        </div>

        <div className="astra-dashboard-actions d-flex align-items-center gap-2 flex-wrap">
          <button
            type="button"
            className="astra-action-btn-secondary"
            onClick={() => dispatch(fetchDashboardData())}
            disabled={status === 'loading'}
            title="Sync latest records from database"
          >
            <FaSyncAlt className={status === 'loading' ? 'spin' : ''} size={12} />
            <span>{status === 'loading' ? 'Syncing...' : 'Refresh'}</span>
          </button>
          <button
            type="button"
            className="astra-action-btn-primary"
            onClick={() => window.dispatchEvent(new CustomEvent('astra:open-terminal'))}
          >
            <FaTerminal size={12} />
            <span>AI Terminal</span>
          </button>
        </div>
      </div>

      {status === 'failed' && error && (
        <div className="astra-alert-error d-flex align-items-center justify-content-between flex-wrap gap-2 mb-4" role="alert">
          <div className="d-flex align-items-center gap-2">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
          <button
            type="button"
            className="astra-inline-action"
            onClick={() => dispatch(fetchDashboardData())}
          >
            Retry Now
          </button>
        </div>
      )}

      {/* KPI Summary Strip */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="astra-kpi-card">
            <div className="astra-kpi-label">Available Leave Quota</div>
            <div className="astra-kpi-value">{metrics.totalAvailable} <span className="astra-kpi-unit">/ 37 Days</span></div>
            <div className="astra-kpi-meta text-emerald">Annual balance active</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="astra-kpi-card">
            <div className="astra-kpi-label">Leave Requests</div>
            <div className="astra-kpi-value">{metrics.leaveCount} <span className="astra-kpi-unit">({metrics.totalUsedDays}d taken)</span></div>
            <div className="astra-kpi-meta">Auto-validated via AI</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="astra-kpi-card">
            <div className="astra-kpi-label">Upcoming Meetings</div>
            <div className="astra-kpi-value">{metrics.meetingCount} <span className="astra-kpi-unit">Scheduled</span></div>
            <div className="astra-kpi-meta">Synced in real time</div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="astra-kpi-card">
            <div className="astra-kpi-label">Agentic HR Status</div>
            <div className="astra-kpi-value d-flex align-items-center gap-2" style={{ fontSize: '1.1rem' }}>
              <FaCheckCircle style={{ color: '#10b981' }} />
              <span>Ready</span>
            </div>
            <div className="astra-kpi-meta">RAG &amp; Tool Calling active</div>
          </div>
        </div>
      </div>

      {/* Main 3-Column Operational Grid */}
      <div className="row g-3 g-lg-4">
        <div className="col-12 col-md-6 col-lg-4">
          <LeaveBalanceCard balances={user?.leaveBalance} />
        </div>
        <div className="col-12 col-md-6 col-lg-4">
          <RecentLeavesCard leaves={leaves} />
        </div>
        <div className="col-12 col-lg-4">
          <UpcomingMeetingsCard meetings={meetings} />
        </div>
      </div>

      <AiBanner />
    </div>
  );
};

export default Dashboard;
