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


### Screenshots
Here are some screenshots from the app:

| Dashboard | Skill Gaps and Learning Recommendations |
|-----------|-----------------------------------------|
| <img width="1800" height="818" alt="Screenshot 2025-08-20 214126" src="https://github.com/user-attachments/assets/ab4406ce-789d-4a74-81bb-7c110a9e4a44" /> <img width="1797" height="815" alt="Screenshot 2025-08-20 214201" src="https://github.com/user-attachments/assets/d1502df0-dd37-4cf0-b5f7-c471fbb9a46e" />
 | <img width="1798" height="819" alt="Screenshot 2025-08-20 214236" src="https://github.com/user-attachments/assets/2549e0d3-c19c-455f-aa56-cf84e02837ec" />
 |

| Projects | AI Assistant | Jobs and Internships |
|----------|--------------|----------------------|
| <img width="1796" height="821" alt="Screenshot 2025-08-20 214332" src="https://github.com/user-attachments/assets/53fdc01d-508a-4e1b-85da-2f69c9f26177" /> <img width="1798" height="818" alt="Screenshot 2025-08-20 214354" src="https://github.com/user-attachments/assets/552a9aa3-ac96-4d6f-92d2-0af1c002bfb8" />
 | <img width="1794" height="815" alt="Screenshot 2025-08-20 214508" src="https://github.com/user-attachments/assets/925771a1-1ae8-4b9e-8c72-5ff773bd4f3e" />
 | <img width="1799" height="818" alt="Screenshot 2025-08-20 214526" src="https://github.com/user-attachments/assets/e029b895-975f-41ab-af09-e885bf481a57" /> |


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

