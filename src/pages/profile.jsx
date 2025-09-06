import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { Link } from 'react-router-dom';

const Profile = () => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    // This useEffect hook is responsible for fetching user data
    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                const db = getFirestore();
                const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', currentUser.uid);

                try {
                    const userDoc = await getDoc(userDocRef);
                    if (userDoc.exists()) {
                        setUserData(userDoc.data());
                        setFormData(userDoc.data()); // Initialize form with current data
                    } else {
                        // User document does not exist, create a new one
                        await setDoc(userDocRef, {
                            uid: currentUser.uid,
                            name: currentUser.displayName || 'User',
                            email: currentUser.email,
                            role: 'student', // Default role
                            createdAt: new Date(),
                        });
                        setUserData({ uid: currentUser.uid, name: currentUser.displayName || 'User', email: currentUser.email, role: 'student', createdAt: new Date() });
                        setFormData({ uid: currentUser.uid, name: currentUser.displayName || 'User', email: currentUser.email, role: 'student', createdAt: new Date() });
                    }
                } catch (err) {
                    console.error("Error fetching or creating user document:", err);
                    setError("Failed to load user profile. Please try again.");
                } finally {
                    setLoading(false);
                }
            } else {
                setUser(null);
                setUserData(null);
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [id]: value }));
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        if (!user) {
            setError("You must be logged in to update your profile.");
            return;
        }

        const db = getFirestore();
        const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', user.uid);

        try {
            await updateDoc(userDocRef, formData);
            setUserData(formData);
            setIsEditing(false);
            setError("Profile updated successfully!");
        } catch (err) {
            console.error("Error updating profile:", err);
            setError("Failed to update profile. Please try again.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500 pt-24">
                <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="mt-4">Loading profile...</p>
            </div>
        );
    }

    if (error && !isEditing) {
        return <div className="text-center text-red-500 pt-24">{error}</div>;
    }

    if (!user) {
        return (
            <div className="text-center text-gray-500 pt-24">
                <p>Please log in to view your profile.</p>
                <Link to="/login" className="text-blue-500 hover:underline mt-4 block">Go to Login</Link>
            </div>
        );
    }

    const ProfileHeader = () => (
        <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">{userData?.name || 'User'}</h1>
            <p className="text-gray-600 mt-1">{userData?.email}</p>
            <p className="text-sm font-medium text-blue-500 mt-2 capitalize">
                Role: {userData?.role}
            </p>
            {!isEditing && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="mt-4 px-6 py-2 rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                >
                    Edit Profile
                </button>
            )}
        </div>
    );
    
    const StudentDashboard = () => (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Profile Information Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Personal Information</h2>
                {isEditing ? (
                    <form onSubmit={handleUpdateProfile} className="space-y-4">
                        <input
                            id="education"
                            type="text"
                            value={formData.education || ''}
                            onChange={handleInputChange}
                            placeholder="Education (e.g., B.Tech in CSE)"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            id="college"
                            type="text"
                            value={formData.college || ''}
                            onChange={handleInputChange}
                            placeholder="College Name"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            id="city"
                            type="text"
                            value={formData.city || ''}
                            onChange={handleInputChange}
                            placeholder="City"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            id="phoneNumber"
                            type="tel"
                            value={formData.phoneNumber || ''}
                            onChange={handleInputChange}
                            placeholder="Phone Number"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-4 mt-4">
                            <button
                                type="submit"
                                className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700"
                            >
                                Save Changes
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="w-full py-2 px-4 bg-gray-300 text-gray-800 font-semibold rounded-lg hover:bg-gray-400"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-2 text-gray-700">
                        <p><strong>Education:</strong> {userData?.education || <span className="text-gray-400">Not provided</span>}</p>
                        <p><strong>College:</strong> {userData?.college || <span className="text-gray-400">Not provided</span>}</p>
                        <p><strong>City:</strong> {userData?.city || <span className="text-gray-400">Not provided</span>}</p>
                        <p><strong>Phone Number:</strong> {userData?.phoneNumber || <span className="text-gray-400">Not provided</span>}</p>
                        {!userData?.education && <p className="text-red-500 text-sm mt-4">Please update your profile information.</p>}
                    </div>
                )}
            </div>

            {/* Task Stats Section */}
            <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Task Progress</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                        <h3 className="text-3xl font-bold text-green-700">0</h3>
                        <p className="text-green-600">Completed Tasks</p>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg text-center">
                        <h3 className="text-3xl font-bold text-yellow-700">0</h3>
                        <p className="text-yellow-600">In Progress</p>
                    </div>
                </div>
                <div className="mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Application History</h3>
                    <div className="text-gray-500 italic">No applications found.</div>
                </div>
            </div>
        </div>
    );
    
    const RecruiterDashboard = () => (
        <div className="mt-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Posted Tasks</h2>
                <div className="space-y-4">
                    <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Task Title: Build a React Dashboard</h3>
                            <p className="text-sm text-gray-500">Posted on: 2023-10-27</p>
                        </div>
                        <span className="bg-yellow-200 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full">In Progress</span>
                    </div>
                    <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
                        <div>
                            <h3 className="font-semibold">Task Title: Design a landing page</h3>
                            <p className="text-sm text-gray-500">Posted on: 2023-10-20</p>
                        </div>
                        <span className="bg-green-200 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">Completed</span>
                    </div>
                    <div className="text-gray-500 italic mt-4">No tasks found.</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 pt-24">
            <div className="max-w-4xl mx-auto">
                <ProfileHeader />
                {userData?.role === 'recruiter' ? <RecruiterDashboard /> : <StudentDashboard />}
            </div>
        </div>
    );
};

export default Profile;
