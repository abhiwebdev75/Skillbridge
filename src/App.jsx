import React, { useState, useEffect, createContext } from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc } from "firebase/firestore";

import AppLayout from './layouts/app_layout';
import LandingPage from './pages/landingPage';
import OnboardingPage from './pages/OnboardingPage';
import JobListing from './pages/job-listing';
import MyJobs from './pages/myjobs';
import Explore from './pages/explore';
import PostTask from './pages/posttask';
import Signup from './pages/signup';
import Login from './pages/login';
import Profile from './pages/profile';
import Messages from './pages/Messages';

import { Button } from '@/components/ui/button';
import { cn } from './lib/utils';
import './index.css';

export const UserContext = createContext(null);

const firebaseConfig = {
  apiKey: "AIzaSyAAa1lNKQPgt6f0dd6TZ4VtgOiLYb7ukzE",
  authDomain: "skillbridge-81d5e.firebaseapp.com",
  projectId: "skillbridge-81d5e",
  storageBucket: "skillbridge-81d5e.firebasestorage.app",
  messagingSenderId: "854363859288",
  appId: "1:854363859288:web:c04fb725eebb0b52f35d2d",
  measurementId: "G-E78EQCCY5R"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const PrivateRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setIsAuthenticated(!!user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Checking authentication...
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', currentUser.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
          } else {
            setUserRole('student');
          }
        } catch (err) {
          console.error("Error fetching user role:", err);
          setUserRole('student');
        }
      } else {
        setUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-gray-500">
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading...
      </div>
    );
  }

  const router = createBrowserRouter([
    {
      element: <AppLayout userRole={userRole} />,
      children: [
        {
          path: '/',
          element: <LandingPage />
        },
        {
          path: '/onboarding',
          element: <OnboardingPage />
        },
        {
          path: '/job-listing',
          element: <JobListing />
        },
        {
          path: '/my-jobs',
          element: <MyJobs />
        },
        {
          path: '/explore',
          element: (
            <PrivateRoute>
              <Explore userRole={userRole} />
            </PrivateRoute>
          )
        },
        {
          path: '/post-task',
          element: (
            <PrivateRoute>
              <PostTask />
            </PrivateRoute>
          )
        },
        {
          path: '/profile',
          element: (
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          )
        },
        {
          path: '/messages',
          element: (
            <PrivateRoute>
              <Messages />
            </PrivateRoute>
          )
        },
        {
          path: '/signup',
          element: <Signup />
        },
        {
          path: '/login',
          element: <Login />
        },
      ]
    },
    {
      path: '*',
      element: <div>404 Not Found</div>
    }
  ]);

  return (
    <div>
      <UserContext.Provider value={user}>
      <RouterProvider router={router} />
      </UserContext.Provider>
    </div>
  );
};

export default App;
