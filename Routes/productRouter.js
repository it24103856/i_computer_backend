import express from "express"
import { getAllProducts, createProduct,getProductByID, deleteProduct, updateProduct,searchProducts } from '../controllers/productController.js';

const productRouter=express.Router();
productRouter.get("/",getAllProducts);
productRouter.get("/search",searchProducts)

productRouter.get("/:productID",getProductByID);
productRouter.post("/",createProduct);

productRouter.delete("/:productID",deleteProduct); //delete product
productRouter.put("/:productID",updateProduct);


export default productRouter;