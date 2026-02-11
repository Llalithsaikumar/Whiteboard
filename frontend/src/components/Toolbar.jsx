import { useState } from 'react';
import './Toolbar.css';

export default function Toolbar({ 
  currentTool, 
  onToolChange, 
  currentColor, 
  onClearCanvas,
}) {
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showMoreTools, setShowMoreTools] = useState(false);

  const mainTools = [
    { id: 'pen', label: 'P', fullLabel: 'Pen' },
    { id: 'eraser', label: 'E', fullLabel: 'Eraser' },
  ];

  return (
    <div className="toolbar">
      {/* Main tool buttons */}
      <div className="toolbar-main">
        {mainTools.map((tool) => (
          <button
            key={tool.id}
            className={`tool-btn ${currentTool === tool.id ? 'active' : ''}`}
            onClick={() => onToolChange(tool.id)}
            title={tool.fullLabel}
          >
            {tool.label}
          </button>
        ))}
        
        {/* Text tool */}
        <button className="tool-btn" title="Text">
          TEXT
        </button>
        
        {/* Shapes & Lines */}
        <button 
          className={`tool-btn ${['line', 'rectangle', 'circle'].includes(currentTool) ? 'active' : ''}`}
          onClick={() => setShowShapesMenu(!showShapesMenu)}
          title="Shapes & Lines"
        >
          SHAPES &<br/>LINES
        </button>
        
        {showShapesMenu && (
          <div className="shapes-menu">
            <button 
              className={`shape-option ${currentTool === 'line' ? 'active' : ''}`}
              onClick={() => {onToolChange('line'); setShowShapesMenu(false);}}
            >
              Line
            </button>
            <button 
              className={`shape-option ${currentTool === 'rectangle' ? 'active' : ''}`}
              onClick={() => {onToolChange('rectangle'); setShowShapesMenu(false);}}
            >
              Rectangle
            </button>
            <button 
              className={`shape-option ${currentTool === 'circle' ? 'active' : ''}`}
              onClick={() => {onToolChange('circle'); setShowShapesMenu(false);}}
            >
              Circle
            </button>
          </div>
        )}
        
        {/* Frames */}
        <button className="tool-btn" title="Frames">
          FRAMES
        </button>
        
        {/* Save or Export */}
        <button className="tool-btn" onClick={onClearCanvas} title="Save or Export">
          SAVE OR<br/>EXPORT
        </button>
        
        {/* More Tools */}
        <button 
          className="tool-btn more-tools"
          onClick={() => setShowMoreTools(!showMoreTools)}
          title="More Tools"
        >
          ▶ More Tools {'>'}
        </button>
        
        {showMoreTools && (
          <div className="more-tools-menu">
            <button className="menu-option">EMOJIS</button>
            <button className="menu-option">COMMENTS</button>
          </div>
        )}
      </div>
      
      {/* Color picker - hidden by default, can be shown with a button */}
      <div className="toolbar-footer">
        <button 
          className="color-indicator"
          style={{ backgroundColor: currentColor }}
          onClick={() => setShowShapesMenu(!showShapesMenu)}
          title="Color"
        />
      </div>
    </div>
  );
}
