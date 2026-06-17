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

## Environment Variables

Backend `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:4200
```

## Future Roadmap

- Employee attendance workflows
- Inventory alerts and purchase planning
- Sales analytics dashboards
- AI insight summaries and recommendations
- Role-based approval flows
