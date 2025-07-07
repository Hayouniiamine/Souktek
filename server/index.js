const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

// If you use a .env file for local development, uncomment the line below.
// For Railway, you will set these variables directly in the dashboard.
// require('dotenv').config();

const app = express();

// Middleware Configuration

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve static React build files
app.use(express.static(path.join(__dirname, "../client/build")));

// Serve images (if you store/upload images here)
app.use("/images", express.static(path.join(__dirname, "../client/public/images")));

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../client/public/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const adminSecretKey = process.env.ADMIN_SECRET_KEY;

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'souktek.tn@gmail.com';

const sendOrderNotificationEmail = async (orderDetails) => {
  const {
    orderId, product_name, payment_method, email, phone,
    transaction_number, order_time, user_created
  } = orderDetails;

  const mailOptions = {
    from: `"Souktek Store" <${process.env.EMAIL_USER}>`,
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

// JWT Authentication Middleware

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ message: "Authentication token is required." });

  const token = authHeader.split(' ')[1]; // Bearer token
  if (!token) return res.status(401).json({ message: "Authentication token is missing." });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.error("JWT Verification Error:", err.message);
      return res.status(403).json({ message: "Invalid or expired token." });
    }
    req.user = user;
    next();
  });
};

const authorizeAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user && req.user.is_admin) {
      next();
    } else {
      res.status(403).json({ message: "Access Denied: Not an administrator." });
    }
  });
};

// Product & Option Routes

app.get("/api/products/name/:name", async (req, res) => {
  const productName = req.params.name.trim();
  try {
    const result = await pool.query("SELECT * FROM products WHERE name ILIKE $1", [productName]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product:", err);
    res.status(500).json({ message: "Error fetching product" });
  }
});

app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

app.get("/api/products/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query("SELECT * FROM products WHERE id = $1", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching product by ID:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.get("/api/product_options/:productId", async (req, res) => {
  const { productId } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM product_options WHERE product_id = $1 ORDER BY id ASC",
      [productId]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "No product options found" });
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching product options:", err);
    res.status(500).json({ message: "Error fetching product options" });
  }
});

app.post("/api/products", authorizeAdmin, upload.single("image"), async (req, res) => {
  const { name, price, description, type, options } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!name || !price || !description || !type) {
    return res.status(400).json({ message: "Name, price, description, and type are required" });
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
        return res.status(400).json({ message: "Each option must have label, price, and description" });
      }

      await client.query(
        "INSERT INTO product_options (product_id, label, price, description) VALUES ($1, $2, $3, $4)",
        [productId, label, optPrice, optDesc]
      );
    }

    await client.query("COMMIT");

    res.status(201).json({ message: "Product and options created successfully", product: productResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error creating product and options:", err);
    res.status(500).json({ message: "Error creating product and options" });
  } finally {
    client.release();
  }
});

app.delete("/api/products/:id", authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query("DELETE FROM products WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Product deleted successfully", product: result.rows[0] });
  } catch (err) {
    console.error("Error deleting product:", err);
    res.status(500).json({ message: "Error deleting product" });
  }
});

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
        return res.status(400).json({ message: "Each option must have id, label, price, and description" });
      }

      await client.query(
        `UPDATE product_options SET label = $1, price = $2, description = $3 WHERE id = $4`,
        [label, optionPrice, optionDesc, optionId]
      );
    }

    await client.query("COMMIT");

    res.json({ message: "Product and options updated successfully", product: productResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating product and options:", err);
    res.status(500).json({ message: "Error updating product and options" });
  } finally {
    client.release();
  }
});

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

    if (result.rows.length === 0) return res.status(404).json({ message: "Option not found" });
    res.json({ message: "Option updated successfully", option: result.rows[0] });
  } catch (err) {
    console.error("Error updating product option:", err);
    res.status(500).json({ message: "Error updating product option" });
  }
});

// Orders Routes

app.get("/api/orders/all", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders ORDER BY order_time DESC");
    if (result.rows.length === 0) return res.status(404).json({ message: "No orders found in the system." });
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching all orders:", err.message || err);
    res.status(500).json({ message: "Error fetching all orders." });
  }
});

// Statistics Routes

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
    if (result.rows.length === 0) return res.status(404).json({ message: "No products found." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching most expensive product:", err);
    res.status(500).json({ message: "Error fetching most expensive product" });
  }
});

app.get("/api/stats/lowest-stock", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT name, stock FROM products ORDER BY stock ASC LIMIT 1");
    if (result.rows.length === 0) return res.status(404).json({ message: "No products found or no stock data." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching lowest stock product:", err);
    res.status(500).json({ message: "Error fetching lowest stock product" });
  }
});

app.get("/api/stats/most-popular", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT product_name, COUNT(product_id) AS total_sold_count
      FROM orders
      GROUP BY product_name
      ORDER BY total_sold_count DESC
      LIMIT 1;
    `);
    if (result.rows.length === 0) return res.status(404).json({ message: "No orders found to determine popularity." });
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error fetching most popular product:", err);
    res.status(500).json({ message: "Error fetching most popular product" });
  }
});

// User Signup

app.post("/api/auth/signup", async (req, res) => {
  const { email, password, phone, username, is_admin, avatar } = req.body;

  if (!email || !password || !phone || !username) {
    return res.status(400).json({ message: "Please provide email, password, phone, and username." });
  }

  try {
    const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userExists.rows.length > 0) {
      return res.status(409).json({ message: "User already exists with this email." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await pool.query(
      "INSERT INTO users (email, password, phone, username, is_admin, avatar) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [email, hashedPassword, phone, username, is_admin || false, avatar || null]
    );

    const token = jwt.sign(
      { id: newUser.rows[0].id, email: newUser.rows[0].email, is_admin: newUser.rows[0].is_admin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({ message: "User created successfully", token, user: newUser.rows[0] });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// User Login

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password required." });

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (userResult.rows.length === 0) return res.status(401).json({ message: "Invalid credentials." });

    const user = userResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials." });

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ message: "Login successful", token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Place Order Endpoint

app.post("/api/orders", async (req, res) => {
  const { product_name, payment_method, email, phone, transaction_number } = req.body;

  if (!product_name || !payment_method || !email) {
    return res.status(400).json({ message: "Product name, payment method, and email are required." });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if user exists
    let userResult = await client.query("SELECT id FROM users WHERE email = $1", [email]);
    let userId;
    let user_created = false;

    if (userResult.rows.length === 0) {
      // Create user with a random password (to be changed later by user)
      const randomPassword = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomPassword, salt);

      const newUser = await client.query(
        "INSERT INTO users (email, password, phone, username) VALUES ($1, $2, $3, $4) RETURNING id",
        [email, hashedPassword, phone || null, email.split('@')[0]]
      );
      userId = newUser.rows[0].id;
      user_created = true;
    } else {
      userId = userResult.rows[0].id;
    }

    // Insert order with current timestamp
    const orderResult = await client.query(
      `INSERT INTO orders (product_name, payment_method, email, phone, transaction_number, order_time, user_id)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6) RETURNING *`,
      [product_name, payment_method, email, phone || null, transaction_number || null, userId]
    );

    await client.query("COMMIT");

    // Send notification email to admin
    sendOrderNotificationEmail({
      orderId: orderResult.rows[0].id,
      product_name,
      payment_method,
      email,
      phone,
      transaction_number,
      order_time: orderResult.rows[0].order_time,
      user_created,
    });

    res.status(201).json({ message: "Order placed successfully", order: orderResult.rows[0] });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Error placing order" });
  } finally {
    client.release();
  }
});

// Get all orders for a specific user by email

app.get("/api/orders/user/:email", async (req, res) => {
  const userEmail = req.params.email;

  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE email = $1 ORDER BY order_time DESC",
      [userEmail]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "No orders found for this user." });
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching user orders:", err);
    res.status(500).json({ message: "Error fetching user orders" });
  }
});

// Admin Secret Key Verification

app.post("/api/admin/verify-secret", (req, res) => {
  const { secretKey } = req.body;

  if (!secretKey) return res.status(400).json({ message: "Secret key is required" });

  if (secretKey === adminSecretKey) {
    res.json({ message: "Secret key is valid" });
  } else {
    res.status(403).json({ message: "Invalid secret key" });
  }
});

// Default catch-all handler to serve React app for any other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});
// --- Quick DB‑connect test on boot ---------------------------------
pool.connect()
  .then(client => {
    return client.query('SELECT NOW()')        // any light query is fine
      .then(res => {
        console.log('✅  DB connected – current time:', res.rows[0].now);
        client.release();
      });
  })
  .catch(err => {
    console.error('❌  DB connection error:', err.message || err);
    // optional: process.exit(1);   // crash app so Railway restarts until env is fixed
  });
// -------------------------------------------------------------------

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
