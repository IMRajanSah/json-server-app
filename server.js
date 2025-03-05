const jsonServer = require("json-server");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = "your_secret_key"; // Change this for security
// Middleware
app.use(cors());
app.use(express.json());

// Load users and products from separate JSON files
const usersFile = path.join(__dirname, "data", "./users.json");
const productsFile = path.join(__dirname, "data", "./products.json");

// ** Middleware to Verify JWT Token**
const authenticateToken = (req, res, next) => {
    const token = req.header("Authorization");
    if (!token) return res.status(401).json({ message: "Access denied. No token provided." });
  
    try {
      const decoded = jwt.verify(token.split(" ")[1], SECRET_KEY);
      req.user = decoded;
      next();
    } catch (error) {
      res.status(403).json({ message: "Invalid token." });
    }
};
//post user for unique email only and bcrypt the password
app.post("/signup", async (req, res) => {    
    // Read current users from the file
    const { name, email, password } = req.body;
    // Check if any required field is missing
    if (!name || !email || !password) {
        return res.status(400).json({ message: "All fields (name, email, password) are required!" });
    }
    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    

    // Get new user data from the request body
    if (users.find(user => user.email === email)) {
        return res.status(400).json({ message: "Email already registered!" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = users.length > 0 ? Math.max(...users.map(user => user.id)) + 1 : 1;
    const newUser = { id: newId, name, email, password: hashedPassword };
    // Create a new id (this example assigns id = max id + 1, or 1 if empty)
    
    newUser.id = newId;
    
    // Add new user to the users array
    users.push(newUser);
    
    // Write updated users array back to the file
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    // Respond with the new user data
    res.status(201).json(newUser);
});
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    // const users = readData(usersFile);
    if (!email || !password) {
        return res.status(400).json({ message: "All fields (name, email, password) are required!" });
    }
    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    const user = users.find(u => u.email === email);
  
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
  
    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
});
// get all users
app.get("/users", authenticateToken,(req, res) => {
    console.log("Fetching users...");
    const users = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
    res.json(users); // Send actual users data
});

// get all products with middleware acess
app.get("/products",authenticateToken, (req, res) => {
    console.log("Fetching users...");
    const products = JSON.parse(fs.readFileSync(productsFile, "utf-8"));
    res.json(products); // Send actual users data
});

//post product (not authorized)
app.post("/products", authenticateToken,(req, res) => {
    // console.log('post');
    const { id,name, price } = req.body;
    if (!id || !name || !price) {
        return res.status(400).json({ message: "All fields (id, name, price) are required!" });
    }
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
