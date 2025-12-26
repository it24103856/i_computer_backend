import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    
    productID :{
        type:String,
        required:true,
        unique: true,
    },
    name :{
        type:String,
        required:true,

    },
    altName :{
        type :[String],
        default:[],
    },
    description :{
        type:String,
        required:true
    },
    price :{
        type:Number,
        required:true
    },
    labelledPrice :{
        type:Number,
        required:true
    },
    category :{
        type:String,
        required:true
    },
    images :{
        type:[String],
        required:true
    },
    brand :{
        type:String,
        required:true,
        default: "NO brand"
    },
    stock :{  
        type:Number,    
        required:true,
        default:0
    },
       isAvailable:{
           type:Boolean,
           required:true,
           default: true,
       }       

}
)

const Product =mongoose.model("product",productSchema)
export default Product;