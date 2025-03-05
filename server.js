const jsonServer = require("json-server");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Load users and products from separate JSON files
const usersFile = path.join(__dirname, "data", "./users.json");
const productsFile = path.join(__dirname, "data", "./products.json");



// Mount routers
app.get("/users", (req, res) => {
    console.log("Fetching users...");
    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    res.json(users); // Send actual users data
});
// Fix the route to return actual data
app.get("/products", (req, res) => {
    console.log("Fetching users...");
    const products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
    res.json(products); // Send actual users data
});

//post user
app.post("/users", (req, res) => {
    // console.log('post');
    
    // Read current users from the file
    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    
    // Get new user data from the request body
    const newUser = req.body;
    
    // Create a new id (this example assigns id = max id + 1, or 1 if empty)
    const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    newUser.id = newId;
    
    // Add new user to the users array
    users.push(newUser);
    
    // Write updated users array back to the file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    // Respond with the new user data
    res.status(201).json(newUser);
});

//post product
app.post("/products", (req, res) => {
    // console.log('post');
    
    // Read current users from the file
    const products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
    
    // Get new user data from the request body
    const newProduct = req.body;
    
    // Create a new id (this example assigns id = max id + 1, or 1 if empty)
    const newId = products.length > 0 ? Math.max(...products.map(product => product.id)) + 1 : 1;
    newProduct.id = newId;
    
    // Add new user to the users array
    products.push(newProduct);
    
    // Write updated users array back to the file
    fs.writeFileSync(productsFile, JSON.stringify(products, null, 2));
    
    // Respond with the new user data
    res.status(201).json(newProduct);
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
