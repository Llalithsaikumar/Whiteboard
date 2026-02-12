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
  canRedo,
}) {
  const [showShapesMenu, setShowShapesMenu] = useState(false);
  const [showWidthPicker, setShowWidthPicker] = useState(false);

  const mainTools = [
    { id: 'select', icon: '↖', fullLabel: 'Select' },
    { id: 'pen', icon: '✏️', fullLabel: 'Pen' },
    { id: 'text', icon: 'T', fullLabel: 'Text' },
    { id: 'shapes', icon: '▢', fullLabel: 'Shapes', hasSubmenu: true },
    { id: 'eraser', icon: '🧹', fullLabel: 'Eraser' },
    { id: 'frame', icon: '⬚', fullLabel: 'Frame' },
    { id: 'comment', icon: '💬', fullLabel: 'Comment' },
  ];

  const shapeTools = ['line', 'rectangle', 'circle'];
  const isShapeActive = shapeTools.includes(currentTool);

  return (
    <div className="toolbar">
      <div className="toolbar-main">
        {mainTools.map((tool) => (
          <div key={tool.id} className="tool-wrapper">
            <button
              className={`tool-btn ${
                currentTool === tool.id || (tool.hasSubmenu && isShapeActive)
                  ? 'active'
                  : ''
              }`}
              onClick={() => {
                if (tool.hasSubmenu) {
                  setShowShapesMenu((prev) => !prev);
                  setShowWidthPicker(false);
                } else {
                  onToolChange(tool.id);
                  setShowShapesMenu(false);
                  setShowWidthPicker(false);
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
                  onClick={() => { onToolChange('line'); setShowShapesMenu(false); }}
                >
                  <span className="shape-icon">─</span>
                  <span>Line</span>
                </button>
                <button
                  className={`shape-option ${currentTool === 'rectangle' ? 'active' : ''}`}
                  onClick={() => { onToolChange('rectangle'); setShowShapesMenu(false); }}
                >
                  <span className="shape-icon">▢</span>
                  <span>Rectangle</span>
                </button>
                <button
                  className={`shape-option ${currentTool === 'circle' ? 'active' : ''}`}
                  onClick={() => { onToolChange('circle'); setShowShapesMenu(false); }}
                >
                  <span className="shape-icon">○</span>
                  <span>Circle</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="toolbar-footer">
        {/* Undo */}
        <button
          className="tool-btn"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <span className="tool-icon">↶</span>
        </button>

        {/* Redo */}
        <button
          className="tool-btn"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Y)"
        >
          <span className="tool-icon">↷</span>
        </button>

        <div className="color-separator" />

        {/* Stroke width picker */}
        <div className="tool-wrapper">
          <button
            className="tool-btn width-btn"
            onClick={() => setShowWidthPicker((prev) => !prev)}
            title="Stroke Width"
          >
            <div
              className="width-preview"
              style={{
                width: 20,
                height: Math.max(2, Math.min(currentWidth, 12)),
                backgroundColor: currentColor,
                borderRadius: 4,
              }}
            />
          </button>
          {showWidthPicker && (
            <div className="width-menu">
              <span className="width-label">Size: {currentWidth}px</span>
              <input
                type="range"
                min={1}
                max={30}
                value={currentWidth}
                onChange={(e) => onWidthChange(Number(e.target.value))}
                className="width-slider"
              />
              <div className="width-presets">
                {[2, 4, 8, 14, 20].map((w) => (
                  <button
                    key={w}
                    className={`width-preset ${currentWidth === w ? 'active' : ''}`}
                    onClick={() => { onWidthChange(w); setShowWidthPicker(false); }}
                  >
                    <div
                      style={{
                        width: 20,
                        height: Math.min(w, 14),
                        backgroundColor: currentColor,
                        borderRadius: 3,
                        margin: '0 auto',
                      }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Color picker */}
        <label className="color-label" title="Pick color">
          <div
            className="color-indicator"
            style={{ backgroundColor: currentColor }}
          />
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onColorChange(e.target.value)}
            className="color-input-hidden"
          />
        </label>

        <div className="color-separator" />

        {/* Clear canvas */}
        <button
          className="tool-btn clear-btn"
          onClick={onClearCanvas}
          title="Clear canvas"
        >
          <span className="tool-icon">🗑️</span>
        </button>
      </div>
    </div>
  );
}