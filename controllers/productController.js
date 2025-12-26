import Product from "../models/product.js";
import { isAdmin } from "./userController.js";

export function createProduct(req, res) {

    if (!isAdmin(req)) {
         res.status(403).json({ message: "Access denied. Admins only." });
        return;
    }

    const product = new Product(req.body);
    product.save().then(() => {
        res.json({ message: "Product created successfully", product });
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });

}

export function getAllProducts(req, res) {
    if(isAdmin(req)){ 
        Product.find().then((products) => {
        res.json(products);
    }
).catch(err => {
        res.status(500).json({ message: "error fetching products" ,
            error: err.message
        });
    });
}else{
    Product.find({ isAvailable: true }).then((products) => {
        res.json(products);
    }).catch(err => {
        res.status(500).json({ message: "error fetching products" ,
            error: err.message
        });
    }); 

}
}
export function deleteProduct(req, res) {

    if (!isAdmin(req)) {
         res.status(403).json({ message: "Access denied. Admins only delete." });
        return;

    }
    

    const productID=req.params.productID;

    Product.deleteOne({ productID: productID }).then(() => {
        res.json({ message: "Product deleted successfully" });
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });

}


export function updateProduct(req, res){
  if(!isAdmin(req)){
    res.status(403).json({
        message : "cant update unautherized members"
    })
    return;
  }

  const productID = req.params.productID;
  Product.updateOne({ productID: productID }, req.body).then(() => {
    res.json({
        message: "Product updated successfully"
    })
  }).catch(err => {
    res.status(500).json({ error: err.message });
  });

}
export function getProductByID(req, res){
    if(!isAdmin(req)){
        res.json({
            message : "cant get you"
        })
        return;
    }
const productID = req.params.productID;
    Product.findOne({ productID: productID }).then((product) => {
        if(product==null){
            res.status(404).json({ message: "Product not found" });
        }else{
            res.json(product);
        }
        
    }).catch(err => {
        res.status(500).json({ error: err.message });
    });
}

