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

function Profile({ user = null, onLogout = () => {} }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markersRef = useRef({});

  const [profileData, setProfileData] = useState(null);
  const [mySpots, setMySpots] = useState([]);
  const [selectedSpotId, setSelectedSpotId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    preferences: {},
  });

  /** Fetch profile & spots **/
  useEffect(() => {
    if (!user) return;

    async function fetchProfile() {
      try {
        const res = await fetch(`/api/users/${user._id}`);
        if (res.ok) {
          const data = await res.json();
          setProfileData(data);
          setEditForm({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            preferences: {
              noise: data.preferences?.noise || "",
              group: data.preferences?.group || "",
              category: data.preferences?.category || "",
            },
          });
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

  /** Initialize Leaflet map **/
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

  /** Update markers **/
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

  /** Spot handlers **/
  const handleSelect = useCallback(
    (spotId) => {
      setSelectedSpotId(spotId);
      const spot = mySpots.find((s) => (s._id || s.id) === spotId);
      if (spot && mapRef.current)
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
    },
    [mySpots],
  );

  const handleSaveSpot = useCallback(async (spotId, updatedFields) => {
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

  const handleDeleteSpot = useCallback(
    async (spotId) => {
      try {
        const res = await fetch(`/api/spots/${spotId}`, { method: "DELETE" });
        if (res.ok) {
          setMySpots((prev) => prev.filter((s) => (s._id || s.id) !== spotId));
          if (selectedSpotId === spotId) {
            setSelectedSpotId(null);
            mapRef.current?.flyTo([42.344, -71.08], 14, { duration: 0.8 });
          }
        }
      } catch (err) {
        console.error("Failed to delete spot:", err);
      }
    },
    [selectedSpotId],
  );

  /** User profile update **/
  const handleUpdateProfile = useCallback(
    async (updatedFields) => {
      if (!user?._id) return;
      try {
        const res = await fetch(`/api/users/${user._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedFields),
        });
        if (res.ok) {
          const updated = await res.json();
          setProfileData(updated);
          setEditing(false);
        } else {
          const err = await res.json();
          console.error("Profile update failed:", err);
        }
      } catch (err) {
        console.error("Failed to update profile:", err);
      }
    },
    [user],
  );

  /** Delete user account **/
  const handleDeleteProfile = useCallback(async () => {
    if (!user?._id) return;
    if (!window.confirm("Are you sure you want to delete your account?"))
      return;
    try {
      const res = await fetch(`/api/users/${user._id}`, { method: "DELETE" });
      if (res.ok) {
        onLogout();
        navigate("/");
      } else {
        const err = await res.json();
        console.error("Delete failed:", err);
      }
    } catch (err) {
      console.error("Failed to delete profile:", err);
    }
  }, [user, onLogout, navigate]);

  const displayUser = profileData || user;

  if (!displayUser) {
    return (
      <main className="profile-page">
        <p
          className="profile-page__empty"
          style={{ marginTop: 0, padding: "40px" }}
        >
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
        <div className="profile-page__avatar">{displayUser.initials}</div>
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
                  className={`profile-page__pref-pill profile-page__pref-pill--${key}`}
                >
                  {value}
                </span>
              ))}
        </div>

        <div className="profile-page__actions">
          <button
            type="button"
            className="edit"
            onClick={() => setEditing(true)}
          >
            Edit Profile
          </button>
          <button
            type="button"
            className="danger"
            onClick={handleDeleteProfile}
          >
            Delete Account
          </button>
          <button
            type="button"
            className="profile-page__logout"
            onClick={() => {
              onLogout();
              navigate("/");
            }}
          >
            Log out
          </button>
        </div>
      </header>

      {editing && (
        <div className="profile-page__edit-modal">
          <div className="modal-content">
            <h2>Edit Profile</h2>
            <input
              type="text"
              value={editForm.firstName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, firstName: e.target.value }))
              }
              placeholder="First name"
            />
            <input
              type="text"
              value={editForm.lastName}
              onChange={(e) =>
                setEditForm((prev) => ({ ...prev, lastName: e.target.value }))
              }
              placeholder="Last name"
            />

            <div className="modal-preferences">
              {["noise", "group", "category"].map((key) => (
                <label key={key}>
                  {key.charAt(0).toUpperCase() + key.slice(1)}:
                  <select
                    value={editForm.preferences[key]}
                    onChange={(e) =>
                      setEditForm((prev) => ({
                        ...prev,
                        preferences: {
                          ...prev.preferences,
                          [key]: e.target.value,
                        },
                      }))
                    }
                  >
                    <option value="">None</option>
                    {key === "noise" && (
                      <>
                        <option value="Quiet">Quiet</option>
                        <option value="Moderate">Moderate</option>
                        <option value="Loud">Loud</option>
                      </>
                    )}
                    {key === "group" && (
                      <>
                        <option value="Group Friendly">Group Friendly</option>
                        <option value="Not Group Friendly">
                          Not Group Friendly
                        </option>
                      </>
                    )}
                    {key === "category" && (
                      <>
                        <option value="Cafe">Cafe</option>
                        <option value="Library">Library</option>
                        <option value="Academic">Academic</option>
                        <option value="Student Center">Student Center</option>
                        <option value="Residence">Residence</option>
                      </>
                    )}
                  </select>
                </label>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="save"
                onClick={() => handleUpdateProfile(editForm)}
              >
                Save
              </button>
              <button className="cancel" onClick={() => setEditing(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
                onSave={handleSaveSpot}
                onDelete={handleDeleteSpot}
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
