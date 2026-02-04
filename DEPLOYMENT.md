# QuMail Deployment Guide

Congratulations on building QuMail! Here are the 3 best ways to deploy and host your application.

## 1. Quick & Free (Best for Hackathons)
This separates the frontend and backend onto free hosting tiers.

### **Backend (Render or Railway)**
1. Push your code to GitHub.
2. Sign up for [Render.com](https://render.com).
3. Create a **New Web Service**.
4. Connect your GitHub repo.
5. **Root Directory**: `backend`
6. **Build Command**: `pip install -r requirements.txt`
7. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port 10000`
8. Copy the **URL** Render gives you (e.g., `https://qumail-backend.onrender.com`).

### **Frontend (Vercel)**
1. **No Code Changes Needed**: We updated `api.js` to automatically use the `VITE_API_URL` environment variable.
2. Sign up for [Vercel](https://vercel.com).
3. **Import Project** -> Select your GitHub repo.
4. **Root Directory**: Click Edit and select `frontend`.
5. **Environment Variables**:
   - Name: `VITE_API_URL`
   - Value: Your Render Backend URL (e.g., `https://qumail-backend.onrender.com/api`)
6. Click **Deploy**.
7. Vercel will give you a live URL (e.g., `https://qumail.vercel.app`).

---

## 2. Professional (Docker)
We have added `Dockerfile`s and a `docker-compose.yml` to your project. This allows you to run the entire app on any cloud provider (AWS, DigitalOcean, Azure) with a single command.

### **Prerequisites**
- Install Docker Desktop.

### **Run Locally or on VPS**
1. Open terminal in the root `QuMail` folder.
2. Run:
   ```bash
   docker-compose up --build
   ```
3. Your app will be live at:
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

To deploy this to a server (like a DigitalOcean Droplet ($5/mo)):
1. SSH into the server.
2. Clone your repo.
3. Run `docker-compose up -d`.

---

## 3. Temporary Demo (Ngrok)
If you just want to show your friend the app running on your laptop right now without deploying.

1. Keep your local servers running (`npm run dev` and `uvicorn`).
2. Install [ngrok](https://ngrok.com/).
3. Open a **new terminal** and expose the backend:
   ```bash
   ngrok http 8000
   ```
   Copy the `https://....ngrok-free.app` URL.
4. Update `frontend/src/api.js` with this backend URL.
5. Open another terminal and expose the frontend:
   ```bash
   ngrok http 5173
   ```
6. Share the second link with anyone!
