const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require('bcryptjs');
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// If you use a .env file for local development, uncomment the line below.
// For Railway, you will set these variables directly in the dashboard.
// require('dotenv').config();

const app = express();

// ---------------------------\
// Middleware Configuration
// ---------------------------\

// Updated CORS configuration:
// In production, process.env.FRONTEND_URL will be set to your React app's domain on Railway.
// During local development, it will fall back to '*' or a specific localhost URL if you set it in a local .env.
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serving static files:
// If you host your React frontend as a separate static service on Railway (recommended),
// your backend doesn't need to serve these general static files.
// Keep the "/images" route if your backend specifically manages image uploads
// that need to be served directly via the backend's URL.
app.use(express.static(path.join(__dirname, "../client/public")));
app.use(
  "/images",
  express.static(path.join(__dirname, "../client/public/images"))
);

// ---------------------------\
// Multer Configuration (for Image Uploading)
// ---------------------------\

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../client/public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

// ---------------------------\

// Sensitive information pulled from environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const adminSecretKey = process.env.ADMIN_SECRET_KEY; // Using ADMIN_SECRET_KEY for clarity

// ---------------------------\
// Nodemailer Configuration (using environment variables)
// ---------------------------\

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Set this in Railway variables
    pass: process.env.EMAIL_PASS, // Set this in Railway variables (Gmail App Password)
  },
});

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'souktek.tn@gmail.com';

const sendOrderNotificationEmail = async (orderDetails) => {
  const {
    orderId, product_name, payment_method, email, phone,
    transaction_number, order_time, user_created
  } = orderDetails;

  const mailOptions = {
    from: `"Souktek Store" <${process.env.EMAIL_USER}>`, // Use env var here too
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New Order Placed! Order ID: ${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">New Order Notification</h2>
        <p>A new order has been successfully placed on your store!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Product:</strong> ${product_name}</p>
        <p><strong>Payment Method:</strong> ${payment_method}</p>
        <p><strong>Customer Email:</strong> ${email}</p>
        <p><strong>Customer Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Transaction Number:</strong> ${transaction_number || 'N/A'}</p>
        <p><strong>Order Time:</strong> ${new Date(order_time).toLocaleString()}</p>
        ${user_created ? '<p style="color: #007bff;"><strong>Note: A new user account was automatically created for this customer.</strong></p>' : ''}
        <p>Please log in to your admin dashboard to view full details.</p>
        <p>Thank you,</p>
        <p>Souktek Store Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Order notification email sent successfully for Order ID: ${orderId}`);
  } catch (error) {
    console.error(`Failed to send order notification email for Order ID: ${orderId}:`, error);
  }
};

// ---------------------------\
// JWT Authentication Middleware
// ---------------------------\

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication token is required." });
  }

  const token = authHeader.split(' ')[1]; // Expects "Bearer TOKEN"
  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing." });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user; // Attach user payload to the request object
    next();
  });
};

// Middleware to authorize admin access (uses verifyToken first)
const authorizeAdmin = (req, res, next) => {
  verifyToken(req, res, () => { // Call verifyToken first
    if (req.user && req.user.is_admin) {
      next(); // User is authenticated and is an admin
    } else {
      return res.status(403).json({ message: "Access Denied: Not an administrator." });
    }
  });
};

// ---------------------------\
// PRODUCT & OPTION ROUTES (UPDATED WITH authorizeAdmin)
// ---------------------------\

// Get a single product by name (can be public)
app.get("/api/products/name/:name", async (req, res) => {
  const productName = req.params.name.trim();
  console.log("Searching for product:", productName);

  try {
    const result = await pool.query(
      "SELECT * FROM products WHERE name ILIKE $1",
      [productName]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product" });
  }
});

// Fetch all products from the database (can be public or admin-only, depending on your design)
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Fetch a specific product by its ID (can be public)
app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Fetch product options for a given product ID (can be public)
app.get("/api/product_options/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM product_options WHERE product_id = $1 ORDER BY id ASC",
      [productId]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No product options found" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching product options:", err);
    res.status(500).json({ message: "Error fetching product options" });
  }
});

// Create a new product (ADMIN ONLY)
app.post("/api/products", authorizeAdmin, upload.single("image"), async (req, res) => {
  const { name, price, description, type, options } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !description || !type) {
    return res.status(400).json({
      message: "Name, price, description, and type are required",
    });
  }

  let parsedOptions = [];
  if (options) {
    try {
      parsedOptions = JSON.parse(options);
      if (!Array.isArray(parsedOptions)) throw new Error("Options must be an array");
    } catch (err) {
      return res.status(400).json({ message: "Invalid options format" });
    }
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "INSERT INTO products (name, price, description, img, type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, description, image, type]
    );

    const productId = productResult.rows[0].id;

    for (const opt of parsedOptions) {
      const { label, price: optPrice, description: optDesc } = opt;

      if (!label || !optPrice || !optDesc) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Each option must have label, price, and description",
        });
      }

      await client.query(
        "INSERT INTO product_options (product_id, label, price, description) VALUES ($1, $2, $3, $4)",
        [productId, label, optPrice, optDesc]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      message: "Product and options created successfully",
      product: productResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating product and options:", err);
    res.status(500).json({ message: "Error creating product and options" });
  } finally {
    client.release();
  }
});

// Delete a product by ID (ADMIN ONLY)
app.delete("/api/products/:id", authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM products WHERE id = $1 RETURNING *",
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({
      message: "Product deleted successfully",
      product: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

// Update product and all its options together (ADMIN ONLY)
app.put("/api/products/:id", authorizeAdmin, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, price, description, options } = req.body;

  if (!name || !price || !description) {
    return res.status(400).json({ message: "Name, price, and description are required" });
  }

  let parsedOptions = [];
  if (options) {
    try {
      parsedOptions = JSON.parse(options);
      if (!Array.isArray(parsedOptions)) throw new Error("Options must be an array");
    } catch {
      return res.status(400).json({ message: "Invalid options format" });
    }
  }

  const imageFile = req.file ? req.file.filename : null;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let updateProductQuery;
    let updateProductValues;

    if (imageFile) {
      updateProductQuery =
        "UPDATE products SET name = $1, price = $2, description = $3, img = $4 WHERE id = $5 RETURNING *";
      updateProductValues = [name, price, description, imageFile, id];
    } else {
      updateProductQuery =
        "UPDATE products SET name = $1, price = $2, description = $3 WHERE id = $4 RETURNING *";
      updateProductValues = [name, price, description, id];
    }

    const productResult = await client.query(updateProductQuery, updateProductValues);

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    for (const opt of parsedOptions) {
      const { id: optionId, label, price: optionPrice, description: optionDesc } = opt;

      if (!optionId || label === undefined || optionPrice === undefined || optionDesc === undefined) {
        await client.query("ROLLBACK");
        return res.status(400).json({
          message: "Each option must have id, label, price, and description",
        });
      }

      await client.query(
        `UPDATE product_options
          SET label = $1, price = $2, description = $3
          WHERE id = $4`,
        [label, optionPrice, optionDesc, optionId]
      );
    }

    await client.query("COMMIT");

    res.json({
      message: "Product and options updated successfully",
      product: productResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating product and options:", err);
    res.status(500).json({ message: "Error updating product and options" });
  } finally {
    client.release();
  }
});

// Update a single product option by its ID (ADMIN ONLY)
app.put("/api/product_options/:id", authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { label, price, description } = req.body;

  if (!label || price === undefined || description === undefined) {
    return res.status(400).json({ message: "label, price, and description are required" });
  }

  try {
    const result = await pool.query(
      `UPDATE product_options SET label = $1, price = $2, description = $3 WHERE id = $4 RETURNING *`,
      [label, price, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Option not found" });
    }

    res.json({
      message: "Option updated successfully",
      option: result.rows[0],
    });
  } catch (err) {
    console.error("Error updating product option:", err);
    res.status(500).json({ message: "Error updating product option" });
  }
});

// Route to fetch all orders for admin dashboard (ADMIN ONLY)
app.get("/api/orders/all", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY order_time DESC"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No orders found in the system." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all orders:", err.message || err);
    res.status(500).json({ message: "Error fetching all orders." });
  }
});

// Product statistics routes (ADMIN ONLY)
app.get("/api/stats/total-products", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(id) AS total_products FROM products");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching total products:", err);
    res.status(500).json({ message: "Error fetching total products" });
  }
});

app.get("/api/stats/average-price", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT AVG(price) AS average_price FROM products");
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching average price:", err);
    res.status(500).json({ message: "Error fetching average price" });
  }
});

app.get("/api/stats/most-expensive", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT name, price FROM products ORDER BY price DESC LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No products found." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching most expensive product:", err);
    res.status(500).json({ message: "Error fetching most expensive product" });
  }
});

app.get("/api/stats/lowest-stock", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT name, stock FROM products ORDER BY stock ASC LIMIT 1");
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No products found or no stock data." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching lowest stock product:", err);
    res.status(500).json({ message: "Error fetching lowest stock product" });
  }
});

app.get("/api/stats/most-popular", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        product_name,
        COUNT(product_id) AS total_sold_count
      FROM
        orders
      GROUP BY
        product_name
      ORDER BY
        total_sold_count DESC
      LIMIT 1;
    `);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No orders found to determine popularity." });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching most popular product:", err);
    res.status(500).json({ message: "Error fetching most popular product" });
  }
});


// ---------------------------\
// USER AUTHENTICATION ROUTES
// ---------------------------\

// Sign up a new user with hashed password
app.post("/api/signup", async (req, res) => {
  console.log("Signup route hit");

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (result.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, email, password) VALUES ($1, $2, $3)",
      [username, email, hashedPassword]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    console.error("Error creating user:", err);
    res.status(500).json({ message: "Error creating user" });
  }
});

// Login route with admin check (UPDATED TO ISSUE JWT)
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim(),
    ]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const user = result.rows[0];

    const fixedHash = user.password.replace(/^\$2y\$/, "$2b$");

    const isPasswordValid = await bcrypt.compare(password, fixedHash);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT token for both regular users and admins
    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // Prepare user data to send to frontend (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
    };

    // If user is admin, provide the token and admin status
    if (user.is_admin) {
      return res.json({
        message: "Login successful",
        user: userData,
        token: token, // Send the JWT token
        isAdmin: true, // Explicitly indicate admin status
      });
    }

    // For regular users
    res.json({ message: "Login successful", user: userData, token: token });
  } catch (err) {
    console.error("Error logging in:", err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// ✅ NEW: Route to change password (can be accessed by authenticated users)
app.put("/api/users/password", verifyToken, async (req, res) => {
  const { newPassword } = req.body;
  const userEmailFromToken = req.user.email;

  if (!newPassword) {
    return res.status(400).json({ message: "New password is required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      "UPDATE users SET password = $1 WHERE email = $2 RETURNING id",
      [hashedPassword, userEmailFromToken]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found or no changes made." });
    }

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Error updating password" });
  }
});


// ✅ UPDATED: Order placement route with automatic user creation
app.post("/api/orders", async (req, res) => {
  const {
    product_id,
    product_name,
    payment_method,
    email,
    phone,
    transaction_number,
    // Removed: observations_comments,
  } = req.body;

  if (!product_id || !product_name || !email || !payment_method) {
    return res.status(400).json({ message: "Missing required order information (product_id, product_name, email, payment_method are mandatory)" });
  }

  const normalizedEmail = email.trim().toLowerCase();

  let client;

  try {
    client = await pool.connect();
    await client.query("BEGIN");

    let userId;
    let userWasCreated = false;

    const userCheckResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (userCheckResult.rows.length === 0) {
      console.log(`User with email ${normalizedEmail} not found. Creating new user...`);
      const defaultUsername = "Customer";
      const defaultPassword = "Souktek123";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      const newUserResult = await client.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
        [defaultUsername, normalizedEmail, hashedPassword]
      );
      userId = newUserResult.rows[0].id;
      userWasCreated = true;
      console.log(`New user created with ID: ${userId}`);
    } else {
      userId = userCheckResult.rows[0].id;
      console.log(`User with email ${normalizedEmail} found with ID: ${userId}.`);
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, product_id, product_name, payment_method, email, phone, transaction_number, order_time)
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
        RETURNING *`,
      [
        userId,
        product_id,
        product_name,
        payment_method,
        normalizedEmail,
        phone,
        transaction_number,
        // Removed: observations_comments,
      ]
    );

    await client.query("COMMIT");
    const placedOrder = orderResult.rows[0];
    console.log(`Order placed successfully. Order ID: ${placedOrder.id}`);

    await sendOrderNotificationEmail({
      orderId: placedOrder.id,
      product_name: placedOrder.product_name,
      payment_method: placedOrder.payment_method,
      email: placedOrder.email,
      phone: placedOrder.phone,
      transaction_number: placedOrder.transaction_number,
      order_time: placedOrder.order_time,
      user_created: userWasCreated
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: placedOrder,
      user_created: userWasCreated
    });

  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
      console.error("Transaction rolled back due to error.");
    }
    console.error("Error processing order:", err.message || err);
    res.status(500).json({ message: "Error processing order. Please try again." });
  } finally {
    if (client) {
      client.release();
      console.log("Database client released.");
    }
  }
});

// Route to fetch orders by email (can be accessed by authenticated users, not just admin)
app.get("/api/orders/email/:email", verifyToken, async (req, res) => {
  const { email } = req.params;
  const userEmailFromToken = req.user.email;

  if (userEmailFromToken !== email.trim().toLowerCase() && !req.user.is_admin) {
    return res.status(403).json({ message: "Access Denied: You can only view your own orders." });
  }

  if (!email) {
    return res.status(400).json({ message: "Email parameter is required." });
  }

  const normalizedEmail = email.trim().toLowerCase();

  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE email = $1 ORDER BY order_time DESC",
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No orders found for this email." });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders by email:", err.message || err);
    res.status(500).json({ message: "Error fetching orders." });
  }
});

app.post("/api/admin/verify-secret", verifyToken, async (req, res) => {
  const { secretKey } = req.body;

  if (!secretKey) {
    return res.status(400).json({ message: "Secret key is required." });
  }

  // Ensure the user is an admin before checking the secret key
  if (!req.user || !req.user.is_admin) {
    return res.status(403).json({ message: "Access Denied: Not an administrator." });
  }

  // Compare the provided secret key with the one configured on the server
  if (secretKey === adminSecretKey) {
    return res.status(200).json({ message: "Admin secret key verified successfully." });
  } else {
    return res.status(401).json({ message: "Invalid admin secret key." });
  }
});
// ---------------------------\
// React frontend build serving
// ---------------------------

// Serve React build files (make sure this is AFTER all other routes)
app.use(express.static(path.join(__dirname, "../client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});

// ---------------------------\
// ---------------------------\

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});