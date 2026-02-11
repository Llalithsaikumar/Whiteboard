import { useEffect, useState, useCallback, useMemo } from "react";
import { io } from "socket.io-client";
import Canvas from "./components/Canvas";
import Toolbar from "./components/Toolbar";
import Header from "./components/Header";
import ZoomControls from "./components/ZoomControls";
import "./App.css";

export default function App() {
  const [roomId] = useState("room-1");
  const [currentTool, setCurrentTool] = useState("pen");
  const [currentColor, setCurrentColor] = useState("#000000");
  const [currentWidth, setCurrentWidth] = useState(4);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(-1);

  // Create socket connection once
  const socket = useMemo(() => io("http://localhost:3001"), []);

  const handleClearCanvas = useCallback(() => {
    if (socket && confirm("Are you sure you want to clear the canvas?")) {
      socket.emit("clear-canvas", { roomId });
      setHistory([]);
      setHistoryStep(-1);
    }
  }, [socket, roomId]);

  const handleUndo = useCallback(() => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      // Request canvas redraw up to historyStep - 1
      socket.emit("request-canvas-state", { roomId });
    }
  }, [historyStep, socket, roomId]);

  const handleRedo = useCallback(() => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      // Request canvas redraw up to historyStep
      socket.emit("request-canvas-state", { roomId });
    }
  }, [historyStep, history.length, socket, roomId]);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("join-room", { roomId });
    });

    socket.on("canvas-state", (data) => {
      console.log("Canvas state loaded:", data);
    });

    // Keyboard shortcuts
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      socket.disconnect();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [socket, roomId, handleUndo, handleRedo]);

  // Track strokes for undo/redo
  useEffect(() => {
    if (!socket) return;

    const handleStrokeComplete = ({ stroke }) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, historyStep + 1);
        newHistory.push(stroke);
        setHistoryStep(newHistory.length - 1);
        return newHistory;
      });
    };

    socket.on("stroke-complete", handleStrokeComplete);

    return () => {
      socket.off("stroke-complete", handleStrokeComplete);
    };
  }, [socket, historyStep]);

  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Toolbar
          currentTool={currentTool}
          onToolChange={setCurrentTool}
          currentColor={currentColor}
          onColorChange={setCurrentColor}
          currentWidth={currentWidth}
          onWidthChange={setCurrentWidth}
          onClearCanvas={handleClearCanvas}
          onUndo={handleUndo}
          onRedo={handleRedo}
          canUndo={historyStep > 0}
          canRedo={historyStep < history.length - 1}
        />
        {socket && (
          <Canvas
            socket={socket}
            roomId={roomId}
            currentTool={currentTool}
            currentColor={currentColor}
            currentWidth={currentWidth}
          />
        )}
      </div>
      <ZoomControls />
    </div>
  );
}
