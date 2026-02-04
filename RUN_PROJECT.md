# QuMail - Quantum-Secured Email System
## ⚡ Quick Start Guide

This project consists of two parts: a **Python FastAPI Backend** and a **React Frontend**. You need to run both simultaneously in separate terminals.

---

### 1. Start the Backend (Server)

1.  Open a new terminal.
2.  Navigate to the backend directory:
    ```powershell
    cd backend
    ```
3.  Activate your Python environment (if you use Conda or venv):
    ```powershell
    conda activate <your-env-name>
    # OR
    .\venv\Scripts\activate
    ```
4.  Install dependencies (if not already done):
    ```powershell
    pip install -r requirements.txt
    ```
5.  Run the server:
    ```powershell
    uvicorn app.main:app --reload
    ```
    ✅ You should see: `Uvicorn running on http://127.0.0.1:8000`

---

### 2. Start the Frontend (UI)

1.  Open a **second** terminal.
2.  Navigate to the frontend directory:
    ```powershell
    cd frontend
    ```
3.  Install dependencies (if not already done):
    ```powershell
    npm install
    ```
4.  Run the development server:
    ```powershell
    npm run dev
    ```
5.  Open the link shown (usually **http://localhost:5173**) in your browser.

---

### 👨‍💻 Demo Workflow (How to test)

1.  **Register User A**: Go to the app, sign up as `alice@qumail.com`.
2.  **Register User B**: Open an **Incognito Window**, sign up as `bob@qumail.com`.
3.  **Send Secure Email**:
    *   Alice clicks **Compose**.
    *   Enters `bob@qumail.com`.
    *   Selects **🛡️ AES** or **🔒 Quantum** toggle.
    *   Clicks **Send**.
4.  **Decrypt**:
    *   Bob sees specific encrypted metadata in his Inbox.
    *   Bob opens the email and clicks **Decrypt**.
    *   The message reveals itself.

---
**Note**: Do not close the terminal windows. The app stops if you close them.
