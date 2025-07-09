const express = require("express");
const cors = require("cors");
const pool = require("./db"); // Assuming db.js connects to your PostgreSQL database
const bcrypt = require("bcryptjs");
const path = require("path");
const multer = require("multer");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const fs = require("fs");

const app = express();
function printRoutes(stack, prefix = '') {
  stack.forEach((layer) => {
    if (layer.route) {
      // routes registered directly on the app
      const methods = Object.keys(layer.route.methods).join(', ').toUpperCase();
      console.log(`${methods} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle.stack) {
      // router middleware 
      printRoutes(layer.handle.stack, prefix + (layer.regexp.source.replace('^\\','').replace('\\/?(?=\\/|$)','')));
    } else if (layer.name === 'bound dispatch') {
      // ignore
    } else {
      console.log(`Middleware: ${layer.name} ${prefix}${layer.regexp}`);
    }
  });
}


// ---------------------------
// Create uploads folder if missing on Railway volume
// ---------------------------

const uploadsDir = "/mnt/volume/images"; // Volume mount path

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log(`✅ Created uploads directory at ${uploadsDir}`);
} else {
  console.log(`✅ Uploads directory already exists at ${uploadsDir}`);
}

// ---------------------------
// Middleware Configuration
// ---------------------------

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Serve React frontend build
app.use(express.static(path.join(__dirname, "../client/build")));

// Serve existing images from client/public/images
app.use(
  "/images",
  express.static(path.join(__dirname, "../client/public/images"))
);

// Serve new uploaded images from volume
app.use(
  "/uploads",
  express.static(uploadsDir)
);

// ---------------------------
// Multer setup for image uploads to volume
// ---------------------------

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

// ---------------------------
// Environment variables and constants
// ---------------------------

const JWT_SECRET = process.env.JWT_SECRET;
const adminSecretKey = process.env.ADMIN_SECRET_KEY;

// ---------------------------
// Nodemailer setup
// ---------------------------

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
    orderId,
    products,
    payment_method,
    email,
    phone,
    transaction_number,
    order_time,
    user_created
  } = orderDetails;

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

// ---------------------------
// JWT Authentication Middleware
// ---------------------------

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ message: "Authentication token is required." });
  }
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: "Authentication token is missing." });
  }
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
      return res.status(403).json({ message: "Access Denied: Not an administrator." });
    }
  });
};

// ---------------------------
// Routes
// ---------------------------

// Total product count
app.get("/api/products/total-count", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(id) AS total_products FROM products");
    res.json({ total_products: result.rows[0].total_products });
  } catch (err) {
    console.error("Error fetching total product count:", err);
    res.status(500).json({ message: "Failed to fetch total product count" });
  }
});

// Total income
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

// Order count
app.get("/api/orders/count", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT COUNT(*) AS total_orders FROM orders");
    res.json({ total_orders: parseInt(result.rows[0].total_orders, 10) });
  } catch (err) {
    console.error("Error fetching order count:", err);
    res.status(500).json({ message: "Failed to fetch order count" });
  }
});

// Most popular product
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

// Get product by name
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

// Fetch all products
app.get("/api/products", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching products:", err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// Fetch product by ID
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

// Fetch product options
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

// Create new product (ADMIN ONLY)
app.post("/api/products", authorizeAdmin, upload.single("image"), async (req, res) => {
  const { name, price, description, type, options } = req.body;
  const image = req.file ? req.file.filename : '';

  if (!name || !price || !description || !type) {
    return res.status(400).json({
      message: "Name, price, description, and type are required",
    });
  }

  const priceRegex = /^\d+(\.\d{2})?\s*-\s*\d+(\.\d{2})?$/;
  if (typeof price !== 'string' || !priceRegex.test(price)) {
    return res.status(400).json({
      message: "Price must be a string in the format '5.00 - 50.00'",
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

// Delete product by ID (ADMIN ONLY)
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

// Update product and options (ADMIN ONLY)
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

  const imageFile = req.file ? req.file.filename : null;
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

// Update a single product option by ID (ADMIN ONLY)
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

// Delete a product option by ID (ADMIN ONLY)
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

// Fetch all orders (ADMIN ONLY)
app.get("/api/orders/all", authorizeAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM orders ORDER BY order_time DESC"
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Get orders for a specific user by email
app.get("/api/orders/user/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const result = await pool.query(
      "SELECT * FROM orders WHERE email = $1 ORDER BY order_time DESC",
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "No orders found for this user" });
    }
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching orders for user:", err);
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// Create order, create user if not exists, send email notification
app.post("/api/orders", async (req, res) => {
  const {
    products,
    payment_method,
    email,
    phone,
    transaction_number,
    order_time,
    password,
    user_created = false,
  } = req.body;

  if (!products || !Array.isArray(products) || products.length === 0) {
    return res.status(400).json({ message: "Products array is required" });
  }
  if (!payment_method || !email || !order_time) {
    return res.status(400).json({ message: "Payment method, email and order time are required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Check if user exists
    const userResult = await client.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      if (!password) {
        await client.query("ROLLBACK");
        return res.status(400).json({ message: "Password required to create new user" });
      }
      // Create new user with hashed password
      const hashedPassword = await bcrypt.hash(password, 12);
      await client.query(
        "INSERT INTO users (email, password) VALUES ($1, $2)",
        [email, hashedPassword]
      );
    }

    // Insert order
    const insertOrderResult = await client.query(
      "INSERT INTO orders (products, payment_method, email, phone, transaction_number, order_time) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [JSON.stringify(products), payment_method, email, phone, transaction_number, order_time]
    );

    await client.query("COMMIT");

    // Send notification email (async, no need to block response)
    sendOrderNotificationEmail({
      orderId: insertOrderResult.rows[0].id,
      products,
      payment_method,
      email,
      phone,
      transaction_number,
      order_time,
      user_created,
    });

    res.status(201).json({
      message: "Order placed successfully",
      order: insertOrderResult.rows[0],
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error placing order:", err);
    res.status(500).json({ message: "Failed to place order" });
  } finally {
    client.release();
  }
});

// Authentication - login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      is_admin: user.is_admin,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({
      token,
      user: tokenPayload,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Admin secret key verification
app.post("/api/admin/verify-secret", verifyToken, async (req, res) => {
  const { secretKey } = req.body;
  if (!secretKey) {
    return res.status(400).json({ message: "Secret key is required" });
  }
  if (secretKey === adminSecretKey) {
    return res.json({ message: "Secret key is valid" });
  }
  return res.status(401).json({ message: "Invalid secret key" });
});

// React frontend SPA fallback (for client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../client/build/index.html"));
});



// After your routes and middleware setup, add:
console.log('Registered routes and middleware:');
printRoutes(app._router.stack);


// Start server
// ---------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server started on port ${PORT}`);
});
