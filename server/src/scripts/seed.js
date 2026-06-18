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
  { name: "Fashion", category: "Retail", manager: "Manager User", status: "active" },
  { name: "Food Court", category: "Food & Beverage", manager: "Food Court Manager", status: "active" },
  { name: "Electronics", category: "Retail", manager: "Electronics Manager", status: "active" },
  { name: "Beauty", category: "Retail", manager: "Beauty Manager", status: "active" },
  { name: "Sports", category: "Retail", manager: "Sports Manager", status: "active" },
  { name: "Home & Living", category: "Retail", manager: "Home Manager", status: "active" }
];

const employees = [
  {
    fullName: "Ayesha Khan",
    email: "ayesha.khan@mallos.com",
    phone: "0300-1111111",
    role: "Sales Associate",
    department: "Fashion",
    status: "active",
    clockInTime: createDateDaysAgo(0, 9),
    lastActive: createDateDaysAgo(0, 14)
  },
  {
    fullName: "Hassan Ali",
    email: "hassan.ali@mallos.com",
    phone: "0300-2222222",
    role: "Cashier",
    department: "Food Court",
    status: "active",
    clockInTime: createDateDaysAgo(0, 9),
    lastActive: createDateDaysAgo(0, 15)
  },
  {
    fullName: "Sara Ahmed",
    email: "sara.ahmed@mallos.com",
    phone: "0300-3333333",
    role: "Inventory Officer",
    department: "Electronics",
    status: "active",
    clockInTime: createDateDaysAgo(1, 9),
    lastActive: createDateDaysAgo(1, 16)
  },
  {
    fullName: "Usman Raza",
    email: "usman.raza@mallos.com",
    phone: "0300-4444444",
    role: "Beauty Advisor",
    department: "Beauty",
    status: "active",
    clockInTime: createDateDaysAgo(1, 10),
    lastActive: createDateDaysAgo(1, 17)
  },
  {
    fullName: "Nida Tariq",
    email: "nida.tariq@mallos.com",
    phone: "0300-5555555",
    role: "Floor Supervisor",
    department: "Sports",
    status: "active",
    clockInTime: createDateDaysAgo(2, 9),
    lastActive: createDateDaysAgo(2, 15)
  },
  {
    fullName: "Bilal Hussain",
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
    category: "Apparel",
    department: "Fashion",
    sellingPrice: 8999,
    costPrice: 5500,
    stockQuantity: 24,
    reorderLevel: 8,
    status: "healthy",
    image: ""
  },
  {
    name: "Cotton T-Shirt",
    sku: "FASH-002",
    barcode: "100000000002",
    category: "Apparel",
    department: "Fashion",
    sellingPrice: 1499,
    costPrice: 700,
    stockQuantity: 60,
    reorderLevel: 20,
    status: "healthy",
    image: ""
  },
  {
    name: "Backpack",
    sku: "FASH-003",
    barcode: "100000000003",
    category: "Accessories",
    department: "Fashion",
    sellingPrice: 3499,
    costPrice: 1900,
    stockQuantity: 12,
    reorderLevel: 10,
    status: "healthy",
    image: ""
  },
  {
    name: "Wireless Earbuds",
    sku: "ELEC-001",
    barcode: "200000000001",
    category: "Audio",
    department: "Electronics",
    sellingPrice: 6999,
    costPrice: 4200,
    stockQuantity: 18,
    reorderLevel: 7,
    status: "healthy",
    image: ""
  },
  {
    name: "Smartphone Charger",
    sku: "ELEC-002",
    barcode: "200000000002",
    category: "Accessories",
    department: "Electronics",
    sellingPrice: 1299,
    costPrice: 700,
    stockQuantity: 50,
    reorderLevel: 15,
    status: "healthy",
    image: ""
  },
  {
    name: "Smart Watch",
    sku: "ELEC-003",
    barcode: "200000000003",
    category: "Wearables",
    department: "Electronics",
    sellingPrice: 12999,
    costPrice: 8600,
    stockQuantity: 6,
    reorderLevel: 8,
    status: "low_stock",
    image: ""
  },
  {
    name: "Burger Combo",
    sku: "FOOD-001",
    barcode: "300000000001",
    category: "Meals",
    department: "Food Court",
    sellingPrice: 1499,
    costPrice: 800,
    stockQuantity: 45,
    reorderLevel: 12,
    status: "healthy",
    image: ""
  },
  {
    name: "Pizza Combo Meal",
    sku: "FOOD-002",
    barcode: "300000000002",
    category: "Meals",
    department: "Food Court",
    sellingPrice: 2499,
    costPrice: 1400,
    stockQuantity: 28,
    reorderLevel: 10,
    status: "healthy",
    image: ""
  },
  {
    name: "Coffee Maker",
    sku: "HOME-001",
    barcode: "400000000001",
    category: "Appliances",
    department: "Home & Living",
    sellingPrice: 8999,
    costPrice: 6100,
    stockQuantity: 9,
    reorderLevel: 6,
    status: "healthy",
    image: ""
  },
  {
    name: "Home Decor Lamp",
    sku: "HOME-002",
    barcode: "400000000002",
    category: "Decor",
    department: "Home & Living",
    sellingPrice: 2799,
    costPrice: 1600,
    stockQuantity: 0,
    reorderLevel: 5,
    status: "out_of_stock",
    image: ""
  },
  {
    name: "Face Serum",
    sku: "BEAU-001",
    barcode: "500000000001",
    category: "Skincare",
    department: "Beauty",
    sellingPrice: 2199,
    costPrice: 1200,
    stockQuantity: 32,
    reorderLevel: 10,
    status: "healthy",
    image: ""
  },
  {
    name: "Perfume Bottle",
    sku: "BEAU-002",
    barcode: "500000000002",
    category: "Fragrance",
    department: "Beauty",
    sellingPrice: 4999,
    costPrice: 3000,
    stockQuantity: 7,
    reorderLevel: 10,
    status: "low_stock",
    image: ""
  },
  {
    name: "Sports Shoes",
    sku: "SPORT-001",
    barcode: "600000000001",
    category: "Footwear",
    department: "Sports",
    sellingPrice: 9999,
    costPrice: 6400,
    stockQuantity: 20,
    reorderLevel: 8,
    status: "healthy",
    image: ""
  },
  {
    name: "Yoga Mat",
    sku: "SPORT-002",
    barcode: "600000000002",
    category: "Fitness",
    department: "Sports",
    sellingPrice: 2499,
    costPrice: 1500,
    stockQuantity: 14,
    reorderLevel: 5,
    status: "healthy",
    image: ""
  },
  {
    name: "Running Shorts",
    sku: "SPORT-003",
    barcode: "600000000003",
    category: "Apparel",
    department: "Sports",
    sellingPrice: 1899,
    costPrice: 1100,
    stockQuantity: 4,
    reorderLevel: 8,
    status: "low_stock",
    image: ""
  }
];

const sales = [
  {
    items: [
      { name: "Cotton T-Shirt", quantity: 2, price: 1499 },
      { name: "Backpack", quantity: 1, price: 3499 }
    ],
    subtotal: 6497,
    discount: 497,
    tax: 300,
    totalAmount: 6300,
    cashier: "Cashier User",
    department: "Fashion",
    paymentMethod: "cash",
    status: "completed",
    createdAt: createDateDaysAgo(0, 12)
  },
  {
    items: [
      { name: "Burger Combo", quantity: 3, price: 1499 },
      { name: "Pizza Combo Meal", quantity: 1, price: 2499 }
    ],
    subtotal: 6996,
    discount: 0,
    tax: 350,
    totalAmount: 7346,
    cashier: "Cashier User",
    department: "Food Court",
    paymentMethod: "card",
    status: "completed",
    createdAt: createDateDaysAgo(1, 13)
  },
  {
    items: [
      { name: "Wireless Earbuds", quantity: 1, price: 6999 },
      { name: "Smartphone Charger", quantity: 2, price: 1299 }
    ],
    subtotal: 9597,
    discount: 597,
    tax: 450,
    totalAmount: 9450,
    cashier: "Cashier User",
    department: "Electronics",
    paymentMethod: "card",
    status: "completed",
    createdAt: createDateDaysAgo(2, 15)
  },
  {
    items: [
      { name: "Face Serum", quantity: 2, price: 2199 },
      { name: "Perfume Bottle", quantity: 1, price: 4999 }
    ],
    subtotal: 9397,
    discount: 397,
    tax: 500,
    totalAmount: 9500,
    cashier: "Cashier User",
    department: "Beauty",
    paymentMethod: "cash",
    status: "completed",
    createdAt: createDateDaysAgo(3, 11)
  },
  {
    items: [
      { name: "Sports Shoes", quantity: 1, price: 9999 },
      { name: "Yoga Mat", quantity: 2, price: 2499 }
    ],
    subtotal: 14997,
    discount: 997,
    tax: 700,
    totalAmount: 14700,
    cashier: "Cashier User",
    department: "Sports",
    paymentMethod: "card",
    status: "completed",
    createdAt: createDateDaysAgo(4, 16)
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
    const saleDate = sales[index].createdAt;
    return {
      transactionId: `TXN-${String(index + 1).padStart(4, "0")}`,
      sale: sale._id,
      cashier: "Cashier User",
      department: sale.department,
      itemsCount: sale.items.length,
      totalAmount: sale.totalAmount,
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
