export function formatListingMessage(listing, categoryName) {
    const endDate = new Date(listing.end_date).toLocaleString();
    const minBidNumber = Number(listing.min_bid);
    const highestBidNumber = Number(listing.highest_bid);

    const caption = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    🛎️ <b>NEW Listing on Auctioneer!!</b> 🛎️
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

    📦 <b>Item:</b> ${listing.title}
    🏷️ <b>Category:</b> ${categoryName}
    💰 <b>Starting Bid:</b> $${minBidNumber.toFixed(2)}
    💵 <b>Current Highest Bid:</b> $${highestBidNumber.toFixed(2)}
    ⏰ <b>Ends On:</b> ${endDate}

    📝 <b>Description:</b>
    ${listing.description}

    🚀 <i>Place your bid now by clicking the button below!</i>`;
    const options = {
        parse_mode: "HTML",
        reply_markup: {
            inline_keyboard: [
                [
                    {
                        text: "💸 Bid Now",
                        url: `https://t.me/AuctioneerFYPBot?start=bid_${listing.id}`
                    }
                ]
            ]
        }
    }

    return { 
        photoUrl: listing.image_url,
        caption, 
        options 
    };
}