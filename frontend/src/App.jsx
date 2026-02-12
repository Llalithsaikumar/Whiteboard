import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  const [zoom, setZoom] = useState(100);
  const [isPresenting, setIsPresenting] = useState(false);

  // Store strokes locally for reliable undo/redo
  const strokesRef = useRef([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const historyStepRef = useRef(-1);

  // Canvas redraw trigger
  const [redrawTrigger, setRedrawTrigger] = useState(0);

  const socket = useMemo(() => io("http://localhost:3001"), []);

  const handleClearCanvas = useCallback(() => {
    if (socket && confirm("Are you sure you want to clear the canvas?")) {
      socket.emit("clear-canvas", { roomId });
      strokesRef.current = [];
      historyStepRef.current = -1;
      setHistoryStep(-1);
    }
  }, [socket, roomId]);

  const handleUndo = useCallback(() => {
    if (historyStepRef.current > -1) {
      historyStepRef.current -= 1;
      setHistoryStep(historyStepRef.current);
      setRedrawTrigger((t) => t + 1);
    }
  }, []);

  const handleRedo = useCallback(() => {
    if (historyStepRef.current < strokesRef.current.length - 1) {
      historyStepRef.current += 1;
      setHistoryStep(historyStepRef.current);
      setRedrawTrigger((t) => t + 1);
    }
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, 25));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom(100);
  }, []);

  const handlePresent = useCallback(() => {
    setIsPresenting((prev) => !prev);
  }, []);

  const handleShare = useCallback(() => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        alert("Link copied to clipboard! Share it to collaborate.");
      });
    } else {
      prompt("Copy this link to share:", url);
    }
  }, []);

  // Called by Canvas when a stroke is completed
  const handleStrokeAdded = useCallback((stroke) => {
    // Trim any redo history
    strokesRef.current = strokesRef.current.slice(0, historyStepRef.current + 1);
    strokesRef.current.push(stroke);
    historyStepRef.current = strokesRef.current.length - 1;
    setHistoryStep(historyStepRef.current);
  }, []);

  useEffect(() => {
    socket.on("connect", () => {
      console.log("Connected:", socket.id);
      socket.emit("join-room", { roomId });
    });

    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "y" || (e.key === "z" && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      socket.disconnect();
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [socket, roomId, handleUndo, handleRedo]);

  return (
    <div className={`app ${isPresenting ? "presenting" : ""}`}>
      <Header
        onPresent={handlePresent}
        onShare={handleShare}
        isPresenting={isPresenting}
      />
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
          canUndo={historyStep > -1}
          canRedo={historyStep < strokesRef.current.length - 1}
        />
        {socket && (
          <Canvas
            socket={socket}
            roomId={roomId}
            currentTool={currentTool}
            currentColor={currentColor}
            currentWidth={currentWidth}
            zoom={zoom}
            strokes={strokesRef.current}
            historyStep={historyStep}
            redrawTrigger={redrawTrigger}
            onStrokeAdded={handleStrokeAdded}
          />
        )}
      </div>
      <ZoomControls
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
      />
    </div>
  );
}