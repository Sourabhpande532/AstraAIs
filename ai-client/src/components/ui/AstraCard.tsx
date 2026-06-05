import React from 'react';

interface AstraCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  bodyClass?: string;
  bodyStyle?: React.CSSProperties;
  titleClass?: string;
  headerIconStyle?: React.CSSProperties;
}

const AstraCard: React.FC<AstraCardProps> = ({ title, icon, children, bodyClass = '', bodyStyle, titleClass = '', headerIconStyle }) => {
  return (
    <div className="astra-card h-100">
      <div className="astra-card-header">
        {icon && <span className="astra-card-icon" style={headerIconStyle}>{icon}</span>}
        <h3 className={`astra-card-title ${titleClass}`}>{title}</h3>
      </div>
      <div className={`astra-card-body ${bodyClass}`} style={bodyStyle}>
        {children}
      </div>
    </div>
  );
};

export default AstraCard;
