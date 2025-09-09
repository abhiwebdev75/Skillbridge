import React, { useState, useEffect, useRef } from 'react';

// This is a single, self-contained React component for the SkillBridge chatbot.
// It can be added directly to your MERN stack's React frontend.
// The component manages its own state for messages, input, and loading.

const Chatbot = ({ isOpen, onClose }) => {
    // State to hold the chat messages
    const [messages, setMessages] = useState([]);
    // State for the user's current input
    const [input, setInput] = useState('');
    // State for showing a loading indicator
    const [isLoading, setIsLoading] = useState(false);
    // State for the uploaded file
    const [file, setFile] = useState(null);
    // Ref to auto-scroll the messages container
    const messagesEndRef = useRef(null);

    // System instruction for the Gemini API
    const systemPrompt = "You are SkillBridge, an AI assistant for a website that bridges the gap between students and industry. Your primary goal is to help users with their resumes, career skills, and further studies. When a user asks a question, provide a helpful and encouraging response. If the query is related to resume building, improving skills, or finding courses, offer specific, actionable advice. If the user asks for something outside of this scope, gently redirect them back to the core topics of career development. You are professional, knowledgeable, and friendly.";

    // Effect to add an initial welcome message from the bot when the component mounts
    useEffect(() => {
        setMessages([{ text: "Hi there! I'm SkillBridge Chat, your personal career assistant. I can help you with things like creating a new resume, improving your current one, or finding skills and courses to boost your career. What can I help you with today?", sender: 'bot' }]);
    }, []);

    // Effect to scroll to the bottom of the chat on every message update
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    // Function to handle sending a message to the Gemini API
    const handleSendMessage = async () => {
        const userText = input.trim();
        if (!userText && !file) return;

        // Add the user's message to the chat
        let messageText = userText;
        if (file) {
            messageText = `Uploaded file: ${file.name}`;
            setMessages(prevMessages => [...prevMessages, { text: messageText, sender: 'user' }]);
            // For now, we will simply confirm the file upload
            setMessages(prevMessages => [...prevMessages, { text: `Thank you for uploading ${file.name}! I can analyze your resume once you have a backend endpoint to handle it.`, sender: 'bot' }]);
            setFile(null); // Clear the file state
        } else {
            setMessages(prevMessages => [...prevMessages, { text: userText, sender: 'user' }]);
            setIsLoading(true);

            // This is where you call the Gemini API.
            // For security, you should create a backend endpoint (e.g., in Express.js)
            // to proxy this request, so your API key is not exposed in the client-side code.
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            // Payload for the Gemini API request
            const payload = {
                contents: [{ parts: [{ text: userText }] }],
                tools: [{ "google_search": {} }],
                systemInstruction: {
                    parts: [{ text: systemPrompt }]
                },
            };

            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('API call failed:', errorData);
                    throw new Error(`API call failed with status ${response.status}`);
                }

                const result = await response.json();
                const botMessage = result?.candidates?.[0]?.content?.parts?.[0]?.text;

                if (botMessage) {
                    setMessages(prevMessages => [...prevMessages, { text: botMessage, sender: 'bot' }]);
                }
            } catch (error) {
                console.error('Error fetching from Gemini API:', error);
                setMessages(prevMessages => [...prevMessages, { text: "Sorry, I'm having trouble connecting right now. Please try again in a moment.", sender: 'bot' }]);
            } finally {
                setIsLoading(false);
            }
        }
    };

    // Handle file change from the input
    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setInput(selectedFile.name);
        }
    };

    // Handle key press for sending messages with Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    // The component will only render if the 'isOpen' prop is true.
    if (!isOpen) {
        return null;
    }

    return (
        <div className="fixed inset-0 flex items-end justify-end p-4 z-50">
            {/* Background overlay with a blur effect */}
            {/* Updated the background to be a lighter color with more transparency and a stronger blur. */}
            <div className="absolute inset-0 bg-gray-100 bg-opacity-10 backdrop-blur-lg z-40"></div>
            
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm h-4/5 flex flex-col z-50">
                <div className="p-4 bg-blue-600 text-white rounded-t-2xl flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-xl">SB</div>
                            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full ring-2 ring-white bg-green-400"></span>
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">SkillBridge Chat</h2>
                            <p className="text-sm font-light opacity-80">Online</p>
                        </div>
                    </div>
                    {/* The close button now calls the 'onClose' prop from AppLayout */}
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-blue-700 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div id="messages" className="p-6 flex-1 overflow-y-auto flex flex-col">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`message max-w-sm p-3 rounded-2xl mb-2 shadow-sm ${
                                message.sender === 'user'
                                    ? 'bg-blue-600 text-white self-end rounded-br-md'
                                    : 'bg-gray-200 text-gray-800 self-start rounded-bl-md'
                            }`}
                        >
                            {message.text}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="message bot-message self-start text-sm italic text-gray-500">
                            SkillBridge is thinking...
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="p-4 flex items-center bg-gray-50 rounded-b-2xl">
                    <label htmlFor="file-upload" className="cursor-pointer ml-2 p-3 bg-gray-300 text-gray-700 rounded-full hover:bg-gray-400 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06L12 4.06V17.25a.75.75 0 01-1.5 0V4.06L7.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5z" clipRule="evenodd" />
                            <path fillRule="evenodd" d="M3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                        </svg>
                    </label>
                    <input id="file-upload" type="file" onChange={handleFileChange} className="hidden" />

                    <input
                        type="text"
                        id="user-input"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="flex-1 px-4 py-2 mx-4 bg-white border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />

                    <button
                        id="send-button"
                        onClick={handleSendMessage}
                        className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        disabled={isLoading}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.917a.75.75 0 00.926.94L18.777 9.4l-7.917 2.432a.75.75 0 00-.94.926l2.432 7.917a.75.75 0 00.926.94l2.432-7.917a.75.75 0 00.94-.926L21.777 2.405a.75.75 0 00-.926-.94l-18.35 1.545z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
