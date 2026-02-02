import express from "express";
import { createUser,loginUser,getUser , googlelogin  } from "../controllers/userController.js"

 
const userRouter = express.Router();

userRouter.post("/create", createUser); //create user
 userRouter.post("/login", loginUser); //login user
userRouter.get("/", getUser); //get logged in user details
userRouter.post("/google-login",googlelogin); //google login


 

export default userRouter