const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const db = require("./db");

const app = express();

app.use(
  cors({
   origin: true,
  })
);

app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET;

// =========================
// AUTH MIDDLEWARE
// =========================

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token.",
    });
  }
};

// =========================
// ROOT
// =========================

app.get("/", (req, res) => {
  res.json({
    message: "UdharPay Backend is running",
  });
});

// =========================
// DATABASE TEST
// =========================

app.get("/api/test-db", (req, res) => {
  db.query("SELECT 1 AS test", (err, results) => {
    if (err) {
      console.error("Database test failed:", err.message);

      return res.status(500).json({
        success: false,
        message: "Database connection failed",
      });
    }

    res.json({
      success: true,
      message: "Database connected successfully",
      result: results,
    });
  });
});

// =========================
// REGISTER
// =========================

app.post("/api/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Name, email and password are required.",
    });
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanName.length < 2) {
    return res.status(400).json({
      success: false,
      message: "Name must contain at least 2 characters.",
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: "Password must contain at least 6 characters.",
    });
  }

  const checkUserSql = "SELECT id FROM users WHERE email = ?";

  db.query(checkUserSql, [cleanEmail], async (err, results) => {
    if (err) {
      console.error("User check failed:", err.message);

      return res.status(500).json({
        success: false,
        message: "Database error.",
      });
    }

    if (results.length > 0) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    try {
      const passwordHash = await bcrypt.hash(password, 10);

      const insertUserSql = `
        INSERT INTO users
        (name, email, password_hash)
        VALUES (?, ?, ?)
      `;

      db.query(
        insertUserSql,
        [cleanName, cleanEmail, passwordHash],
        (err, result) => {
          if (err) {
            console.error("User registration failed:", err.message);

            return res.status(500).json({
              success: false,
              message: "Registration failed.",
            });
          }

          res.status(201).json({
            success: true,
            message: "Registration successful.",
            userId: result.insertId,
          });
        }
      );
    } catch (error) {
      console.error("Password hashing failed:", error.message);

      return res.status(500).json({
        success: false,
        message: "Registration failed.",
      });
    }
  });
});

// =========================
// LOGIN
// =========================

app.post("/api/login", (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required.",
    });
  }

  const cleanEmail = email.trim().toLowerCase();

  const sql = `
    SELECT
      id,
      name,
      email,
      password_hash,
      business_name,
      business_mobile,
      business_address,
      upi_id
    FROM users
    WHERE email = ?
  `;

  db.query(sql, [cleanEmail], async (err, results) => {
    if (err) {
      console.error("Login query failed:", err.message);

      return res.status(500).json({
        success: false,
        message: "Database error.",
      });
    }

    if (results.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = results[0];

    try {
      const passwordMatch = await bcrypt.compare(
        password,
        user.password_hash
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
        },
        JWT_SECRET,
        {
          expiresIn: "7d",
        }
      );

      res.json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          businessName: user.business_name || "",
          businessMobile: user.business_mobile || "",
          businessAddress: user.business_address || "",
          upiId: user.upi_id || "",
        },
      });
    } catch (error) {
      console.error("Login authentication failed:", error.message);

      return res.status(500).json({
        success: false,
        message: "Login failed.",
      });
    }
  });
});

// =========================
// BUSINESS PROFILE - GET
// =========================

app.get("/api/profile", authenticateToken, (req, res) => {
  const sql = `
    SELECT
      id,
      name,
      email,
      business_name AS businessName,
      business_mobile AS businessMobile,
      business_address AS businessAddress,
      upi_id AS upiId
    FROM users
    WHERE id = ?
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error("Get profile failed:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to get business profile.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    res.json({
      success: true,
      profile: results[0],
    });
  });
});

// =========================
// BUSINESS PROFILE - UPDATE
// =========================

app.put("/api/profile", authenticateToken, (req, res) => {
  const {
    businessName,
    businessMobile,
    businessAddress,
    upiId,
  } = req.body;

  if (!businessName || !businessMobile || !businessAddress) {
    return res.status(400).json({
      success: false,
      message: "Business name, mobile and address are required.",
    });
  }

  const sql = `
    UPDATE users
    SET
      business_name = ?,
      business_mobile = ?,
      business_address = ?,
      upi_id = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [
      businessName.trim(),
      businessMobile.trim(),
      businessAddress.trim(),
      upiId ? upiId.trim() : null,
      req.user.id,
    ],
    (err, result) => {
      if (err) {
        console.error("Update profile failed:", err.message);

        return res.status(500).json({
          success: false,
          message: "Failed to update business profile.",
        });
      }

      res.json({
        success: true,
        message: "Business profile updated successfully.",
      });
    }
  );
});

// =========================
// GET ALL CUSTOMERS
// =========================

app.get("/api/customers", authenticateToken, (req, res) => {
  const sql = `
    SELECT
      c.id,
      c.user_id AS userId,
      c.name,
      c.mobile,
      c.address,
      c.total_amount AS totalAmount,
      c.due_date AS dueDate,
      c.credit_date AS creditDate,
      c.created_at AS createdAt,
      COALESCE(SUM(p.amount), 0) AS totalPaid
    FROM customers c
    LEFT JOIN payments p
      ON c.id = p.customer_id
    WHERE c.user_id = ?
    GROUP BY
      c.id,
      c.user_id,
      c.name,
      c.mobile,
      c.address,
      c.total_amount,
      c.due_date,
      c.credit_date,
      c.created_at
    ORDER BY c.id DESC
  `;

  db.query(sql, [req.user.id], (err, results) => {
    if (err) {
      console.error("Get customers error:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to get customers.",
      });
    }

    const customers = results.map((customer) => {
      const totalAmount = Number(customer.totalAmount || 0);
      const totalPaid = Number(customer.totalPaid || 0);

      return {
        ...customer,
        totalAmount,
        totalPaid,
        remainingAmount: Math.max(totalAmount - totalPaid, 0),
        dueDate: customer.dueDate
          ? new Date(customer.dueDate).toISOString().split("T")[0]
          : "",
        creditDate: customer.creditDate
          ? new Date(customer.creditDate).toISOString().split("T")[0]
          : "",
        payments: [],
      };
    });

    res.json({
      success: true,
      customers,
    });
  });
});

// =========================
// GET SINGLE CUSTOMER
// =========================

app.get("/api/customers/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const sql = `
    SELECT
      c.id,
      c.user_id AS userId,
      c.name,
      c.mobile,
      c.address,
      c.total_amount AS totalAmount,
      c.due_date AS dueDate,
      c.credit_date AS creditDate,
      c.created_at AS createdAt,
      COALESCE(SUM(p.amount), 0) AS totalPaid
    FROM customers c
    LEFT JOIN payments p
      ON c.id = p.customer_id
    WHERE c.id = ?
      AND c.user_id = ?
    GROUP BY
      c.id,
      c.user_id,
      c.name,
      c.mobile,
      c.address,
      c.total_amount,
      c.due_date,
      c.credit_date,
      c.created_at
  `;

  db.query(sql, [id, req.user.id], (err, results) => {
    if (err) {
      console.error("Get customer failed:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch customer.",
      });
    }

    if (results.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    const customer = results[0];

    const totalAmount = Number(customer.totalAmount || 0);
    const totalPaid = Number(customer.totalPaid || 0);

    res.json({
      success: true,
      customer: {
        id: customer.id,
        userId: customer.userId,
        name: customer.name,
        mobile: customer.mobile,
        address: customer.address || "",
        totalAmount,
        totalPaid,
        remainingAmount: Math.max(totalAmount - totalPaid, 0),

        dueDate: customer.dueDate
          ? new Date(customer.dueDate).toISOString().split("T")[0]
          : "",

        creditDate: customer.creditDate
          ? new Date(customer.creditDate).toISOString().split("T")[0]
          : "",

        payments: [],
        createdAt: customer.createdAt,
      },
    });
  });
});

// =========================
// ADD CUSTOMER
// =========================

app.post("/api/customers", authenticateToken, (req, res) => {
  const {
    name,
    mobile,
    address,
    totalAmount,
    dueDate,
    creditDate,
  } = req.body;

  if (!name || !mobile || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile and total amount are required.",
    });
  }

  const amount = Number(totalAmount);

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Total amount must be greater than 0.",
    });
  }

  const sql = `
    INSERT INTO customers
    (
      user_id,
      name,
      mobile,
      address,
      total_amount,
      due_date,
      credit_date
    )
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [
      req.user.id,
      name.trim(),
      mobile,
      address || "",
      amount,
      dueDate || null,
      creditDate || null,
    ],
    (err, result) => {
      if (err) {
        console.error("Add customer failed:", err.message);

        return res.status(500).json({
          success: false,
          message: "Failed to add customer.",
        });
      }

      res.status(201).json({
        success: true,
        message: "Customer added successfully.",
        customer: {
          id: result.insertId,
          userId: req.user.id,
          name: name.trim(),
          mobile,
          address: address || "",
          totalAmount: amount,
          totalPaid: 0,
          remainingAmount: amount,
          dueDate: dueDate || "",
          creditDate: creditDate || "",
          payments: [],
        },
      });
    }
  );
});

// =========================
// UPDATE CUSTOMER
// =========================

app.put("/api/customers/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const {
    name,
    mobile,
    address,
    totalAmount,
    dueDate,
    creditDate,
  } = req.body;

  if (!name || !mobile || !totalAmount) {
    return res.status(400).json({
      success: false,
      message: "Name, mobile and total amount are required.",
    });
  }

  const amount = Number(totalAmount);

  if (amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Total amount must be greater than 0.",
    });
  }

  const sql = `
    UPDATE customers
    SET
      name = ?,
      mobile = ?,
      address = ?,
      total_amount = ?,
      due_date = ?,
      credit_date = ?
    WHERE id = ?
      AND user_id = ?
  `;

  db.query(
    sql,
    [
      name.trim(),
      mobile,
      address || "",
      amount,
      dueDate || null,
      creditDate || null,
      id,
      req.user.id,
    ],
    (err, result) => {
      if (err) {
        console.error("Update customer failed:", err.message);

        return res.status(500).json({
          success: false,
          message: "Failed to update customer.",
        });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({
          success: false,
          message: "Customer not found.",
        });
      }

      res.json({
        success: true,
        message: "Customer updated successfully.",
      });
    }
  );
});

// =========================
// DELETE CUSTOMER
// =========================

app.delete("/api/customers/:id", authenticateToken, (req, res) => {
  const { id } = req.params;

  const sql = `
    DELETE FROM customers
    WHERE id = ?
      AND user_id = ?
  `;

  db.query(sql, [id, req.user.id], (err, result) => {
    if (err) {
      console.error("Delete customer failed:", err.message);

      return res.status(500).json({
        success: false,
        message: "Failed to delete customer.",
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Customer not found.",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully.",
    });
  });
});

// =========================
// GET PAYMENTS
// =========================

app.get(
  "/api/customers/:customerId/payments",
  authenticateToken,
  (req, res) => {
    const { customerId } = req.params;

    const customerCheckSql = `
      SELECT id
      FROM customers
      WHERE id = ?
        AND user_id = ?
    `;

    db.query(
      customerCheckSql,
      [customerId, req.user.id],
      (customerErr, customerResults) => {
        if (customerErr) {
          console.error(
            "Customer ownership check failed:",
            customerErr
          );

          return res.status(500).json({
            success: false,
            message: "Failed to verify customer.",
          });
        }

        if (customerResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Customer not found.",
          });
        }

        const sql = `
          SELECT
            id,
            customer_id AS customerId,
            amount,
            payment_date AS date,
            created_at AS createdAt
          FROM payments
          WHERE customer_id = ?
          ORDER BY payment_date DESC, id DESC
        `;

        db.query(sql, [customerId], (err, results) => {
          if (err) {
            console.error("Get payments error:", err.message);

            return res.status(500).json({
              success: false,
              message: "Failed to get payments.",
            });
          }

          res.json({
            success: true,
            payments: results,
          });
        });
      }
    );
  }
);

// =========================
// ADD PAYMENT
// =========================

app.post(
  "/api/customers/:customerId/payments",
  authenticateToken,
  (req, res) => {
    const { customerId } = req.params;
    const { amount, paymentDate } = req.body;

    const paymentAmount = Number(amount);

    if (!paymentAmount || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Payment amount must be greater than 0.",
      });
    }

    const customerSql = `
      SELECT
        id,
        total_amount
      FROM customers
      WHERE id = ?
        AND user_id = ?
    `;

    db.query(
      customerSql,
      [customerId, req.user.id],
      (err, customerResults) => {
        if (err) {
          console.error("Check customer error:", err.message);

          return res.status(500).json({
            success: false,
            message: "Failed to check customer.",
          });
        }

        if (customerResults.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Customer not found.",
          });
        }

        const totalAmount = Number(
          customerResults[0].total_amount || 0
        );

        const paidSql = `
          SELECT COALESCE(SUM(amount), 0) AS totalPaid
          FROM payments
          WHERE customer_id = ?
        `;

        db.query(
          paidSql,
          [customerId],
          (paidErr, paidResults) => {
            if (paidErr) {
              console.error(
                "Get paid amount error:",
                paidErr.message
              );

              return res.status(500).json({
                success: false,
                message: "Failed to calculate remaining amount.",
              });
            }

            const totalPaid = Number(
              paidResults[0].totalPaid || 0
            );

            const remainingAmount = Math.max(
              totalAmount - totalPaid,
              0
            );

            if (paymentAmount > remainingAmount) {
              return res.status(400).json({
                success: false,
                message: `Payment cannot be greater than remaining amount of ₹${remainingAmount}.`,
              });
            }

            const date =
              paymentDate ||
              new Date().toISOString().split("T")[0];

            const insertSql = `
              INSERT INTO payments
              (customer_id, amount, payment_date)
              VALUES (?, ?, ?)
            `;

            db.query(
              insertSql,
              [customerId, paymentAmount, date],
              (insertErr, result) => {
                if (insertErr) {
                  console.error(
                    "Add payment error:",
                    insertErr.message
                  );

                  return res.status(500).json({
                    success: false,
                    message: "Failed to add payment.",
                  });
                }

                res.status(201).json({
                  success: true,
                  message: "Payment added successfully.",
                  payment: {
                    id: result.insertId,
                    customerId: Number(customerId),
                    amount: paymentAmount,
                    date,
                  },
                });
              }
            );
          }
        );
      }
    );
  }
);

// =========================
// DELETE PAYMENT
// =========================

app.delete(
  "/api/customers/:customerId/payments/:paymentId",
  authenticateToken,
  (req, res) => {
    const { customerId, paymentId } = req.params;

    const sql = `
      DELETE p
      FROM payments p
      INNER JOIN customers c
        ON p.customer_id = c.id
      WHERE p.id = ?
        AND p.customer_id = ?
        AND c.user_id = ?
    `;

    db.query(
      sql,
      [paymentId, customerId, req.user.id],
      (err, result) => {
        if (err) {
          console.error(
            "Delete payment error:",
            err.message
          );

          return res.status(500).json({
            success: false,
            message: "Failed to delete payment.",
          });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({
            success: false,
            message: "Payment not found.",
          });
        }

        res.json({
          success: true,
          message: "Payment deleted successfully.",
        });
      }
    );
  }
);

// =========================
// GLOBAL ERROR HANDLER
// =========================

app.use((err, req, res, next) => {
  console.error("Server error:", err);

  res.status(500).json({
    success: false,
    message: "Internal server error.",
  });
});

// =========================
// SERVER
// =========================

const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});