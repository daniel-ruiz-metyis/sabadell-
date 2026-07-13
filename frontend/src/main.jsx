import React from "react";
import { createRoot } from "react-dom/client";
import "./theme.css";
import App from "./App.jsx";
import { FilterProvider } from "./FilterContext.jsx";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FilterProvider>
      <App />
    </FilterProvider>
  </React.StrictMode>
);
