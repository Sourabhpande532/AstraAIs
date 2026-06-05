import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store/store';
import { fetchDashboardData } from '../store/dashboardSlice';
import LeaveBalanceCard from '../components/dashboard/LeaveBalanceCard';
import RecentLeavesCard from '../components/dashboard/RecentLeavesCard';
import UpcomingMeetingsCard from '../components/dashboard/UpcomingMeetingsCard';
import AiBanner from '../components/dashboard/AiBanner';
import LoadingSpinner from '../components/ui/LoadingSpinner';

const Dashboard = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { leaves, meetings, status } = useSelector((state: RootState) => state.dashboard);

  useEffect(() => {
    dispatch(fetchDashboardData());
  }, [dispatch]);

  if (status === 'loading') return <LoadingSpinner />;

  return (
    <div className="astra-page fade-up">
      <h1 className="astra-page-title">My Dashboard</h1>
      <p className="astra-page-subtitle">Overview of your leaves, meetings, and activities.</p>
      
      <div className="row g-4">
        <div className="col-lg-4">
          <LeaveBalanceCard balances={user?.leaveBalance} />
        </div>
        <div className="col-lg-4">
          <RecentLeavesCard leaves={leaves} />
        </div>
        <div className="col-lg-4">
          <UpcomingMeetingsCard meetings={meetings} />
        </div>
      </div>
      
      <AiBanner />
    </div>
  );
};

export default Dashboard;
