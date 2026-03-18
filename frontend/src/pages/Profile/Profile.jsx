import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ProfileSpotCard from "../../components/ProfileSpotCard/ProfileSpotCard.jsx";
import "./Profile.css";

function makeIcon(size, active) {
  const shadow = active
    ? "box-shadow:0 0 8px rgba(4,57,94,.4);"
    : "box-shadow:0 0 4px rgba(154,189,151,.4);";
  const border = active
    ? "border:2.5px solid #04395E;"
    : "border:2px solid #fff;";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:#9ABD97;${border}border-radius:50%;${shadow}transition:all .2s;"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const greenIcon = makeIcon(12, false);
const activeIcon = makeIcon(16, true);

/* TODO: Replace with real user data from API */
const PLACEHOLDER_USER = {
  name: "Isabel Yeow",
  email: "yeow.i@northeastern.edu",
  initials: "IY",
  preferences: {
    noise: "Quiet",
    group: "Solo study",
    category: "Library",
  },
};

/* TODO: Replace with API fetch for spots created by this user */
const PLACEHOLDER_MY_SPOTS = [
  {
    id: "1",
    name: "Snell Library",
    address: "376 Huntington Ave",
    pos: [42.33855, -71.08843],
    status: "Crowded",
    category: "Library",
    noiseLevel: "Quiet",
    groupFriendly: "No",
    hours: "Open 24 hours (Husky Card)",
    description:
      "Main campus library with multiple floors. Silent study areas on upper floors, collaborative spaces on lower levels.",
  },
  {
    id: "2",
    name: "Curry Student Center",
    address: "346 Huntington Ave",
    pos: [42.33912, -71.08735],
    status: "Not crowded",
    category: "Student center",
    noiseLevel: "Loud",
    groupFriendly: "Yes",
    hours: "7:00 AM - 11:00 PM",
    description:
      "Student center with dining, lounge areas, and meeting rooms. Great for group work.",
  },
  {
    id: "3",
    name: "Hayden Hall",
    address: "370 Huntington Ave",
    pos: [42.33825, -71.08615],
    status: "Moderate",
    category: "Academic",
    noiseLevel: "Moderate",
    groupFriendly: "No",
    hours: "8:00 AM - 10:00 PM",
    description:
      "Academic building with open study nooks between classrooms. Can get busy between classes.",
  },
];

const PREF_STYLES = {
  noise: { bg: "#eaf3de", color: "#3b6d11" },
  group: { bg: "#faeeda", color: "#854f0b" },
  category: { bg: "#e6f0fa", color: "#1a5276" },
};

function Profile() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markersRef = useRef({});

  const [user] = useState(PLACEHOLDER_USER);
  const [mySpots, setMySpots] = useState(PLACEHOLDER_MY_SPOTS);
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map(mapElRef.current, {
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(mapRef.current);
    mapRef.current.setView([42.344, -71.08], 14);
  }, []);

  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    Object.values(markersRef.current).forEach((m) =>
      mapRef.current.removeLayer(m),
    );
    markersRef.current = {};

    mySpots.forEach((spot) => {
      const isActive = selectedSpotId === spot.id;
      const icon = isActive ? activeIcon : greenIcon;
      const m = L.marker(spot.pos, { icon })
        .addTo(mapRef.current)
        .bindTooltip(spot.name, { direction: "top", offset: [0, -10] });
      m.on("click", () => {
        setSelectedSpotId(spot.id);
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
      });
      markersRef.current[spot.id] = m;
    });
  }, [mySpots, selectedSpotId]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  const handleSelect = useCallback(
    (spotId) => {
      setSelectedSpotId(spotId);
      const spot = mySpots.find((s) => s.id === spotId);
      if (spot && mapRef.current) {
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
      }
    },
    [mySpots],
  );

  const handleSave = useCallback(
    (spotId, updatedFields) => {
      /* TODO: PUT /api/spots/:id */
      setMySpots((prev) =>
        prev.map((s) => (s.id === spotId ? { ...s, ...updatedFields } : s)),
      );
    },
    [],
  );

  const handleDelete = useCallback(
    (spotId) => {
      /* TODO: DELETE /api/spots/:id */
      setMySpots((prev) => prev.filter((s) => s.id !== spotId));
      if (selectedSpotId === spotId) {
        setSelectedSpotId(null);
        if (mapRef.current) {
          mapRef.current.flyTo([42.344, -71.08], 14, { duration: 0.8 });
        }
      }
    },
    [selectedSpotId],
  );

  return (
    <main className="profile-page">
      <div className="profile-page__back-bar">
        <button
          type="button"
          className="profile-page__back"
          onClick={() => navigate("/explore")}
          aria-label="Back to explore"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            width="16"
            height="16"
          >
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span>Back to explore</span>
        </button>
      </div>
      <header className="profile-page__header">
        <div className="profile-page__avatar">{user.initials}</div>
        <div className="profile-page__info">
          <h1 className="profile-page__name">{user.name}</h1>
          <p className="profile-page__email">{user.email}</p>
        </div>
        <div className="profile-page__prefs">
          {Object.entries(user.preferences).map(([key, value]) => (
            <span
              key={key}
              className="profile-page__pref-pill"
              style={{
                backgroundColor: PREF_STYLES[key].bg,
                color: PREF_STYLES[key].color,
              }}
            >
              {value}
            </span>
          ))}
        </div>
      </header>

      <div className="profile-page__content">
        <div className="profile-page__map">
          <div ref={mapElRef} className="profile-page__leaflet" />
        </div>
        <div className="profile-page__list">
          <p className="profile-page__list-header">
            {mySpots.length} spot{mySpots.length !== 1 ? "s" : ""} added
          </p>
          {mySpots.length === 0 && (
            <p className="profile-page__empty">
              You haven&apos;t added any spots yet.
            </p>
          )}
          {mySpots.map((spot) => (
            <ProfileSpotCard
              key={spot.id}
              spot={spot}
              selected={selectedSpotId === spot.id}
              onSelect={() => handleSelect(spot.id)}
              onSave={handleSave}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

Profile.propTypes = {};

export default Profile;