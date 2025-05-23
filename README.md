# NeuroBrief – AI-Powered Text Summarizer Web Platform

**NeuroBrief** lets users submit raw text, PDF files, or URLs and receive concise AI-generated summaries.

## 🚀 Features

- **AI-Powered Summarizer**  
  Uses OpenAI GPT models for extractive and abstractive summaries.  
- **Multiple Input Types**  
  • Raw text  
  • PDF file uploads  
  • URL article scraping  
- **User Accounts**  
  • Registration & login with JWT auth  
  • History of past summaries  
- **Export Options**  
  • Download summary as `.txt` or `.pdf`  
- **Responsive UI**  
  Built in React.js + Tailwind CSS  

## 📂 Repository Structure

```
neurobrief/
├── server/           ← Backend (Node.js + Express)
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   └── index.js
├── client/           ← Frontend (React.js + Tailwind CSS)
│   ├── public/
│   ├── src/
│   │   ├── api.js
│   │   ├── components/
│   │   ├── pages/
│   │   ├── index.css
│   │   └── App.js
│   ├── tailwind.config.js
│   └── postcss.config.js
└── README.md         ← This file
```

## 🛠 Prerequisites

- Node.js v18+ and npm  
- MongoDB (local or Atlas)  
- OpenAI API key  
- (Optional) Cloudinary account for file storage  

## ⚙️ Setup Guide

### 1. Clone the Repo

```bash
git clone https://github.com/<your-org>/neurobrief.git
cd neurobrief
```

### 2. Backend

```bash
cd server
npm install
cp .env.example .env
```

Edit `.env` and fill in:

```env
MONGO_URI=your-mongodb-connection-string
JWT_SECRET=your-jwt-secret
OPENAI_API_KEY=your-openai-api-key
CLOUDINARY_URL=your-cloudinary-url  # optional
```

### 3. Frontend

```bash
cd ../client
npm install
```

Create `client/.env` with:

```env
REACT_APP_API_URL=http://localhost:5000
```

## 👩‍💻 Development

- **Run Backend** (auto-reload):

  ```bash
  cd server
  npm run dev
  ```

  Server runs on port **5000**.

- **Run Frontend**:

  ```bash
  cd client
  npm start
  ```

  Opens at http://localhost:3000.

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

- Uses **Jest** & **Supertest** with an in-memory MongoDB.

### Frontend Tests

```bash
cd client
npm test
```

- Uses **React Testing Library** & **Jest**.

## 📦 Build & Deployment

1. **Build Frontend**:

   ```bash
   cd client
   npm run build
   ```

   Generates `client/build/`.

2. **Serve in Production**:

   - **Option A**: Deploy `client/build` to Netlify/Vercel.  
   - **Option B**: Serve static files from Express:

     ```js
     // in server/index.js
     app.use(express.static(path.join(__dirname, '../client/build')));
     app.get('*', (req, res) =>
       res.sendFile(path.join(__dirname, '../client/build/index.html'))
     );
     ```

3. **Environment**:

   - Ensure production `.env` has valid keys.  
   - Use HTTPS and secure cookie flags.

## 🔒 Security & Privacy

- All inputs are validated and sanitized.  
- No sensitive inputs are logged.  
- JWT tokens expire after 7 days.  
- CORS policies restrict origins.

## 🤝 Contributing

1. Fork the repo.  
2. Create a feature branch: `git checkout -b feature/YourFeature`.  
3. Commit your changes: `git commit -m "Add YourFeature"`.  
4. Push to your branch: `git push origin feature/YourFeature`.  
5. Open a Pull Request.

## 📄 License

This project is released under the [MIT License](LICENSE).
