import './ZoomControls.css';

export default function ZoomControls({ zoom, onZoomIn, onZoomOut, onZoomReset }) {
  return (
    <div className="zoom-controls">
      <button className="zoom-minimap" title="Show minimap">
        🗺️
      </button>
      <div className="zoom-divider" />
      <button
        className="zoom-button"
        onClick={onZoomOut}
        disabled={zoom <= 25}
        title="Zoom Out (−)"
      >
        −
      </button>
      <button
        className="zoom-display"
        onClick={onZoomReset}
        title="Reset to 100%"
      >
        {zoom}%
      </button>
      <button
        className="zoom-button"
        onClick={onZoomIn}
        disabled={zoom >= 200}
        title="Zoom In (+)"
      >
        +
      </button>
      <div className="zoom-divider" />
      <button className="zoom-help" title="Help">
        ?
      </button>
    </div>
  );
}