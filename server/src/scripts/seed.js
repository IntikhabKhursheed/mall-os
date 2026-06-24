require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");
const Employee = require("../models/Employee");
const Product = require("../models/Product");
const Sale = require("../models/Sale");
const Transaction = require("../models/Transaction");

const createDateDaysAgo = (daysAgo, hours = 10) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hours, 30, 0, 0);
  return date;
};

const users = [
  {
    name: "Admin User",
    email: "admin@mallos.com",
    password: "Admin@123",
    role: "admin",
    department: "",
    status: "active"
  },
  {
    name: "Manager User",
    email: "manager@mallos.com",
    password: "Manager@123",
    role: "manager",
    department: "Fashion",
    status: "active"
  },
  {
    name: "Cashier User",
    email: "cashier@mallos.com",
    password: "Cashier@123",
    role: "cashier",
    department: "Fashion",
    status: "active"
  }
];

const departments = [
  { name: "Fashion", managerId: "Manager User", status: "active" },
  { name: "Food Court", managerId: "Food Court Manager", status: "active" },
  { name: "Electronics", managerId: "Electronics Manager", status: "active" },
  { name: "Beauty", managerId: "Beauty Manager", status: "active" },
  { name: "Sports", managerId: "Sports Manager", status: "active" },
  { name: "Home & Living", managerId: "Home Manager", status: "active" }
];

const employees = [
  {
    name: "Ayesha Khan",
    email: "ayesha.khan@mallos.com",
    phone: "0300-1111111",
    role: "Sales Associate",
    department: "Fashion",
    status: "active",
    clockInTime: createDateDaysAgo(0, 9),
    lastActive: createDateDaysAgo(0, 14)
  },
  {
    name: "Hassan Ali",
    email: "hassan.ali@mallos.com",
    phone: "0300-2222222",
    role: "Cashier",
    department: "Food Court",
    status: "active",
    clockInTime: createDateDaysAgo(0, 9),
    lastActive: createDateDaysAgo(0, 15)
  },
  {
    name: "Sara Ahmed",
    email: "sara.ahmed@mallos.com",
    phone: "0300-3333333",
    role: "Inventory Officer",
    department: "Electronics",
    status: "active",
    clockInTime: createDateDaysAgo(1, 9),
    lastActive: createDateDaysAgo(1, 16)
  },
  {
    name: "Usman Raza",
    email: "usman.raza@mallos.com",
    phone: "0300-4444444",
    role: "Beauty Advisor",
    department: "Beauty",
    status: "active",
    clockInTime: createDateDaysAgo(1, 10),
    lastActive: createDateDaysAgo(1, 17)
  },
  {
    name: "Nida Tariq",
    email: "nida.tariq@mallos.com",
    phone: "0300-5555555",
    role: "Floor Supervisor",
    department: "Sports",
    status: "active",
    clockInTime: createDateDaysAgo(2, 9),
    lastActive: createDateDaysAgo(2, 15)
  },
  {
    name: "Bilal Hussain",
    email: "bilal.hussain@mallos.com",
    phone: "0300-6666666",
    role: "Store Assistant",
    department: "Home & Living",
    status: "active",
    clockInTime: createDateDaysAgo(2, 10),
    lastActive: createDateDaysAgo(2, 18)
  }
];

const products = [
  {
    name: "Classic Denim Jacket",
    sku: "FASH-001",
    barcode: "100000000001",
    department: "Fashion",
    price: 8999,
    stock: 24,
    reorderLevel: 8,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Cotton T-Shirt",
    sku: "FASH-002",
    barcode: "100000000002",
    department: "Fashion",
    price: 1499,
    stock: 60,
    reorderLevel: 20,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Backpack",
    sku: "FASH-003",
    barcode: "100000000003",
    department: "Fashion",
    price: 3499,
    stock: 12,
    reorderLevel: 10,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Wireless Earbuds",
    sku: "ELEC-001",
    barcode: "200000000001",
    department: "Electronics",
    price: 6999,
    stock: 18,
    reorderLevel: 7,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Smartphone Charger",
    sku: "ELEC-002",
    barcode: "200000000002",
    department: "Electronics",
    price: 1299,
    stock: 50,
    reorderLevel: 15,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Smart Watch",
    sku: "ELEC-003",
    barcode: "200000000003",
    department: "Electronics",
    price: 12999,
    stock: 6,
    reorderLevel: 8,
    status: "low_stock",
    imageUrl: ""
  },
  {
    name: "Burger Combo",
    sku: "FOOD-001",
    barcode: "300000000001",
    department: "Food Court",
    price: 1499,
    stock: 45,
    reorderLevel: 12,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Pizza Combo Meal",
    sku: "FOOD-002",
    barcode: "300000000002",
    department: "Food Court",
    price: 2499,
    stock: 28,
    reorderLevel: 10,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Coffee Maker",
    sku: "HOME-001",
    barcode: "400000000001",
    department: "Home & Living",
    price: 8999,
    stock: 9,
    reorderLevel: 6,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Home Decor Lamp",
    sku: "HOME-002",
    barcode: "400000000002",
    department: "Home & Living",
    price: 2799,
    stock: 0,
    reorderLevel: 5,
    status: "out_of_stock",
    imageUrl: ""
  },
  {
    name: "Face Serum",
    sku: "BEAU-001",
    barcode: "500000000001",
    department: "Beauty",
    price: 2199,
    stock: 32,
    reorderLevel: 10,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Perfume Bottle",
    sku: "BEAU-002",
    barcode: "500000000002",
    department: "Beauty",
    price: 4999,
    stock: 7,
    reorderLevel: 10,
    status: "low_stock",
    imageUrl: ""
  },
  {
    name: "Sports Shoes",
    sku: "SPORT-001",
    barcode: "600000000001",
    department: "Sports",
    price: 9999,
    stock: 20,
    reorderLevel: 8,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Yoga Mat",
    sku: "SPORT-002",
    barcode: "600000000002",
    department: "Sports",
    price: 2499,
    stock: 14,
    reorderLevel: 5,
    status: "healthy",
    imageUrl: ""
  },
  {
    name: "Running Shorts",
    sku: "SPORT-003",
    barcode: "600000000003",
    department: "Sports",
    price: 1899,
    stock: 4,
    reorderLevel: 8,
    status: "low_stock",
    imageUrl: ""
  }
];

const sales = [
  {
    items: [
      { name: "Cotton T-Shirt", quantity: 2, unitPrice: 1499, lineTotal: 2998 },
      { name: "Backpack", quantity: 1, unitPrice: 3499, lineTotal: 3499 }
    ],
    subtotal: 6497,
    discount: 497,
    tax: 300,
    grandTotal: 6300,
    paymentMethod: "cash",
    timestamp: createDateDaysAgo(0, 12)
  },
  {
    items: [
      { name: "Burger Combo", quantity: 3, unitPrice: 1499, lineTotal: 4497 },
      { name: "Pizza Combo Meal", quantity: 1, unitPrice: 2499, lineTotal: 2499 }
    ],
    subtotal: 6996,
    discount: 0,
    tax: 350,
    grandTotal: 7346,
    paymentMethod: "card",
    timestamp: createDateDaysAgo(1, 13)
  },
  {
    items: [
      { name: "Wireless Earbuds", quantity: 1, unitPrice: 6999, lineTotal: 6999 },
      { name: "Smartphone Charger", quantity: 2, unitPrice: 1299, lineTotal: 2598 }
    ],
    subtotal: 9597,
    discount: 597,
    tax: 450,
    grandTotal: 9450,
    paymentMethod: "card",
    timestamp: createDateDaysAgo(2, 15)
  },
  {
    items: [
      { name: "Face Serum", quantity: 2, unitPrice: 2199, lineTotal: 4398 },
      { name: "Perfume Bottle", quantity: 1, unitPrice: 4999, lineTotal: 4999 }
    ],
    subtotal: 9397,
    discount: 397,
    tax: 500,
    grandTotal: 9500,
    paymentMethod: "cash",
    timestamp: createDateDaysAgo(3, 11)
  },
  {
    items: [
      { name: "Sports Shoes", quantity: 1, unitPrice: 9999, lineTotal: 9999 },
      { name: "Yoga Mat", quantity: 2, unitPrice: 2499, lineTotal: 4998 }
    ],
    subtotal: 14997,
    discount: 997,
    tax: 700,
    grandTotal: 14700,
    paymentMethod: "card",
    timestamp: createDateDaysAgo(4, 16)
  }
];

const seed = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing. Set it in server/.env before seeding.");
  }

  await connectDB();

  console.log("Clearing demo data...");
  await Promise.all([
    User.deleteMany({}),
    Department.deleteMany({}),
    Employee.deleteMany({}),
    Product.deleteMany({}),
    Sale.deleteMany({}),
    Transaction.deleteMany({})
  ]);

  console.log("Seeding users...");
  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await bcrypt.hash(user.password, 10)
    }))
  );
  const createdUsers = await User.insertMany(hashedUsers);

  console.log("Seeding departments...");
  const createdDepartments = await Department.insertMany(departments);

  console.log("Seeding employees...");
  await Employee.insertMany(employees);

  console.log("Seeding products...");
  await Product.insertMany(products);

  console.log("Seeding sales...");
  const createdSales = await Sale.insertMany(sales);
  for (let index = 0; index < createdSales.length; index += 1) {
    const saleDate = sales[index].createdAt;
    await Sale.updateOne(
      { _id: createdSales[index]._id },
      { $set: { createdAt: saleDate, updatedAt: saleDate } }
    );
  }

  console.log("Seeding transactions...");
  const transactionDocs = createdSales.map((sale, index) => {
    const saleDate = sales[index].timestamp;
    return {
      transactionId: `TXN-${String(index + 1).padStart(4, "0")}`,
      sale: sale._id,
      cashier: "Cashier User",
      department: sale.items[0]?.department || "Mixed",
      itemsCount: sale.items.length,
      totalAmount: sale.grandTotal,
      paymentMethod: sale.paymentMethod,
      status: "completed",
      createdAt: saleDate,
      updatedAt: saleDate
    };
  });

  await Transaction.insertMany(transactionDocs);

  console.log("Demo seed complete.");
  console.log(`Users: ${createdUsers.length}`);
  console.log(`Departments: ${createdDepartments.length}`);
  console.log(`Employees: ${employees.length}`);
  console.log(`Products: ${products.length}`);
  console.log(`Sales: ${createdSales.length}`);
  console.log(`Transactions: ${transactionDocs.length}`);
};

seed()
  .then(async () => {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB.");
    process.exit(0);
  })
  .catch(async (error) => {
    console.error("Seed failed:", error.message);
    try {
      await mongoose.disconnect();
    } catch (disconnectError) {
      console.error("Disconnect error:", disconnectError.message);
    }
    process.exit(1);
  });
