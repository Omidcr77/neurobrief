# NeuroBrief

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)

AI-Powered Text Summarizer Web Platform

NeuroBrief empowers users to transform lengthy text, PDFs, or web articles into concise, insight-rich summaries using state-of-the-art GPT models. Whether you need a quick overview, detailed breakdown, or bullet-point highlights, NeuroBrief delivers.

---

## Table of Contents

- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Clone & Installation](#clone--installation)
  - [Configuration](#configuration)
  - [Running the App](#running-the-app)
- [Usage](#usage)
  - [API Endpoints](#api-endpoints)
  - [Client UI Overview](#client-ui-overview)
- [Testing](#testing)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## Key Features

- **Multi-Modal Input**: Summarize raw text, upload PDFs, or fetch & summarize articles via URL.
- **Flexible Summarization Options**:
  - **Length**: `short` (≤50 words), `medium` (~100 words), `detailed` (≥200 words).
  - **Style**: `abstractive`, `extractive` (quote key sentences), or `bullets`.
  - **Focus**: Specify topics or sections to emphasize.
- **User Authentication & Profiles**:
  - Secure JWT-based sign up, login, and session management.
  - Passwords hashed via bcrypt.
- **History & Export**:
  - View, search, and delete past summaries in your dashboard.
  - Download results as `.txt`, `.pdf` (via jsPDF), or export CSV/Excel.
- **Admin Dashboard**:
  - **User Management**: List, filter, update, deactivate/delete users, impersonate accounts.
  - **Reports & Metrics**: Real-time metrics (user & summary counts), daily registrations, summary trends, and CSV/Excel exports.
- **Responsive & Interactive UI**:
  - Built with React (v19), Tailwind v3, Headless UI, Framer Motion, AOS.
  - Charts & graphs powered by Chart.js & Recharts.
  - Markdown rendering via React Markdown + GFM support.
  - Accessible modals and routing (React Router v7).
- **Robust Backend**:
  - Node & Express v5, MongoDB (via Mongoose).
  - PDF parsing (`pdf-parse`), article extraction (Mozilla Readability & JSDOM).
  - CORS, file uploads (Multer), and secure environment management.

---

## Tech Stack

- **Frontend**: React · Tailwind CSS · Headless UI · Framer Motion · AOS · React Router
- **Backend**: Node.js · Express · MongoDB · Mongoose · JWT · bcrypt · Multer
- **AI & NLP**: OpenAI GPT-4.1 · `openai` SDK · Mozilla Readability · `pdf-parse`
- **Visualizations**: Chart.js · Recharts · jsPDF · React Markdown
- **Utilities**: Axios · CORS · dotenv
- **Testing**: Jest · Supertest · React Testing Library

---

## Getting Started

### Prerequisites

- Node.js v18+ & npm
- MongoDB (local or Atlas)
- OpenAI API key
- (Optional) Cloudinary account for PDF storage

### Clone & Installation

```bash
# Clone the repository
git clone https://github.com/Omidcr77/neurobrief.git
cd neurobrief
```

#### Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

#### Frontend Setup
```bash
cd ../client
npm install
```

### Configuration

Create environment files:

**Server (`server/.env`):**
```ini
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
OPENAI_API_KEY=<your-openai-api-key>
CLOUDINARY_URL=<optional-cloudinary-url>
```

**Client (`client/.env`):**
```ini
REACT_APP_API_URL=http://localhost:5000
```

### Running the App

```bash
# In one terminal (Backend)
cd server
npm run dev   # nodemon auto-reload

# In another terminal (Frontend)
cd client
npm start     # launches at http://localhost:3000
```

---

## Usage

### API Endpoints

| Method | Endpoint                    | Description                                  | Auth     |
| ------ | --------------------------- | -------------------------------------------- | -------- |
| GET    | `/`                         | Health check: returns "NeuroBrief API is live!" | No       |
| POST   | `/api/auth/register`        | Create a new user                            | No       |
| POST   | `/api/auth/login`           | Authenticate & receive JWT                   | No       |
| POST   | `/api/summarize/text`       | Summarize raw text                           | Yes      |
| POST   | `/api/summarize/pdf`        | Summarize uploaded PDF                       | Yes      |
| POST   | `/api/summarize/url`        | Summarize web article                        | Yes      |
| GET    | `/api/summaries`            | List user’s past summaries                   | Yes      |
| GET    | `/api/summaries/:id`        | Retrieve a single summary by ID              | Yes      |
| DELETE | `/api/summaries/:id`        | Delete a summary                             | Yes      |
| **Admin** |                         |                                              |          |
| GET    | `/api/admin/users`          | List & filter all users                      | Admin    |
| GET    | `/api/admin/users/:id`      | Get user details                             | Admin    |
| PUT    | `/api/admin/users/:id`      | Update user profile/role                     | Admin    |
| PATCH  | `/api/admin/users/:id/status` | Change user status                         | Admin |
| DELETE | `/api/admin/users/:id`      | Delete a user                                | Admin    |
| POST   | `/api/admin/users/:id/impersonate` | Impersonate a user                      | Admin    |
| GET    | `/api/admin/metrics`        | Retrieve platform usage metrics              | Admin    |
| GET    | `/api/admin/reports/user-activity`   | Registrations over time            | Admin    |
| GET    | `/api/admin/reports/summary-trends`  | Summary activity trends             | Admin    |
| GET    | `/api/admin/reports/export/:type`    | Export `users` or `summaries` as CSV | Admin    |

### Client UI Overview

- **Home**: Quick summarization form with customizable options.
- **Login / Register**: Access or create your account.
- **Dashboard**: View and manage past summaries, filter, delete, and export.
- **Admin Panel**: (Admin users only) Manage users and view system metrics.

---

## Testing

#### Backend Tests
```bash
cd server
npm test
```
- Utilizes Jest & Supertest with in-memory MongoDB.

#### Frontend Tests
```bash
cd client
npm test
```
- Powered by React Testing Library & Jest.

---

## Deployment

1. **Build Frontend**:
    ```bash
    cd client
    npm run build
    ```

2. **Serve Static Files** (Option A: Vercel/Netlify)

3. **Serve via Express** (Option B):
    ```js
    // in server/index.js
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('*', (req, res) =>
      res.sendFile(path.join(__dirname, '../client/build/index.html'))
    );
    ```
4. Configure production `.env` and ensure HTTPS, secure cookies.

---

## Roadmap

- ✅ Core summarization (text, PDF, URL)
- ✅ History & exports
- ✅ User authentication & roles
- ✅ Admin metrics, reporting & exports
- 🔄 UI/UX enhancements (animations, charts)
- 🚀 Dockerization & CI/CD pipeline
- 📱 Mobile-responsive optimizations

---

## Contributing

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/YourFeature`.
3. Commit your changes: `git commit -m "Add Feature"`.
4. Push to your branch: `git push origin feature/YourFeature`.
5. Open a Pull Request; ensure tests pass.

Please follow the [Code of Conduct](CODE_OF_CONDUCT.md).

---

## License

This project is licensed under the [MIT License](LICENSE).

---

© 2025 Omid Cheraghi (Omidcr77)
