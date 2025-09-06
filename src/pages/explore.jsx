import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, onSnapshot, query, where } from 'firebase/firestore';

const Explore = () => {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null); // 'student' or 'recruiter'
    const [selectedSkills, setSelectedSkills] = useState([]);
    const [selectedDifficulty, setSelectedDifficulty] = useState('');

    const allSkills = [
        "AI", "Machine Learning", "Web Development", "Mobile Development",
        "Cybersecurity", "Data Science", "DevOps", "Cloud Computing",
        "Blockchain", "IoT", "Game Development", "UI/UX Design",
        "React", "Node.js", "Python", "Java", "C++", "JavaScript",
    ];

    const allDifficulties = ["Beginner", "Intermediate", "Advanced"];

    // Get auth instance and set up user listener
    useEffect(() => {
        const auth = getAuth();
        const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                // In a real application, you would fetch the user's role from a database
                // For this example, we'll hardcode a role for demonstration purposes.
                // You can change this to 'recruiter' to see the other dashboard.
                setUserRole('student');
            } else {
                setUser(null);
                setUserRole(null);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    // Fetch tasks from Firestore when user is authenticated or filters change
    useEffect(() => {
        if (!user || !userRole) {
            setLoading(false);
            return;
        }

        const db = getFirestore();
        const tasksCollectionRef = collection(db, 'artifacts/skillbridge-app/public/data/tasks');
        
        // Build the query based on filters and user role
        let tasksQuery;

        if (userRole === 'recruiter') {
            // Recruiter sees only their own tasks
            tasksQuery = query(tasksCollectionRef, where('postedByUserId', '==', user.uid));
        } else {
            // Student sees all tasks
            tasksQuery = query(tasksCollectionRef);

            if (selectedSkills.length > 0) {
                tasksQuery = query(tasksQuery, where('selectedSkills', 'array-contains-any', selectedSkills));
            }
    
            if (selectedDifficulty) {
                tasksQuery = query(tasksQuery, where('difficulty', '==', selectedDifficulty));
            }
        }
       
        // Set up real-time listener
        const unsubscribeFirestore = onSnapshot(tasksQuery,
            (snapshot) => {
                const fetchedTasks = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setTasks(fetchedTasks);
                setLoading(false);
            },
            (err) => {
                setError("Error fetching tasks: " + err.message);
                console.error(err);
                setLoading(false);
            }
        );

        // Clean up the listener on unmount
        return () => unsubscribeFirestore();
    }, [user, userRole, selectedSkills, selectedDifficulty]);

    const handleSkillToggle = (skill) => {
        setSelectedSkills((prevSkills) =>
            prevSkills.includes(skill)
                ? prevSkills.filter((s) => s !== skill)
                : [...prevSkills, skill]
        );
    };

    const handleDifficultyChange = (e) => {
        setSelectedDifficulty(e.target.value);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen pt-24">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-500">Loading tasks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen pt-24 text-red-500">
                <p>{error}</p>
            </div>
        );
    }
    
    // --- Student Dashboard UI ---
    const StudentDashboard = () => (
        <>
            <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
                Explore Tasks
            </h1>
            <p className="text-center text-lg text-gray-600 mb-12">
                Find and apply to real-world tasks posted by professionals.
            </p>

            {/* Filter Section */}
            <div className="mb-12 p-6 bg-white rounded-xl shadow-lg">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Filters</h3>
                <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
                    {/* Skills Filter */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Skills:</label>
                        <div className="flex flex-wrap gap-2">
                            {allSkills.map(skill => (
                                <button
                                    key={skill}
                                    onClick={() => handleSkillToggle(skill)}
                                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${
                                        selectedSkills.includes(skill)
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                    }`}
                                >
                                    {skill}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Difficulty Filter */}
                    <div className="md:w-1/4">
                        <label htmlFor="difficulty-filter" className="block text-sm font-medium text-gray-700 mb-2">Filter by Difficulty:</label>
                        <select
                            id="difficulty-filter"
                            value={selectedDifficulty}
                            onChange={handleDifficultyChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">All Difficulties</option>
                            {allDifficulties.map(difficulty => (
                                <option key={difficulty} value={difficulty}>{difficulty}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>
             {tasks.length === 0 ? (
                <div className="text-center text-gray-500 text-lg">
                    No tasks available.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.taskTitle}</h2>
                                <p className="text-gray-500 text-sm mb-4">Posted by: {task.yourName}</p>
                                <p className="text-gray-600 mb-4">{task.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {task.selectedSkills && task.selectedSkills.map(skill => (
                                        <span key={skill} className="bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                    <span>Difficulty: <span className="font-semibold text-gray-700">{task.difficulty}</span></span>
                                    <span>Deadline: <span className="font-semibold text-gray-700">{task.deadline}</span></span>
                                </div>
                                <button className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg mt-4 hover:bg-blue-700 transition-colors">
                                    Apply for this Task
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    // --- Recruiter Dashboard UI ---
    const RecruiterDashboard = () => (
        <>
            <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
                Your Posted Tasks
            </h1>
            <p className="text-center text-lg text-gray-600 mb-12">
                Manage the tasks you have posted for students to work on.
            </p>
            {tasks.length === 0 ? (
                <div className="text-center text-gray-500 text-lg">
                    You have not posted any tasks yet.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {tasks.map(task => (
                        <div key={task.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">{task.taskTitle}</h2>
                                <p className="text-gray-500 text-sm mb-4">Posted by: {task.yourName}</p>
                                <p className="text-gray-600 mb-4">{task.description}</p>
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {task.selectedSkills && task.selectedSkills.map(skill => (
                                        <span key={skill} className="bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">{skill}</span>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center text-sm text-gray-500 mb-2">
                                    <span>Difficulty: <span className="font-semibold text-gray-700">{task.difficulty}</span></span>
                                    <span>Deadline: <span className="font-semibold text-gray-700">{task.deadline}</span></span>
                                </div>
                                <div className="flex space-x-2 mt-4">
                                    <button className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors">
                                        View Applicants
                                    </button>
                                    <button className="flex-1 bg-red-600 text-white font-semibold py-2 rounded-lg hover:bg-red-700 transition-colors">
                                        Delete Task
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
            <div className="max-w-7xl mx-auto">
                {userRole === 'recruiter' ? <RecruiterDashboard /> : <StudentDashboard />}
            </div>
        </div>
    );
};

export default Explore;
