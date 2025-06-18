import { IMG_BASE_URL } from "../global-vars.jsx";

export default function Profile() {
    return (
        
        <div className="landingContent">
            <div className="headerSpacing"></div>
            <div className="landingBlock1">
                <div className="title">
                    <p>
                        Auctioneer:
                    </p>
                    <p>
                        Your Auctions, One Telegram Away
                    </p>
                </div>
                <div className="block" id="subtext">
                    Manage auctions on the go: create listings, track bids and receive notifications in Telegram
                </div>
            </div>
            <div className="block" id="landingBlock2">
                <img src={`${IMG_BASE_URL}tele-wireframe-01.png`} style={{ height: "200px", cursor: "pointer" }}/>
            </div>
        </div>  
    )
}