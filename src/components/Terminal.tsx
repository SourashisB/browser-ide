import React from 'react';

type TerminalProps = {
  stdout: string;
  stderr: string;
  loading: boolean;
};

const Terminal: React.FC<TerminalProps> = ({ stdout, stderr, loading }) => (
  <div style={{
    background: '#1e1e1e',
    color: '#d4d4d4',
    padding: 12,
    height: '100%',
    overflow: 'auto',
    fontFamily: 'monospace',
    fontSize: 15,
    borderRadius: 6,
    whiteSpace: 'pre-wrap'
  }}>
    {loading ? (
      <div style={{ color: '#6cf' }}>Running...</div>
    ) : (
      <>
        {stdout && <div style={{ color: '#d4d4d4' }}>{stdout}</div>}
        {stderr && <div style={{ color: '#ff6', background: '#4a2', padding: 4 }}>{stderr}</div>}
      </>
    )}
  </div>
);

export default Terminal;