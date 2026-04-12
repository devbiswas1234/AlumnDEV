Alumni Platform
A full-featured Alumni Management Platform to connect students and alumni, track mentorships, and maintain a dynamic alumni directory. Designed for universities and colleges to strengthen their alumni network.

Table of Contents

Features
Tech Stack
Setup & Installation
Environment Variables
Usage
Folder Structure
Contributing
License

Features
1. Alumni Profiles
Alumni can create and update detailed profiles.
Visibility control: PUBLIC / PRIVATE.
Mentorship availability and topics.

2. Alumni Directory
Search and filter by department, passing year, company, and mentorship availability.
Sort by name or passing year.
Pagination for smooth browsing.
Multi-select filter for mentorship topics.

3. Mentorship System
Students can directly request mentorship from available alumni.
Alumni can manage incoming requests.
Limits on mentees per alumni.

4. Profile Analytics
Alumni can track profile views and mentorship request stats.

5. Security
JWT authentication.
Role-based access control (Student vs Alumni).
Private data protection.


Tech Stack
Frontend: React, React Router, Axios, Tailwind CSS
Backend: Node.js, Express.js
Database: PostgreSQL

Authentication: JWT (JSON Web Tokens)
Hosting: Local / configurable for deployment

Setup & Installation
Clone the repository
git clone <your-repo-url>
cd alumini-platform


Backend setup
cd backend
npm install

Frontend setup

cd ../frontend
npm install

Create a .env file in backend/ with the following:
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
JWT_SECRET=your_jwt_secret
PORT=5000


Run the project
Backend:
cd backend
npm run dev

Frontend:
cd frontend
npm run dev


Frontend runs on http://localhost:5173/ and backend on http://localhost:5000/.

Folder Structure
alumini-platform/
├── backend/
│   ├── routes/
│   ├── middleware/
│   ├── db.js
│   └── app.js
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── context/
│   │   ├── pages/
│   │   └── App.jsx
├── .gitignore
└── README.md

Contributing

Fork the repository
Create a new branch (git checkout -b feature/your-feature)
Commit your changes (git commit -m "Add feature")
Push to your branch (git push origin feature/your-feature)
Open a Pull Request

License

This project is licensed under the MIT License.
