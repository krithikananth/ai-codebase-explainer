# 🧠 CodeLens AI — GitHub Codebase Explainer

> **AI-powered tool that analyzes any GitHub repository and explains its architecture, tech stack, APIs, and more — with interactive Q&A.**

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)](https://www.mongodb.com/mern-stack)
[![Gemini AI](https://img.shields.io/badge/AI-Google%20Gemini-blue)](https://ai.google.dev/)

---

## 🎯 What It Does

Users paste a **GitHub repository URL** → the system clones, analyzes, and explains the entire codebase using AI.

## ✨ Features

- 🔐 JWT Authentication | 📊 AI Analysis | 📂 File Tree | 💬 Chat Q&A
- 🛠️ Tech Stack Detection | 📐 Architecture Diagrams | 📋 API Docs
- 🎯 Complexity Analysis | ⭐ Bookmarks | 🔗 Public Sharing
- 🌙 Dark Mode | 📱 Responsive | ⚡ Animations

## 🛠️ Tech Stack

React 19 + Vite + Tailwind | Node.js + Express 5 | MongoDB + Mongoose | Google Gemini AI | JWT Auth

## 🚀 Setup

```bash
# Backend
cd server && npm install
# Add .env with PORT, MONGO_URI, JWT_SECRET, GEMINI_API_KEY
npm run dev

# Frontend 
cd client/my-project && npm install
npm run dev
```

## 📜 API Routes

POST `/api/auth/register` `/api/auth/login` | GET `/api/auth/me`
POST `/api/repos/analyze` | GET `/api/repos` `/api/repos/:id` | DELETE `/api/repos/:id`
POST `/api/repos/:id/bookmark` `/api/repos/:id/share` | GET `/api/repos/shared/:id`
POST `/api/chat/message` | GET `/api/chat/:repoId` | DELETE `/api/chat/:repoId`

## 🌐 Deploy: Frontend → Vercel | Backend → Render | DB → MongoDB Atlas

---
Made with ❤️ by Krithik Ananth | MERN + Gemini AI
