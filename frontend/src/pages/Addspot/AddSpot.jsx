import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./AddSpot.css";

const CATEGORIES = ["Library", "Cafe", "Academic", "Student center", "Residence"];
const NOISE_LEVELS = ["Quiet", "Moderate", "Loud"];
const AVAILABILITY = ["Not crowded", "Moderate", "Crowded"];

function AddSpot() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markerRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    address: "",
    category: "",
    noiseLevel: "",
    groupFriendly: "",
    hours: "",
    description: "",
    status: "",
    lat: null,
    lng: null,
  });

  const [errors, setErrors] = useState({});

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
      setForm((prev) => ({ ...prev, lat, lng }));

      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lng]);
      } else {
        const icon = L.divIcon({
          html: '<div style="width:16px;height:16px;background:#9ABD97;border:3px solid #04395E;border-radius:50;box-shadow:0 0 8px rgba(4,57,94,.3);"></div>',
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

  const updateField = useCallback((field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Name is required";
    if (!form.address.trim()) newErrors.address = "Address is required";
    if (!form.category) newErrors.category = "Pick a category";
    if (!form.noiseLevel) newErrors.noiseLevel = "Pick a noise level";
    if (!form.groupFriendly) newErrors.groupFriendly = "Select yes or no";
    if (!form.status) newErrors.status = "Pick availability";
    if (!form.lat || !form.lng) newErrors.map = "Click the map to set location";
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // TODO: POST to backend API
    console.log("New spot:", form);
    navigate("/explore");
  };

  return (
    <main className="add-spot-page">
      <div className="add-spot-page__map-side">
        <div ref={mapElRef} className="add-spot-page__leaflet" />
        <div className="add-spot-page__map-hint">
          {form.lat
            ? "Location set — click again to change"
            : "Click the map to set the spot location"}
        </div>
        {errors.map && (
          <div className="add-spot-page__map-error">{errors.map}</div>
        )}
      </div>

      <div className="add-spot-page__form-side">
        <h2 className="add-spot-page__title">Add a study spot</h2>
        <p className="add-spot-page__subtitle">
          Share a great place to study with the community.
        </p>

        <form onSubmit={handleSubmit} className="add-spot-page__form">
          <div className="add-spot-page__field">
            <label htmlFor="spot-name">Name</label>
            <input
              id="spot-name"
              type="text"
              placeholder="e.g. Snell Library"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
            />
            {errors.name && (
              <span className="add-spot-page__error">{errors.name}</span>
            )}
          </div>

          <div className="add-spot-page__field">
            <label htmlFor="spot-address">Address</label>
            <input
              id="spot-address"
              type="text"
              placeholder="e.g. 376 Huntington Ave"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
            />
            {errors.address && (
              <span className="add-spot-page__error">{errors.address}</span>
            )}
          </div>

          <div className="add-spot-page__row">
            <div className="add-spot-page__field">
              <label htmlFor="spot-category">Category</label>
              <select
                id="spot-category"
                value={form.category}
                onChange={(e) => updateField("category", e.target.value)}
              >
                <option value="">Select</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              {errors.category && (
                <span className="add-spot-page__error">{errors.category}</span>
              )}
            </div>

            <div className="add-spot-page__field">
              <label htmlFor="spot-noise">Noise level</label>
              <select
                id="spot-noise"
                value={form.noiseLevel}
                onChange={(e) => updateField("noiseLevel", e.target.value)}
              >
                <option value="">Select</option>
                {NOISE_LEVELS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              {errors.noiseLevel && (
                <span className="add-spot-page__error">
                  {errors.noiseLevel}
                </span>
              )}
            </div>
          </div>

          <div className="add-spot-page__row">
            <div className="add-spot-page__field">
              <label htmlFor="spot-group">Group friendly</label>
              <select
                id="spot-group"
                value={form.groupFriendly}
                onChange={(e) => updateField("groupFriendly", e.target.value)}
              >
                <option value="">Select</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
              {errors.groupFriendly && (
                <span className="add-spot-page__error">
                  {errors.groupFriendly}
                </span>
              )}
            </div>

            <div className="add-spot-page__field">
              <label htmlFor="spot-status">Current availability</label>
              <select
                id="spot-status"
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
              >
                <option value="">Select</option>
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
              {errors.status && (
                <span className="add-spot-page__error">{errors.status}</span>
              )}
            </div>
          </div>

          <div className="add-spot-page__field">
            <label htmlFor="spot-hours">Hours of operation</label>
            <input
              id="spot-hours"
              type="text"
              placeholder="e.g. 7:00 AM - 11:00 PM"
              value={form.hours}
              onChange={(e) => updateField("hours", e.target.value)}
            />
          </div>

          <div className="add-spot-page__field">
            <label htmlFor="spot-description">Description</label>
            <textarea
              id="spot-description"
              placeholder="What makes this a good study spot?"
              rows="3"
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
            />
          </div>

          <div className="add-spot-page__actions">
            <button
              type="button"
              className="add-spot-page__btn add-spot-page__btn--cancel"
              onClick={() => navigate("/explore")}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="add-spot-page__btn add-spot-page__btn--submit"
            >
              Add spot
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

AddSpot.propTypes = {};

export default AddSpot;