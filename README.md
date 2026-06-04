# 📋 SkillBridge Task Manager

A full-stack task management application built using React, Node.js, Express, and MongoDB. The application allows users to create, view, update, and delete tasks through REST APIs with data stored in a MongoDB database.

---

## 🚀 Features

- ✅ Create new tasks
- ✅ View all tasks
- ✅ Update existing tasks
- ✅ Delete tasks
- ✅ RESTful API integration
- ✅ MongoDB database storage
- ✅ Responsive user interface
- ✅ Real-time task management

---

## 🛠️ Tech Stack

### Frontend
- React.js
- Axios
- CSS / Tailwind CSS

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose

---

## 📂 Project Structure

```bash
SkillBridge/
│
├── client/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│
├── server/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── config/
│   ├── server.js
│
└── README.md
```

---

## ⚙️ Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/skillbridge-task-manager.git
cd skillbridge-task-manager
```

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the server folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
```

Start the backend server:

```bash
npm start
```

or

```bash
npm run dev
```

---

### 3. Frontend Setup

```bash
cd client
npm install
```

Create a `.env` file:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Run the React application:

```bash
npm start
```

---

## 📡 API Endpoints

### Get All Tasks

```http
GET /api/tasks
```

### Create Task

```http
POST /api/tasks
```

Request Body:

```json
{
  "title": "Complete React Project",
  "description": "Build a task manager application"
}
```

### Update Task

```http
PUT /api/tasks/:id
```

### Delete Task

```http
DELETE /api/tasks/:id
```

---

## 🗄️ Database Schema

```javascript
{
  title: String,
  description: String,
  completed: Boolean,
  createdAt: Date
}
```

---

## 🎯 Future Improvements

- User Authentication
- Task Categories
- Due Dates
- Search and Filter Tasks
- Notifications
- Dashboard Analytics
- Dark Mode

---

## 👨‍💻 Author

**Abhinash**

GitHub: https://github.com/abhiwebdev75

LinkedIn: https://linkedin.com/in/abhinash22hp

---

## 📜 License

This project is licensed under the MIT License.

---

⭐ If you like this project, consider giving it a star on GitHub!
