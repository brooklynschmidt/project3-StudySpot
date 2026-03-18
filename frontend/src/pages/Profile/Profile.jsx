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

const PREF_STYLES = {
  noise: { bg: "#eaf3de", color: "#3b6d11" },
  group: { bg: "#faeeda", color: "#854f0b" },
  category: { bg: "#e6f0fa", color: "#1a5276" },
};

function Profile({ user = null, onLogout = () => {} }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markersRef = useRef({});

  const [profileData, setProfileData] = useState(null);
  const [mySpots, setMySpots] = useState([]);
  const [selectedSpotId, setSelectedSpotId] = useState(null);

  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
        }
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      }
    }

    async function fetchMySpots() {
      try {
        const res = await fetch(`/api/spots?createdBy=${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setMySpots(data);
        }
      } catch (err) {
        console.error("Failed to fetch spots:", err);
      }
    }

    fetchProfile();
    fetchMySpots();
  }, [user]);

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
      const spotId = spot._id || spot.id;
      const isActive = selectedSpotId === spotId;
      const icon = isActive ? activeIcon : greenIcon;
      const m = L.marker(spot.pos, { icon })
        .addTo(mapRef.current)
        .bindTooltip(spot.name, { direction: "top", offset: [0, -10] });
      m.on("click", () => {
        setSelectedSpotId(spotId);
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
      });
      markersRef.current[spotId] = m;
    });
  }, [mySpots, selectedSpotId]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  const handleSelect = useCallback(
    (spotId) => {
      setSelectedSpotId(spotId);
      const spot = mySpots.find((s) => (s._id || s.id) === spotId);
      if (spot && mapRef.current) {
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
      }
    },
    [mySpots],
  );

  const handleSave = useCallback(async (spotId, updatedFields) => {
    try {
      const res = await fetch(`/api/spots/${spotId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedFields),
      });

      if (res.ok) {
        const updated = await res.json();
        setMySpots((prev) =>
          prev.map((s) => ((s._id || s.id) === spotId ? updated : s)),
        );
      }
    } catch (err) {
      console.error("Failed to update spot:", err);
    }
  }, []);

  const handleDelete = useCallback(
    async (spotId) => {
      try {
        const res = await fetch(`/api/spots/${spotId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          setMySpots((prev) =>
            prev.filter((s) => (s._id || s.id) !== spotId),
          );
          if (selectedSpotId === spotId) {
            setSelectedSpotId(null);
            if (mapRef.current) {
              mapRef.current.flyTo([42.344, -71.08], 14, { duration: 0.8 });
            }
          }
        }
      } catch (err) {
        console.error("Failed to delete spot:", err);
      }
    },
    [selectedSpotId],
  );

  const displayUser = profileData || user;

  if (!displayUser) {
    return (
      <main className="profile-page">
        <p style={{ padding: "40px", textAlign: "center", opacity: 0.5 }}>
          Please log in to view your profile.
        </p>
      </main>
    );
  }

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
        <div className="profile-page__avatar">
          {displayUser.initials}
        </div>
        <div className="profile-page__info">
          <h1 className="profile-page__name">
            {displayUser.firstName} {displayUser.lastName}
          </h1>
          <p className="profile-page__email">{displayUser.email}</p>
        </div>
        <div className="profile-page__prefs">
          {displayUser.preferences &&
            Object.entries(displayUser.preferences)
              .filter(([, value]) => value)
              .map(([key, value]) => (
                <span
                  key={key}
                  className="profile-page__pref-pill"
                  style={{
                    backgroundColor: PREF_STYLES[key]
                      ? PREF_STYLES[key].bg
                      : "#f0f0f0",
                    color: PREF_STYLES[key]
                      ? PREF_STYLES[key].color
                      : "#666",
                  }}
                >
                  {value}
                </span>
              ))}
        </div>
        <button
          type="button"
          className="profile-page__logout"
          onClick={() => {
            onLogout();
            navigate("/");
          }}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            width="14"
            height="14"
          >
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Log out</span>
        </button>
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
          {mySpots.map((spot) => {
            const spotId = spot._id || spot.id;
            return (
              <ProfileSpotCard
                key={spotId}
                spot={{ ...spot, id: spotId }}
                selected={selectedSpotId === spotId}
                onSelect={() => handleSelect(spotId)}
                onSave={handleSave}
                onDelete={handleDelete}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

Profile.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    firstName: PropTypes.string,
    lastName: PropTypes.string,
    email: PropTypes.string,
    initials: PropTypes.string,
    preferences: PropTypes.object,
  }),
  onLogout: PropTypes.func,
};

export default Profile;