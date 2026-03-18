import { useEffect, useRef, useState, useCallback } from "react";
import PropTypes from "prop-types";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./MapView.css";

const NEU = [42.3398, -71.0892];
const SNELL = [42.3386, -71.0877];
const MASS_AVE = [42.342, -71.0853];
const KHOURY = [42.3370, -71.0920];

const SPOTS = [
  { pos: [42.3386, -71.0877], name: "Snell Library" },
  { pos: [42.3395, -71.091], name: "Curry Student Center" },
  { pos: [42.3375, -71.086], name: "Hayden Hall" },
  { pos: [42.341, -71.087], name: "International Village" },
  { pos: [42.342, -71.0853], name: "300 Mass Ave" },
  { pos: [42.34, -71.09], name: "Shillman Hall" },
  { pos: [42.3365, -71.0895], name: "Forsyth Building" },
  { pos: [42.3408, -71.0885], name: "Behrakis Health Sciences" },
];

function makeIcon(color, size, shadow) {
  const sh = shadow ? `box-shadow:0 0 6px ${shadow};` : "";
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:2px solid #fff;border-radius:50%;${sh}"></div>`,
    className: "",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

const greenIcon = makeIcon("#9ABD97", 10, "");
const redIcon = makeIcon("#E24B4A", 16, "rgba(226,75,74,.4)");
const bigGreenIcon = makeIcon("#9ABD97", 16, "rgba(154,189,151,.5)");
const navyIcon = makeIcon("#04395E", 16, "rgba(4,57,94,.4)");

function MapView({ spots }) {
  const heroMapRef = useRef(null);
  const mainMapRef = useRef(null);
  const heroMapEl = useRef(null);
  const mainMapEl = useRef(null);
  const frameRef = useRef(null);
  const svgRef = useRef(null);
  const markersRef = useRef([]);
  const [currentStep, setCurrentStep] = useState(0);
  const isTransitioning = useRef(false);
  const accumulated = useRef(0);
  const totalSteps = 5;
  const displaySpots = spots.length > 0 ? spots : SPOTS;

  useEffect(() => {
    if (heroMapRef.current) return;

    heroMapRef.current = L.map(heroMapEl.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(heroMapRef.current);
    heroMapRef.current.setView(NEU, 15);

    mainMapRef.current = L.map(mainMapEl.current, {
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
      dragging: false,
    });
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
      { maxZoom: 19 },
    ).addTo(mainMapRef.current);
    mainMapRef.current.setView(NEU, 15);
  }, []);

  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => mainMapRef.current.removeLayer(m));
    markersRef.current = [];
  }, []);

  const clearLines = useCallback(() => {
    if (svgRef.current) {
      svgRef.current.innerHTML = "";
    }
  }, []);

  const drawLine = useCallback((cardId, latlng) => {
    if (!svgRef.current || !mainMapRef.current) return;

    const map = mainMapRef.current;
    const cardEl = document.getElementById(cardId);
    if (!cardEl) return;

    setTimeout(() => {
      const point = map.latLngToContainerPoint(L.latLng(latlng));
      if (!point) return;

      const cardRect = cardEl.getBoundingClientRect();
      const frameRect = frameRef.current.getBoundingClientRect();

      const cardCenterY = cardRect.top - frameRect.top + cardRect.height / 2;

      let cardEdgeX;

      if (cardRect.left > frameRect.left + frameRect.width / 2) {
        cardEdgeX = cardRect.left - frameRect.left;
      } else {
        cardEdgeX = cardRect.right - frameRect.left;
      }

      const line = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "line",
      );
      line.setAttribute("x1", cardEdgeX);
      line.setAttribute("y1", cardCenterY);
      line.setAttribute("x2", point.x);
      line.setAttribute("y2", point.y);
      line.setAttribute("stroke", "#04395E");
      line.setAttribute("stroke-width", "1.5");
      line.setAttribute("stroke-dasharray", "6 4");
      line.setAttribute("opacity", "0.5");
      svgRef.current.appendChild(line);

      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle",
      );
      circle.setAttribute("cx", point.x);
      circle.setAttribute("cy", point.y);
      circle.setAttribute("r", "4");
      circle.setAttribute("fill", "#04395E");
      circle.setAttribute("opacity", "0.5");
      svgRef.current.appendChild(circle);
    }, 800);
  }, []);

  const goToStep = useCallback(
    (step) => {
      if (
        step < 0 ||
        step >= totalSteps ||
        isTransitioning.current ||
        step === currentStep
      )
        return;

      isTransitioning.current = true;
      setCurrentStep(step);
      clearMarkers();
      clearLines();

      const map = mainMapRef.current;

      if (step === 1) {
        map.flyTo(NEU, 15, { duration: 1.2 });
        setTimeout(() => {
          displaySpots.forEach((s) => {
            const m = L.marker(s.pos, { icon: greenIcon })
              .addTo(map)
              .bindTooltip(s.name, { direction: "top", offset: [0, -8] });
            markersRef.current.push(m);
          });
        }, 400);
      } else if (step === 2) {
        map.flyTo(SNELL, 17, { duration: 1.2 });
        setTimeout(() => {
          const m = L.marker(SNELL, { icon: redIcon })
            .addTo(map)
            .bindTooltip("Snell Library", {
              direction: "top",
              offset: [0, -12],
              permanent: true,
            });
          markersRef.current.push(m);
          drawLine("card-snell", SNELL);
        }, 600);
      } else if (step === 3) {
        map.flyTo([42.3403, -71.0865], 16, { duration: 1.2 });
        setTimeout(() => {
          const m1 = L.marker(SNELL, { icon: redIcon })
            .addTo(map)
            .bindTooltip("Snell Library", {
              direction: "top",
              offset: [0, -12],
            });
          const m2 = L.marker(MASS_AVE, { icon: bigGreenIcon })
            .addTo(map)
            .bindTooltip("300 Mass Ave", {
              direction: "top",
              offset: [0, -12],
              permanent: true,
            });
          markersRef.current.push(m1, m2);
          drawLine("card-discover", MASS_AVE);
        }, 600);
      } else if (step === 4) {
        map.flyTo(KHOURY, 17, { duration: 1.2 });
        setTimeout(() => {
          const m = L.marker(KHOURY, { icon: navyIcon })
            .addTo(map)
            .bindTooltip("Khoury College", {
              direction: "top",
              offset: [0, -12],
              permanent: true,
            });
          markersRef.current.push(m);
          drawLine("card-khoury", KHOURY);
        }, 600);
      } else if (step === 0) {
        map.flyTo(NEU, 15, { duration: 1 });
      }

      setTimeout(() => {
        isTransitioning.current = false;
      }, 1400);
    },
    [currentStep, clearMarkers, clearLines, drawLine, displaySpots],
  );

  useEffect(() => {
    const frame = frameRef.current;
    const handleWheel = (e) => {
      e.preventDefault();
      if (isTransitioning.current) return;

      accumulated.current += e.deltaY;

      if (Math.abs(accumulated.current) >= 80) {
        if (accumulated.current > 0) goToStep(currentStep + 1);
        else goToStep(currentStep - 1);
        accumulated.current = 0;
      }
    };

    frame.addEventListener("wheel", handleWheel, { passive: false });
    return () => frame.removeEventListener("wheel", handleWheel);
  }, [currentStep, goToStep]);

  return (
    <div className="map-view" ref={frameRef}>
      {/* Layer 1: Full map */}
      <div className="map-view__full-map">
        <div ref={mainMapEl} className="map-view__leaflet" />
      </div>

      {/* Layer 2: SVG connector lines */}
      <svg className="map-view__lines" ref={svgRef} />

      {/* Layer 3: Overlay cards */}
      <div
        id="card-allspots"
        className={`map-view__card map-view__card--allspots ${currentStep === 1 ? "map-view__card--visible" : ""}`}
      >
        <h2>All spots on campus</h2>
        <p>Browse every study space at a glance</p>
      </div>

      <div
        id="card-snell"
        className={`map-view__card map-view__card--snell ${currentStep === 2 ? "map-view__card--visible" : ""}`}
      >
        <h2>Sick of Snell?</h2>
        <p>
          The same crowded tables, the same packed floors. There are better
          options hiding in plain sight.
        </p>
      </div>

      <div
        id="card-discover"
        className={`map-view__card map-view__card--discover ${currentStep === 3 ? "map-view__card--visible" : ""}`}
      >
        <h2>Discover new spots</h2>
        <div className="map-view__spot-name">300 Mass Ave</div>
        <div className="map-view__spot-info">
          Quiet workspace with natural light
        </div>
        <span className="map-view__badge">30 students studying</span>
      </div>

      <div
        id="card-khoury"
        className={`map-view__card map-view__card--khoury ${currentStep === 4 ? "map-view__card--visible" : ""}`}
      >
        <div className="map-view__khoury-label">
          <svg viewBox="0 0 20 20" fill="none" width="16" height="16">
            <polygon
              points="10,1 12.5,7 19,7.5 14,12 15.5,19 10,15.5 4.5,19 6,12 1,7.5 7.5,7"
              fill="#9ABD97"
            />
          </svg>
          <span>Khoury College</span>
        </div>
        <h2>Made by students, for students</h2>
        <p>
          We noticed students always end up at the same crowded spots.
          StudySpot was built to change that.
        </p>
        <div className="map-view__bios">
          <div className="map-view__bio-card">
            <div className="map-view__bio-avatar">IY</div>
            <div>
              <p className="map-view__bio-name">Isabel Yeow</p>
              <p className="map-view__bio-text">
                Tired of circling Snell for an open seat. Built StudySpot so
                nobody has to settle for the last chair again.
              </p>
            </div>
          </div>
          <div className="map-view__bio-card">
            <div className="map-view__bio-avatar">BS</div>
            <div>
              <p className="map-view__bio-name">Brooklyn Schmidt</p>
              <p className="map-view__bio-text">
                Wanted a better way for students to share the spots they
                swear by. 
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Layer 4: Hero */}
      <div
        className="map-view__hero"
        style={{
          opacity: currentStep === 0 ? 1 : 0,
          pointerEvents: currentStep === 0 ? "auto" : "none",
        }}
      >
        <div className="map-view__hero-map">
          <div ref={heroMapEl} className="map-view__leaflet" />
        </div>
        <div className="map-view__hero-text">
          <h1>
            Never
            <br />
            wander
            <br />
            again.
          </h1>
          <p>Find your perfect study space</p>
          <div className="map-view__scroll-hint">
            <span>Scroll to explore</span>
            <span className="map-view__scroll-arrow">&#8595;</span>
          </div>
        </div>
      </div>

      {/* Layer 5: Navigation */}
      <div className="map-view__dots">
        {[0, 1, 2, 3, 4].map((i) => (
          <button
            key={i}
            className={`map-view__dot ${currentStep === i ? "map-view__dot--active" : ""}`}
            onClick={() => goToStep(i)}
            aria-label={`Go to step ${i + 1}`}
          />
        ))}
      </div>

      <button
        className="map-view__nav map-view__nav--prev"
        onClick={() => goToStep(currentStep - 1)}
        style={{
          opacity: currentStep === 0 ? 0.2 : 1,
          pointerEvents: currentStep === 0 ? "none" : "auto",
        }}
        aria-label="Previous step"
      >
        &#8249;
      </button>
      <button
        className="map-view__nav map-view__nav--next"
        onClick={() => goToStep(currentStep + 1)}
        style={{
          opacity: currentStep === totalSteps - 1 ? 0.2 : 1,
          pointerEvents: currentStep === totalSteps - 1 ? "none" : "auto",
        }}
        aria-label="Next step"
      >
        &#8250;
      </button>
    </div>
  );
}

MapView.propTypes = {
  spots: PropTypes.arrayOf(
    PropTypes.shape({
      pos: PropTypes.arrayOf(PropTypes.number).isRequired,
      name: PropTypes.string.isRequired,
    }),
  ),
};

MapView.defaultProps = {
  spots: [],
};

export default MapView;