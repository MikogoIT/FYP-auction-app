import { useRef, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// Material-Web tabs
import "@material/web/tabs/tabs.js";
import "@material/web/tabs/primary-tab.js";

const tabStyles = {
  display: "inline-flex",
  "--md-primary-tab-container-color": "transparent",
  "--md-primary-tab-container-shape": "0px",
  "--md-primary-tab-active-indicator-color": "#B58392",
  "--md-primary-tab-active-indicator-height": "2px",
};
const primaryTabStyles = {
  "--md-primary-tab-label-text-font": "16px",
  padding: "0 10px",
};

export default function ListingTabs() {
  const navigate = useNavigate();
  const location = useLocation();
  const tabsRef = useRef(null);

  // map path → index
  const pathToIdx = (p) =>
    p === "/ListingPage" ? 1 : p === "/mylistings" ? 2 : 0;
  const [tabIndex, setTabIndex] = useState(pathToIdx(location.pathname));

  // sync with history navigation
  useEffect(() => {
    setTabIndex(pathToIdx(location.pathname));
  }, [location.pathname]);

  // on-change handler
  useEffect(() => {
    const el = tabsRef.current;
    if (!el) return;
    const onChange = () => {
      const i = el.activeTabIndex;
      if (i === 0) navigate("/dashboard");
      else if (i === 1) navigate("/ListingPage");
      else navigate("/mylistings");
    };
    el.addEventListener("change", onChange);
    return () => el.removeEventListener("change", onChange);
  }, [navigate]);

  return (
    <div style={{ marginBottom: 16 }}>
      <md-tabs ref={tabsRef} activeTabIndex={tabIndex} style={tabStyles}>
        <md-primary-tab style={primaryTabStyles}>
          recent listings
        </md-primary-tab>
        <md-primary-tab style={primaryTabStyles}>
          all listings
        </md-primary-tab>
        <md-primary-tab style={primaryTabStyles}>
          my listings
        </md-primary-tab>
      </md-tabs>
    </div>
  );
}
