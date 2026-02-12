import { useRef, useEffect, useState, useCallback } from 'react';
import './Canvas.css';

export default function Canvas({
  socket,
  roomId,
  currentTool,
  currentColor,
  currentWidth,
  zoom,
  strokes,
  historyStep,
  redrawTrigger,
  onStrokeAdded,
}) {
  const canvasRef = useRef(null);
  const overlayRef = useRef(null); // For shape preview / text input
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const currentStrokeRef = useRef([]);
  const startPointRef = useRef(null);

  // Text tool state
  const [textInput, setTextInput] = useState(null); // { x, y }
  const textareaRef = useRef(null);

  // Selection tool state
  const [selectionRect, setSelectionRect] = useState(null);

  // Draw a single stroke onto the canvas context
  const drawStroke = useCallback((context, stroke) => {
    if (!context || !stroke) return;
    const { tool, color, width, path, shapeType, text, fontSize } = stroke;

    context.save();

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }

    context.strokeStyle = color || '#000000';
    context.fillStyle = color || '#000000';
    context.lineWidth = width || 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    // Text stroke
    if (tool === 'text' && text) {
      context.font = `${fontSize || 18}px sans-serif`;
      context.fillText(text, path[0].x, path[0].y);
      context.restore();
      return;
    }

    if (!path || path.length < 1) {
      context.restore();
      return;
    }

    if (shapeType === 'line') {
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      context.lineTo(path[path.length - 1].x, path[path.length - 1].y);
      context.stroke();
    } else if (shapeType === 'rectangle') {
      const rectW = path[path.length - 1].x - path[0].x;
      const rectH = path[path.length - 1].y - path[0].y;
      context.beginPath();
      context.rect(path[0].x, path[0].y, rectW, rectH);
      context.stroke();
    } else if (shapeType === 'circle') {
      const radius = Math.sqrt(
        Math.pow(path[path.length - 1].x - path[0].x, 2) +
        Math.pow(path[path.length - 1].y - path[0].y, 2)
      );
      context.beginPath();
      context.arc(path[0].x, path[0].y, radius, 0, 2 * Math.PI);
      context.stroke();
    } else {
      // Freehand / pen / eraser
      if (path.length < 2) {
        // Single dot
        context.beginPath();
        context.arc(path[0].x, path[0].y, (width || 2) / 2, 0, 2 * Math.PI);
        context.fill();
      } else {
        context.beginPath();
        context.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
          context.lineTo(path[i].x, path[i].y);
        }
        context.stroke();
      }
    }

    context.restore();
  }, []);

  // Redraw all strokes up to historyStep
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (!canvas || !context) return;

    context.clearRect(0, 0, canvas.width, canvas.height);

    const limit = historyStep === undefined ? strokes.length : historyStep + 1;
    for (let i = 0; i < limit; i++) {
      if (strokes[i]) drawStroke(context, strokes[i]);
    }
  }, [strokes, historyStep, drawStroke]);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    contextRef.current = ctx;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      // Save current image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      ctx.putImageData(imageData, 0, 0);
      redrawCanvas();
    };

    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawCanvas]);

  // Redraw whenever historyStep or redrawTrigger changes
  useEffect(() => {
    redrawCanvas();
  }, [redrawTrigger, historyStep, redrawCanvas]);

  // Apply zoom via CSS transform on the canvas wrapper
  useEffect(() => {
    const container = canvasRef.current?.parentElement;
    if (container) {
      container.style.transformOrigin = 'center center';
      container.style.transform = `scale(${zoom / 100})`;
    }
  }, [zoom]);

  // Socket events for other users' strokes
  useEffect(() => {
    if (!socket) return;

    const handleDraw = ({ from, to, color, width, tool }) => {
      const context = contextRef.current;
      if (!context) return;
      context.save();
      if (tool === 'eraser') {
        context.globalCompositeOperation = 'destination-out';
      } else {
        context.globalCompositeOperation = 'source-over';
      }
      context.strokeStyle = color;
      context.lineWidth = width;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.restore();
    };

    const handleStrokeComplete = ({ stroke }) => {
      drawStroke(contextRef.current, stroke);
    };

    const handleCanvasCleared = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      if (canvas && context) {
        context.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    socket.on('draw', handleDraw);
    socket.on('stroke-complete', handleStrokeComplete);
    socket.on('canvas-cleared', handleCanvasCleared);

    return () => {
      socket.off('draw', handleDraw);
      socket.off('stroke-complete', handleStrokeComplete);
      socket.off('canvas-cleared', handleCanvasCleared);
    };
  }, [socket, drawStroke]);

  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  // Draw shape preview without touching persisted strokes
  const drawPreview = useCallback((start, end) => {
    redrawCanvas(); // restore clean state
    const context = contextRef.current;
    if (!context) return;

    context.save();
    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = currentColor;
    context.lineWidth = currentWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.setLineDash([6, 3]); // dashed preview

    if (currentTool === 'line') {
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    } else if (currentTool === 'rectangle') {
      context.beginPath();
      context.rect(start.x, start.y, end.x - start.x, end.y - start.y);
      context.stroke();
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(
        Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
      );
      context.beginPath();
      context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      context.stroke();
    } else if (currentTool === 'select') {
      context.strokeStyle = '#4a90e2';
      context.fillStyle = 'rgba(74,144,226,0.1)';
      const w = end.x - start.x;
      const h = end.y - start.y;
      context.beginPath();
      context.rect(start.x, start.y, w, h);
      context.fill();
      context.stroke();
    }

    context.restore();
  }, [currentTool, currentColor, currentWidth, redrawCanvas]);

  const startDrawing = (e) => {
    if (currentTool === 'select' || currentTool === 'comment') {
      // These tools don't need special canvas init
    }
    if (currentTool === 'text') return; // handled by click

    e.preventDefault();
    const coords = getCoordinates(e);
    startPointRef.current = coords;
    currentStrokeRef.current = [coords];
    setIsDrawing(true);

    if (['line', 'rectangle', 'circle', 'select'].includes(currentTool)) return;

    const context = contextRef.current;
    context.save();
    if (currentTool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }
    context.strokeStyle = currentColor;
    context.lineWidth = currentWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(coords.x, coords.y);
    context.restore();
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    const prevCoords = currentStrokeRef.current[currentStrokeRef.current.length - 1];
    currentStrokeRef.current = [...currentStrokeRef.current, coords];

    if (['line', 'rectangle', 'circle', 'select'].includes(currentTool)) {
      drawPreview(startPointRef.current, coords);
      if (currentTool === 'select') {
        setSelectionRect({
          x: startPointRef.current.x,
          y: startPointRef.current.y,
          w: coords.x - startPointRef.current.x,
          h: coords.y - startPointRef.current.y,
        });
      }
      return;
    }

    const context = contextRef.current;
    context.save();
    if (currentTool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }
    context.strokeStyle = currentColor;
    context.lineWidth = currentWidth;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(prevCoords.x, prevCoords.y);
    context.lineTo(coords.x, coords.y);
    context.stroke();
    context.restore();

    if (socket) {
      socket.emit('draw', {
        roomId,
        from: prevCoords,
        to: coords,
        color: currentColor,
        width: currentWidth,
        tool: currentTool,
      });
    }
  };

  const stopDrawing = (e) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const path = currentStrokeRef.current;
    currentStrokeRef.current = [];

    if (path.length === 0) return;

    const isShape = ['line', 'rectangle', 'circle'].includes(currentTool);
    const isSelect = currentTool === 'select';

    if (isSelect) {
      setSelectionRect(null);
      redrawCanvas();
      return;
    }

    const stroke = {
      tool: currentTool,
      color: currentColor,
      width: currentWidth,
      path,
      shapeType: isShape ? currentTool : null,
    };

    // For shapes, do the final clean draw
    if (isShape) {
      redrawCanvas();
      drawStroke(contextRef.current, stroke);
    }

    // Save locally for undo/redo
    onStrokeAdded(stroke);

    if (socket) {
      socket.emit('stroke-complete', { roomId, stroke });
    }
  };

  // Text tool: click to place text input
  const handleCanvasClick = (e) => {
    if (currentTool !== 'text') return;
    const coords = getCoordinates(e);
    setTextInput(coords);
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const commitText = () => {
    if (!textInput) return;
    const text = textareaRef.current?.value?.trim();
    if (text) {
      const stroke = {
        tool: 'text',
        color: currentColor,
        width: currentWidth,
        fontSize: Math.max(14, currentWidth * 4),
        path: [textInput],
        text,
      };
      drawStroke(contextRef.current, stroke);
      onStrokeAdded(stroke);
      if (socket) socket.emit('stroke-complete', { roomId, stroke });
    }
    setTextInput(null);
  };

  const getCursor = () => {
    switch (currentTool) {
      case 'pen': return 'crosshair';
      case 'eraser': return 'cell';
      case 'text': return 'text';
      case 'select': return 'default';
      case 'line':
      case 'rectangle':
      case 'circle': return 'crosshair';
      default: return 'default';
    }
  };

  return (
    <div className="canvas-container" style={{ overflow: 'hidden', position: 'relative' }}>
      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        style={{ cursor: getCursor() }}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        onClick={handleCanvasClick}
      />

      {/* Floating text input for text tool */}
      {textInput && (
        <div
          style={{
            position: 'absolute',
            left: textInput.x,
            top: textInput.y - 4,
            zIndex: 10,
          }}
        >
          <textarea
            ref={textareaRef}
            rows={2}
            autoFocus
            style={{
              background: 'rgba(255,255,255,0.9)',
              border: `2px dashed ${currentColor}`,
              color: currentColor,
              fontSize: Math.max(14, currentWidth * 4),
              padding: '2px 6px',
              outline: 'none',
              resize: 'none',
              minWidth: 120,
              borderRadius: 4,
              fontFamily: 'sans-serif',
            }}
            onBlur={commitText}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commitText();
              }
              if (e.key === 'Escape') setTextInput(null);
            }}
          />
        </div>
      )}
    </div>
  );
}