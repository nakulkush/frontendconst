import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";

// Custom cartoon guide icon SVG
const guideSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="80" height="80">
  <!-- Head -->
  <circle cx="50" cy="30" r="20" fill="#FFD93B" />
  <!-- Body -->
  <rect x="35" y="50" width="30" height="40" rx="15" ry="15" fill="#3E4347" />
  <!-- Eyes -->
  <circle cx="43" cy="28" r="4" fill="#000" />
  <circle cx="57" cy="28" r="4" fill="#000" />
  <!-- Smile -->
  <path d="M40 35 Q50 45 60 35" stroke="#000" stroke-width="2" fill="none" />
  <!-- Hat -->
  <path d="M30 10 Q50 -5 70 10" stroke="#000" stroke-width="4" fill="#3E4347" />
</svg>
`;

const guideIcon = new L.DivIcon({
  className: "custom-guide-icon",
  html: guideSVG,
  iconSize: [80, 80],
  iconAnchor: [40, 80],
  popupAnchor: [0, -90],
});

// 50 stops around India
const states = [
  {
    name: "Delhi",
    coords: [28.6139, 77.209],
    info: "Delhi: Capital of India.",
  },
  {
    name: "Mumbai",
    coords: [19.076, 72.8777],
    info: "Mumbai: Financial hub of India.",
  },
  {
    name: "Chennai",
    coords: [13.0827, 80.2707],
    info: "Chennai: Cultural capital of South India.",
  },
  {
    name: "Kolkata",
    coords: [22.5726, 88.3639],
    info: "Kolkata: City of Joy.",
  },
  {
    name: "Hyderabad",
    coords: [17.385, 78.4867],
    info: "Hyderabad: Known for its biryani.",
  },
  // Add 45 more stops covering various regions in India...
];

// Component to dynamically update map view
const UpdateMapView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom]);
  return null;
};

export default function MapComponent() {
  const [currentStop, setCurrentStop] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [translatedInfo, setTranslatedInfo] = useState("");

  // Function to translate text
  const translateText = async (text) => {
    try {
      const formData = new FormData();
      formData.append("key", "devnagri_195104046cb711efa23ac220bdaddf68");
      formData.append("sentence", text);
      formData.append("src_lang", "en");
      formData.append("dest_lang", selectedLanguage);

      const response = await axios.post(
        "https://app.devnagri.com/api/v1/translate-sentence-api",
        formData
      );
      setTranslatedInfo(response.data.translated_sentence || text);
    } catch (error) {
      console.error("Translation failed", error);
    }
  };

  // Move to the next stop
  const moveToNextStop = () => {
    const nextStop = (currentStop + 1) % states.length;
    setCurrentStop(nextStop);
    setTranslatedInfo(""); // Reset translation for the new stop
  };

  // Move to the previous stop
  const moveToPrevStop = () => {
    const prevStop = (currentStop - 1 + states.length) % states.length;
    setCurrentStop(prevStop);
    setTranslatedInfo(""); // Reset translation for the new stop
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "ArrowRight") moveToNextStop();
      else if (event.key === "ArrowLeft") moveToPrevStop();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [currentStop]);

  return (
    <div>
      {/* Language Selector */}
      <div>
        <label htmlFor="language">Choose Language:</label>
        <select
          id="language"
          value={selectedLanguage}
          onChange={(e) => setSelectedLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="hi">Hindi</option>
          {/* Add more languages */}
        </select>
      </div>

      {/* Map Container */}
      <MapContainer
        center={states[currentStop].coords}
        zoom={6} // Zoom level for India visibility
        style={{ height: "80vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <UpdateMapView center={states[currentStop].coords} zoom={6} />
        <Marker
          position={states[currentStop].coords}
          icon={guideIcon}
          eventHandlers={{
            click: () => translateText(states[currentStop].info),
          }}
        >
          <Popup maxWidth={300}>
            <div
              dangerouslySetInnerHTML={{
                __html: translatedInfo || states[currentStop].info,
              }}
            />
          </Popup>
        </Marker>
      </MapContainer>

      {/* Navigation Buttons */}
      <div style={{ marginTop: "10px", textAlign: "center" }}>
        <button onClick={moveToPrevStop}>Previous</button>
        <button onClick={moveToNextStop}>Next</button>
      </div>
    </div>
  );
}
