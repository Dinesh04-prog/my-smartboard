import React, { useEffect, useRef, useState } from "react";
import "./style.css";

const Whiteboard: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState<boolean>(false);
  const [currentColor, setCurrentColor] = useState<string>("black");
  const [erasing, setErasing] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [actions, setActions] = useState<string[]>([]);
  const [redoStack, setRedoStack] = useState<string[]>([]);
  const [text, setText] = useState<string>("");
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 2;
    ctx.strokeStyle = currentColor;
    ctxRef.current = ctx;
  }, [currentColor]);

  const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const saveState = () => {
    if (!canvasRef.current) return;
    setActions((prev) => [...prev, canvasRef.current!.toDataURL()]);
    setRedoStack([]);
  };

  const undo = () => {
    if (actions.length === 0) return;
    setRedoStack((prev) => [...prev, actions.pop()!]);
    redrawCanvas();
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    setActions((prev) => [...prev, redoStack.pop()!]);
    redrawCanvas();
  };

  const redrawCanvas = () => {
    if (!canvasRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    const img = new Image();
    img.src = actions.length > 0 ? actions[actions.length - 1] : "";
    img.onload = () => {
      ctx.clearRect(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      ctx.drawImage(img, 0, 0);
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setDrawing(true);
    const pos = getMousePos(e);
    ctxRef.current?.beginPath();
    ctxRef.current?.moveTo(pos.x, pos.y);
    saveState();
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawing || !ctxRef.current) return;
    const pos = getMousePos(e);
    ctxRef.current.lineTo(pos.x, pos.y);
    ctxRef.current.stroke();
  };


  
  const stopDrawing = () => {
    setDrawing(false);
    ctxRef.current?.beginPath();
  };

  const clearCanvas = () => {
    ctxRef.current?.clearRect(0, 0, canvasRef.current?.width || 0, canvasRef.current?.height || 0);
  };

  const toggleSpeech = () => {
    setIsSpeaking(!isSpeaking);
  };

  return (
    <div className="container">
      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
        ></canvas>
        <div className="toolbar">
          <button onClick={() => setCurrentColor("black")}>🖊</button>
          <button onClick={() => setErasing(!erasing)}>🧹</button>
          <button onClick={clearCanvas}>🗑</button>
          <button onClick={toggleSpeech} style={{ backgroundColor: isSpeaking ? "green" : "red" }}>
            🎤
          </button>
          <button onClick={undo}>↩</button>
          <button onClick={redo}>↪</button>
          <button onClick={() => setText("Speech-to-text activated")}>📜</button>
          <button onClick={() => setImages([...images, "new-image.jpg"]) }>🖼</button>
        </div>
      </div>
      <div className="text-image-container">
        <div id="text-container">{text}</div>
        <div className="section">
          <div className="section-header">
            <button id="clearImages" className="clear-button" onClick={() => setImages([])}>Clear Images</button>
          </div>
          <div id="imageGallery" className="image-gallery">
            {images.map((img, index) => (
              <img key={index} src={img} alt="Generated" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Whiteboard;
