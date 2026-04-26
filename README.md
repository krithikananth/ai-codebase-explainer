# 🔍 CodeLens AI — AI-Powered Codebase Explainer

> Understand any GitHub repository in seconds using AI.

🌐 **Live Demo:** [https://codelensai-two.vercel.app](https://codelensai-two.vercel.app)

---

## What is CodeLens AI?

CodeLens AI is a full-stack web application that analyzes any public GitHub repository using **Google's Gemini AI**. Paste a GitHub URL and get:

- 📝 **AI-generated explanation** of the entire codebase
- 📐 **Architecture diagrams** (Mermaid.js SVG)
- 📋 **API documentation** (auto-detected endpoints)
- 📂 **Interactive file tree** with expand/collapse
- 📊 **Language distribution** charts
- 🤖 **AI Q&A chat** — ask questions about any analyzed repo

---

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite, Tailwind CSS v4, Mermaid.js, Recharts |
| **Backend** | Node.js, Express 5, Mongoose 9 |
| **Database** | MongoDB Atlas |
| **AI** | Google Gemini 2.5 Flash |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Features

- **One-click analysis** — paste any GitHub URL and get a full breakdown
- **Smart AI prompts** — single optimized API call for explanation + diagram + docs
- **API key rotation** — supports multiple Gemini keys for higher daily quota
- **Architecture diagrams** — auto-generated Mermaid.js flowcharts with SVG rendering
- **Downloadable docs** — export API documentation as Markdown files
- **Chat with AI** — ask context-aware questions about analyzed repos
- **Auth system** — JWT-based registration and login
- **Bookmarks & sharing** — save and share analysis reports publicly

---

## Project Structure

```
├── server/                    # Express.js backend
│   ├── server.js              # Entry point
│   ├── src/
│   │   ├── config/            # DB & Gemini AI config
│   │   ├── controllers/       # Route handlers
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API routes
│   │   ├── services/          # AI, git, file analysis
│   │   ├── middleware/        # Auth & error handling
│   │   └── utils/             # Helpers
│   └── tests/                 # Jest tests
│
├── client/my-project/         # React frontend (Vite)
│   ├── src/
│   │   ├── pages/             # Login, Dashboard, Analyze, RepoView, Chat
│   │   ├── components/        # MermaidDiagram, FileTree, Loader, etc.
│   │   ├── context/           # AuthContext
│   │   └── api/               # Axios instance
│   └── public/
```

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| `POST` | `/api/auth/register` | ❌ | Register |
| `POST` | `/api/auth/login` | ❌ | Login |
| `GET` | `/api/auth/me` | ✅ | Current user |
| `POST` | `/api/repos/analyze` | ✅ | Analyze a repo |
| `GET` | `/api/repos` | ✅ | List user's repos |
| `GET` | `/api/repos/:id` | ✅ | Get full analysis |
| `DELETE` | `/api/repos/:id` | ✅ | Delete analysis |
| `POST` | `/api/repos/:id/bookmark` | ✅ | Toggle bookmark |
| `POST` | `/api/repos/:id/share` | ✅ | Toggle sharing |
| `GET` | `/api/repos/shared/:id` | ❌ | View public report |
| `POST` | `/api/chat/message` | ✅ | Ask AI a question |
| `GET` | `/api/chat/:repoId` | ✅ | Get chat history |
| `DELETE` | `/api/chat/:repoId` | ✅ | Clear chat |

---

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Gemini API key(s) from [Google AI Studio](https://aistudio.google.com/apikey)

### Setup

```bash
# Clone
git clone https://github.com/krithikananth/ai-codebase-explainer.git
cd ai-codebase-explainer

# Backend
cd server
npm install
# Create .env file (see below)
npm run dev

# Frontend (new terminal)
cd client/my-project
npm install
npm run dev
```

### Environment Variables (`server/.env`)

```env
PORT=5000
JWT_SECRET=your_jwt_secret
GEMINI_API_KEYS=key1,key2,key3
MONGO_URI=your_mongodb_connection_string
NODE_ENV=development
```

> 💡 **Tip:** Use multiple comma-separated Gemini API keys for higher daily quota (20 requests per key).

---

## How It Works

```
User pastes GitHub URL
        ↓
Backend clones repo (shallow, depth=1)
        ↓
Extracts file tree, README, key source files
        ↓
Detects tech stack & computes stats
        ↓
Single AI call → Explanation + Diagram + API Docs
        ↓
Results saved to MongoDB
        ↓
Frontend displays in tabbed view
```

---

## License

MIT

---

**Built by [Krithik Ananth](https://github.com/krithikananth)**
