import PropTypes from "prop-types";
import MapView from "../../components/MapView/MapView.jsx";
import "./Home.css";

function Home() {
  return (
    <main className="home">
      <MapView spots={[]} />
    </main>
  );
}

Home.propTypes = {};

export default Home;
