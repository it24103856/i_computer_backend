import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    productID: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    model: {                          // Changed from 'modelNumbers'
        type: String,
        required: true,
        default: "standard"
    },
    altName: {
        type: [String],
        default: [],
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    labeledPrice: {                   // Changed spelling from 'labelledPrice'
        type: Number,
        required: false,              // Changed to false since it's optional
        default: 0
    },
    category: {
        type: String,
        required: true
    },
    image: {                          // Changed from 'images' (singular)
        type: [String],
        required: false,              // Changed to false or make sure frontend always sends it
        default: []
    },
    brand: {
        type: String,
        required: true,
        default: "No brand"
    },
    stock: {
        type: Number,
        required: true,
        default: 0
    },
    isAvailable: {
        type: Boolean,
        required: true,
        default: true,
    }
}, {
    timestamps: true                  // Add timestamps for createdAt/updatedAt
});

const Product = mongoose.model("Product", productSchema);
export default Product;
