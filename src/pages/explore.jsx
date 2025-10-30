import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import {
  getFirestore, collection, onSnapshot, query, where,
  doc, updateDoc, getDoc, addDoc, setDoc
} from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const Explore = ({ userRole }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState(null);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [applications, setApplications] = useState([]);
  const [selectedTask, setSelectedTask] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [applicantProfile, setApplicantProfile] = useState(null);
  const navigate = useNavigate();

  const allSkills = [
    "AI", "Machine Learning", "Web Development", "Mobile Development",
    "Cybersecurity", "Data Science", "DevOps", "Cloud Computing",
    "Blockchain", "IoT", "Game Development", "UI/UX Design",
    "React", "Node.js", "Python", "Java", "C++", "JavaScript",
  ];

  const allDifficulties = ["Beginner", "Intermediate", "Advanced"];

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const tasksCollectionRef = collection(db, 'artifacts/skillbridge-app/public/data/tasks');
    const applicationsCollectionRef = collection(db, 'artifacts/skillbridge-app/public/data/applications');

    let tasksQuery;
    if (userRole === 'recruiter') {
      tasksQuery = query(tasksCollectionRef, where('postedByUserId', '==', user.uid));
    } else {
      tasksQuery = query(tasksCollectionRef);
      if (selectedSkills.length > 0) {
        tasksQuery = query(tasksQuery, where('selectedSkills', 'array-contains-any', selectedSkills));
      }
      if (selectedDifficulty) {
        tasksQuery = query(tasksQuery, where('difficulty', '==', selectedDifficulty));
      }
    }

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

    const unsubscribeApplications = onSnapshot(applicationsCollectionRef, (snapshot) => {
      const applicationsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setApplications(applicationsData);
    }, (err) => {
      console.error("Error fetching applications:", err);
    });

    return () => {
      unsubscribeFirestore();
      unsubscribeApplications();
    };
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

  const handleViewApplicants = (task) => {
    const taskApplicants = applications.filter(app => app.taskId === task.id);
    setSelectedTask(task);
    setApplicants(taskApplicants);
  };

  const handleAcceptReject = async (applicationId, status) => {
    const db = getFirestore();
    const appDocRef = doc(db, 'artifacts/skillbridge-app/public/data/applications', applicationId);
    try {
      await updateDoc(appDocRef, { status });
      setApplicants(prevApplicants =>
        prevApplicants.map(app => app.id === applicationId ? { ...app, status } : app)
      );
    } catch (err) {
      console.error("Error updating application status:", err);
      setError("Failed to update applicant status.");
    }
  };
  // Fix: Always use setDoc for chat creation, and check for chat existence before navigation
  const handleMessageApplicant = async (applicantId) => {
  if (!user) return;

  const db = getFirestore();
  const chatsRef = collection(db, 'artifacts/skillbridge-app/public/data/chats');
  const chatId = [user.uid, applicantId].sort().join('_'); // ensures unique order
  const chatDocRef = doc(chatsRef, chatId);

  try {
    const chatSnap = await getDoc(chatDocRef);
    if (!chatSnap.exists()) {
      // ✅ create chat doc without inline messages
      await setDoc(chatDocRef, {
        participants: [user.uid, applicantId],
        createdAt: new Date(),
      });
    }

    // Navigate to chat screen
    setTimeout(() => {
      navigate(`/messages?chatId=${chatId}`);
    }, 500);

  } catch (err) {
    console.error("Error creating/opening chat:", err);
    setError("Failed to start chat.");
  }
};

  const handleViewProfile = async (applicantId) => {
    const db = getFirestore();
    const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', applicantId);
    try {
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        setApplicantProfile(userDoc.data());
      }
    } catch (err) {
      console.error("Error fetching applicant profile:", err);
      setError("Failed to fetch applicant profile.");
    }
  };

  const handleApplyForTask = async (task) => {
    if (!user) {
      setError("You must be logged in to apply for a task.");
      return;
    }

    const db = getFirestore();
    const applicationsCollectionRef = collection(db, 'artifacts/skillbridge-app/public/data/applications');

    try {
      await addDoc(applicationsCollectionRef, {
        taskId: task.id,
        applicantId: user.uid,
        applicantName: user.displayName || 'user',
        taskTitle: task.taskTitle,
        status: 'pending',
        appliedAt: new Date(),
      });
    } catch (err) {
      console.error("Error applying for task:", err);
      setError("Failed to apply for task. Please try again.");
    }
  };

  // (Removed duplicate handleMessageApplicant function)

  // Student Dashboard
  const StudentDashboard = () => {
    const studentTasks = tasks;
    const appliedTaskIds = applications
      .filter(app => user && app.applicantId === user.uid)
      .map(app => app.taskId);

    return (
      <>
        <h1 className="text-4xl font-extrabold text-center text-gray-900 mb-8">
          Explore Tasks
        </h1>
        <p className="text-center text-lg text-gray-600 mb-12">
          Find and apply to real-world tasks posted by professionals.
        </p>
        {/* Filters */}
        <div className="mb-12 p-6 bg-white rounded-xl shadow-lg">
          <h3 className="text-xl font-bold text-gray-800 mb-4">Filters</h3>
          <div className="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-8">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Skills:</label>
              <div className="flex flex-wrap gap-2">
                {allSkills.map(skill => (
                  <button
                    key={skill}
                    onClick={() => handleSkillToggle(skill)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${selectedSkills.includes(skill)
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                      }`}
                  >
                    {skill}
                  </button>
                ))}
              </div>
            </div>
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

        {studentTasks.length === 0 ? (
          <div className="text-center text-gray-500 text-lg">
            No tasks available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentTasks.map(task => (
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
                  <button
                    onClick={() => handleApplyForTask(task)}
                    disabled={appliedTaskIds.includes(task.id)}
                    className={`w-full text-white font-semibold py-2 rounded-lg mt-4 transition-colors ${appliedTaskIds.includes(task.id)
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                  >
                    {appliedTaskIds.includes(task.id) ? 'Applied' : 'Apply for this Task'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </>
    );
  };

  // Recruiter Dashboard
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
                  <button onClick={() => handleViewApplicants(task)} className="flex-1 bg-green-600 text-white font-semibold py-2 rounded-lg hover:bg-green-700 transition-colors">
                    View Applicants ({applications.filter(app => app.taskId === task.id).length})
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

      {selectedTask && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Applicants for "{selectedTask.taskTitle}"</h2>
              <button onClick={() => setSelectedTask(null)} className="text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {applicants.length > 0 ? (
              <div className="space-y-4">
                {applicants.map(applicant => (
                  <div key={applicant.id} className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                    <div>
                      <button onClick={() => handleViewProfile(applicant.applicantId)} className="font-semibold text-blue-600 hover:underline">
                        {applicant.applicantName}
                      </button>
                      <p className="text-sm text-gray-500">Status: <span className="capitalize">{applicant.status}</span></p>
                    </div>
                    <div className="flex space-x-2">
                      {applicant.status === 'pending' && (
                        <>
                          <button onClick={() => handleAcceptReject(applicant.id, 'accepted')} className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-green-600">Accept</button>
                          <button onClick={() => handleAcceptReject(applicant.id, 'rejected')} className="bg-red-500 text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-red-600">Reject</button>
                        </>
                      )}
                      {applicant.status === 'accepted' && (
                        <button onClick={() => handleMessageApplicant(applicant.applicantId)} className="bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full hover:bg-blue-600">Message</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-gray-500 italic">No applicants for this task yet.</div>
            )}
          </div>
        </div>
      )}

      {applicantProfile && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Student Profile</h2>
              <button onClick={() => setApplicantProfile(null)} className="text-gray-500 hover:text-gray-800">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 text-gray-700">
              <p><strong>Username:</strong> {applicantProfile.username || 'Not provided'}</p>
              <p><strong>Email:</strong> {applicantProfile.email || 'Not provided'}</p>
              <p><strong>Education:</strong> {applicantProfile.education || 'Not provided'}</p>
              <p><strong>College:</strong> {applicantProfile.college || 'Not provided'}</p>
              <p><strong>City:</strong> {applicantProfile.city || 'Not provided'}</p>
              <p><strong>Phone:</strong> {applicantProfile.phoneNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );

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

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
      <div className="max-w-7xl mx-auto">
        {userRole === 'recruiter' ? <RecruiterDashboard /> : <StudentDashboard />}
      </div>
    </div>
  );
};

export default Explore;