import express from "express"
import mongoose from "mongoose"
import userRouter from "./Routes/userRouter.js"
import productRouter from "./Routes/productRouter.js"
import jwt from "jsonwebtoken"


let mongoUrl="mongodb+srv://admin12:admin1234@cluster0.uas8odg.mongodb.net/?appName=Cluster0"




mongoose.connect(mongoUrl).then(() => {
    console.log("Connected to MongoDB")
}).catch((err) => {
    console.log("Error connecting to MongoDB:", err)
})

let app = express()


app.use(express.json())

// Log Authorization header for incoming requests (placed before routers)
app.use((req, res, next) => {
    const authorizationHeader = req.header("Authorization");
   
   if(authorizationHeader != null){
        const token = authorizationHeader.replace("Bearer ", "")
        console.log("Authorization Token:", token);

         jwt.verify(token, "secretKey$2025", (error, content) => {
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


app.use("/users", userRouter);
app.use("/products", productRouter);



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});