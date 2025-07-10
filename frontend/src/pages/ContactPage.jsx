// src/pages/ContactPage.jsx
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
import FeedbackForm from "../components/FeedbackForm";

// make sure you have these so <md-filled-button> and <md-filled-tonal-button> work
import "@material/web/button/filled-button.js";
import "@material/web/button/filled-tonal-button.js";


export default function ContactPage() {

  return (
    <div className="dashboardCanvas">
      <div className="sidebarSpacer"></div>
      <div className="dashboardContent">

        {/* page title */}
        <div className="profileTitle">Contact us</div>
        <p>Please send us an email: auctioneer@support.mock.com</p>
        <p>You may write a public review for us instead,</p>

        {/* Feedback form */}
        <FeedbackForm/>

      </div>
      <div className="sidebarSpacer"></div>
    </div>
  );
}