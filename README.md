# LostLink – Smart Lost & Found Management Platform

![LostLink Platform](https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=1200)

**LostLink** is a modern, responsive, full-stack MERN platform built to streamline lost and found management with an automated multi-parameter Smart Matching engine, anti-fraud claim verification, notifications, and comprehensive administrative oversight.

---

##  Key Features

### 1. User Authentication & Authorization
- **Secure Registration & Login**: Password hashing with `bcryptjs` and session tokens via `jsonwebtoken` (JWT).
- **Role-Based Access Control (RBAC)**: Distinguishes regular platform users from administrators.
- **Account Moderation**: Admin ability to suspend or reinstate suspicious accounts.
- **Finder Reputation System**: Users earn reputation score points for reporting and successfully returning items.

### 2. Lost & Found Reporting & Directory
- **Comprehensive Item Reports**: Title, type (Lost / Found), category, brand, primary & secondary colors, city, exact location landmark, date, and description.
- **Image Upload Integration**: Seamless Cloudinary support with automatic local storage fallback (`/uploads/...`) so uploads always work out-of-the-box.
- **Advanced Directory Filters**: Search by keyword, report type, category, city/region, brand, color, date range, and status.
- **Multiple Views**: Interactive Grid View and List View with responsive cards.
- **Report Management**: Owners and admins can edit or delete existing reports.

### 3. Smart Matching Engine (0% – 100%)
- **Multi-Parameter Algorithmic Scoring**:
  - **Category Correlation (25%)**: Exact category and subcategory matching.
  - **Location & Proximity (20%)**: City matching + specific location keyword similarity.
  - **Brand Similarity (15%)**: Brand name comparison and text reference detection.
  - **Color Matching (15%)**: Primary and secondary color normalization.
  - **Description & Keyword Overlap (15%)**: Tokenized stop-word filtered Jaccard similarity.
  - **Date Delta (10%)**: Proximity between date lost and date found.
- **Automated Alerts**: As soon as a report is posted, opposite items with $\ge 60\%$ match scores trigger automatic notifications to both parties.
- **Interactive Match Simulator**: Compare any two items on the fly to inspect exact scoring parameters.

### 4. Anti-Fraud Ownership Claims
- **Confidential Security Questions**: Finders can attach challenge questions only the true owner would know.
- **Proof Documentation**: Claimants submit proof descriptions, purchase receipts, or unique serial number photos.
- **Claim Review**: Finders or admins can review proof, approve, or reject claims.
- **Reunion Finalization**: Marks item as reunited and awards $+20$ reputation points to the finder and $+15$ to the claimant.

### 5. Notifications Stream
- **Match Alerts**: Real-time notifications when a report correlates with an item.
- **Claim Updates**: Notifications on claim submission, approval, or rejection.
- **Header Bell & Counter**: Live unread badge count with dropdown preview and mark-all-as-read.

### 6. User Dashboard
- **My Reports Tab**: Track active, claimed, and reunited reports with views count.
- **My Claims Tab**: View submitted claims, status badges, and review notes.
- **Smart Matches Tab**: Direct view of high-confidence pairing recommendations.
- **Notification Activity**: Manage and dismiss alerts.
- **Profile & Security**: Update profile name, contact phone, avatar, and password.

### 7. Admin Dashboard & Audit Trail
- **Platform Analytics**: Live statistics (Total Users, Lost Items, Found Items, Reunited Count, Active Cases, Recovery Success Rate).
- **Category & Trend Analytics**: Aggregated category breakdown and monthly distribution trends.
- **Report Moderation**: Flag suspicious reports to protect users from spam or phishing.
- **Claims Management**: Oversight of all platform claims with filtering.
- **User Management**: Search users, toggle admin role privileges, and suspend malicious accounts.
- **Activity & Security Audit Log**: Chronological audit trail logging user actions, timestamps, and IP addresses.

---

## 🛠 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router 6, Axios, Lucide React, Custom SaaS Design System (Navy, White, Teal) |
| **Backend** | Node.js, Express.js, CORS, Morgan, Multer, Dotenv |
| **Database** | MongoDB, Mongoose ORM (supports MongoDB Atlas, local MongoDB, or automatic in-memory fallback) |
| **Auth & Security** | JWT (JSON Web Tokens), bcryptjs |
| **Storage** | Cloudinary v2 API with automatic local disk storage fallback |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ or v24+
- [MongoDB](https://www.mongodb.com/) (local daemon or free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster)

### 1. Installation
Clone or open the workspace and install root, backend, and frontend packages:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

# Return to root
cd ..
npm install
```

### 2. Environment Configuration
The backend comes pre-configured with default development settings. You can review or customize `backend/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/lostlink
JWT_SECRET=lostlink_super_secret_jwt_key_2026_secure_key_change_in_production
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

# Optional: Cloudinary credentials (local storage used automatically if blank)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### 3. Seed Realistic Demo Data
Seed the database with verified users, realistic lost and found reports (with pre-matched 90%+ pairs), sample claims, notifications, and activity logs:
```bash
npm run seed
```

### 4. Run the Full Application
Start both the Express API and Vite React frontend concurrently:
```bash
npm run dev
```

Or run them in separate terminals:
- **Backend API**: `npm run dev --prefix backend` (Runs at `http://localhost:5000`)
- **Frontend App**: `npm run dev --prefix frontend` (Runs at `http://localhost:5173`)

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Features to Test |
|---|---|---|---|
| **Platform Admin** | `admin@lostlink.com` | `Admin@123456` | Admin Dashboard, user management, item moderation, all claims |
| **User (Lost iPhone)** | `alex@example.com` | `User@123456` | My Reports, 90%+ Smart Match alert, submitted claim |
| **User (Found iPhone)** | `sarah@example.com` | `User@123456` | Review incoming claim, challenge questions, finalize return |
| **User (Fossil Wallet)** | `marcus@example.com` | `User@123456` | Browse directory, submit new reports |

*(You can also click any of the **"One-Click Demo Credentials"** buttons directly on the Login page for instant access!)*

---

## 🧪 Testing the APIs & Full Lifecycle

An automated end-to-end integration test suite is included in `backend/test-api.js`:
```bash
# With the backend server running:
node backend/test-api.js
```

This verifies:
-  API Health Check (`/api/health`)
-  Landing Page Statistics Counters (`/api/stats/public`)
-  Directory Search & Filters (`/api/items?type=lost`)
-  Admin Authentication & JWT Generation (`/api/auth/login`)
-  User Authentication & Profile Authorization (`/api/auth/me`)
-  Smart Match Calculation & Natural Language Reasons
-  Report Creation with automatic opposite-type matching
-  Admin Analytics & Audit Trail Logs
-  Notifications Stream

---

## 📂 Project Directory Structure

```
lost&link/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB connection & in-memory fallback
│   │   └── cloudinary.js         # Cloudinary configuration & storage helpers
│   ├── controllers/
│   │   ├── adminController.js    # Statistics, user management, moderation
│   │   ├── authController.js     # Register, login, profile, password
│   │   ├── claimController.js    # Claim submission, approval, return finalization
│   │   ├── itemController.js     # CRUD reports, filters, image processing
│   │   ├── matchController.js    # Smart match scoring & item comparison
│   │   └── notificationController.js # Notifications stream & read receipts
│   ├── middleware/
│   │   ├── adminMiddleware.js    # Admin authorization guard
│   │   ├── authMiddleware.js     # JWT verification & banned user checks
│   │   ├── errorMiddleware.js    # Central error handler
│   │   └── uploadMiddleware.js   # Multer & Cloudinary/Local file handler
│   ├── models/
│   │   ├── ActivityLog.js        # Audit trail logs
│   │   ├── Claim.js              # Ownership claims & security answers
│   │   ├── Item.js               # Lost & Found report schema with indexes
│   │   ├── Notification.js       # Real-time alerts
│   │   └── User.js               # User accounts & reputation score
│   ├── routes/                   # RESTful API route definitions
│   ├── utils/
│   │   ├── activityLogger.js     # System event logger
│   │   ├── seed.js               # Database seeder with realistic test data
│   │   └── smartMatch.js         # Multi-factor smart matching engine
│   ├── uploads/                  # Local media uploads storage
│   ├── .env                      # Environment variables
│   ├── server.js                 # Main Express application entrypoint
│   └── test-api.js               # End-to-end integration test suite
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── AdminRoute.jsx    # Admin-only route guard
│   │   │   ├── ClaimModal.jsx    # Proof submission modal
│   │   │   ├── Footer.jsx        # Responsive SaaS footer
│   │   │   ├── ItemCard.jsx      # Item card with status & match pills
│   │   │   ├── MatchCard.jsx     # Smart match breakdown card
│   │   │   ├── Navbar.jsx        # Navigation & notification bell
│   │   │   ├── ProtectedRoute.jsx# Auth route guard
│   │   │   ├── SearchBar.jsx     # Multi-filter search component
│   │   │   └── StatCard.jsx      # Metrics and analytics card
│   │   ├── context/
│   │   │   ├── AuthContext.jsx   # Global session & user state
│   │   │   └── NotificationContext.jsx # Polling notification state
│   │   ├── pages/
│   │   │   ├── AdminDashboardPage.jsx # Analytics, users, reports, claims
│   │   │   ├── BrowseItemsPage.jsx    # Advanced directory & filters
│   │   │   ├── EditItemPage.jsx       # Edit report page
│   │   │   ├── HomePage.jsx           # Hero, stats, recent items, how it works
│   │   │   ├── ItemDetailsPage.jsx    # Gallery, claim actions, recommendations
│   │   │   ├── LoginPage.jsx          # Login with quick demo buttons
│   │   │   ├── NotFoundPage.jsx       # 404 page
│   │   │   ├── RegisterPage.jsx       # Account registration
│   │   │   ├── ReportItemPage.jsx     # Report form with image upload
│   │   │   ├── SmartMatchesPage.jsx   # Automated matching hub & sandbox
│   │   │   └── UserDashboardPage.jsx  # My Reports, Claims, Matches, Profile
│   │   ├── services/
│   │   │   └── api.js                 # Axios instance with auth interceptor
│   │   ├── App.jsx                    # Route mapping
│   │   ├── index.css                  # Navy / White / Teal design system
│   │   └── main.jsx                   # React root entrypoint
│   ├── index.html
│   └── vite.config.js
└── package.json                  # Root orchestration scripts
```

---

## 🔒 Security Best Practices Implemented
- **Password Protection**: Passwords salted and hashed with `bcryptjs` (salt rounds: 10), excluded from JSON serialization.
- **JWT Protection**: Tokens verified via middleware on protected endpoints.
- **Anti-Fraud Security Verification**: Secret questions created by finders allow genuine owners to verify ownership before items are returned.
- **Input Sanitization**: Mongoose schemas validate types, character limits, email formats, and required attributes.
- **Safe File Storage**: Multer validates image mimetypes (`jpeg`, `jpg`, `png`, `webp`, `gif`) and enforces a 5MB size limit.
