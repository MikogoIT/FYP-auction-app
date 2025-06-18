import { IMG_BASE_URL } from "../global-vars.jsx";

export default function Profile() {
    return (
        
        <div className="landingContent">
            <div className="headerSpacing"></div>
                <div className="theBlocks">
                <div className="block" id="landingBlock1">
                    <div className="title">
                        <div>
                            Auctioneer
                        </div>
                    </div>
                    <div className="subtext">
                        <div>
                            Your Auctions, One Telegram Away
                        </div>
                        
                    </div>
                </div>
                <div className="block" id="landingBlock2">
                    <img src={`${IMG_BASE_URL}tele-wireframe-01.png`} style={{ height: "200px", cursor: "pointer" }}/>
                </div>
            </div>
        </div>  
    )
}