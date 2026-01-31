import Order from "../models/order.js";
import Product from "../models/Product.js";

export async function createOrder(req, res) {
    try {
        if (!req.user) {
            return res.status(401).json({ message: "Unauthorized: User information missing" });
        }

        const latestOrder = await Order.findOne().sort({ date: -1 });
        let orderId = "ORd00001";
        if (latestOrder != null) {
            let latestOrderID = latestOrder.orderID;
            let lastestOrderNumberString = latestOrderID.replace("ORd", "");
            let latestOrderNumber = parseInt(lastestOrderNumberString);

            let newOrderNumber = latestOrderNumber + 1;
            let newOrderNumberString = newOrderNumber.toString().padStart(6, "0");
            orderId = "ORd" + newOrderNumberString;
        }

        const items = [];
        let total = 0;
        
        for (let i = 0; i < req.body.items.length; i++) {
            const product = await Product.findOne({ productID: req.body.items[i].productID });
            if (product == null) {
                return res.status(400).json({
                    message: `Product with ID ${req.body.items[i].productID} not found`
                });
            }

            // --- මෙන්න මේ කොටස තමයි Fix එක ---
            // Product එකේ image එක Array එකක් නම් එකේ 0 වෙනි index එක ගන්න, නැත්නම් කෙලින්ම ගන්න
            let productImage = "";
            if (Array.isArray(product.image)) {
                productImage = product.image[0]; 
            } else {
                productImage = product.image;
            }

            items.push({
                productID: product.productID,
                name: product.name,
                image: productImage, // දැන් මෙතනට යන්නේ String එකක් පමණයි
                quantity: req.body.items[i].quantity,
                price: product.price
            });
            total += product.price * req.body.items[i].quantity;
        }

        let name = req.body.name || (req.user.firstName + " " + req.user.lastName);

        const newOrder = new Order({
            orderID: orderId,
            email: req.user.email,
            name: name,
            address: req.body.address,
            items: items,
            total: total,
            phone: req.body.phone
        });

        await newOrder.save();
        return res.json({
            message: "Order created successfully",
            orderId: orderId
        });

    } catch (err) {
        console.error("Internal Server Error:", err);
        return res.status(500).json({ message: "Error generating order", error: err.message });
    }
}

export async function getOrders(req, res) {
    try {
        const orders = await Order.find().sort({ date: -1 });
        return res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        return res.status(500).json({ message: "Error fetching orders", error: err.message });
    }
}