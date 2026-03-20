import { useState } from "react";
import PropTypes from "prop-types";
import "./Filterdropdown.css";

const CATEGORIES = ["Library", "Cafe", "Academic", "Student center", "Residence"];
const AVAILABILITY = ["Crowded", "Moderate", "Not crowded"];
const NOISE_LEVELS = ["Quiet", "Moderate", "Loud"];
const GROUP_OPTIONS = ["Yes", "No"];

function FilterDropdown({ filters, onFilterChange, onClose }) {
  const [localFilters, setLocalFilters] = useState({ ...filters });

  const toggleFilter = (key, value) => {
    setLocalFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  const toggleSingleFilter = (key, value) => {
    setLocalFilters((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value) ? [] : [value];
      return { ...prev, [key]: updated };
    });
  };

  const handleApply = () => {
    onFilterChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {
      category: [],
      availability: [],
      noiseLevel: [],
      groupFriendly: [],
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
    onClose();
  };

  const activeCount =
    (localFilters.category?.length || 0) +
    (localFilters.availability?.length || 0) +
    (localFilters.noiseLevel?.length || 0) +
    (localFilters.groupFriendly?.length || 0);

  return (
    <div className="filter-dropdown">
      <div className="filter-dropdown__section">
        <h4 className="filter-dropdown__label">Category</h4>
        <div className="filter-dropdown__chips">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`filter-dropdown__chip ${
                localFilters.category?.includes(cat)
                  ? "filter-dropdown__chip--active"
                  : ""
              }`}
              onClick={() => toggleFilter("category", cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-dropdown__section">
        <h4 className="filter-dropdown__label">Availability</h4>
        <div className="filter-dropdown__chips">
          {AVAILABILITY.map((a) => (
            <button
              key={a}
              type="button"
              className={`filter-dropdown__chip ${
                localFilters.availability?.includes(a)
                  ? "filter-dropdown__chip--active"
                  : ""
              }`}
              onClick={() => toggleFilter("availability", a)}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-dropdown__section">
        <h4 className="filter-dropdown__label">Noise level</h4>
        <div className="filter-dropdown__chips">
          {NOISE_LEVELS.map((n) => (
            <button
              key={n}
              type="button"
              className={`filter-dropdown__chip ${
                localFilters.noiseLevel?.includes(n)
                  ? "filter-dropdown__chip--active"
                  : ""
              }`}
              onClick={() => toggleFilter("noiseLevel", n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-dropdown__section">
        <h4 className="filter-dropdown__label">Group friendly</h4>
        <div className="filter-dropdown__chips">
          {GROUP_OPTIONS.map((g) => (
            <button
              key={g}
              type="button"
              className={`filter-dropdown__chip ${
                localFilters.groupFriendly?.includes(g)
                  ? "filter-dropdown__chip--active"
                  : ""
              }`}
              onClick={() => toggleSingleFilter("groupFriendly", g)}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-dropdown__actions">
        <button
          type="button"
          className="filter-dropdown__btn filter-dropdown__btn--clear"
          onClick={handleClear}
        >
          Clear all {activeCount > 0 ? `(${activeCount})` : ""}
        </button>
        <button
          type="button"
          className="filter-dropdown__btn filter-dropdown__btn--apply"
          onClick={handleApply}
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}

FilterDropdown.propTypes = {
  filters: PropTypes.shape({
    category: PropTypes.arrayOf(PropTypes.string),
    availability: PropTypes.arrayOf(PropTypes.string),
    noiseLevel: PropTypes.arrayOf(PropTypes.string),
    groupFriendly: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default FilterDropdown;