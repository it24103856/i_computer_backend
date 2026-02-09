import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import axios from "axios";
import crypto from "crypto";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Otp from "../models/Otp.js"; 

dotenv.config();

// 1. Email Transporter එක (Gmail Settings සමඟ)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, 
    },
    tls: {
        rejectUnauthorized: false,
        minVersion: "TLSv1.2"
    }
});

// 2. isAdmin Function එක (අනිවාර්යයෙන්ම Export කළ යුතුයි)
export function isAdmin(req) {
    if (req.user == null) {
        return false;
    }
    if (req.user.role != "admin") {
        return false;
    }
    return true;
}

// 3. Create User
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
        res.json({ message: "User created successfully", user });
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
}

// 4. Login User
export function loginUser(req, res) {
    const email = req.body.email;
    const password = req.body.password;

    User.find({ email: email }).then((users) => {
        if (users[0] == null) {
            res.status(404).json({ message: "User not found" });
        } else {
            const user = users[0];
            if(user.isblocked){
                return res.status(403).json({ message: "Your account is blocked. Please contact support." });
            }
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
                res.json({ message: "Login successful", token: token, role: user.role });
            } else {
                res.status(401).json({ message: "Invalid password" });
            }
        }
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
}

// 5. Get User Details
export function getUser(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json(decoded);
    } catch (error) {
        res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
}

// 6. Send OTP (Forget Password සඳහා)
export async function sendOtp(req, res) {
    const email = req.params.email;
    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found with this email." });
        }

        const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

        await Otp.findOneAndDelete({ email: email });

        const newOtpEntry = new Otp({
            email: email,
            otp: generatedOtp,
            otpExpiry: otpExpiry
        });
        await newOtpEntry.save();

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for password reset is: ${generatedOtp}. This code is valid for 10 minutes.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Email Error:", err);
                return res.status(500).json({ message: "Failed to send email." });
            }
            return res.json({ message: "OTP sent successfully!", status: "Email sent" });
        });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// 7. Validate OTP and Change Password
export async function vadateOtpAndchangePassword(req, res) {
    try {
        const { email, otp, newPassword } = req.body;
        const otpRecord = await Otp.findOne({ email: email, otp: otp });
        if (!otpRecord) {
            return res.status(400).json({ message: "Invalid OTP or email." });
        }
        await Otp.deleteOne({ email: email, otp: otp });
        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await User.updateOne({ email: email }, {
            $set: { password: hashedPassword, isemailverified: true }
        });
        res.json({ message: "Password changed successfully." });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// 8. Google Login
export async function googlelogin(req, res) {
    const accessToken = req.body.token;
    if (!accessToken) return res.status(400).json({ message: "Missing Google access token" });

    try {
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        const googleUser = response.data;
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
        if(user.isblocked){
            return res.status(403).json({ message: "Your account is blocked. Please contact support." });
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
        return res.json({ message: "Login successful", token, role: user.role });
    } catch (error) {
        return res.status(500).json({ message: "Google login failed", error: error.message });
    }
}

// 9. Get All Users (Admin Only)
export async function getAllUsers(req, res) {
    if (!isAdmin(req)) {
         res.status(403).json({ message: "Unauthorized: Admins only" });
        return;
    }
    try {
        const users=await User.find()
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

// User Status Update (Block/Unblock)
export async function updateUserStatus(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Unauthorized: Admins only" });
    }

    const email = req.params.email;
    const isBlockedValue = req.body.isBlocked; // Frontend එකෙන් එවන්නේ මෙයයි

    try {
        // Schema එකේ field එක 'isblocked' නිසා එය එලෙසම තිබිය යුතුයි
        const result = await User.updateOne(
            { email: email }, 
            { $set: { isblocked: isBlockedValue } }
        );
        
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User status updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error updating status", error: error.message });
    }
}