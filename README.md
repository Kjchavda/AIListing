# AI Toolkit Directory

[![Live Deployment](https://img.shields.io/badge/Live_Deployment-Available_Now-success?style=for-the-badge)](https://ai-listing-rho.vercel.app/)
[![Watch Demo](https://img.shields.io/badge/Demo-View_GIF_Below-blue?style=for-the-badge)](#-gallery)

A full-stack, decoupled directory application that aggregates, categorizes, and serves modern AI tools. Built to solve the "Cold Start" problem of empty directories using custom data ingestion pipelines, and secured with Role-Based Access Control (RBAC).

![AI Toolkit Homepage Screenshot](docs/homepage-screenshot.png)

---

## 🚀 Core Engineering Features

### 1. Graceful Fallback Web Scraping
Implemented a "magic autofill" feature that fetches SEO metadata (OpenGraph tags, titles, descriptions) directly from user-submitted URLs. 
* **The Challenge:** Many AI product sites (like OpenAI) use aggressive anti-bot protections (Cloudflare, Datadome).
* **The Solution:** Built a robust extraction utility that gracefully catches `403 Forbidden` and `429 Too Many Requests` errors, failing cleanly and alerting the user to enter data manually rather than crashing the server or hanging the request.

### 2. Automated Data Ingestion Pipeline
To solve the "empty directory" problem at launch, I built a standalone data pipeline entirely separated from the FastAPI production server.
* Fetches raw markdown from popular "Awesome AI" GitHub repositories.
* Uses Regex to parse clean URLs, filtering out social media, arXiv papers, and internal repo links.
* Scrapes the target websites and formats the data into a clean JSON structure.
* A dedicated `bulk_imports.py` script securely seeds the PostgreSQL database using SQLAlchemy.

### 3. Secure Role-Based Access Control (RBAC)
* Integrated **Clerk** for secure JWT-based authentication.
* Implemented an Admin Approval workflow: User-submitted tools are flagged as `is_approved = False` and hidden from public `GET` requests.
* Only explicitly authorized Admin accounts can access the dashboard to approve, edit, or reject pending community submissions.

### 4. Relational Data Modeling
Designed a robust PostgreSQL schema using SQLAlchemy, featuring:
* **Many-to-Many Relationships:** Connecting Tools and Categories via association tables.
* **Pivot Tables:** Managing user-specific Bookmarks and Likes with unique constraints to prevent duplicate database entries.

---

## 💻 Tech Stack

**Client-Side (Frontend)**
* React.js (Vite)
* Tailwind CSS + shadcn/ui components
* React Router DOM
* Clerk (Authentication)

**Server-Side (Backend)**
* FastAPI (Python)
* PostgreSQL
* SQLAlchemy (ORM)
* BeautifulSoup4 + HTTPX (Web Scraping)
* Pydantic (Data Validation & Environment Management)

---

## 📸 Gallery

<details>
<summary>Click to view Admin Dashboard</summary>
<br>
<img src="docs/admin-dashboard.png" alt="Admin Dashboard Screenshot">
</details>

<details>
<summary>Click to view Autofill Feature in Action</summary>
<br>
<img src="docs/autofill-demo.gif" alt="Autofill GIF">
</details>

<details>
<summary>Click to view demo </summary>
<br>
<img src="docs/project-demo.gif" alt="Project demo GIF">
</details>

---

## 🛠️ Local Development Setup

Follow these steps to run the project locally.

### Prerequisites
* Python 3.10+
* Node.js 18+
* PostgreSQL installed and running

### 1. Backend Setup
Navigate to the root directory and create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install the dependencies:
```bash
pip install -r requirements.txt
```

Create a `.env` file in the root directory:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
ADMIN_USER_ID=your_clerk_user_id
```

Run the FastAPI server:
```bash
cd backend
uvicorn main:app --reload
```

### 2. Frontend Setup
Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` directory:
```env
VITE_API_BASE_URL=http://localhost:8000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Start the Vite development server:
```bash
npm run dev
```

### 3. Seeding the Database (Optional)
To populate the local database with initial AI tools, run the bulk importer from the root directory:
```bash
python -m backend.bulk_imports
```

---
*Designed and engineered by Kulanjay Chavda.*