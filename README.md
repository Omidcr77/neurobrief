# NeuroBrief 🧠📄

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![OpenAI Powered](https://img.shields.io/badge/Powered%20by-OpenAI-412991.svg?logo=openai)](https://openai.com)
[![React Version](https://img.shields.io/badge/React-v19-61DAFB.svg?logo=react)](https://react.dev)
[![Node Version](https://img.shields.io/badge/Node.js-v18+-339933.svg?logo=nodedotjs)](https://nodejs.org)

AI-Powered Text Summarization Platform

NeuroBrief transforms lengthy text, PDFs, or web articles into concise, insight-rich summaries using GPT-4.1. Get quick overviews, detailed breakdowns, or bullet-point highlights tailored to your needs.

---

## ✨ Key Features

| Feature | Icon | Description |
|---------|------|-------------|
| **Multi-Modal Input** | 📥 | Summarize text, PDFs, or web articles via URL |
| **Flexible Summarization** | ⚙️ | Customize length, style (abstractive/extractive/bullets), and focus areas |
| **User Authentication** | 🔒 | JWT-based auth with password hashing via bcrypt |
| **History & Export** | 📊 | View/search past summaries • Export as TXT/PDF/CSV |
| **Admin Dashboard** | 👑 | User management • Impersonation • Real-time metrics |
| **Responsive UI** | 📱 | Interactive React UI with animations & visualizations |

---

## 🛠 Tech Stack

**Frontend**  
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) 
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwind-css)
![React Router](https://img.shields.io/badge/React_Router-7-CA4245?logo=react-router)

**Backend**  
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=nodedotjs) 
![Express](https://img.shields.io/badge/Express-5-000000?logo=express)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb)

**AI Processing**  
![OpenAI](https://img.shields.io/badge/GPT_4.1-412991?logo=openai) 
![PDF Parse](https://img.shields.io/badge/PDF_Parse-FF6B6B)

**Visualization**  
![Chart.js](https://img.shields.io/badge/Chart.js-FF6384?logo=chartdotjs) 
![Recharts](https://img.shields.io/badge/Recharts-00CED1)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- [OpenAI API Key](https://platform.openai.com/)
- (Optional) Cloudinary account

### Installation
```bash
# Clone repository
git clone https://github.com/Omidcr77/neurobrief.git
cd neurobrief

# Backend setup
cd server
npm install
cp .env.example .env

# Frontend setup
cd ../client
npm install
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

© 2025 Omid Muradi (Omidcr77)
