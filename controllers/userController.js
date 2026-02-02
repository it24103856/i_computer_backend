import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";

// 1. Create User
export function createUser(req, res) {
    const data = req.body;
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);

    const user = new User({
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        password: hashedPassword,
        image: data.image || "/default.jpg"
    });

    user.save().then(() => {
        res.json({
            message: "User created successfully",
            user,
        });
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
}

// 2. Login User
export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.find({ email: email }).then((users) => {
        if (users[0] == null) {
            res.status(404).json({ message: "User not found" });
        } else {
            const user = users[0];
            const isPasswordValid = bcrypt.compareSync(password, user.password);

            if (isPasswordValid) {
                const payload = {
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    image: user.image,
                    role: user.role,
                    isemailverified: user.isemailverified
                };

                const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

                res.json({
                    message: "Login successful",
                    token: token,
                    role: user.role
                });
            } else {
                res.status(401).json({ message: "Invalid password" });
            }
        }
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
}

// 3. Admin Check Helper
export function isAdmin(req) {
    // Note: If you don't use middleware, 'req.user' will be undefined here.
    // This helper works only if you manually set req.user before calling it.
    if (req.user == null) {
        return false;
    }
    if (req.user.role != "admin") {
        return false;
    }
    return true;
}

// 4. Get User Details (Fixed without Middleware)
export function getUser(req, res) {
    // Get token from headers
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];

    try {
        // Verify token manually
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Return decoded user data (this includes email, role, etc. from payload)
        res.json(decoded);

    } catch (error) {
        // Token is invalid or expired
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}
export async function googlelogin(req, res) {
    const accessToken = req.body.token;

    if (!accessToken) {
        return res.status(400).json({ message: "Missing Google access token" });
    }

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        const googleUser = response.data;

        if (!googleUser?.email) {
            return res.status(400).json({ message: "Google account has no email" });
        }

        let user = await User.findOne({ email: googleUser.email });

        if (!user) {
            const randomPassword = crypto.randomBytes(32).toString("hex");
            const hashedPassword = bcrypt.hashSync(randomPassword, 10);

            user = new User({
                email: googleUser.email,
                firstName: googleUser.given_name || googleUser.name || "Google",
                lastName: googleUser.family_name || "User",
                password: hashedPassword,
                image: googleUser.picture || "/default.jpg",
                isemailverified: true,
            });

            await user.save();
        }

        const payload = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            image: user.image,
            role: user.role,
            isemailverified: user.isemailverified,
        };

        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });

        return res.json({
            message: "Login successful",
            token,
            role: user.role,
        });
    } catch (error) {
        console.error("Error during Google login:", error.response?.data || error.message);
        return res.status(500).json({ message: "Google login failed", error: error.message });
    }
}
