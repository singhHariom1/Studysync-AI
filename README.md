# StudySync AI

> **Built by Hariom Singh for the CodingOtt Hackathon 2025**

StudySync AI is a modern, full-stack MERN application designed to supercharge your study sessions with AI-powered tools. Built in a hackathon setting, it features a beautiful, premium SaaS UI and a robust backend, making it your all-in-one learning companion.

---

## 🚀 Live Demo
- **Frontend:** [https://studysync-ai-nu.vercel.app/](https://studysync-ai-nu.vercel.app/)
- **Backend API:** [https://studysync-ai-jte1.onrender.com](https://studysync-ai-jte1.onrender.com)

---

## 🚀 Features

- **AI Doubt Solver** (Gemini AI): Instantly get answers and explanations for any academic question.
- **Syllabus PDF Analyzer**: Upload your syllabus and extract the top 10 study topics using AI.
- **AI Resource Recommender**: Get personalized learning resources for your syllabus topics.
- **Task Planner**: Full CRUD for tasks, with filtering, sorting, color tags, and a modern UI.
- **Pomodoro Timer**: Focused work/break cycles with notifications and progress tracking.
- **Progress Tracker**: Visualize your daily and overall task completion with motivational feedback.
- **Beautiful, Consistent UI**: Glassmorphism, gradients, and a premium SaaS look throughout.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express 5, MongoDB (Mongoose), Gemini AI API, PDF parsing
- **Other**: Axios, Multer, dotenv, CORS, ESLint

---

## 📦 Project Structure

```
Hackathon/
  client/    # React frontend (Vite + Tailwind)
  server/    # Express backend (API, MongoDB, Gemini AI)
```

---

## ⚡ Quick Start

### 1. Clone the repo
```bash
git clone https://github.com/singhHariom1/Studysync-AI.git
cd Studysync-AI
```

### 2. Install dependencies
```bash
cd client && npm install
cd ../server && npm install
```

### 3. Set up environment variables
Create a `.env` file in the `server/` directory:
```env
MONGODB_URI=your_mongodb_atlas_uri
PORT=5000
GEMINI_API_KEY=your_gemini_api_key
```

> **Never commit your `.env` files!** They are already included in `.gitignore`.

### 4. Start the backend
```bash
cd server
npm run dev
```

### 5. Start the frontend
```bash
cd client
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- Backend API: [http://localhost:5000](http://localhost:5000)

---

## 🌐 Deployment
- **Frontend (client) Live:** [https://studysync-ai-nu.vercel.app/](https://studysync-ai-nu.vercel.app/)
- **Backend (server) Live:** [https://studysync-ai-jte1.onrender.com](https://studysync-ai-jte1.onrender.com)

- Deploy the frontend (client) to Vercel, Netlify, or your favorite static host.
- Deploy the backend (server) to Render, Railway, or any Node.js host.
- Set environment variables in your deployment dashboard (never commit secrets).

---

## 📝 .gitignore
A root `.gitignore` is provided to keep your repo clean:
- Ignores all `node_modules`, build outputs, logs, and local env files for both client and server.
- **Never commit `.env` or sensitive files.**

---

## 🙏 Credits
- **Made with ❤️ by Hariom Singh**
- Built for the **CodingOtt Hackathon 2025**
- UI/UX inspired by top SaaS products

---

## 📣 License
MIT (add your own if needed)

---

Happy Studying! 🚀 