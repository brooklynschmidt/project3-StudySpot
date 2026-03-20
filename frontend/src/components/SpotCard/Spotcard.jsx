import PropTypes from "prop-types";
import "./Spotcard.css";

function SpotCard({
  name,
  address,
  status,
  category,
  selected = false,
  favorited = false,
  onClick = () => {},
  onToggleFavorite = () => {},
}) {
  const statusClass =
    status === "Crowded"
      ? "spot-card__status--crowded"
      : status === "Moderate"
        ? "spot-card__status--moderate"
        : "spot-card__status--open";

  const handleHeartClick = (e) => {
    e.stopPropagation();
    onToggleFavorite();
  };

  return (
    <article
      className={`spot-card ${selected ? "spot-card--selected" : ""}`}
      onClick={onClick}
    >
      <div className="spot-card__content">
        <h3 className="spot-card__name">{name}</h3>
        <p className="spot-card__address">{address}</p>
        <div className="spot-card__bottom">
          <span className={`spot-card__status ${statusClass}`}>{status}</span>
          <span className="spot-card__type">{category}</span>
        </div>
      </div>
      <button
        type="button"
        className="spot-card__heart"
        onClick={handleHeartClick}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
      >
        <svg
          viewBox="0 0 24 24"
          fill={favorited ? "#dba8a8" : "none"}
          stroke={favorited ? "#dba8a8" : "#d4d0d0"}
          strokeWidth={favorited ? "2" : "1.5"}
          strokeLinecap="round"
          strokeLinejoin="round"
          width="14"
          height="14"
        >
          <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
        </svg>
      </button>
    </article>
  );
}

SpotCard.propTypes = {
  name: PropTypes.string.isRequired,
  address: PropTypes.string.isRequired,
  status: PropTypes.oneOf(["Crowded", "Moderate", "Not crowded"]).isRequired,
  category: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  favorited: PropTypes.bool,
  onClick: PropTypes.func,
  onToggleFavorite: PropTypes.func,
};

export default SpotCard;