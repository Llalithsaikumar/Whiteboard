import { useState } from 'react';
import './Toolbar.css';

export default function Toolbar({ 
  currentTool, 
  onToolChange, 
  currentColor, 
  onColorChange,
  currentWidth,
  onWidthChange,
  onClearCanvas,
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) {
  const [showColorPicker, setShowColorPicker] = useState(false);

  const tools = [
    { id: 'pen', label: '✏️ Pen', icon: '✏️' },
    { id: 'eraser', label: '🧹 Eraser', icon: '🧹' },
    { id: 'line', label: '📏 Line', icon: '📏' },
    { id: 'rectangle', label: '⬜ Rectangle', icon: '⬜' },
    { id: 'circle', label: '⭕ Circle', icon: '⭕' },
  ];

  const colors = [
    '#000000', // Black
    '#FF0000', // Red
    '#00FF00', // Green
    '#0000FF', // Blue
    '#FFFF00', // Yellow
    '#FF00FF', // Magenta
    '#00FFFF', // Cyan
    '#FFA500', // Orange
    '#800080', // Purple
    '#FFFFFF', // White
  ];

  const widths = [2, 4, 8, 12, 16];

  return (
    <div className="toolbar">
      <div className="toolbar-section">
        <h3>Tools</h3>
        <div className="tool-buttons">
          {tools.map((tool) => (
            <button
              key={tool.id}
              className={`tool-button ${currentTool === tool.id ? 'active' : ''}`}
              onClick={() => onToolChange(tool.id)}
              title={tool.label}
            >
              <span className="tool-icon">{tool.icon}</span>
              <span className="tool-label">{tool.id}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Color</h3>
        <div className="color-picker-container">
          <button
            className="current-color"
            style={{ backgroundColor: currentColor }}
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Select color"
          />
          {showColorPicker && (
            <div className="color-palette">
              {colors.map((color) => (
                <button
                  key={color}
                  className={`color-option ${currentColor === color ? 'selected' : ''}`}
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onColorChange(color);
                    setShowColorPicker(false);
                  }}
                  title={color}
                />
              ))}
              <input
                type="color"
                value={currentColor}
                onChange={(e) => onColorChange(e.target.value)}
                className="custom-color-input"
                title="Custom color"
              />
            </div>
          )}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Width</h3>
        <div className="width-selector">
          {widths.map((width) => (
            <button
              key={width}
              className={`width-button ${currentWidth === width ? 'active' : ''}`}
              onClick={() => onWidthChange(width)}
              title={`${width}px`}
            >
              <div 
                className="width-preview"
                style={{ 
                  width: `${width}px`, 
                  height: `${width}px`,
                  backgroundColor: currentColor 
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="toolbar-section">
        <h3>Actions</h3>
        <div className="action-buttons">
          <button
            className="action-button"
            onClick={onUndo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            ↶ Undo
          </button>
          <button
            className="action-button"
            onClick={onRedo}
            disabled={!canRedo}
            title="Redo (Ctrl+Y)"
          >
            ↷ Redo
          </button>
          <button
            className="action-button clear"
            onClick={onClearCanvas}
            title="Clear canvas"
          >
            🗑️ Clear
          </button>
        </div>
      </div>
    </div>
  );
}
