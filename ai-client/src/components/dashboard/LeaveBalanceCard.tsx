import React from 'react';
import AstraCard from '../ui/AstraCard';
import { FaUmbrellaBeach } from 'react-icons/fa';

interface LeaveBalanceProps {
  balances?: { sick: number; casual: number; earned: number };
}

const ENTITLEMENTS = {
  sick: 10,
  casual: 12,
  earned: 15,
};

const LeaveBalanceCard: React.FC<LeaveBalanceProps> = ({ balances }) => {
  const sick = balances?.sick ?? 0;
  const casual = balances?.casual ?? 0;
  const earned = balances?.earned ?? 0;

  const totalRemaining = sick + casual + earned;
  const totalEntitlement = ENTITLEMENTS.sick + ENTITLEMENTS.casual + ENTITLEMENTS.earned;

  const sickPct = Math.min(100, Math.max(0, Math.round((sick / ENTITLEMENTS.sick) * 100)));
  const casualPct = Math.min(100, Math.max(0, Math.round((casual / ENTITLEMENTS.casual) * 100)));
  const earnedPct = Math.min(100, Math.max(0, Math.round((earned / ENTITLEMENTS.earned) * 100)));

  return (
    <AstraCard
      title="Leave Balances"
      icon={<FaUmbrellaBeach />}
      headerIconStyle={{ color: '#10b981' }}
      headerAction={
        <span className="astra-header-pill">
          {totalRemaining} / {totalEntitlement} Days Left
        </span>
      }
    >
      <div className="leave-balance-item">
        <div className="leave-label">
          <div className="d-flex flex-wrap align-items-baseline gap-1">
            <span className="leave-name">Sick Leave</span>
            <span className="leave-subtext">Paid medical quota</span>
          </div>
          <span className="leave-badge leave-badge-sick">
            {sick} / {ENTITLEMENTS.sick} Days
          </span>
        </div>
        <div className="leave-bar-track" role="progressbar" aria-valuenow={sick} aria-valuemin={0} aria-valuemax={ENTITLEMENTS.sick} aria-label="Sick leave balance">
          <div className="leave-bar-fill leave-bar-sick" style={{ width: `${sickPct}%` }}></div>
        </div>
      </div>

      <div className="leave-balance-item">
        <div className="leave-label">
          <div className="d-flex flex-wrap align-items-baseline gap-1">
            <span className="leave-name">Casual Leave</span>
            <span className="leave-subtext">Personal &amp; urgent</span>
          </div>
          <span className="leave-badge leave-badge-casual">
            {casual} / {ENTITLEMENTS.casual} Days
          </span>
        </div>
        <div className="leave-bar-track" role="progressbar" aria-valuenow={casual} aria-valuemin={0} aria-valuemax={ENTITLEMENTS.casual} aria-label="Casual leave balance">
          <div className="leave-bar-fill leave-bar-casual" style={{ width: `${casualPct}%` }}></div>
        </div>
      </div>

      <div className="leave-balance-item">
        <div className="leave-label">
          <div className="d-flex flex-wrap align-items-baseline gap-1">
            <span className="leave-name">Earned Leave</span>
            <span className="leave-subtext">Annual privilege</span>
          </div>
          <span className="leave-badge leave-badge-earned">
            {earned} / {ENTITLEMENTS.earned} Days
          </span>
        </div>
        <div className="leave-bar-track" role="progressbar" aria-valuenow={earned} aria-valuemin={0} aria-valuemax={ENTITLEMENTS.earned} aria-label="Earned leave balance">
          <div className="leave-bar-fill leave-bar-earned" style={{ width: `${earnedPct}%` }}></div>
        </div>
      </div>

      <div className="astra-card-footer-note mt-3 pt-3">
        <span>Policy: Section 4.1 Annual Quota</span>
        <button
          type="button"
          className="astra-inline-action"
          onClick={() =>
            window.dispatchEvent(
              new CustomEvent('astra:open-terminal', {
                detail: { prompt: 'Apply for 1 day sick leave, I have a fever', autoSend: false },
              })
            )
          }
        >
          + Request Leave via AI
        </button>
      </div>
    </AstraCard>
  );
};

export default React.memo(LeaveBalanceCard);
