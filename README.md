# 🛠️ HOMEService — Cooperative Home Services Marketplace

A modern, transparent, and fair home services cooperative platform built to empower skilled service professionals and provide reliable home services to communities.

---

## 🌟 Overview & Cooperative Philosophy

Unlike traditional gig-economy platforms that extract 20–30% intermediary fees, **HOMEService** operates on a **Worker Cooperative Federation model** (modeled after the *Tamil Nadu Labour Welfare Cooperative Federation Ltd.*):
- **Transparent 5% Platform Fee + 5% Cooperative Welfare Fund**: Fair earnings for providers.
- **Worker Welfare & Social Security**: Healthcare grants, accidental insurance, provident savings, and skill-upgrading certification programs.
- **Fair Customer Pricing**: Transparent rates with family subscription plans and guaranteed verified professionals.
- **Community Governance & Audit Trails**: Every rate adjustment, worker certification, and transaction is logged in an immutable audit ledger.

---

## 🚀 Key Features

1. **Service Categories & 50+ Services**:
   - Home Cleaning, Appliance Repair, Plumbing, Electrical, Carpentry, Painting, Pest Control, and Emergency Services.
2. **End-to-End Booking Lifecycle**:
   - Dynamic stage updates: `Requested` → `Accepted` → `On The Way` → `Arrived` → `Service Started` → `Completed` → `Customer Confirmed` → `Payment Completed` → `Rated`.
3. **Smart Cooperative Dispatch & Matching**:
   - Geolocation-based matching using Haversine distance, worker tier level, skill badges, and availability.
4. **Provider Portal**:
   - Job request feed with accept/decline actions.
   - Live availability toggle & calendar schedule.
   - Skill upgrading & cooperative certification submission.
   - Earnings analytics and welfare benefits dashboard.
5. **Customer Portal**:
   - Multi-step booking wizard with transparent price breakdown.
   - Family membership management with dependent profiles.
   - Instant GST-compliant invoice generation (PDF download).
6. **Cooperative Admin Dashboard**:
   - Federation overview: active members, revenue volume, and welfare reserve balance.
   - Worker verification & certification approval flow.
   - Algorithmic demand forecasting and workforce capacity planner.
   - Cooperative pricing configuration & audit logs.
7. **Bilingual Support**:
   - English & Tamil interface support.

---

## 💻 Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Actions & Route Handlers)
- **Frontend**: React 18, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend / Database**: Prisma ORM with SQLite (compatible with PostgreSQL/MySQL for production)
- **Authentication**: JWT session tokens with role-based access control (Customer, Worker, Cooperative Admin, Federation Admin)
- **PDF Generation**: jsPDF for dynamic invoice generation

---

## 🛠️ Getting Started Locally

### Prerequisites
- Node.js (v18.17+ or v20+)
- npm or yarn

### 1. Clone the repository
```bash
git clone <your-repository-url>
cd HomeService
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Copy the example environment file:
```bash
cp .env.example .env
```

### 4. Setup Prisma Database and Seed Data
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```
*This populates the database with 7 categories, 50+ services, pricing configurations, and 9 demo worker accounts across skills and certification tiers.*

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Logins

Quick one-click demo logins are available on `/auth/login`:
- **Customer**: `9876543210` / `Password123!`
- **Worker / Provider**: `9876543220` / `Password123!`
- **Cooperative Admin**: `admin@homeservice.coop` / `AdminPass123!`

---

## 🚢 Deployment Guide

### Deploying to Vercel
1. Push this repository to your GitHub account.
2. Go to [Vercel](https://vercel.com/) and click **Add New Project**.
3. Import your GitHub repository.
4. Set the environment variables in Vercel:
   - `JWT_SECRET`: A secure 32+ character random string.
   - `DATABASE_URL`: A hosted PostgreSQL or MySQL URL (e.g. Neon, Supabase, Railway, PlanetScale).
   - If migrating to PostgreSQL, update `provider = "postgresql"` in `prisma/schema.prisma` and run `npx prisma db push`.
5. Click **Deploy**.

---

## 📄 License
This project is licensed under the MIT License.
