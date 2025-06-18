import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

export default function TelegramConnect({ user }) {
    const [telegramLinked, setTelegramLinked] = useState(false);
    const [telegramUsername, setTelegramUsername] = useState(null);
    const [hovered, setHovered] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Show snackbar
    const showSnackbar = (message, severity = "success") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar((prev) => ({ ...prev, open: false }));
    }

    // Check Telegram link status on load
    useEffect(() => {
        if (!user) return;

        const checkStatus = async () => {
            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const res = await fetch("/api/telegram/status", {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const data = await res.json();
                if (res.ok && data.telegram_username) {
                    setTelegramLinked(true);
                    setTelegramUsername(data.telegram_username);
                }
            } catch (err) {
                showSnackbar("Failed to check Telegram link status", "error");
            }
        };

        checkStatus();
    }, [user]);

    // Define global Telegram callback
    useEffect(() => {
        if (!user || telegramLinked) return;

        window.onTelegramAuth = async function (tgUser) {
            const token = localStorage.getItem("token");
            if (!token) return alert("You must be logged in");

            try {
                const res = await fetch("/api/telegram/linkTelegram", {
                    method: "POST",
                    headers: { 
                        "Content-Type": "application/json" ,
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        telegram_id: tgUser.id,
                        telegram_username: tgUser.username,
                    }),
                });

                const result = await res.json();
                if (!res.ok) throw new Error(result.message);

                setTelegramLinked(true);
                setTelegramUsername(tgUser.username);
                showSnackbar("Telegram linked successfully!");
            } catch (err) {
                showSnackbar("Failed to link Telegram: " + err.message, "error");
            }
        };

        const container = document.getElementById("telegram-container");
        if (!telegramLinked && container && !document.getElementById("telegram-login-script")) {
            const script = document.createElement("script");
            script.src = "https://telegram.org/js/telegram-widget.js?22";
            script.setAttribute("data-telegram-login", "AuctioneerFYPBot");
            script.setAttribute("data-size", "large");
            script.setAttribute("data-userpic", "true");
            script.setAttribute("data-request-access", "write");
            script.setAttribute("data-onauth", "onTelegramAuth(user)");
            script.id = "telegram-login-script";
            script.async = true;
            container.appendChild(script);
        }
    }, [user, telegramLinked]);

    // Allow user to unlink their Telegram (after being linked)
    const handleUnlinkTelegram = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;

        try {
            const res = await fetch("/api/telegram/unlinkTelegram", {
                method: "POST",
                headers: { 
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await res.json();
            if (!res.ok) throw new Error(result.message);

            setTelegramLinked(false);
            setTelegramUsername(null);
            showSnackbar("Telegram unlinked.");
        } catch (err) {
            showSnackbar("Error unlinking: " + err.message, "error");
        }
    };

    return (
        <>
            <Box mt={2} display="flex" flexDirection="column" alignItems="center">
                <Box
                    id="telegram-wrapper"
                    onMouseEnter={() => telegramLinked && setHovered(true)}
                    onMouseLeave={() => setHovered(false)}
                    sx={{ width: 305, height: 40, position: "relative", cursor: telegramLinked ? "pointer": "default" }}
                >
                    <Box id="telegram-container" />
                    {/* Show unlink button on hover if linked */}
                    {hovered && (
                        <Button
                            variant="contained"
                            color="error"
                            onClick={handleUnlinkTelegram}
                            sx={{
                                width: "100%",
                                height: "100%",
                                position: "absolute",
                                top: 0,
                                left: 0,
                                zIndex: 10,
                            }}
                        >
                            Unlink from Telegram
                        </Button>
                    )}
                </Box>
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert severity={snackbar.severity} onClose={handleCloseSnackbar} sx={{ width: "100%" }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}