import React from 'react';

const App: React.FC = () => {
  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Minimal App Test</h1>
      <p>If you see this, React is working</p>
      <p>Time: {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default App;