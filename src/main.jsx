import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// Libraries first
import "bootstrap/dist/css/bootstrap.min.css";
// Your theme last (overrides Bootstrap)
import "./theme.css";

ReactDOM.createRoot(document.getElementById("root")).render(<App />);