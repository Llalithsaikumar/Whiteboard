import { useState } from 'react';
import './Toolbar.css';

export default function Toolbar({ 
  currentTool, 
  onToolChange, 
  currentColor, 
  onUndo,
  onRedo,
  canUndo,
  canRedo
}) {
  const [showShapesMenu, setShowShapesMenu] = useState(false);

  const mainTools = [
    { id: 'select', icon: '↖', fullLabel: 'Select' },
    { id: 'pen', icon: '✏️', fullLabel: 'Pen' },
    { id: 'text', icon: 'T', fullLabel: 'Text' },
    { id: 'shapes', icon: '▢', fullLabel: 'Shapes', hasSubmenu: true },
    { id: 'eraser', icon: '🧹', fullLabel: 'Eraser' },
    { id: 'frame', icon: '⬚', fullLabel: 'Frame' },
    { id: 'comment', icon: '💬', fullLabel: 'Comment' },
  ];

  return (
    <div className="toolbar">
      {/* Main tool buttons */}
      <div className="toolbar-main">
        {mainTools.map((tool) => (
          <div key={tool.id} className="tool-wrapper">
            <button
              className={`tool-btn ${currentTool === tool.id || (tool.hasSubmenu && ['line', 'rectangle', 'circle'].includes(currentTool)) ? 'active' : ''}`}
              onClick={() => {
                if (tool.hasSubmenu) {
                  setShowShapesMenu(!showShapesMenu);
                } else {
                  onToolChange(tool.id);
                  setShowShapesMenu(false);
                }
              }}
              title={tool.fullLabel}
            >
              <span className="tool-icon">{tool.icon}</span>
            </button>
            {tool.hasSubmenu && showShapesMenu && (
              <div className="shapes-menu">
                <button 
                  className={`shape-option ${currentTool === 'line' ? 'active' : ''}`}
                  onClick={() => {onToolChange('line'); setShowShapesMenu(false);}}
                >
                  <span className="shape-icon">─</span>
                  <span>Line</span>
                </button>
                <button 
                  className={`shape-option ${currentTool === 'rectangle' ? 'active' : ''}`}
                  onClick={() => {onToolChange('rectangle'); setShowShapesMenu(false);}}
                >
                  <span className="shape-icon">▢</span>
                  <span>Rectangle</span>
                </button>
                <button 
                  className={`shape-option ${currentTool === 'circle' ? 'active' : ''}`}
                  onClick={() => {onToolChange('circle'); setShowShapesMenu(false);}}
                >
                  <span className="shape-icon">○</span>
                  <span>Circle</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Bottom actions */}
      <div className="toolbar-footer">
        <button 
          className="tool-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <span className="tool-icon">↶</span>
        </button>
        <button 
          className="tool-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <span className="tool-icon">↷</span>
        </button>
        <div className="color-separator"></div>
        <button 
          className="color-indicator"
          style={{ backgroundColor: currentColor }}
          title="Color"
        />
      </div>
    </div>
  );
}
