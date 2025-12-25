import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { SpriteProvider } from "./context/SpriteContext";
import { SelectedSpriteProvider } from "./context/SelectedSpriteContext";
import "tailwindcss/tailwind.css";

console.log("hi");

ReactDOM.render(
  <React.StrictMode>
    <SpriteProvider>
      <SelectedSpriteProvider>
        <App />
      </SelectedSpriteProvider>
    </SpriteProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
