import { useRef, useEffect, useState, useCallback } from 'react';
import './Canvas.css';

export default function Canvas({ socket, roomId, currentTool, currentColor, currentWidth }) {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState([]);

  // Draw a complete stroke on canvas
  const drawStroke = useCallback((stroke) => {
    const context = contextRef.current;
    if (!context || !stroke.path || stroke.path.length < 2) return;

    const { tool, color, width, path, shapeType } = stroke;

    if (tool === 'eraser') {
      context.globalCompositeOperation = 'destination-out';
    } else {
      context.globalCompositeOperation = 'source-over';
    }

    context.strokeStyle = color;
    context.fillStyle = color;
    context.lineWidth = width;
    context.lineCap = 'round';
    context.lineJoin = 'round';

    if (shapeType === 'line') {
      // Draw straight line
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      context.lineTo(path[path.length - 1].x, path[path.length - 1].y);
      context.stroke();
    } else if (shapeType === 'rectangle') {
      // Draw rectangle
      const startX = path[0].x;
      const startY = path[0].y;
      const endX = path[path.length - 1].x;
      const endY = path[path.length - 1].y;
      const rectWidth = endX - startX;
      const rectHeight = endY - startY;
      
      context.beginPath();
      context.rect(startX, startY, rectWidth, rectHeight);
      context.stroke();
    } else if (shapeType === 'circle') {
      // Draw circle
      const startX = path[0].x;
      const startY = path[0].y;
      const endX = path[path.length - 1].x;
      const endY = path[path.length - 1].y;
      const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
      
      context.beginPath();
      context.arc(startX, startY, radius, 0, 2 * Math.PI);
      context.stroke();
    } else {
      // Draw freehand path
      context.beginPath();
      context.moveTo(path[0].x, path[0].y);
      
      for (let i = 1; i < path.length; i++) {
        context.lineTo(path[i].x, path[i].y);
      }
      context.stroke();
    }
  }, []);

  // Initialize canvas context and size
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    contextRef.current = ctx;

    // Set canvas size to fill container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
      
      // Redraw on resize
      if (socket) {
        socket.emit('request-canvas-state', { roomId });
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [socket, roomId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket || !contextRef.current) return;

    // Handle canvas state from server
    const handleCanvasState = ({ strokes }) => {
      // Clear and redraw all strokes
      const canvas = canvasRef.current;
      const context = contextRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      strokes.forEach((stroke) => {
        drawStroke(stroke);
      });
    };

    // Handle incoming draw events
    const handleDraw = ({ from, to, color, width, tool }) => {
      const context = contextRef.current;
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
    };

    // Handle completed strokes
    const handleStrokeComplete = ({ stroke }) => {
      drawStroke(stroke);
    };

    // Handle canvas cleared
    const handleCanvasCleared = () => {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      context.clearRect(0, 0, canvas.width, canvas.height);
    };

    socket.on('canvas-state', handleCanvasState);
    socket.on('draw', handleDraw);
    socket.on('stroke-complete', handleStrokeComplete);
    socket.on('canvas-cleared', handleCanvasCleared);

    return () => {
      socket.off('canvas-state', handleCanvasState);
      socket.off('draw', handleDraw);
      socket.off('stroke-complete', handleStrokeComplete);
      socket.off('canvas-cleared', handleCanvasCleared);
    };
  }, [socket, roomId, drawStroke]);

  // Get mouse/touch position relative to canvas
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  // Preview shape while drawing
  const drawShapePreview = useCallback((start, end) => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    
    // Clear canvas and redraw
    context.clearRect(0, 0, canvas.width, canvas.height);
    
    // Request full canvas state to redraw background
    if (socket) {
      socket.emit('request-canvas-state', { roomId });
    }

    // Draw preview
    context.globalCompositeOperation = 'source-over';
    context.strokeStyle = currentColor;
    context.lineWidth = currentWidth;

    if (currentTool === 'line') {
      context.beginPath();
      context.moveTo(start.x, start.y);
      context.lineTo(end.x, end.y);
      context.stroke();
    } else if (currentTool === 'rectangle') {
      const width = end.x - start.x;
      const height = end.y - start.y;
      context.beginPath();
      context.rect(start.x, start.y, width, height);
      context.stroke();
    } else if (currentTool === 'circle') {
      const radius = Math.sqrt(Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2));
      context.beginPath();
      context.arc(start.x, start.y, radius, 0, 2 * Math.PI);
      context.stroke();
    }
  }, [currentTool, currentColor, currentWidth, socket, roomId]);

  // Start drawing
  const startDrawing = (e) => {
    e.preventDefault();
    setIsDrawing(true);
    
    const coords = getCoordinates(e);
    setCurrentStroke([coords]);

    // For shapes, don't draw immediately
    if (['line', 'rectangle', 'circle'].includes(currentTool)) {
      return;
    }

    const context = contextRef.current;
    // Set drawing style
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
  };

  // Continue drawing
  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault();

    const coords = getCoordinates(e);
    const prevCoords = currentStroke[currentStroke.length - 1];
    
    setCurrentStroke((prev) => [...prev, coords]);

    // For shapes, just update the preview
    if (['line', 'rectangle', 'circle'].includes(currentTool)) {
      drawShapePreview(currentStroke[0], coords);
      return;
    }

    const context = contextRef.current;
    // Draw line segment
    context.lineTo(coords.x, coords.y);
    context.stroke();

    // Emit draw event to other users
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

  // Stop drawing
  const stopDrawing = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);

    // Complete the stroke and send to server
    if (currentStroke.length > 0 && socket) {
      const stroke = {
        tool: currentTool,
        color: currentColor,
        width: currentWidth,
        path: currentStroke,
        shapeType: ['line', 'rectangle', 'circle'].includes(currentTool) ? currentTool : null,
      };

      // For shapes, draw the final shape
      if (['line', 'rectangle', 'circle'].includes(currentTool)) {
        drawStroke(stroke);
      }

      socket.emit('stroke-complete', {
        roomId,
        stroke,
      });
    }

    setCurrentStroke([]);
  };

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        className="whiteboard-canvas"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />
    </div>
  );
}
