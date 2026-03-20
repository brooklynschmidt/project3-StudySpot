import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SpotCard from "../../components/SpotCard/Spotcard.jsx";
import SpotDetail from "../../components/SpotDetail/Spotdetail.jsx";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown.jsx";
import "./Explore.css";

function makeIcon(color, size, active) {
  const shadow = active
    ? "box-shadow:0 0 8px rgba(4,57,94,.4);"
    : "box-shadow:0 0 4px rgba(154,189,151,.4);";
  const border = active
    ? "border:2.5px solid #04395E;"
    : "border:2px solid #fff;";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};${border}border-radius:50%;${shadow}transition:all .2s;"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const greenIcon = makeIcon("#9ABD97", 12, false);
const activeIcon = makeIcon("#9ABD97", 16, true);

function Explore({ loggedIn = false }) {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markersRef = useRef({});
  const [allSpots, setAllSpots] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [authPrompt, setAuthPrompt] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    availability: [],
    noiseLevel: [],
    groupFriendly: [],
  });

  useEffect(() => {
    async function fetchSpots() {
      try {
        const res = await fetch("/api/spots");
        if (res.ok) {
          const data = await res.json();
          setAllSpots(data);
        }
      } catch (err) {
        console.error("Failed to fetch spots:", err);
      }
    }
    fetchSpots();
  }, []);

  const toggleFavorite = useCallback(
    (spotId) => {
      if (!loggedIn) {
        setAuthPrompt(true);
        return;
      }
      setFavorites((prev) =>
        prev.includes(spotId)
          ? prev.filter((id) => id !== spotId)
          : [...prev, spotId]
      );
    },
    [loggedIn]
  );

  const handleFavoritesFilter = useCallback(() => {
    if (!loggedIn) {
      setAuthPrompt(true);
      return;
    }
    setShowFavoritesOnly((prev) => !prev);
  }, [loggedIn]);

  const filteredSpots = allSpots.filter((spot) => {
    const spotId = spot._id || spot.id;
    if (showFavoritesOnly && !favorites.includes(spotId)) return false;

    const matchesSearch =
      searchQuery === "" ||
      spot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spot.address.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      filters.category.length === 0 ||
      filters.category.includes(spot.category);

    const matchesAvailability =
      filters.availability.length === 0 ||
      filters.availability.includes(spot.status);

    const matchesNoise =
      filters.noiseLevel.length === 0 ||
      filters.noiseLevel.includes(spot.noiseLevel);

    const matchesGroup =
      filters.groupFriendly.length === 0 ||
      filters.groupFriendly.includes(spot.groupFriendly);

    return (
      matchesSearch &&
      matchesCategory &&
      matchesAvailability &&
      matchesNoise &&
      matchesGroup
    );
  });

  // --- NEW: handle updating spot availability ---
  const handleUpdateAvailability = useCallback(
    async (spotId, newStatus) => {
      try {
        // Update immediately in UI for snappy feedback
        setAllSpots((prev) =>
          prev.map((s) =>
            (s._id || s.id) === spotId ? { ...s, status: newStatus } : s
          )
        );
        if (selectedSpot && (selectedSpot._id || selectedSpot.id) === spotId) {
          setSelectedSpot((prev) => ({ ...prev, status: newStatus }));
        }

        // Persist change to backend
        const res = await fetch(`/api/spots/${spotId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        });

        if (!res.ok) {
          console.error("Failed to update spot status");
        }
      } catch (err) {
        console.error("Error updating spot status:", err);
      }
    },
    [selectedSpot]
  );

  useEffect(() => {
    if (mapRef.current) return;

    mapRef.current = L.map(mapElRef.current, {
      zoomControl: false,
      attributionControl: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 }
    ).addTo(mapRef.current);
    mapRef.current.setView([42.344, -71.08], 14);
  }, []);

  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    Object.values(markersRef.current).forEach((m) =>
      mapRef.current.removeLayer(m)
    );
    markersRef.current = {};

    filteredSpots.forEach((spot) => {
      const spotId = spot._id || spot.id;
      const isActive =
        selectedSpot && (selectedSpot._id || selectedSpot.id) === spotId;
      const icon = isActive ? activeIcon : greenIcon;
      const m = L.marker(spot.pos, { icon })
        .addTo(mapRef.current)
        .bindTooltip(spot.name, { direction: "top", offset: [0, -10] });
      m.on("click", () => {
        setSelectedSpot(spot);
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
      });
      markersRef.current[spotId] = m;
    });
  }, [filteredSpots, selectedSpot]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  const handleSpotClick = useCallback((spot) => {
    setSelectedSpot(spot);
    if (mapRef.current) {
      mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
    }
  }, []);

  const handleCloseDetail = useCallback(() => {
    setSelectedSpot(null);
    if (mapRef.current) {
      mapRef.current.flyTo([42.344, -71.08], 14, { duration: 0.8 });
    }
  }, []);

  const activeFilterCount =
    filters.category.length +
    filters.availability.length +
    filters.noiseLevel.length +
    filters.groupFriendly.length;

  return (
    <main className="explore-page">
      {authPrompt && (
        <div
          className="explore-page__overlay"
          onClick={() => setAuthPrompt(false)}
        >
          <div
            className="explore-page__auth-prompt"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="explore-page__auth-title">
              Create an account to save spots
            </p>
            <p className="explore-page__auth-text">
              Sign up to favorite study spots and access them anytime.
            </p>
            <div className="explore-page__auth-actions">
              <Link
                to="/signup"
                className="explore-page__auth-btn explore-page__auth-btn--primary"
              >
                Sign up
              </Link>
              <Link
                to="/login"
                className="explore-page__auth-btn explore-page__auth-btn--secondary"
              >
                Log in
              </Link>
            </div>
            <button
              type="button"
              className="explore-page__auth-close"
              onClick={() => setAuthPrompt(false)}
              aria-label="Close"
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
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="explore-page__toolbar">
        <div className="explore-page__search">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="#04395E"
            strokeWidth="2"
            strokeLinecap="round"
            width="16"
            height="16"
          >
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            type="text"
            placeholder="Search for a study spot..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="explore-page__tools">
          <button
            type="button"
            className={`explore-page__tool-btn ${
              filterOpen ? "explore-page__tool-btn--active" : ""
            }`}
            onClick={() => setFilterOpen(!filterOpen)}
            title="Filter"
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
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="7" y1="12" x2="17" y2="12" />
              <line x1="10" y1="18" x2="14" y2="18" />
            </svg>
            {activeFilterCount > 0 && (
              <span className="explore-page__filter-badge">
                {activeFilterCount}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`explore-page__tool-btn ${
              showFavoritesOnly ? "explore-page__tool-btn--active" : ""
            }`}
            onClick={handleFavoritesFilter}
            title="Favorites"
          >
            <svg
              viewBox="0 0 24 24"
              fill={showFavoritesOnly ? "#dba8a8" : "none"}
              stroke={showFavoritesOnly ? "#dba8a8" : "currentColor"}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              width="16"
              height="16"
            >
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
          </button>

          <Link
            to="/add-spot"
            className="explore-page__tool-btn explore-page__tool-btn--green"
            title="Add spot"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="#04395E"
              strokeWidth="2.5"
              strokeLinecap="round"
              width="16"
              height="16"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </Link>
        </div>

        {filterOpen && (
          <FilterDropdown
            filters={filters}
            onFilterChange={setFilters}
            onClose={() => setFilterOpen(false)}
          />
        )}
      </div>

      <div className="explore-page__content">
        <div className="explore-page__map">
          <div ref={mapElRef} className="explore-page__leaflet" />
          {selectedSpot && (
            <SpotDetail
              spot={selectedSpot}
              onClose={handleCloseDetail}
              onUpdateAvailability={handleUpdateAvailability} // <-- PASS HERE
            />
          )}
        </div>
        <div className="explore-page__list">
          <p className="explore-page__list-header">
            {filteredSpots.length}{" "}
            {showFavoritesOnly ? "favorited" : ""} spot
            {filteredSpots.length !== 1 ? "s" : ""}{" "}
            {!showFavoritesOnly && (searchQuery || activeFilterCount > 0)
              ? "found"
              : showFavoritesOnly
              ? ""
              : "nearby"}
          </p>
          {filteredSpots.length === 0 && (
            <p className="explore-page__no-results">
              {showFavoritesOnly
                ? "No favorited spots yet. Tap the heart on a spot to save it."
                : "No spots match your filters. Try adjusting your search."}
            </p>
          )}
          {filteredSpots.map((spot) => {
            const spotId = spot._id || spot.id;
            return (
              <SpotCard
                key={spotId}
                name={spot.name}
                address={spot.address}
                status={spot.status}
                category={spot.category}
                selected={
                  selectedSpot &&
                  (selectedSpot._id || selectedSpot.id) === spotId
                }
                favorited={favorites.includes(spotId)}
                onClick={() => handleSpotClick(spot)}
                onToggleFavorite={() => toggleFavorite(spotId)}
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}

Explore.propTypes = {
  loggedIn: PropTypes.bool,
};

export default Explore;