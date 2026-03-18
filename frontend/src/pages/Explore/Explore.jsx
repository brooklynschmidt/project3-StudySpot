import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import SpotCard from "../../components/SpotCard/SpotCard.jsx";
import SpotDetail from "../../components/SpotDetail/SpotDetail.jsx";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown.jsx";
import "./Explore.css";

const PLACEHOLDER_SPOTS = [
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
    studentsNow: 142,
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
    studentsNow: 28,
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
    studentsNow: 54,
  },
  {
    id: "4",
    name: "International Village",
    address: "1155 Tremont St",
    pos: [42.34065, -71.08895],
    status: "Moderate",
    category: "Residence",
    noiseLevel: "Quiet",
    groupFriendly: "No",
    hours: "24 hours (residents only)",
    description:
      "Residence hall with common study lounges on each floor. Quiet after 10 PM.",
    studentsNow: 35,
  },
  {
    id: "5",
    name: "Shillman Hall",
    address: "115 Forsyth St",
    pos: [42.33745, -71.08920],
    status: "Not crowded",
    category: "Academic",
    noiseLevel: "Moderate",
    groupFriendly: "Yes",
    hours: "8:00 AM - 9:00 PM",
    description:
      "Large lecture hall building with open atrium space. Tables and seating on the ground floor.",
    studentsNow: 18,
  },
  {
    id: "6",
    name: "Behrakis Health Sciences",
    address: "30 Leon St",
    pos: [42.33665, -71.09175],
    status: "Not crowded",
    category: "Academic",
    noiseLevel: "Quiet",
    groupFriendly: "No",
    hours: "7:30 AM - 9:00 PM",
    description:
      "Health sciences building with quiet study areas. Less known so usually has open seats.",
    studentsNow: 9,
  },
  {
    id: "7",
    name: "Caffè Bene",
    address: "333 Massachusetts Ave",
    pos: [42.34268, -71.08545],
    status: "Moderate",
    category: "Cafe",
    noiseLevel: "Moderate",
    groupFriendly: "Yes",
    hours: "8:00 AM - 10:00 PM",
    description:
      "Korean cafe near Symphony with great waffles, bingsu, and lattes. Popular with NEU students. Plenty of seating and outlets.",
    studentsNow: 38,
  },
  {
    id: "8",
    name: "Wishing Cup",
    address: "45 Court St",
    pos: [42.35862, -71.05895],
    status: "Not crowded",
    category: "Cafe",
    noiseLevel: "Moderate",
    groupFriendly: "No",
    hours: "7:00 AM - 5:00 PM (Closed Sun)",
    description:
      "Family-owned cafe in the Financial District. Every order supports their wish-granting program. Great matcha and pastries.",
    studentsNow: 8,
  },
  {
    id: "9",
    name: "Jaho Coffee - Back Bay",
    address: "116 Huntington Ave",
    pos: [42.34795, -71.07755],
    status: "Moderate",
    category: "Cafe",
    noiseLevel: "Moderate",
    groupFriendly: "Yes",
    hours: "6:30 AM - 11:00 PM",
    description:
      "Largest Jaho location with a fireplace lounge, marble bar, and wine/beer. Open late — great for evening study sessions.",
    studentsNow: 45,
  },
  {
    id: "10",
    name: "Jaho Coffee - Chinatown",
    address: "665 Washington St",
    pos: [42.35155, -71.06255],
    status: "Not crowded",
    category: "Cafe",
    noiseLevel: "Quiet",
    groupFriendly: "Yes",
    hours: "6:30 AM - 11:00 PM",
    description:
      "Flagship Jaho location with in-house roaster, slow coffee bar, and full food menu. Open late with a chill vibe.",
    studentsNow: 22,
  },
  {
    id: "11",
    name: "Jaho Coffee - South End",
    address: "1651 Washington St",
    pos: [42.33665, -71.07445],
    status: "Not crowded",
    category: "Cafe",
    noiseLevel: "Quiet",
    groupFriendly: "No",
    hours: "6:30 AM - 9:00 PM",
    description:
      "Cozy South End location. First Jaho in Boston. Great coffee and a relaxed neighborhood feel.",
    studentsNow: 14,
  },
  {
    id: "12",
    name: "Caffè Nero - Copley",
    address: "100 Huntington Ave",
    pos: [42.34740, -71.07985],
    status: "Moderate",
    category: "Cafe",
    noiseLevel: "Moderate",
    groupFriendly: "No",
    hours: "6:30 AM - 7:30 PM",
    description:
      "Italian coffee chain in Copley Place. Solid espresso, free wifi, and baked goods. Good for quick study sessions.",
    studentsNow: 20,
  },
  {
    id: "13",
    name: "Caffè Nero - South End",
    address: "564 Tremont St",
    pos: [42.34460, -71.07095],
    status: "Not crowded",
    category: "Cafe",
    noiseLevel: "Quiet",
    groupFriendly: "No",
    hours: "6:30 AM - 9:00 PM",
    description:
      "Quiet South End Nero location. Italian-style light dishes and blended drinks in a cozy setting.",
    studentsNow: 10,
  },
  {
    id: "14",
    name: "Boston Public Library",
    address: "700 Boylston St",
    pos: [42.34940, -71.07835],
    status: "Moderate",
    category: "Library",
    noiseLevel: "Quiet",
    groupFriendly: "No",
    hours: "9:00 AM - 9:00 PM (Mon-Thu)",
    description:
      "Historic public library at Copley Square. Beautiful reading rooms, free wifi, and open to everyone. No Husky Card needed.",
    studentsNow: 95,
  },
  {
    id: "15",
    name: "Capital One Cafe - Back Bay",
    address: "711 Boylston St",
    pos: [42.34900, -71.07650],
    status: "Not crowded",
    category: "Cafe",
    noiseLevel: "Moderate",
    groupFriendly: "Yes",
    hours: "7:00 AM - 7:00 PM",
    description:
      "Free wifi, comfortable seating, and 50% off drinks with a Capital One card. Private nooks available for account holders.",
    studentsNow: 25,
  },
  {
    id: "16",
    name: "Blank Street - Boylston",
    address: "647 Boylston St",
    pos: [42.34935, -71.07475],
    status: "Not crowded",
    category: "Cafe",
    noiseLevel: "Moderate",
    groupFriendly: "No",
    hours: "6:30 AM - 8:00 PM",
    description:
      "Minimalist coffee shop on Boylston. Quick service, good matcha and espresso. Small but efficient.",
    studentsNow: 6,
  },
];

function makeIcon(color, size, active) {
  const shadow = active ? "box-shadow:0 0 8px rgba(4,57,94,.4);" : "box-shadow:0 0 4px rgba(154,189,151,.4);";
  const border = active ? "border:2.5px solid #04395E;" : "border:2px solid #fff;";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};${border}border-radius:50%;${shadow}transition:all .2s;"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const greenIcon = makeIcon("#9ABD97", 12, false);
const activeIcon = makeIcon("#9ABD97", 16, true);

function Explore() {
  const mapRef = useRef(null);
  const mapElRef = useRef(null);
  const markersRef = useRef({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [filters, setFilters] = useState({
    category: [],
    availability: [],
    noiseLevel: [],
    groupFriendly: [],
  });

  const toggleFavorite = useCallback((spotId) => {
    setFavorites((prev) =>
      prev.includes(spotId)
        ? prev.filter((id) => id !== spotId)
        : [...prev, spotId],
    );
  }, []);

  // TODO: Replace with API fetch
  const allSpots = PLACEHOLDER_SPOTS;

  const filteredSpots = allSpots.filter((spot) => {
    if (showFavoritesOnly && !favorites.includes(spot.id)) return false;

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
    mapRef.current.setView([42.3440, -71.0800], 14);
  }, []);

  const updateMarkers = useCallback(() => {
    if (!mapRef.current) return;

    Object.values(markersRef.current).forEach((m) =>
      mapRef.current.removeLayer(m),
    );
    markersRef.current = {};

    filteredSpots.forEach((spot) => {
      const isActive = selectedSpot && selectedSpot.id === spot.id;
      const icon = isActive ? activeIcon : greenIcon;
      const m = L.marker(spot.pos, { icon })
        .addTo(mapRef.current)
        .bindTooltip(spot.name, { direction: "top", offset: [0, -10] });
      m.on("click", () => {
        setSelectedSpot(spot);
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
      });
      markersRef.current[spot.id] = m;
    });
  }, [filteredSpots, selectedSpot]);

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  const handleSpotClick = useCallback(
    (spot) => {
      setSelectedSpot(spot);
      if (mapRef.current) {
        mapRef.current.flyTo(spot.pos, 17, { duration: 0.8 });
      }
    },
    [],
  );

  const handleCloseDetail = useCallback(() => {
    setSelectedSpot(null);
    if (mapRef.current) {
      mapRef.current.flyTo([42.3440, -71.0800], 14, { duration: 0.8 });
    }
  }, []);

  const activeFilterCount =
    filters.category.length +
    filters.availability.length +
    filters.noiseLevel.length +
    filters.groupFriendly.length;

  return (
    <main className="explore-page">
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
            className={`explore-page__tool-btn ${filterOpen ? "explore-page__tool-btn--active" : ""}`}
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
            className={`explore-page__tool-btn ${showFavoritesOnly ? "explore-page__tool-btn--active" : ""}`}
            onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
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
            <SpotDetail spot={selectedSpot} onClose={handleCloseDetail} />
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
          {filteredSpots.map((spot) => (
            <SpotCard
              key={spot.id}
              name={spot.name}
              address={spot.address}
              status={spot.status}
              category={spot.category}
              selected={selectedSpot && selectedSpot.id === spot.id}
              favorited={favorites.includes(spot.id)}
              onClick={() => handleSpotClick(spot)}
              onToggleFavorite={() => toggleFavorite(spot.id)}
            />
          ))}
        </div>
      </div>
    </main>
  );
}

Explore.propTypes = {};

export default Explore;