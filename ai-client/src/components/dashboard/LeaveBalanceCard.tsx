import React from 'react';
import AstraCard from '../ui/AstraCard';
import { FaUmbrellaBeach } from 'react-icons/fa';

interface LeaveBalanceProps {
  balances?: { sick: number; casual: number; earned: number };
}

const LeaveBalanceCard: React.FC<LeaveBalanceProps> = ({ balances }) => {
  return (
    <AstraCard 
      title="Leave Balances" 
      icon={<FaUmbrellaBeach />} 
      headerIconStyle={{ color: '#0dcaf0' }} 
    >
      <div className="leave-balance-item">
        <div className="leave-label">
          <span className="leave-name">Sick Leave</span>
          <span className="leave-badge leave-badge-sick">{balances?.sick} Days</span>
        </div>
        <div className="leave-bar-track">
          <div className="leave-bar-fill leave-bar-sick" style={{ width: `${Math.min(100, (balances?.sick || 0) * 10)}%` }}></div>
        </div>
      </div>
      
      <div className="leave-balance-item">
        <div className="leave-label">
          <span className="leave-name">Casual Leave</span>
          <span className="leave-badge leave-badge-casual">{balances?.casual} Days</span>
        </div>
        <div className="leave-bar-track">
          <div className="leave-bar-fill leave-bar-casual" style={{ width: `${Math.min(100, (balances?.casual || 0) * 10)}%` }}></div>
        </div>
      </div>
      
      <div className="leave-balance-item">
        <div className="leave-label">
          <span className="leave-name">Earned Leave</span>
          <span className="leave-badge leave-badge-earned">{balances?.earned} Days</span>
        </div>
        <div className="leave-bar-track">
          <div className="leave-bar-fill leave-bar-earned" style={{ width: `${Math.min(100, (balances?.earned || 0) * 5)}%` }}></div>
        </div>
      </div>
    </AstraCard>
  );
};

export default LeaveBalanceCard;
