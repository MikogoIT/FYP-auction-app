// userRoutes.js
import express from "express";
import { getAllUsers, createUser } from "./userModel.js";

const router = express.Router();

router.get("/getAllUsers", async (req, res) => {
    try {
        const users = await getAllUsers();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch users" });
    }
});

router.post("/createUser", async (req, res) => {
    const { username, email, password } = req.body;
    try {
        const newUser = await createUser(username, email, password);
        res.status(201).json(newUser);
    } catch (err) {
        res.status(500).json({ error: "Failed to create user" });
    }
});

export default router;