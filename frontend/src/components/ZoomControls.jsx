import { useState } from 'react';
import './ZoomControls.css';

export default function ZoomControls() {
  const [zoom, setZoom] = useState(100);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 10, 50));
  };

  const handleReset = () => {
    setZoom(100);
  };

  return (
    <div className="zoom-controls">
      <button className="zoom-minimap" title="Show minimap">
        🗺️
      </button>
      <div className="zoom-divider"></div>
      <button className="zoom-button" onClick={handleZoomOut} title="Zoom Out">
        −
      </button>
      <button className="zoom-display" onClick={handleReset} title="Reset Zoom">
        {zoom}%
      </button>
      <button className="zoom-button" onClick={handleZoomIn} title="Zoom In">
        +
      </button>
      <div className="zoom-divider"></div>
      <button className="zoom-help" title="Help">
        ?
      </button>
    </div>
  );
}
