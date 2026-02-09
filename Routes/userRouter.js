import express from "express";
import { createUser,loginUser,getUser , googlelogin , sendOtp, vadateOtpAndchangePassword, getAllUsers, updateUserStatus} from "../controllers/userController.js";

 
const userRouter = express.Router();

userRouter.post("/create", createUser); //create user
 userRouter.post("/login", loginUser); //login user
userRouter.get("/", getUser); //get logged in user details
userRouter.post("/google-login",googlelogin); //google login
userRouter.post("/send-otp/:email",sendOtp); //send otp for password reset
userRouter.post("/validate-otp",vadateOtpAndchangePassword); //validate otp and change password
userRouter.get("/all",getAllUsers)
userRouter.put("/toggle-block/:email", updateUserStatus);


 

export default userRouter