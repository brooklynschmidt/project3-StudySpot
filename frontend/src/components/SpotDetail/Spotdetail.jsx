import PropTypes from "prop-types";
import "./SpotDetail.css";

function SpotDetail({ spot = null, onClose }) {
  if (!spot) return null;

  const statusClass =
    spot.status === "Crowded"
      ? "spot-detail__status--crowded"
      : spot.status === "Moderate"
        ? "spot-detail__status--moderate"
        : "spot-detail__status--open";

  return (
    <div className="spot-detail">
      <button
        type="button"
        className="spot-detail__close"
        onClick={onClose}
        aria-label="Close detail"
      >
        &times;
      </button>

      <h3 className="spot-detail__name">{spot.name}</h3>
      <p className="spot-detail__address">{spot.address}</p>

      <div className="spot-detail__tags">
        <span className={`spot-detail__status ${statusClass}`}>
          {spot.status}
        </span>
        <span className="spot-detail__category">{spot.category}</span>
      </div>

      {spot.description && (
        <p className="spot-detail__description">{spot.description}</p>
      )}

      <div className="spot-detail__info">
        <div className="spot-detail__row">
          <span className="spot-detail__label">Hours</span>
          <span className="spot-detail__value">{spot.hours || "N/A"}</span>
        </div>
        <div className="spot-detail__row">
          <span className="spot-detail__label">Noise level</span>
          <span className="spot-detail__value">{spot.noiseLevel}</span>
        </div>
        <div className="spot-detail__row">
          <span className="spot-detail__label">Group friendly</span>
          <span className="spot-detail__value">{spot.groupFriendly}</span>
        </div>
        <div className="spot-detail__row">
          <span className="spot-detail__label">Students here now</span>
          <span className="spot-detail__value spot-detail__value--highlight">
            {spot.studentsNow ?? "N/A"}
          </span>
        </div>
      </div>
    </div>
  );
}

SpotDetail.propTypes = {
  spot: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    status: PropTypes.oneOf(["Crowded", "Moderate", "Not crowded"]).isRequired,
    category: PropTypes.string.isRequired,
    noiseLevel: PropTypes.string.isRequired,
    groupFriendly: PropTypes.string.isRequired,
    hours: PropTypes.string,
    description: PropTypes.string,
    studentsNow: PropTypes.number,
    pos: PropTypes.arrayOf(PropTypes.number).isRequired,
  }),
  onClose: PropTypes.func.isRequired,
};

export default SpotDetail;