import '@material/web/button/filled-button.js';
import { IMG_BASE_URL } from "../global-vars.jsx";
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import markdown from '../mds/landing.md?raw';

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
            <p className="title1">Auctioneer</p>
          </div>
          <div className="subtext">
            <p className="subtext1">Your Auctions, One Telegram Away</p>

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
            className="landing_tele"
            src={`${IMG_BASE_URL}wallpaper.png`}
            alt="Telegram wireframe"
          />
        </div>
      </div>

      <ReactMarkdown>{markdown}</ReactMarkdown>
    </div>
  );
}
