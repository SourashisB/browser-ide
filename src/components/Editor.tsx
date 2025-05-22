import React from 'react';

type EditorProps = {
  value: string;
  onChange: (val: string) => void;
};

const Editor: React.FC<EditorProps> = ({ value, onChange }) => (
  <textarea
    value={value}
    onChange={e => onChange(e.target.value)}
    style={{
      width: '100%',
      height: '100%',
      fontFamily: 'monospace',
      fontSize: 16,
      border: 'none',
      outline: 'none',
      background: '#f6f8fa',
      resize: 'none',
      padding: 12,
      boxSizing: 'border-box'
    }}
    spellCheck={false}
  />
);

export default Editor;