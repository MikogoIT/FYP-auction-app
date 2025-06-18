import '@material/web/button/filled-button.js';
import { IMG_BASE_URL } from "../global-vars.jsx";

export default function Profile() {
  const handleGetStarted = () => {
    // TODO: wire up your navigation or action here
    console.log('Get Started clicked');
  };

  return (
    <div className="landingContent">
      <div className="headerSpacing" />
      <div className="theBlocks">
        <div className="block" id="landingBlock1">
          <div className="title">
            <div>Auctioneer</div>
          </div>
          <div className="subtext">
            <div>Your Auctions, One Telegram Away</div>

            {/* Material Web "filled" button */}
            <md-filled-button
              style={{ marginTop: '24px' }}
              onClick={handleGetStarted}
            >
              Get Started
            </md-filled-button>
          </div>
        </div>

        <div className="block" id="landingBlock2">
          <img
            src={`${IMG_BASE_URL}tele-wireframe-01.png`}
            style={{ height: "200px", cursor: "pointer" }}
            alt="Telegram wireframe"
          />
        </div>
      </div>
    </div>
  );
}
