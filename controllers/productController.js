import Product from "../models/Product.js";
import { isAdmin } from "./userController.js";

// 1. භාණ්ඩයක් සෑදීම (Admins Only)
export function createProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only." });
    }

    const product = new Product(req.body);
    product.save()
        .then(() => {
            res.json({ message: "Product created successfully", product });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
}

// 2. සියලුම භාණ්ඩ ලබා ගැනීම
export function getAllProducts(req, res) {
    if (isAdmin(req)) { 
        // Admin ට සියලුම භාණ්ඩ පෙන්වයි
        Product.find()
            .then((products) => {
                res.json(products);
            })
            .catch(err => {
                res.status(500).json({ message: "error fetching products", error: err.message });
            });
    } else {
        // පාරිභෝගිකයාට පෙන්වන්නේ තිබෙන (Available) භාණ්ඩ පමණි
        Product.find({ isAvailable: true })
            .then((products) => {
                res.json(products);
            })
            .catch(err => {
                res.status(500).json({ message: "error fetching products", error: err.message });
            });
    }
}

// 3. භාණ්ඩයක් මැකීම (Admins Only)
export function deleteProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "Access denied. Admins only delete." });
    }

    const productID = req.params.productID;

    Product.deleteOne({ productID: productID })
        .then((result) => {
            if (result.deletedCount === 0) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.json({ message: "Product deleted successfully" });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
}

// 4. භාණ්ඩයක් යාවත්කාලීන කිරීම (Admins Only)
export function updateProduct(req, res) {
    if (!isAdmin(req)) {
        return res.status(403).json({ message: "cant update unauthorized members" });
    }

    const productID = req.params.productID;
    Product.updateOne({ productID: productID }, req.body)
        .then((result) => {
            if (result.matchedCount === 0) {
                return res.status(404).json({ message: "Product not found to update" });
            }
            res.json({ message: "Product updated successfully" });
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
}

// 5. භාණ්ඩයක් ID එක මගින් ලබා ගැනීම (Admins සහ Customers දෙගොල්ලන්ටම)
export function getProductByID(req, res) {
    // මෙතන තිබුණ isAdmin check එක ඉවත් කළා. දැන් ඕනෑම කෙනෙකුට Overview බලන්න පුළුවන්.
    const productID = req.params.productID;

    Product.findOne({ productID: productID })
        .then((product) => {
            if (product == null) {
                return res.status(404).json({ message: "Product not found" });
            }
            res.json(product);
        })
        .catch(err => {
            res.status(500).json({ error: err.message });
        });
}