import '@material/web/button/filled-button.js';
import { IMG_BASE_URL } from "../global-vars.jsx";
import { useNavigate } from 'react-router-dom';

export default function Landing() {
    const navigate = useNavigate();
    const handleGetStarted = () => {
        navigate('/register');
    };

  return (
    <div className="landingContent">
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
            alt="Telegram wireframe"
          />
        </div>
      </div>
    </div>
  );
}
