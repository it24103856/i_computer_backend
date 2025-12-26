import express from "express";
import { createUser,loginUser,} from "../controllers/userController.js"

 
const userRouter = express.Router();

userRouter.post("/create", createUser); //create user
 userRouter.post("/login", loginUser); //login user
 

export default userRouter