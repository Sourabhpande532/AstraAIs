import React from 'react';

interface AstraCardProps {
  title: string;
  icon?: React.ReactNode;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  bodyClass?: string;
  bodyStyle?: React.CSSProperties;
  titleClass?: string;
  headerIconStyle?: React.CSSProperties;
}

const AstraCard: React.FC<AstraCardProps> = ({
  title,
  icon,
  headerAction,
  children,
  bodyClass = '',
  bodyStyle,
  titleClass = '',
  headerIconStyle,
}) => {
  return (
    <div className="astra-card h-100 d-flex flex-column">
      <div className="astra-card-header">
        <div className="d-flex align-items-center gap-2">
          {icon && <span className="astra-card-icon d-inline-flex align-items-center" style={headerIconStyle}>{icon}</span>}
          <h3 className={`astra-card-title ${titleClass}`}>{title}</h3>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className={`astra-card-body flex-grow-1 ${bodyClass}`} style={bodyStyle}>
        {children}
      </div>
    </div>
  );
};

export default AstraCard;
