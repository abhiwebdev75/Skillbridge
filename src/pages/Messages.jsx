import React, { useState, useEffect, useRef } from 'react';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import { useLocation } from 'react-router-dom';

const Messages = ({ userRole }) => {
    const [user, setUser] = useState(null);
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const messagesEndRef = useRef(null);
    const location = useLocation();

    const getRecipientIdFromUrl = () => {
        const params = new URLSearchParams(location.search);
        return params.get('user');
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        const auth = getAuth();
        const db = getFirestore();
        const unsubscribeAuth = auth.onAuthStateChanged(async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                
                const chatsCollectionRef = collection(db, 'artifacts/skillbridge-app/public/data/chats');
                const chatsQuery = query(chatsCollectionRef, where('participants', 'array-contains', currentUser.uid), orderBy('updatedAt', 'desc'));

                const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
                    const fetchedChats = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));
                    
                    const chatsWithUsers = await Promise.all(fetchedChats.map(async chat => {
                        const recipientId = chat.participants.find(uid => uid !== currentUser.uid);
                        if (!recipientId) return null;
                        const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', recipientId);
                        const userDoc = await getDoc(userDocRef);
                        const recipient = userDoc.exists() ? userDoc.data() : { uid: recipientId, name: 'Unknown User' };
                        return { id: chatDoc.id, ...chatDoc.data(), recipient };
                    }));
                    
                    setChats(chatsWithUsers.filter(Boolean));
                    setLoading(false);
                }, (err) => {
                    console.error("Error fetching chats:", err);
                    setError("Failed to load chats.");
                    setLoading(false);
                });

                return () => unsubscribeChats();
            } else {
                setUser(null);
                setChats([]);
                setLoading(false);
            }
        });
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (!selectedChat || selectedChat.id === 'new') {
            setMessages([]);
            return;
        }

        const db = getFirestore();
        const messagesCollectionRef = collection(db, `artifacts/skillbridge-app/public/data/chats/${selectedChat.id}/messages`);
        const messagesQuery = query(messagesCollectionRef, orderBy('createdAt'));

        const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(fetchedMessages);
        }, (err) => {
            console.error("Error fetching messages:", err);
            setError("Failed to load messages.");
        });

        return () => unsubscribeMessages();
    }, [selectedChat]);

    useEffect(() => {
        const recipientId = getRecipientIdFromUrl();
        if (recipientId && user) {
            const existingChat = chats.find(chat => chat.recipient.uid === recipientId);
            if (existingChat) {
                setSelectedChat(existingChat);
            } else {
                const db = getFirestore();
                const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', recipientId);
                getDoc(userDocRef).then(userDoc => {
                    const recipientName = userDoc.exists() ? userDoc.data().name : 'New User';
                    const newChat = {
                        id: 'new',
                        recipient: { uid: recipientId, name: recipientName },
                        participants: [user.uid, recipientId]
                    };
                    setSelectedChat(newChat);
                });
            }
        }
    }, [chats, user, location.search]);
    
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !user || !selectedChat) return;
        
        const db = getFirestore();
        let chatId = selectedChat?.id;

        if (chatId === 'new') {
            const newChatData = {
                participants: [user.uid, selectedChat.recipient.uid],
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            };
            const newChatDocRef = await addDoc(collection(db, 'artifacts/skillbridge-app/public/data/chats'), newChatData);
            chatId = newChatDocRef.id;
            setSelectedChat(prev => ({ ...prev, id: chatId, ...newChatData }));
        }
        
        const messagesCollectionRef = collection(db, `artifacts/skillbridge-app/public/data/chats/${chatId}/messages`);
        
        try {
            await addDoc(messagesCollectionRef, {
                senderId: user.uid,
                text: newMessage,
                createdAt: serverTimestamp(),
            });
            setNewMessage('');
        } catch (err) {
            console.error("Error sending message:", err);
            setError("Failed to send message.");
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen pt-24">
                <div className="flex flex-col items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-10 w-10 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="mt-4 text-gray-500">Loading chats...</p>
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

    if (!user) {
        return (
            <div className="text-center text-gray-500 pt-24">
                <p>Please log in to view your messages.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
            <div className="max-w-7xl mx-auto flex h-[calc(100vh-10rem)] bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="w-1/4 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Messages</h2>
                    <ul className="space-y-2">
                        {chats.length > 0 ? (
                            chats.map(chat => (
                                <li
                                    key={chat.id}
                                    onClick={() => setSelectedChat(chat)}
                                    className={`cursor-pointer p-3 rounded-lg transition-colors ${selectedChat?.id === chat.id ? 'bg-blue-100 text-blue-800' : 'hover:bg-gray-200'}`}
                                >
                                    <h3 className="font-semibold">{chat.recipient.name}</h3>
                                </li>
                            ))
                        ) : (
                            <li className="text-gray-500 italic">No conversations yet.</li>
                        )}
                    </ul>
                </div>
                <div className="flex-1 flex flex-col">
                    {selectedChat ? (
                        <>
                            <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                                <h2 className="text-xl font-bold text-gray-800">{selectedChat.recipient.name}</h2>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.length > 0 ? (
                                    messages.map(msg => (
                                        <div 
                                            key={msg.id} 
                                            className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div className={`p-3 rounded-xl max-w-xs ${msg.senderId === user.uid ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                <p>{msg.text}</p>
                                                <p className="text-xs mt-1 text-right opacity-75">
                                                    {new Date(msg.createdAt?.toDate()).toLocaleTimeString()}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full text-gray-500 italic">
                                        <p>Start a new conversation.</p>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                        className="flex-1 px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button type="submit" className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-500 italic">
                            <p>Select a chat from the sidebar.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Messages;
