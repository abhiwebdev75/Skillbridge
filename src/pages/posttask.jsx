import React, { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, addDoc, serverTimestamp } from "firebase/firestore";

const PostTask = () => {
  // State to manage form data
  const [formData, setFormData] = useState({
    yourName: "",
    email: "",
    taskTitle: "",
    description: "",
    selectedSkills: [],
    deadline: "",
    difficulty: "",
    expectedOutcome: "",
  });

  const [isPreview, setIsPreview] = useState(false);
  const [message, setMessage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [user, setUser] = useState(null); // State to store the authenticated user

  // All available skills
  const allSkills = [
    "AI", "Machine Learning", "Web Development", "Mobile Development",
    "Cybersecurity", "Data Science", "DevOps", "Cloud Computing",
    "Blockchain", "IoT", "Game Development", "UI/UX Design",
    "React", "Node.js", "Python", "Java", "C++", "JavaScript",
  ];

  // Set up auth state listener
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
    });
    return () => unsubscribe();
  }, []);

  // Handle input change
  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [id]: value }));
  };

  // Handle skill selection
  const handleSkillChange = (skill) => {
    setFormData((prevData) => {
      const { selectedSkills } = prevData;
      return {
        ...prevData,
        selectedSkills: selectedSkills.includes(skill)
          ? selectedSkills.filter((s) => s !== skill)
          : [...selectedSkills, skill],
      };
    });
  };

  // Submit task
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (!user) {
      setMessage("You must be logged in to post a task.");
      return;
    }

    if (formData.selectedSkills.length === 0) {
      setMessage("Please select at least one skill tag.");
      return;
    }

    setIsPublishing(true);
    setMessage("Publishing task...");

    try {
      const db = getFirestore();
      const tasksCollectionRef = collection(db, `artifacts/skillbridge-app/public/data/tasks`);

      await addDoc(tasksCollectionRef, {
        ...formData,
        postedByUserId: user.uid,
        timestamp: serverTimestamp(),
      });

      setMessage("Task published successfully!");
      setFormData({
        yourName: "",
        email: "",
        taskTitle: "",
        description: "",
        selectedSkills: [],
        deadline: "",
        difficulty: "",
        expectedOutcome: "",
      });
      setIsPreview(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      setMessage("Failed to publish task. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  // Form UI
  const FormView = (
    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto my-12 backdrop-blur-md bg-opacity-80">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-gray-800">Post a New Task</h2>
      {message && (
        <div
          className={`p-4 rounded-xl mb-4 text-center font-medium ${
            message.includes("Error") || message.includes("Failed")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {message}
        </div>
      )}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <input
          id="yourName"
          type="text"
          value={formData.yourName}
          onChange={handleInputChange}
          placeholder="Your Name"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <input
          id="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Email"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <input
          id="taskTitle"
          type="text"
          value={formData.taskTitle}
          onChange={handleInputChange}
          placeholder="Task Title"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <textarea
          id="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Description"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors h-32 resize-none"
        />
        <div>
          <label className="block text-gray-700 font-semibold mb-2">Select Skills:</label>
          <div className="flex flex-wrap gap-2">
            {allSkills.map((skill) => (
              <button
                type="button"
                key={skill}
                onClick={() => handleSkillChange(skill)}
                className={`px-4 py-2 rounded-full transition-colors font-medium text-sm ${
                  formData.selectedSkills.includes(skill)
                    ? "bg-blue-600 text-white shadow-md"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
        <input
          id="deadline"
          type="date"
          value={formData.deadline}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <select
          id="difficulty"
          value={formData.difficulty}
          onChange={handleInputChange}
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <option value="">Select difficulty</option>
          <option>Beginner</option>
          <option>Intermediate</option>
          <option>Advanced</option>
        </select>
        <input
          id="expectedOutcome"
          type="text"
          value={formData.expectedOutcome}
          onChange={handleInputChange}
          placeholder="Expected Outcome"
          required
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        />
        <div className="flex gap-4 pt-4">
          <button
            type="button"
            onClick={() => setIsPreview(true)}
            className="w-full py-3 px-6 rounded-lg text-lg font-semibold text-white bg-gray-500 hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Preview
          </button>
          <button
            type="submit"
            disabled={!user || isPublishing}
            className={`w-full py-3 px-6 rounded-lg text-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
              isPublishing || !user ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        </div>
      </form>
    </div>
  );

  // Preview UI
  const PreviewView = (
    <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-2xl w-full mx-auto my-12 backdrop-blur-md bg-opacity-80">
      <h2 className="text-3xl font-bold mb-4 text-center">Task Preview</h2>
      <div className="space-y-4 text-gray-800">
        <p><strong>Title:</strong> <span className="text-blue-600 font-semibold">{formData.taskTitle}</span></p>
        <p><strong>Posted by:</strong> {formData.yourName}</p>
        <p><strong>Email:</strong> {formData.email}</p>
        <p><strong>Description:</strong> <span className="block mt-2 p-4 bg-gray-100 rounded-lg">{formData.description}</span></p>
        <p><strong>Skills:</strong> {formData.selectedSkills.map(skill => (
            <span key={skill} className="inline-block bg-blue-200 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full mr-2 last:mr-0">{skill}</span>
        ))}</p>
        <p><strong>Deadline:</strong> {formData.deadline}</p>
        <p><strong>Difficulty:</strong> {formData.difficulty}</p>
        <p><strong>Expected Outcome:</strong> <span className="block mt-2 p-4 bg-gray-100 rounded-lg">{formData.expectedOutcome}</span></p>
      </div>
      <div className="flex gap-4 mt-8">
        <button
          onClick={() => setIsPreview(false)}
          className="w-full py-3 px-6 rounded-lg text-lg font-semibold border-2 border-gray-300 text-gray-700 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2"
        >
          Back to Edit
        </button>
        <button
          onClick={handleSubmit}
          disabled={!user || isPublishing}
          className={`w-full py-3 px-6 rounded-lg text-lg font-semibold text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
            isPublishing || !user ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isPublishing ? "Publishing..." : "Publish Task"}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      {isPreview ? PreviewView : FormView}
    </div>
  );
};

export default PostTask;
