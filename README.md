# MallOS — AI-Powered Smart Mall Management System

Author: Intikhab Khursheed | intikhabkhurheed.netlify.app
Repository: https://github.com/IntikhabKhursheed/mall-os

## Overview

MallOS is a real-time operations dashboard for smart mall management. It 
combines live data pipelines with Gemini AI to detect anomalies in sales and 
operations streams, flag deviations automatically, and surface business 
intelligence to operations staff.

The core engineering challenge was maintaining low-latency anomaly detection 
across continuous event streams without blocking the UI — achieved through 
event-driven Socket.io architecture and server-side AI inference separated from 
the client render cycle.

## Key Technical Features

- Real-time analytics engine processing continuous sales and operations data 
  streams via Socket.io
- Gemini AI anomaly detection identifying deviations in sales trends, inventory 
  levels, and operational KPIs
- Multi-role JWT authentication (Admin, Manager, Cashier) with route-level 
  access enforcement
- POS transaction management with live inventory reconciliation
- ApexCharts dashboard with real-time chart updates on socket events
- Employee and department management with audit logging

## Architecture

Angular 19 frontend subscribes to Socket.io event channels for live data. 
Node.js backend manages the event pipeline, runs Gemini AI inference on 
aggregated stream data at configurable intervals, and emits anomaly alerts back 
to connected clients by role.

## Tech Stack

Frontend: Angular 19, TypeScript, PrimeNG, PrimeIcons, ApexCharts
Backend: Node.js, Express.js, MongoDB Atlas, Mongoose, Socket.io
AI: Google Gemini API (anomaly detection, business insights)
Auth: JWT, bcrypt
Deployment: Vercel

## Setup

```bash
git clone https://github.com/IntikhabKhursheed/mall-os.git
cd mall-os
# Backend
cd server && npm install && npm run dev
# Frontend
cd ../client && npm install && npm run dev
```

Demo credentials: admin@mallos.com / Admin@123

## Status

In active development. Core dashboard, POS, and anomaly detection are 
functional. Planned: inventory alerts, sales forecasting, approval workflows.
