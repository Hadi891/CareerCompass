# CareerCompass

CareerCompass is an AI-powered career assistant that helps users analyze their CVs, identify skill gaps, recommend courses, suggest hands-on projects, and discover job opportunities.  
It integrates advanced AI models with a modern web interface to guide users through their career journey.

---

## 🚀 Features
- 📄 **CV Upload & Parsing**: Upload your CV and let the AI extract skills, experiences, and education.  
- 🧩 **Skill Gap Analysis**: Identify missing skills for your desired roles.  
- 📚 **Course Recommendations**: Get curated learning resources to fill your gaps.  
- 🛠 **Project Suggestions**: Work on AI-guided projects step by step with an integrated chatbot.  
- 💼 **Job Discovery**: Find relevant internships and job postings.  
- 📊 **Dashboard**: Track progress, skills, and projects in a clean UI.  

---

## 🎥 Demo

### Live Demo Video
👉 [Watch the demo video](https://drive.google.com/file/d/1KbQt7EXr9u0iPJpQW0AuLpl5lquWPGUs/view?usp=sharing)

### GIF Preview
![CopyofUntitledvideo-MadewithClipchamp-ezgif com-video-to-gif-converter](https://github.com/user-attachments/assets/77cc853c-2452-4b12-bddb-134c593b95da)

---

## 🛠️ Tech Stack
- **Frontend**: React (Vite, TailwindCSS, TypeScript)  
- **Backend**: FastAPI (Python)  
- **Database**: PostgreSQL (SQLAlchemy ORM)  
- **AI Models**: Mistral / Deepseek (via Ollama), custom CV parser
- **Other Tools:** Coursera web scraper, JWT Auth
---

## ⚡ Installation & Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- [Ollama](https://ollama.ai/) installed locally (for LLMs)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Hadi891/CareerCompass.git
   cd CareerCompass
   ```

2. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

---

## 📌 Usage
1. Create an account and log in.  
2. Upload your CV (PDF/DOCX).  
3. Explore skill gap insights, recommended courses, and suggested projects.  
4. Chat with the AI assistant to get project guidance.  
5. Add completed projects to your portfolio.  

---

## Project Structure

```
CareerCompass/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py          # Entry point for FastAPI
│   │   ├── models/          # Database models (SQLAlchemy)
│   │   ├── schemas/         # Pydantic schemas
│   │   ├── crud/            # Database operations
│   │   ├── routes/          # API routes (auth, CV, projects, etc.)
│   │   ├── utils/           # Utility functions (security, parsing, etc.)
│   │   └── dependencies.py  # Shared dependencies
│   ├── tests/               # Backend tests
│   └── requirements.txt     # Python dependencies
│
├── frontend/                # React + Vite frontend
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/           # App pages (Dashboard, Projects, etc.)
│   │   ├── context/         # React Context (Auth, Projects, etc.)
│   │   ├── hooks/           # Custom hooks (e.g., useToast)
│   │   ├── assets/          # Images, icons, static files
│   │   └── types/           # TypeScript types
│   ├── public/              # Static files served directly
│   └── package.json         # Frontend dependencies
│
├── docker-compose.yml       # Docker setup for backend + frontend + DB
├── README.md                # Project documentation
└── .env                     # Environment variables
```

---

## 🤝 Contributing
Contributions are welcome!  
Please fork the repository, create a branch, and submit a pull request.

---

## 📜 License
This project is released under the MIT License.  
See [LICENSE](LICENSE) for details.

