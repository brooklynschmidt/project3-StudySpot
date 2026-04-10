import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./AddSpot.css";

const CATEGORIES = [
  "Library",
  "Cafe",
  "Academic",
  "Student center",
  "Residence",
];
const NOISE_LEVELS = ["Quiet", "Moderate", "Loud"];
const AVAILABILITY = ["Not crowded", "Moderate", "Crowded"];

function AddSpot({ user = null }) {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markerRef = useRef(null);

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [category, setCategory] = useState("");
  const [noiseLevel, setNoiseLevel] = useState("");
  const [groupFriendly, setGroupFriendly] = useState("");
  const [hours, setHours] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [position, setPosition] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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

    mapRef.current.on("click", (e) => {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const icon = L.divIcon({
          html: '<div style="width:16px;height:16px;background:#9ABD97;border:2.5px solid #04395E;border-radius:50%;box-shadow:0 0 8px rgba(4,57,94,.3);"></div>',
          className: "",
          iconSize: [16, 16],
          iconAnchor: [8, 8],
        });
        markerRef.current = L.marker([lat, lng], { icon }).addTo(
          mapRef.current,
        );
      }
    });
  }, []);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setSubmitting(true);

      try {
        const res = await fetch("/api/spots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            address,
            category,
            noiseLevel,
            groupFriendly,
            hours,
            description,
            status,
            pos: position,
            createdBy: user ? user._id : null,
          }),
        });

        if (res.ok) {
          navigate("/explore");
        } else {
          const data = await res.json();
          console.error("Failed to add spot:", data.error);
          setSubmitting(false);
        }
      } catch (err) {
        console.error("Failed to add spot:", err);
        setSubmitting(false);
      }
    },
    [
      name,
      address,
      category,
      noiseLevel,
      groupFriendly,
      hours,
      description,
      status,
      position,
      user,
      navigate,
    ],
  );

  const statusClass =
    status === "Crowded"
      ? "spot-card__status--crowded"
      : status === "Moderate"
        ? "spot-card__status--moderate"
        : "spot-card__status--open";

  return (
    <main className="add-spot">
      <div className="add-spot__map-side">
        <div ref={mapElRef} className="add-spot__leaflet" />
        <div className="add-spot__map-hint">
          {position
            ? "Pin placed — click again to move it"
            : "Click on the map to place a pin"}
        </div>
      </div>

      <div className="add-spot__form-side">
        <button
          type="button"
          className="add-spot__back"
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

        <h2 className="add-spot__title">Add a study spot</h2>
        <p className="add-spot__subtitle">Share a spot with the community</p>

        <form onSubmit={handleSubmit} className="add-spot__form">
          <div className="add-spot__field">
            <label htmlFor="spot-name">Name</label>
            <input
              id="spot-name"
              type="text"
              placeholder="e.g. Snell Library"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="add-spot__field">
            <label htmlFor="spot-address">Address</label>
            <input
              id="spot-address"
              type="text"
              placeholder="e.g. 376 Huntington Ave"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          <div className="add-spot__row">
            <div className="add-spot__field">
              <label htmlFor="spot-category">Category</label>
              <select
                id="spot-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="add-spot__field">
              <label htmlFor="spot-noise">Noise level</label>
              <select
                id="spot-noise"
                value={noiseLevel}
                onChange={(e) => setNoiseLevel(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                {NOISE_LEVELS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="add-spot__row">
            <div className="add-spot__field">
              <label htmlFor="spot-group">Group friendly</label>
              <select
                id="spot-group"
                value={groupFriendly}
                onChange={(e) => setGroupFriendly(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="add-spot__field">
              <label htmlFor="spot-status">Availability</label>
              <select
                id="spot-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select
                </option>
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="add-spot__field">
            <label htmlFor="spot-hours">Hours</label>
            <input
              id="spot-hours"
              type="text"
              placeholder="e.g. 7:00 AM - 10:00 PM"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
            />
          </div>

          <div className="add-spot__field">
            <label htmlFor="spot-description">Description</label>
            <textarea
              id="spot-description"
              placeholder="What makes this spot great?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="3"
            />
          </div>

          <div className="add-spot__preview-section">
            <p className="add-spot__preview-label">Live preview</p>
            <article className="add-spot__preview-card">
              <div className="add-spot__preview-content">
                <h3
                  className={`add-spot__preview-name ${!name ? "add-spot__preview-name--empty" : ""}`}
                >
                  {name || "Spot name"}
                </h3>
                <p
                  className={`add-spot__preview-address ${!address ? "add-spot__preview-address--empty" : ""}`}
                >
                  {address || "123 Address St"}
                </p>
                <div className="add-spot__preview-bottom">
                  <span
                    className={`add-spot__preview-status ${status ? statusClass : "add-spot__preview-status--empty"}`}
                  >
                    {status || "Not crowded"}
                  </span>
                  <span
                    className={`add-spot__preview-type ${!category ? "add-spot__preview-type--empty" : ""}`}
                  >
                    {category || "Category"}
                  </span>
                </div>
              </div>
            </article>
          </div>

          <div className="add-spot__actions">
            <button
              type="button"
              className="add-spot__btn add-spot__btn--cancel"
              onClick={() => navigate("/explore")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-spot__btn add-spot__btn--submit"
              disabled={!position || submitting}
            >
              {submitting ? "Adding..." : "Add spot"}
            </button>
          </div>

          {!position && (
            <p className="add-spot__pin-warning">
              Place a pin on the map to submit
            </p>
          )}
        </form>
      </div>
    </main>
  );
}

AddSpot.propTypes = {
  user: PropTypes.shape({
    _id: PropTypes.string.isRequired,
    initials: PropTypes.string.isRequired,
  }),
};

export default AddSpot;
