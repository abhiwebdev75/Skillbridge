// src/App.jsx
import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppLayout from './layouts/app_layout';
import LandingPage from './pages/landingPage';
import OnboardingPage from './pages/OnboardingPage';
import Jobs from './pages/jobs';
import JobListing from './pages/job-listing';
import MyJobs from './pages/myjobs';
import Explore from './pages/explore';
import PostTask from './pages/posttask';
import Signup from './pages/signup';

import { Button } from '@/components/ui/button';
import { cn } from './lib/utils';
import './index.css';
import Login from './pages/login';
import ExploreTasks from './pages/explore';

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
    path: '/', // The root path for your application
    element: <LandingPage />
  },
      {
        path: '/onboarding',
        element: <OnboardingPage />
      },
      {
        path: '/jobs',
        element: <Jobs />
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
        element: <ExploreTasks />
      },
      {
        path: '/post-task',
        element: <PostTask />
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
    // This is a catch-all route for any undefined paths
    path: '*',
    element: <div>404 Not Found</div>
  }
]);

const App = () => {
  return (
    <div>
      <RouterProvider router={router} />
    </div>
  );
};

export default App;
