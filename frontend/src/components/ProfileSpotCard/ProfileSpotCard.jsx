import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import "./ProfileSpotCard.css";

const CATEGORIES = [
  "Library",
  "Cafe",
  "Academic",
  "Student center",
  "Residence",
];
const NOISE_LEVELS = ["Quiet", "Moderate", "Loud"];
const AVAILABILITY = ["Not crowded", "Moderate", "Crowded"];

function ProfileSpotCard({
  spot,
  selected = false,
  onSelect = () => {},
  onSave = () => {},
  onDelete = () => {},
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});

  const startEdit = useCallback(
    (e) => {
      e.stopPropagation();
      setDraft({
        name: spot.name,
        address: spot.address,
        category: spot.category,
        noiseLevel: spot.noiseLevel,
        groupFriendly: spot.groupFriendly,
        hours: spot.hours,
        description: spot.description,
        status: spot.status,
      });
      setEditing(true);
    },
    [spot],
  );

  const cancelEdit = useCallback((e) => {
    e.stopPropagation();
    setEditing(false);
    setDraft({});
  }, []);

  const handleSave = useCallback(
    (e) => {
      e.stopPropagation();
      onSave(spot.id, draft);
      setEditing(false);
      setDraft({});
    },
    [spot.id, draft, onSave],
  );

  const handleDelete = useCallback(
    (e) => {
      e.stopPropagation();
      onDelete(spot.id);
    },
    [spot.id, onDelete],
  );

  const updateDraft = useCallback((field, value) => {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }, []);

  const statusClass =
    (editing ? draft.status : spot.status) === "Crowded"
      ? "profile-spot__status--crowded"
      : (editing ? draft.status : spot.status) === "Moderate"
        ? "profile-spot__status--moderate"
        : "profile-spot__status--open";

  if (editing) {
    return (
      <article className="profile-spot profile-spot--editing">
        <div className="profile-spot__edit-header">
          <p className="profile-spot__edit-label">Editing</p>
          <div className="profile-spot__edit-actions">
            <button
              type="button"
              className="profile-spot__save-btn"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              type="button"
              className="profile-spot__cancel-btn"
              onClick={cancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>

        <div className="profile-spot__edit-fields">
          <div className="profile-spot__edit-field">
            <label htmlFor={`edit-name-${spot.id}`}>Name</label>
            <input
              id={`edit-name-${spot.id}`}
              type="text"
              value={draft.name}
              onChange={(e) => updateDraft("name", e.target.value)}
            />
          </div>

          <div className="profile-spot__edit-field">
            <label htmlFor={`edit-address-${spot.id}`}>Address</label>
            <input
              id={`edit-address-${spot.id}`}
              type="text"
              value={draft.address}
              onChange={(e) => updateDraft("address", e.target.value)}
            />
          </div>

          <div className="profile-spot__edit-row">
            <div className="profile-spot__edit-field">
              <label htmlFor={`edit-category-${spot.id}`}>Category</label>
              <select
                id={`edit-category-${spot.id}`}
                value={draft.category}
                onChange={(e) => updateDraft("category", e.target.value)}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="profile-spot__edit-field">
              <label htmlFor={`edit-noise-${spot.id}`}>Noise level</label>
              <select
                id={`edit-noise-${spot.id}`}
                value={draft.noiseLevel}
                onChange={(e) => updateDraft("noiseLevel", e.target.value)}
              >
                {NOISE_LEVELS.map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="profile-spot__edit-row">
            <div className="profile-spot__edit-field">
              <label htmlFor={`edit-group-${spot.id}`}>Group friendly</label>
              <select
                id={`edit-group-${spot.id}`}
                value={draft.groupFriendly}
                onChange={(e) => updateDraft("groupFriendly", e.target.value)}
              >
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>

            <div className="profile-spot__edit-field">
              <label htmlFor={`edit-status-${spot.id}`}>Availability</label>
              <select
                id={`edit-status-${spot.id}`}
                value={draft.status}
                onChange={(e) => updateDraft("status", e.target.value)}
              >
                {AVAILABILITY.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="profile-spot__edit-field">
            <label htmlFor={`edit-hours-${spot.id}`}>Hours</label>
            <input
              id={`edit-hours-${spot.id}`}
              type="text"
              value={draft.hours}
              onChange={(e) => updateDraft("hours", e.target.value)}
            />
          </div>

          <div className="profile-spot__edit-field">
            <label htmlFor={`edit-desc-${spot.id}`}>Description</label>
            <textarea
              id={`edit-desc-${spot.id}`}
              value={draft.description}
              onChange={(e) => updateDraft("description", e.target.value)}
              rows="2"
            />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`profile-spot ${selected ? "profile-spot--selected" : ""}`}
      onClick={onSelect}
    >
      <div className="profile-spot__header">
        <h3 className="profile-spot__name">{spot.name}</h3>
        <div className="profile-spot__icon-group">
          <button
            type="button"
            className="profile-spot__icon-btn"
            onClick={startEdit}
            aria-label="Edit spot"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="13"
              height="13"
            >
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            type="button"
            className="profile-spot__icon-btn profile-spot__icon-btn--delete"
            onClick={handleDelete}
            aria-label="Delete spot"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="13"
              height="13"
            >
              <path d="M3 6h18" />
              <path d="M8 6V4h8v2" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6" />
            </svg>
          </button>
        </div>
      </div>
      <p className="profile-spot__address">{spot.address}</p>
      <div className="profile-spot__bottom">
        <span className={`profile-spot__status ${statusClass}`}>
          {spot.status}
        </span>
        <span className="profile-spot__type">{spot.category}</span>
      </div>
    </article>
  );
}

ProfileSpotCard.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    noiseLevel: PropTypes.string.isRequired,
    groupFriendly: PropTypes.string.isRequired,
    hours: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["Crowded", "Moderate", "Not crowded"]).isRequired,
    pos: PropTypes.arrayOf(PropTypes.number).isRequired,
  }).isRequired,
  selected: PropTypes.bool,
  onSelect: PropTypes.func,
  onSave: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ProfileSpotCard;
