const Employee = require("../models/Employee");
const Notification = require("../models/Notification");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const apiResponse = require("../utils/apiResponse");

const LOW_STOCK_THRESHOLD = 10;

const toTimestamp = (value) => {
  const date = value ? new Date(value) : new Date(0);
  return Number.isNaN(date.getTime()) ? new Date(0) : date;
};

const formatCurrency = (value) => Number(value || 0).toFixed(2);

const buildRecentTransaction = (sale) => {
  const items = Array.isArray(sale.items) ? sale.items : [];
  const itemCount = items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  const department = items.find((item) => item.department)?.department || "Mixed";
  const timestamp = sale.timestamp || sale.createdAt || new Date();

  return {
    id: String(sale._id),
    reference: `TX-${String(sale._id).slice(-6).toUpperCase()}`,
    department,
    itemCount,
    amount: Number(sale.grandTotal ?? sale.totalAmount ?? 0),
    paymentMethod: sale.paymentMethod,
    timestamp: new Date(timestamp).toISOString(),
    status: "completed"
  };
};

const buildLowStockWarning = (product) => ({
  id: String(product._id),
  title: `${product.name} is low on stock`,
  description: `Only ${product.stock} left. Reorder level is ${product.reorderLevel}.`,
  type: product.stock <= 0 ? "danger" : "warning",
  source: "inventory",
  timestamp: new Date(product.updatedAt || product.createdAt || Date.now()).toISOString()
});

const buildSystemEvent = (event) => ({
  id: event.id,
  title: event.title,
  description: event.description,
  type: event.type,
  source: event.source,
  timestamp: event.timestamp
});

const getSummary = async (req, res) => {
  try {
    const [revenueResult, transactionCount, activeEmployees, lowStockCount, totalProducts, recentSales] = await Promise.all([
      Sale.aggregate([
        {
          $group: {
            _id: null,
            revenue: { $sum: "$grandTotal" }
          }
        }
      ]),
      Sale.countDocuments(),
      Employee.countDocuments({ status: "active" }),
      Product.countDocuments({ stock: { $lt: LOW_STOCK_THRESHOLD } }),
      Product.countDocuments(),
      Sale.find().sort({ timestamp: -1, createdAt: -1 }).limit(5).lean()
    ]);

    const revenue = Number(revenueResult[0]?.revenue || 0);
    const stockHealth = totalProducts > 0 ? Math.max(0, Math.round(((totalProducts - lowStockCount) / totalProducts) * 100)) : 0;
    const recentTransactions = recentSales.map(buildRecentTransaction);

    return apiResponse(res, 200, true, "Analytics summary loaded", {
      summary: {
        revenue,
        transactionCount,
        activeEmployees,
        lowStockCount,
        stockHealth,
        alerts: lowStockCount,
        lowStockThreshold: LOW_STOCK_THRESHOLD,
        recentTransactions
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load analytics summary"
    });
  }
};

const getNotifications = async (req, res) => {
  try {
    const [lowStockProducts, recentNotifications, recentSales] = await Promise.all([
      Product.find({ stock: { $lt: LOW_STOCK_THRESHOLD } }).sort({ stock: 1, updatedAt: -1 }).limit(10).lean(),
      Notification.find().sort({ createdAt: -1 }).limit(10).lean(),
      Sale.find().sort({ timestamp: -1, createdAt: -1 }).limit(5).lean()
    ]);

    const warnings = lowStockProducts.map(buildLowStockWarning);

    const notificationEvents = recentNotifications.map((item) =>
      buildSystemEvent({
        id: String(item._id),
        title: item.title,
        description: item.description,
        type: item.type,
        source: item.source || "system",
        timestamp: new Date(item.createdAt || Date.now()).toISOString()
      })
    );

    const saleEvents = recentSales.map((sale) => {
      const amount = Number(sale.grandTotal ?? sale.totalAmount ?? 0);
      const department = Array.isArray(sale.items) && sale.items.length ? sale.items[0].department || "Mixed" : "Mixed";
      return buildSystemEvent({
        id: `sale-${sale._id}`,
        title: "Sale completed",
        description: `Completed ${department} sale worth PKR ${formatCurrency(amount)} via ${sale.paymentMethod}.`,
        type: "success",
        source: "pos",
        timestamp: new Date(sale.timestamp || sale.createdAt || Date.now()).toISOString()
      });
    });

    const events = [...saleEvents, ...notificationEvents]
      .sort((a, b) => toTimestamp(b.timestamp).getTime() - toTimestamp(a.timestamp).getTime())
      .slice(0, 5);

    return apiResponse(res, 200, true, "Analytics notifications loaded", {
      warnings,
      events
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to load analytics notifications"
    });
  }
};

module.exports = {
  getSummary,
  getNotifications
};
