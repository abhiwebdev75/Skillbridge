import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { getAuth, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from 'firebase/auth';


// Main component to explore tasks
const ExploreTasks = () => {
  // State to store the list of tasks fetched from Firestore
  const [tasks, setTasks] = useState([]);
  // State to store the filtered list of tasks
  const [filteredTasks, setFilteredTasks] = useState([]);
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  // State for selected difficulty filter
  const [difficultyFilter, setDifficultyFilter] = useState('');
  
  // States for loading and error messages
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  // States for Firebase
  const [db, setDb] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);

  // Initialize Firebase and authenticate the user
  useEffect(() => {
    const setupFirebase = async () => {
      try {
        const firebaseConfig = JSON.parse(__firebase_config);
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);

        // Sign in the user with the provided custom token or anonymously
        if (typeof __initial_auth_token !== 'undefined') {
          await signInWithCustomToken(firebaseAuth, __initial_auth_token);
        } else {
          await signInAnonymously(firebaseAuth);
        }

        // Listen for auth state changes to get the user's ID
        const unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
          if (user) {
            setUserId(user.uid);
            setIsAuthReady(true);
          } else {
            setUserId(null);
            setIsAuthReady(true);
          }
        });

        setDb(firestoreDb);
        return () => unsubscribeAuth();
      } catch (error) {
        console.error("Firebase setup failed:", error);
        setError("Error: Firebase setup failed. Please try again later.");
        setIsLoading(false);
      }
    };
    setupFirebase();
  }, []);

  // Fetch tasks from Firestore in real-time
  useEffect(() => {
    if (!isAuthReady || !db) return;

    try {
      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const tasksCollectionRef = collection(db, `/artifacts/${appId}/public/data/tasks`);

      // Set up a real-time listener with onSnapshot
      const unsubscribe = onSnapshot(tasksCollectionRef, (querySnapshot) => {
        const fetchedTasks = [];
        querySnapshot.forEach((doc) => {
          fetchedTasks.push({ id: doc.id, ...doc.data() });
        });
        setTasks(fetchedTasks);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching tasks:", error);
        setError("Failed to load tasks. Please try again.");
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (err) {
      console.error("Error setting up Firestore listener:", err);
      setError("Failed to set up real-time updates.");
      setIsLoading(false);
    }
  }, [db, isAuthReady]);

  // Filter tasks whenever the search query, difficulty filter, or tasks list changes
  useEffect(() => {
    let newFilteredTasks = tasks;

    // Apply search filter
    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      newFilteredTasks = newFilteredTasks.filter(task => 
        task.taskTitle.toLowerCase().includes(lowercasedQuery) ||
        task.description.toLowerCase().includes(lowercasedQuery) ||
        task.selectedSkills.some(skill => skill.toLowerCase().includes(lowercasedQuery))
      );
    }

    // Apply difficulty filter
    if (difficultyFilter) {
      newFilteredTasks = newFilteredTasks.filter(task => 
        task.difficulty === difficultyFilter
      );
    }

    setFilteredTasks(newFilteredTasks);
  }, [searchQuery, difficultyFilter, tasks]);

  // Handle loading and error states
  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 font-inter bg-slate-100 text-center">
        <p className="text-gray-600 text-lg">Loading tasks...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative min-h-screen flex items-center justify-center p-4 font-inter bg-slate-100 text-center">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center p-4 z-10 font-inter bg-slate-100">
      <div className="w-full max-w-4xl p-8 rounded-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900">Explore Tasks</h1>
          <p className="text-gray-600 mt-2">Discover real-world projects posted by the community.</p>
        </div>

        {userId && (
          <div className="bg-blue-100 text-blue-800 p-4 rounded-xl mb-6 text-sm text-center">
            Your User ID: <span className="font-mono break-all">{userId}</span>
          </div>
        )}

        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search tasks by title, description, or skills..."
            className="flex-grow px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {/* Difficulty Filter */}
          <select
            className="px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 bg-white"
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>

        {/* Display Tasks */}
        {filteredTasks.length === 0 ? (
          <div className="text-center p-12 bg-white rounded-2xl shadow-xl">
            <p className="text-gray-500 text-xl font-medium">No tasks found. Try a different search or filter.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredTasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{task.taskTitle}</h2>
                <p className="text-gray-600 mb-4 whitespace-pre-wrap">{task.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {task.selectedSkills.map((skill) => (
                    <span key={skill} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Difficulty:</span>
                    <span className="text-gray-600">{task.difficulty}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold mr-2">Deadline:</span>
                    <span className="text-gray-600">{task.deadline}</span>
                  </div>
                  <div className="flex items-center sm:col-span-2">
                    <span className="font-semibold mr-2">Posted by:</span>
                    <span className="text-gray-600">{task.yourName}</span>
                  </div>
                  <div className="flex items-center sm:col-span-2">
                    <span className="font-semibold mr-2">Expected Outcome:</span>
                    <a href={task.expectedOutcome} className="text-blue-500 hover:underline break-all" target="_blank" rel="noopener noreferrer">
                      {task.expectedOutcome}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExploreTasks;
