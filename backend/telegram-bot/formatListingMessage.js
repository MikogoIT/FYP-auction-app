export function formatListingMessage(listing, categoryName) {
    const endDate = new Date(listing.end_date).toLocaleString();

    const text = `
        🛎️ <b>Auctioneer Listing</b> 🛎️

        📦 <b>Item:</b> ${listing.title}
        🏷️ <b>Category:</b> ${categoryName}
        💰 <b>Starting Bid:</b> $${listing.min_bid.toFixed(2)}
        ⏰ <b>Ends On:</b> ${endDate}

        📝 <b>Description:</b>
        ${listing.description}

        🖼️ <a href="${listing.image_url}">View image</a>

        🚀 <i>Place your bid now by clicking the button below!</i>
    `;
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

    return { text, options };
}