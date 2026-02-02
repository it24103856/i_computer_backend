import express from "express"
import mongoose from "mongoose"
import userRouter from "./Routes/userRouter.js"
import productRouter from "./Routes/productRouter.js"
import jwt from "jsonwebtoken"
import cors from "cors"
import dotenv from "dotenv"
import orderRouter from "./Routes/orderRouter.js"

dotenv.config();


const mongoUrl=process.env.Mongo_url;



mongoose.connect(mongoUrl).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err)
})

let app = express()

app.use(express.json())


app.use(cors())

// Log Authorization header for incoming requests (placed before routers)
app.use((req, res, next) => {
    const authorizationHeader = req.header("Authorization");
   
   if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")
        console.log("Authorization Token:", token);

         jwt.verify(token, process.env.JWT_SECRET, (error, content) => {
           if(error){
            console.log("Invalid token:", error.message);
           } else if(content){
            console.log("Token content:", content);
            req.user = content;
           }
        })
    }
    next();
});


app.use("/api/users", userRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);




const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});