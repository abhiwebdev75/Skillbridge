import React, { useState } from "react";
import Header from "../components/header";
import Footer from "../components/footer";

// A wrapper component that provides the consistent background and layout.
const LandingPage = () => {
  return (
    // The main container now has a dark background color class applied directly.
    <div className="relative min-h-screen flex flex-col font-inter">
      {/* The Header component for navigation */}
      {/* The content of the landing page */}
      <Content />
      {/* The Footer component */}
      <StatsSection />
      <WhyChooseSection />
      <CallToActionSection />
      <AccordionSection />
    </div>
  );
};


// Main content with hero text and animated card.
const Content = () => (
  <main className="container mx-auto px-4 mt-24 py-16 flex flex-col lg:flex-row items-center lg:items-start space-y-12 lg:space-y-0 lg:space-x-12 relative z-10" style={{ height: "100vh" }}>
    {/* Left column - Hero text and buttons */}
    <div className="lg:w-1/2 mx-auto flex flex-col items-center lg:items-start text-center lg:text-left text-white">
      <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-4">
        Bridge the Gap <br className="hidden md:inline" />Between <br className="hidden md:inline" />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-400">
          Learning & Industry
        </span>
      </h1>
      <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-lg">
        Connect with industry professionals, work on real-world projects, and
        build skills that matter. SkillBridge transforms theoretical knowledge
        into practical expertise.
      </p>
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        <button className="px-8 py-3 rounded-full text-white font-semibold transition-transform duration-300 transform hover:scale-105 bg-gradient-to-r from-teal-500 to-blue-500 shadow-md">
          Explore Tasks
          <span className="ml-2">&rarr;</span>
        </button>
        <button className="px-8 py-3 rounded-full text-gray-700 font-semibold border-2 border-gray-300 transition-colors duration-300 hover:bg-gray-100">
          Post a Task
        </button>
      </div>
    </div>

    <div className="lg:w-1/2 relative mx-auto p-4 rounded-3xl max-w-xl w-full bg-white border border-gray-200 shadow-lg z-10 mt-12 lg:mt-0">
      {/* Laptop Icon */}
      <div className="absolute top-4 left-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      </div>

      {/* Top-right blob (circle) */}
      <div className="absolute top-[-10px] right-[-10px] bg-purple-300 rounded-full w-16 h-16 opacity-50"></div>

      {/* Bottom-left blob (circle) */}
      <div className="absolute bottom-[-10px] left-[-10px] bg-blue-300 rounded-full w-16 h-16 opacity-50"></div>

      {/* Star Icon */}
      <div className="absolute top-1/2 right-4 transform -translate-y-1/2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 15.654l-4.78 2.513a.5.5 0 01-.74-.585l1.13-4.845-4.09-3.55a.5.5 0 01.28-.846l4.9-.714 2.18-4.424a.5.5 0 01.96 0l2.18 4.424 4.9.714a.5.5 0 01.28.846l-4.09 3.55 1.13 4.845a.5.5 0 01-.74.585L10 15.654z" clipRule="evenodd" />
        </svg>
      </div>

      {/* Rocket Icon */}
      <div className="absolute bottom-4 right-4">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-pink-400" viewBox="0 0 24 24" fill="currentColor">
          <path fillRule="evenodd" d="M17.717 4.783a1 1 0 011.414 1.414L5.828 20.001a1 1 0 11-1.414-1.414L17.717 4.783zM12 12a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          <path d="M9 7a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H10a1 1 0 01-1-1V7z" />
        </svg>
      </div>

      {/* Card's main textual content */}
      <div className="relative text-center py-10">
        <svg className="mx-auto h-52 w-52 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6 3-6 3-6-3 6-3z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Learn. Build. Grow.</h2>
        <p className="text-md text-gray-600">Connect with industry experts</p>
      </div>
    </div>
  </main>
);


const StatsSection = () => {
  const stats = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm0-16c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" fill="currentColor" />
          <path d="M12 16.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 7.5 12 7.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill="currentColor" />
        </svg>
      ),
      iconColor: "text-blue-500",
      value: "9",
      label: "Active Tasks",
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 18H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2zM5 8v8h14V8H5z" fill="currentColor" />
          <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
          <path d="M16 11H8v1h8v-1z" fill="currentColor" />
        </svg>
      ),
      iconColor: "text-purple-500",
      value: "0",
      label: "Student Submissions",
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14c2.761 0 5-2.239 5-5S14.761 4 12 4 7 6.239 7 9s2.239 5 5 5z" fill="currentColor" />
          <path d="M12 15c-3.11 0-7 1.83-7 5v1h14v-1c0-3.17-3.89-5-7-5z" fill="currentColor" />
        </svg>
      ),
      iconColor: "text-green-500",
      value: "15+",
      label: "Skill Categories",
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-18a8 8 0 1 1 0 16 8 8 0 0 1 0-16z" fill="currentColor" />
          <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
          <path d="M12 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
          <path d="M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
          <path d="M12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
        </svg>
      ),
      iconColor: "text-orange-500",
      value: "94%",
      label: "Success Rate",
    },
  ];

  return (
    <section className="bg-white py-12">
      <div className="container mx-auto px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className={`p-3 rounded-full inline-block ${stat.iconColor}`}>
              {stat.icon}
            </div>
            <p className="text-3xl font-bold text-gray-900 mt-2 mb-1">{stat.value}</p>
            <p className="text-gray-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Section with feature cards.
const WhyChooseSection = () => {
  const features = [
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 21c-4.97 0-9-4.03-9-9s4.03-9 9-9 9 4.03 9 9-4.03 9-9 9zm0-16c-3.87 0-7 3.13-7 7s3.13 7 7 7 7-3.13 7-7-3.13-7-7-7z" fill="currentColor" />
          <path d="M12 16.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 7.5 12 7.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5zm0-7c-1.38 0-2.5 1.12-2.5 2.5s1.12 2.5 2.5 2.5 2.5-1.12 2.5-2.5-1.12-2.5-2.5-2.5z" fill="currentColor" />
        </svg>
      ),
      iconColor: "bg-blue-500 text-white",
      title: "Real-World Projects",
      description: "Work on industry-relevant tasks posted by experienced mentors",
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 18H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2zM5 8v8h14V8H5z" fill="currentColor" />
          <path d="M12 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" fill="currentColor" />
          <path d="M16 11H8v1h8v-1z" fill="currentColor" />
        </svg>
      ),
      iconColor: "bg-purple-500 text-white",
      title: "Expert Mentorship",
      description: "Learn from professionals working in top tech companies",
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 14c2.761 0 5-2.239 5-5S14.761 4 12 4 7 6.239 7 9s2.239 5 5 5z" fill="currentColor" />
          <path d="M12 15c-3.11 0-7 1.83-7 5v1h14v-1c0-3.17-3.89-5-7-5z" fill="currentColor" />
        </svg>
      ),
      iconColor: "bg-green-500 text-white",
      title: "Skill Recognition",
      description: "Build your portfolio with verified project completions",
    },
    {
      icon: (
        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zm0-18a8 8 0 1 1 0 16 8 8 0 0 1 0-16z" fill="currentColor" />
          <path d="M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
          <path d="M12 16a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
          <path d="M12 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
          <path d="M12 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
        </svg>
      ),
      iconColor: "bg-orange-500 text-white",
      title: "Diverse Technologies",
      description: "Explore AI, Web Dev, ML, Cybersecurity, and more",
    },
  ];

  return (
    <section className="container mx-auto px-4 py-16 relative z-10">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-bold text-white mb-2">
          Why Choose SkillBridge?
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We connect passionate learners with industry experts to create meaningful learning experiences
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {features.map((feature, index) => (
          <div
            key={index}
            className="group bg-white p-8 rounded-2xl shadow-lg border border-gray-200 transition-all duration-300 transform hover:-translate-y-2 hover:shadow-xl"
          >
            <div className={`p-3 rounded-full inline-block ${feature.iconColor} transition-transform duration-300 group-hover:scale-110`}>
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mt-4 mb-2">
              {feature.title}
            </h3>
            <p className="text-gray-600">
              {feature.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

// Call-to-action section.
const CallToActionSection = () => {
  return (
    <section className="container mx-auto px-4 py-16 relative z-10 text-center bg-gradient-to-r from-teal-400 to-blue-500 rounded-3xl mt-16 mb-16 shadow-lg">
      <div className="flex justify-center items-center mb-4">
        <svg className="h-16 w-16 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          <path d="M17.717 4.783a1 1 0 011.414 1.414L5.828 20.001a1 1 0 11-1.414-1.414L17.717 4.783zM12 12a2 2 0 100-4 2 2 0 000 4z" />
          <path d="M9 7a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1H10a1 1 0 01-1-1V7z" />
        </svg>
      </div>
      <h2 className="text-4xl font-bold text-white mb-4">
        Ready to Start Your Journey?
      </h2>
      <p className="text-white mb-8 max-w-2xl mx-auto">
        Join thousands of students and professionals already building the future together
      </p>
      <a href="/login">
        <button className="px-8 py-3 rounded-full text-blue-500 font-semibold bg-white transition-transform duration-300 transform hover:scale-105 hover:bg-gray-100 shadow-md">
          Get Started Today
        </button>
      </a>
    </section>
  );
};
const AccordionSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How does SkillBridge work?",
      answer: "SkillBridge connects learners with industry experts who post real-world tasks. Students can work on these tasks to build a portfolio, gain practical experience, and receive mentorship."
    },
    {
      question: "Is SkillBridge free to use?",
      answer: "Yes, SkillBridge offers a free tier for both learners and mentors. There may be premium features or advanced resources available for a fee in the future."
    },
    {
      question: "What kind of tasks are available?",
      answer: "You can find tasks in various domains, including Web Development, Data Science, Mobile Development, Cybersecurity, AI/ML, and more. New tasks are added regularly."
    },
    {
      question: "How do I get verified for a project?",
      answer: "Once you complete a task, the mentor will review your submission. Upon approval, the project completion is verified on your profile, which you can use for your portfolio and resume."
    },
  ];

  const toggleAccordion = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-2">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-200 max-w-2xl mx-auto">
            Find answers to common questions about how SkillBridge operates.
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
              <button
                className="w-full text-left p-6 font-semibold text-lg text-gray-200 flex justify-between items-center hover:border border-cyan-600"
                onClick={() => toggleAccordion(index)}
              >
                {faq.question}
                <span className={`transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : 'rotate-0'}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}
              >
                <div className="p-6 text-gray-800 bg-gray-50 border-t border-gray-200">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};


export default LandingPage;
