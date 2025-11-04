import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Your theme CSS (includes navbar/dropdown styles, page styles, etc.)
import "./theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  // No StrictMode to avoid double-effects if you don’t want them
  <App />
);