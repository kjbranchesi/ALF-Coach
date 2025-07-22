import React from 'react';

const EmergencyDebug = () => {
  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'red', 
      color: 'white', 
      padding: '20px',
      fontSize: '24px',
      fontWeight: 'bold'
    }}>
      EMERGENCY DEBUG COMPONENT IS RENDERING!
      <br />
      If you see this, we found where the component should be.
    </div>
  );
};

export default EmergencyDebug;