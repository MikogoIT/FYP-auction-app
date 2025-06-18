// controllers/authController.js
import * as AuthModel from "../models/authModel.js";
import { comparePassword, hashPassword } from "../utils/auth.js";
import { createToken } from "../utils/token.js";

export async function loginUser(req, res) {
  let { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and Password are required" });
  }

  //Convert input to lowercase
  email = email.toLowerCase();

  try {
    const user = await AuthModel.findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    if (user.is_frozen) {
      return res.status(403).json({ message: "Account is frozen. Please contact admin." });
    }

    const match = await comparePassword(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ message: "Wrong account or password" });
    }

    const token = createToken(user.id);

    res.json({ message: "Login successful", token, user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function registerUser(req, res) {
  let { username, email, password, full_name, phone_number, address } = req.body;


  if (!username || !email || !password || !full_name || !phone_number || !address) {
    return res.status(400).json({ message: "All fields are required" });
  }

  emailLower = email.toLowerCase();
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\d{8}$/;

  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: "The email format is incorrect, please try again" });
  }

  if (!phoneRegex.test(phone_number)) {
    return res.status(400).json({ message: "Phone number must be 8 digits" });
  }

  try {
    if (await AuthModel.emailExists(email)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    if (await AuthModel.usernameExists(username)) {
      return res.status(409).json({ message: "Username already exists, please change it" });
    }

    const passwordHash = hashPassword(password);
    const newUser = await AuthModel.createUser({
      username,
      email: emailLower,
      passwordHash,
      full_name,
      phone_number,
      address,
    });

    res.status(201).json({
      message: "User registered successfully",
      user: newUser
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}
