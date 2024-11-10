import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import MapComponent from "./component/MapComponent"; // Import your map component
import "leaflet/dist/leaflet.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MapComponent />
  </React.StrictMode>
);
