# MallOS

MallOS is an AI-powered smart mall management system for managing employees, departments, products, inventory, POS sales, transactions, reports, real-time alerts, and AI-generated business insights.

## Tech Stack

Frontend: Angular 19, TypeScript, PrimeNG, PrimeIcons, Angular Router, Reactive Forms

Backend: Node.js, Express.js, MongoDB, Mongoose, JWT authentication, bcrypt, CORS, dotenv

## Folder Structure

```text
mallos/
├── client/
├── server/
├── README.md
└── .gitignore
```

## Backend Setup

```bash
cd server
npm install
npm run dev
```

## Frontend Setup

```bash
cd client
npm install
npm run dev
```

The client dev server runs on `http://localhost:4201` in this workspace because port `4200` was already occupied.

If PowerShell blocks `npm`, run:

```bash
npm.cmd run dev
```

## Environment Variables

Backend `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4201
```

## MongoDB Setup

### Option A: Use Local MongoDB

1. Install MongoDB Community Server for Windows.
2. Start the MongoDB service from Services or with MongoDB Compass.
3. Use this connection string in `server/.env`:

```env
MONGO_URI=mongodb://127.0.0.1:27017/mallos
```

### Option B: Use MongoDB Atlas

1. Create a free MongoDB Atlas cluster.
2. Add your Atlas connection string to `server/.env` as `MONGO_URI`.
3. Whitelist your local IP address in Atlas.
4. Use the Atlas connection string format provided by MongoDB.

## Seed Data

Run the demo seed after MongoDB is available:

```bash
cd server
npm run seed
```

Demo credentials:

- Admin: `admin@mallos.com` / `Admin@123`
- Manager: `manager@mallos.com` / `Manager@123`
- Cashier: `cashier@mallos.com` / `Cashier@123`

## Future Roadmap

- Employee attendance workflows
- Inventory alerts and purchase planning
- Sales analytics dashboards
- AI insight summaries and recommendations
- Role-based approval flows
