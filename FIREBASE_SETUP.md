# Firebase Firestore Database Setup Guide

## 1. ✅ PROJECT STRUCTURE (Already in place)

Your collections structure in Firestore should be:
```
artifacts/
└── skillbridge-app/
    └── public/
        └── data/
            ├── users/
            ├── tasks/
            ├── applications/
            ├── chats/
            └── messages/
```

---

## 2. 📋 DATABASE SCHEMA

### Users Collection (`users/{userId}`)
```json
{
  "userId": "unique_user_id",
  "email": "user@example.com",
  "name": "Full Name",
  "username": "username",
  "userRole": "student" | "recruiter",
  "education": "Bachelor's",
  "college": "College Name",
  "city": "City Name",
  "phoneNumber": "+91XXXXXXXXXX",
  "profileImage": "url",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
```

### Tasks Collection (`tasks/{taskId}`)
```json
{
  "taskId": "unique_task_id",
  "taskTitle": "Task Title",
  "description": "Task Description",
  "expectedOutcome": "Expected Result",
  "selectedSkills": ["React", "Node.js"],
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "deadline": "2024-12-31",
  "postedByUserId": "recruiter_user_id",
  "yourName": "Recruiter Name",
  "timestamp": "timestamp",
  "applicantCount": 5,
  "status": "open" | "closed"
}
```

### Applications Collection (`applications/{appId}`)
```json
{
  "taskId": "task_id",
  "applicantId": "student_user_id",
  "applicantName": "Student Name",
  "taskTitle": "Task Title",
  "status": "pending" | "accepted" | "rejected" | "completed",
  "appliedAt": "timestamp",
  "submittedAt": "timestamp",
  "submission": "submission_url_or_text"
}
```

### Chats Collection (`chats/{chatId}`)
```json
{
  "participants": ["user_id_1", "user_id_2"],
  "createdAt": "timestamp",
  "lastMessage": "Latest message text",
  "lastMessageTime": "timestamp"
}
```

### Messages Subcollection (`chats/{chatId}/messages/{msgId}`)
```json
{
  "senderId": "user_id",
  "senderName": "User Name",
  "text": "Message text",
  "timestamp": "timestamp",
  "read": true | false
}
```

---

## 3. 🔐 FIRESTORE SECURITY RULES

Create security rules at `firestore.rules` in your project:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Allow authenticated users to read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;
      allow read: if request.auth != null; // Others can view profiles
    }
    
    // Tasks: Anyone can read, only recruiters can create
    match /tasks/{taskId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.userRole == 'recruiter';
      allow update, delete: if request.auth.uid == resource.data.postedByUserId;
    }
    
    // Applications: Students can create, all can read
    match /applications/{appId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth.uid == resource.data.postedByUserId || 
                       request.auth.uid == get(/databases/$(database)/documents/tasks/$(resource.data.taskId)).data.postedByUserId;
    }
    
    // Chats: Only participants can access
    match /chats/{chatId} {
      allow read, write: if request.auth.uid in resource.data.participants;
      allow create: if request.auth.uid in request.resource.data.participants;
      
      // Messages in chat
      match /messages/{messageId} {
        allow read: if request.auth.uid in get(/databases/$(database)/documents/chats/$(chatId)).data.participants;
        allow create, update: if request.auth.uid == request.resource.data.senderId;
      }
    }
  }
}
```

**Deploy rules:**
```bash
firebase deploy --only firestore:rules
```

---

## 4. 🚀 BASIC FIRESTORE OPERATIONS

### A. Initialize Firebase (Already done in `firebase.js`)
```javascript
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = { /* your config */ };
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### B. CREATE (Add data)
```javascript
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const addTask = async (taskData) => {
  const tasksRef = collection(db, 'tasks');
  await addDoc(tasksRef, {
    ...taskData,
    timestamp: serverTimestamp(),
    postedByUserId: user.uid
  });
};
```

### C. READ (Get data)
```javascript
import { collection, query, where, getDocs, onSnapshot } from "firebase/firestore";

// One-time read
const getTasks = async () => {
  const tasksRef = collection(db, 'tasks');
  const snapshot = await getDocs(tasksRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// Real-time listener (Better for React)
const listenToTasks = (callback) => {
  const tasksRef = collection(db, 'tasks');
  return onSnapshot(tasksRef, (snapshot) => {
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(tasks);
  });
};

// Query with filter
const getTasksBySkill = async (skill) => {
  const tasksRef = collection(db, 'tasks');
  const q = query(tasksRef, where('selectedSkills', 'array-contains', skill));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

### D. UPDATE (Modify data)
```javascript
import { doc, updateDoc } from "firebase/firestore";

const updateApplicationStatus = async (appId, status) => {
  const appRef = doc(db, 'applications', appId);
  await updateDoc(appRef, { status });
};
```

### E. DELETE (Remove data)
```javascript
import { deleteDoc } from "firebase/firestore";

const deleteTask = async (taskId) => {
  const taskRef = doc(db, 'tasks', taskId);
  await deleteDoc(taskRef);
};
```

---

## 5. 🔥 USING FIRESTORE IN REACT (Best Practices)

### Hook for Real-time Data
```javascript
import { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';

const useFirestoreData = (collectionPath, filters = []) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const collectionRef = collection(db, collectionPath);
    const q = filters.length > 0 ? query(collectionRef, ...filters) : collectionRef;
    
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [collectionPath, filters]);

  return { data, loading, error };
};

// Usage in component
const MyComponent = () => {
  const { data: tasks, loading } = useFirestoreData(
    'tasks',
    [where('difficulty', '==', 'Beginner')]
  );
  // ... rest of component
};
```

---

## 6. 📝 COMMON OPERATIONS FOR SKILLBRIDGE

### Create User Profile
```javascript
const createUserProfile = async (user, userData) => {
  const userRef = doc(db, 'users', user.uid);
  await setDoc(userRef, {
    userId: user.uid,
    email: user.email,
    ...userData,
    createdAt: serverTimestamp()
  });
};
```

### Apply for Task
```javascript
const applyForTask = async (taskId, studentId) => {
  const applicationsRef = collection(db, 'applications');
  await addDoc(applicationsRef, {
    taskId,
    applicantId: studentId,
    status: 'pending',
    appliedAt: serverTimestamp()
  });
};
```

### Start Chat Between Two Users
```javascript
const startChat = async (userId1, userId2) => {
  const chatId = [userId1, userId2].sort().join('_');
  const chatRef = doc(db, 'chats', chatId);
  
  await setDoc(chatRef, {
    participants: [userId1, userId2],
    createdAt: serverTimestamp()
  }, { merge: true }); // merge: true prevents overwriting
  
  return chatId;
};
```

### Send Message
```javascript
const sendMessage = async (chatId, senderId, senderName, text) => {
  const messagesRef = collection(db, `chats/${chatId}/messages`);
  await addDoc(messagesRef, {
    senderId,
    senderName,
    text,
    timestamp: serverTimestamp(),
    read: false
  });
};
```

---

## 7. 🔄 BATCH OPERATIONS

```javascript
import { writeBatch } from 'firebase/firestore';

const updateMultipleTasks = async (taskIds, updateData) => {
  const batch = writeBatch(db);
  
  taskIds.forEach(taskId => {
    const taskRef = doc(db, 'tasks', taskId);
    batch.update(taskRef, updateData);
  });
  
  await batch.commit();
};
```

---

## 8. 📊 INDEXING FOR QUERIES

For queries with multiple filters, Firestore may ask you to create composite indexes. When you run complex queries, Firebase will provide a link to create the index automatically.

Common queries needing indexes:
- Tasks by skill + difficulty
- Applications by taskId + status
- Messages by chatId + timestamp

---

## 9. ✅ DEPLOYMENT CHECKLIST

- [ ] Set correct collection paths in all components
- [ ] Deploy security rules: `firebase deploy --only firestore:rules`
- [ ] Test all CRUD operations
- [ ] Verify real-time listeners work
- [ ] Test with different user roles (student/recruiter)
- [ ] Monitor Firestore usage in Firebase Console

---

## 10. 🐛 DEBUGGING TIPS

```javascript
// Enable offline persistence
import { enableIndexedDbPersistence } from 'firebase/firestore';

enableIndexedDbPersistence(db)
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.log('Multiple tabs open');
    } else if (err.code === 'unimplemented') {
      console.log('Browser not supported');
    }
  });

// Monitor Firestore activity
db.settings({ experimentalForceLongPolling: true });
```

---

## Quick Summary

1. ✅ Your collections are already defined in code
2. ✅ Your CRUD operations are implemented
3. ✅ Now deploy the **security rules** (Step 3)
4. ✅ Test all operations in Firebase Console
5. ✅ Monitor usage & optimize queries

Your Firebase Firestore is ready to use! 🎉
