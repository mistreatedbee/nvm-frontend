import './index.css';
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { initPaaq } from "./paaq";

initPaaq();

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}