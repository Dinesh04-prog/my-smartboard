import React, { useState } from "react";
import "./style.css";
import Custom3DModel from "./Custom3DModel";
import Whiteboard from "./Whiteboard";
const App: React.FC = () => {
  const [activeComponent, setActiveComponent] = useState<"whiteboard" | "3dmodel">("whiteboard");

  return (
    <div className="container">
      <h1>AI Smart Board</h1>
      <div className="nav-buttons">
        <button onClick={() => setActiveComponent("whiteboard")}>Whiteboard</button>
        <button onClick={() => setActiveComponent("3dmodel")}>3D Model Generator</button>
      </div>
      <div className="content">
        {activeComponent === "whiteboard" ? <Whiteboard /> : <Custom3DModel />}
      </div>
    </div>
  );
};

export default App;
