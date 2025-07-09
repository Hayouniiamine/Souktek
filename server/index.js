const express = require("express");
const cors = require("cors");
const pool = require("./db");
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs"); // Added for volume setup

const app = express();

// ---------------------------
// Middleware Configuration
// ---------------------------

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve React build
app.use(express.static(path.join(__dirname, "../client/build")));

// Serve existing static images (unchanged)
app.use(
  "/images",
  express.static(path.join(__dirname, "../client/public/images"))
);

// ---------------------------
// Setup Persistent Volume Uploads
// ---------------------------

const uploadDir = "/mnt/volume/uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));

// Multer configuration (uploads now go to mounted volume)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });


// ---------------------------------------------------------------------------------------------------------------------------------------\
// Environment Variables and Constants
// ---------------------------------------------------------------------------------------------------------------------------------------\

// IMPORTANT: These should be set as environment variables in your deployment environment
const JWT_SECRET = process.env.JWT_SECRET;
const adminSecretKey = process.env.ADMIN_SECRET_KEY;

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------\
// Nodemailer Configuration
// ---------------------------------------------------------------------------------------------------------------------------------------\

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, // Use environment variable
    pass: process.env.EMAIL_PASS, // Use environment variable
  },
});

const ADMIN_NOTIFICATION_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL || 'souktek.tn@gmail.com';

const sendOrderNotificationEmail = async (orderDetails) => {
  const {
    orderId,
    products,              // Expecting an array of { product_name, quantity }
    payment_method,
    email,
    phone,
    transaction_number,
    order_time,
    user_created
  } = orderDetails;

  // Build an HTML list of products
  const productsHtml = products && products.length > 0
    ? `<ul>${products.map(p => `<li>${p.product_name} ${p.quantity ? `(Qty: ${p.quantity})` : ''}</li>`).join('')}</ul>`
    : '<p>No products listed.</p>';

  const mailOptions = {
    from: `"Souktek Store" <${process.env.EMAIL_USER}>`,
    to: ADMIN_NOTIFICATION_EMAIL,
    subject: `New Order Placed! Order ID: ${orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #4CAF50;">New Order Notification</h2>
        <p>A new order has been successfully placed on your store!</p>
        <p><strong>Order ID:</strong> ${orderId}</p>
        <p><strong>Products Ordered:</strong></p>
        ${productsHtml}
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


// ---------------------------------------------------------------------------------\
// JWT Authentication Middleware
// ------------------------------------------------------------------------------------------------------------\

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

// ------------------------------------------------------Middleware to authorize admin access (uses verifyToken first)-------------------------------------------------------
const authorizeAdmin = (req, res, next) => {
  verifyToken(req, res, () => { // Call verifyToken first
    if (req.user && req.user.is_admin) {
      next(); // User is authenticated and is an admin
    } else {
      return res.status(403).json({ message: "Access Denied: Not an administrator." });
    }
  });
};
// --------------------------------------------------------Total product count------------------------------------------------------------------------------------
app.get("/api/products/total-count", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(id) AS total_products FROM products");
    res.json({ total_products: result.rows[0].total_products });
  } catch (err) {
    console.error("Error fetching total product count:", err);
    res.status(500).json({ message: "Failed to fetch total product count" });
  }
});

// --------------------------------------------------------Total income (TND)--------------------------------------------------------
app.get("/api/products/total-income", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT SUM(CAST(regexp_replace(price, '[^0-9.]', '', 'g') AS numeric)) AS total_income
      FROM orders
    `);
    res.json({ total_income: parseFloat(result.rows[0].total_income) || 0 });
  } catch (err) {
    console.error("Error fetching total income:", err);
    res.status(500).json({ message: "Failed to fetch total income" });
  }
});


// ------------------------------------------------------------Order count----------------------------------------------------------------------------------------------------------------
app.get("/api/orders/count", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS total_orders FROM orders");
    res.json({ total_orders: parseInt(result.rows[0].total_orders, 10) });
  } catch (err) {
    console.error("Error fetching order count:", err);
    res.status(500).json({ message: "Failed to fetch order count" });
  }
});

// --------------------------------------------------------------Most popular product----------------------------------------------------------------------------------------
app.get("/api/products/most-popular", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT product_name, COUNT(product_id) AS sold
      FROM orders
      GROUP BY product_name
      ORDER BY sold DESC
      LIMIT 1
    `);
    if (result.rows.length === 0) {
      return res.json({ name: 'N/A', sold: 0 });
    }
    res.json({ name: result.rows[0].product_name, sold: parseInt(result.rows[0].sold, 10) });
  } catch (err) {
    console.error("Error fetching most popular product:", err);
    res.status(500).json({ message: "Failed to fetch most popular product" });
  }
});


// ------------------------------------------------------------------------------------------------------------------------------------------------------------------\
// PRODUCT & OPTION ROUTES
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------\

// Get a single product by name
app.get("/api/products/name/:name", async (req, res) => {
  const productName = req.params.name.trim();
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

// Fetch all products from the database
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Fetch a specific product by its ID
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

// Fetch product options for a given product ID
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
// -----------------------------------------------------------------------------------------------------------------------------------------------------

// Create a new product (ADMIN ONLY)
app.post("/api/products", authorizeAdmin, upload.single("image"), async (req, res) => {
  const { name, price, description, type, options } = req.body;
  // CORRECTED: Use the full public path for the image
  const image = req.file ? `/uploads/${req.file.filename}` : '';

  // Validate required fields
  if (!name || !price || !description || !type) {
    return res.status(400).json({
      message: "Name, price, description, and type are required",
    });
  }

  // Optional: Validate price format (since now it's a string range like "5.00 - 50.00")
  const priceRegex = /^\d+(\.\d{2})?\s*-\s*\d+(\.\d{2})?$/;
  if (typeof price !== 'string' || !priceRegex.test(price)) {
    return res.status(400).json({
      message: "Price must be a string in the format '5.00 - 50.00'",
    });
  }

  // Parse options
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

    // Insert product
    const productResult = await client.query(
      "INSERT INTO products (name, price, description, img, type) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [name, price, description, image, type]
    );

    const productId = productResult.rows[0].id;

    // Insert product options
    for (const opt of parsedOptions) {
      const { label, price: optPrice, description: optDesc } = opt;

      if (!label || optPrice === undefined || optDesc === undefined) {
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
    res.status(500).json({
      message: "Error creating product and options",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined,
    });
  } finally {
    client.release();
  }
});
// -----------------------------------------------------------------------------------------------------------------------------------------------------

//-------------------------------Delete a product by ID (ADMIN ONLY)------------------------------------------------------------------------------------
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

//--------------------------------------------------------------------------------- Update product and all its options together (ADMIN ONLY)---------------------------------------------------------------------------------
app.put("/api/products/:id", authorizeAdmin, upload.single("image"), async (req, res) => {
  const { id } = req.params;
  const { name, price, description, type, options } = req.body;

  if (!name || price === undefined || !description || !type) {
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

  // CORRECTED: Use the full public path for the image file
  const imageFile = req.file ? `/uploads/${req.file.filename}` : null;
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    let updateProductQuery;
    let updateProductValues;

    if (imageFile) {
      updateProductQuery =
        "UPDATE products SET name = $1, price = $2, description = $3, img = $4, type = $5 WHERE id = $6 RETURNING *";
      updateProductValues = [name, price, description, imageFile, type, id];
    } else {
      updateProductQuery =
        "UPDATE products SET name = $1, price = $2, description = $3, type = $4 WHERE id = $5 RETURNING *";
      updateProductValues = [name, price, description, type, id];
    }

    const productResult = await client.query(updateProductQuery, updateProductValues);

    if (productResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ message: "Product not found" });
    }

    for (const opt of parsedOptions) {
      const { id: optionId, label, price: optionPrice, description: optionDesc } = opt;

      if (
        optionId === undefined ||
        label === undefined ||
        optionPrice === undefined ||
        optionDesc === undefined
      ) {
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


//----------------------------- Update a single product option by its ID (ADMIN ONLY)-------------------------
app.put("/api/product_options/:id", authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const { label, price, description } = req.body;

  if (!label || price === undefined || description === undefined) {
    return res.status(400).json({ message: "label, price, and description are required" });
  }

  try {
    const result = await pool.query(
      `UPDATE product_options
       SET label = $1, price = $2, description = $3
       WHERE id = $4
       RETURNING *`,
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
// -------------Delete a Single Product Option ----------------------------------------------------\

app.delete("/api/product_options/:id", authorizeAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      "DELETE FROM product_options WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Option not found" });
    }

    res.json({
      message: "Option deleted successfully",
      option: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting product option:", err);
    res.status(500).json({ message: "Error deleting product option" });
  }
});

// --------------------------------------------------------------------------------------\
// ORDERS ROUTES
// -----------------------------------------------------------------------------------------------\

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

// Route to fetch orders by email (can be accessed by authenticated users, not just admin)
app.get("/api/orders/user/:email", verifyToken, async (req, res) => {
  const { email } = req.params;
  const userEmailFromToken = req.user.email;

  // IMPORTANT: Ensure the requesting user is either an admin OR the owner of the email
  if (userEmailFromToken.toLowerCase() !== email.trim().toLowerCase() && !req.user.is_admin) {
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

// Order placement route with automatic user creation and product_id
app.post("/api/orders", async (req, res) => {
  const { products, payment_method, email, phone, transaction_number } = req.body;

  if (
    !Array.isArray(products) || products.length === 0 ||
    !email || !payment_method
  ) {
    return res.status(400).json({
      message: "Missing required order information or empty products array",
    });
  }

  const normalizedEmail = email.trim().toLowerCase();

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN");

    // Check if user exists or create
    let userId;
    let userWasCreated = false;

    const userCheckResult = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [normalizedEmail]
    );

    if (userCheckResult.rows.length === 0) {
      const randomPassword = Math.random().toString(36).slice(-10);
      const hashedPassword = await bcrypt.hash(randomPassword, 10);
      const username = normalizedEmail.split('@')[0] || "Customer";

      const newUserResult = await client.query(
        "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id",
        [username, normalizedEmail, hashedPassword]
      );

      userId = newUserResult.rows[0].id;
      userWasCreated = true;
    } else {
      userId = userCheckResult.rows[0].id;
    }

    // Insert all orders in one go
    const insertedOrders = [];

    for (const product of products) {
      if (!product.product_id || !product.product_name) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Each product must have product_id and product_name" });
      }

      const orderResult = await client.query(
        `INSERT INTO orders (user_id, product_id, product_name, payment_method, email, phone, transaction_number, order_time)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [
          userId,
          product.product_id,
          product.product_name,
          payment_method,
          normalizedEmail,
          phone || null,
          transaction_number || null,
        ]
      );
      insertedOrders.push(orderResult.rows[0]);
    }

    await client.query("COMMIT");

    // Compose a single notification email with all ordered products
    await sendOrderNotificationEmail({
      orderId: insertedOrders.map(o => o.id).join(", "),
      products: insertedOrders,
      payment_method,
      email: normalizedEmail,
      phone,
      transaction_number,
      user_created: userWasCreated,
    });

    res.status(201).json({
      message: "Order placed successfully",
      orders: insertedOrders,
      user_created: userWasCreated,
    });
  } catch (err) {
    if (client) {
      await client.query("ROLLBACK");
    }
    console.error("Error processing order:", err);
    res.status(500).json({ message: "Error processing order. Please try again." });
  } finally {
    if (client) client.release();
  }
});





// ---------------------------
// USER AUTHENTICATION ROUTES
// ---------------------------

// Sign up a new user with hashed password
app.post("/api/auth/signup", async (req, res) => { // Changed route to match deployed
  const { username, email, password, phone, is_admin, avatar } = req.body; // Added phone, is_admin, avatar

  if (!username || !email || !password || !phone) { // phone is now required based on deployed code
    return res.status(400).json({ message: "Please provide username, email, password, and phone." });
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
      { expiresIn: "7d" } // Increased expiry to 7 days as in deployed code
    );

    res.status(201).json({ message: "User created successfully", token, user: newUser.rows[0] });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Login route (UPDATED TO ISSUE JWT and match deployed route)
app.post("/api/auth/login", async (req, res) => { // Changed route to match deployed
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required." });
  }

  try {
    const userResult = await pool.query("SELECT * FROM users WHERE email = $1", [
      email.trim(),
    ]);
    if (userResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = userResult.rows[0];

    // Fix for potential $2y$ vs $2b$ hash prefix issue from some bcrypt versions
    const fixedHash = user.password.replace(/^\$2y\$/, "$2b$");

    const isMatch = await bcrypt.compare(password, fixedHash);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, is_admin: user.is_admin },
      JWT_SECRET,
      { expiresIn: "7d" } // Consistent expiry with signup
    );

    // Prepare user data to send to frontend (excluding password)
    const userData = {
      id: user.id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      phone: user.phone, // Include phone from user data
      avatar: user.avatar // Include avatar from user data
    };

    res.json({ message: "Login successful", token, user: userData });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to change password (can be accessed by authenticated users)
app.put("/api/users/password", verifyToken, async (req, res) => {
  const { newPassword } = req.body;
  const userEmailFromToken = req.user.email; // Email from the verified JWT token

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

// Admin Secret Key Verification (now requires JWT authentication)
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

// Default catch-all handler to serve React app for any other routes
app.use((req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});

// --- Quick DB-connect test on boot ---------------------------------
pool.connect()
  .then(client => {
    return client.query('SELECT NOW()')      // any light query is fine
      .then(res => {
        console.log('✅  DB connected – current time:', res.rows[0].now);
        client.release();
      });
  })
  .catch(err => {
    console.error('❌  DB connection error:', err.message || err);
    // optional: process.exit(1);    // crash app so Railway restarts until env is fixed
  });
// -------------------------------------------------------------------

// Port
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});