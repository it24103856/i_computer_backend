import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {
    const data=req.body
    const hashedPassword=bcrypt.hashSync(req.body.password, 10);
    

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

export function loginUser(req,res){

    const  email = req.body.email;
    const password = req.body.password;

    User.find({ email: email }).then(
 (users) => {
            if(users[0] == null){
                res.status(404).json({ message: "User not found" });
            } else {
                const user = users[0];
                const isPasswordValid = bcrypt.compareSync(password, user.password);

              
                if(isPasswordValid) {

                      const payload={
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    image: user.image,
                    role: user.role,
                    isemailverified: user.isemailverified
                }
                    const token=jwt.sign(payload, process.env.JWT_SECRET, {expiresIn:"7d"});

                    
                
                    res.json({
                         message: "Login successful", 
                        token : token,
                        role: user.role

                        });
                } else {
                    res.json({ message: "Invalid password" });
                }
            }

        }
    ).catch(err => {
        res.status(500).json({ error: err.message });
    });

}

export function isAdmin (req) {
    if(req.user == null){
        return false;  
    }
    if(req.user.role != "admin"){
        return false;
    } 
    return true;
}