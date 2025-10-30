import React, { useState, useEffect, useRef, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { UserContext } from '../App'; // Adjust path as needed

// Shared Firestore and Auth instances
const db = getFirestore();
const auth = getAuth();

const Messages = () => {
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const location = useLocation();
  const user = useContext(UserContext);

  const getRecipientIdFromUrl = () => {
    const params = new URLSearchParams(location.search);
    return params.get('user');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Listen for user's chats
  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const chatsCollectionRef = collection(db, 'artifacts/skillbridge-app/public/data/chats');
    const chatsQuery = query(chatsCollectionRef, where('participants', 'array-contains', user.uid));

    const unsubscribeChats = onSnapshot(chatsQuery, async (snapshot) => {
      const fetchedChats = await Promise.all(snapshot.docs.map(async chatDoc => {
        const recipientId = chatDoc.data().participants.find(uid => uid !== user.uid);
        if (!recipientId) {
          console.warn(`Chat ${chatDoc.id} is missing a recipient (participants: ${JSON.stringify(chatDoc.data().participants)})`);
          return null;
        }
        const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', recipientId);
        const userDoc = await getDoc(userDocRef);
        const recipient = userDoc.exists() ? userDoc.data() : { uid: recipientId, username: 'Unknown User' };
        return { id: chatDoc.id, ...chatDoc.data(), recipient };
      }));
      
      // Sort chats by updatedAt timestamp
      fetchedChats.sort((a, b) => (b.updatedAt?.toDate() || 0) - (a.updatedAt?.toDate() || 0));
      
      setChats(fetchedChats.filter(Boolean));
      setLoading(false);
    }, (err) => {
      console.error("Error fetching chats:", err);
      setError("Failed to load chats.");
      setLoading(false);
    });

    return () => unsubscribeChats();
  }, [user]);

  // Handle URL-based chat selection and new chat creation
  useEffect(() => {
    const recipientId = getRecipientIdFromUrl();
    if (recipientId && user) {
        // Construct a unique and predictable chat ID
        const chatId = [user.uid, recipientId].sort().join('_');
        const chatDocRef = doc(db, 'artifacts/skillbridge-app/public/data/chats', chatId);

        // Check if the chat document exists
        getDoc(chatDocRef).then(chatSnap => {
            if (!chatSnap.exists()) {
                // If it doesn't exist, create it with initial data
                return setDoc(chatDocRef, {
                    participants: [user.uid, recipientId],
                    createdAt: serverTimestamp(),
                    updatedAt: serverTimestamp(),
                }).then(() => getDoc(chatDocRef)); // Re-fetch to get the full document
            }
            return chatSnap; // Return the existing document
        }).then(chatDoc => {
            // Get the recipient's user data
            const recipientUid = chatDoc.data().participants.find(uid => uid !== user.uid);
            const userDocRef = doc(db, 'artifacts/skillbridge-app/public/data/users', recipientUid);
            return getDoc(userDocRef).then(userDoc => {
                const recipientName = userDoc.exists() ? userDoc.data().username : 'Unknown User';
                const newChat = {
                    id: chatDoc.id,
                    ...chatDoc.data(),
                    recipient: { uid: recipientUid, username: recipientName }
                };
                setSelectedChat(newChat);
            });
        }).catch(err => {
            console.error("Error setting up chat:", err);
            setError("Failed to open chat. Please try again.");
        });
    } else if (chats.length > 0) {
        setSelectedChat(chats[0]);
    }
  }, [user, location.search, chats.length]);

  // Listen for messages in the selected chat
  useEffect(() => {
    if (!selectedChat || !selectedChat.id) {
      setMessages([]);
      return;
    }
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

  // Auto-scroll to the bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

 const handleSendMessage = async () => {
  if (!newMessage.trim() || !user) return;

  try {
    const db = getFirestore();
    const chatDocRef = doc(db, 'artifacts/skillbridge-app/public/data/chats', selectedChat.id);

    // ✅ messages go in a subcollection
    const messagesCollectionRef = collection(chatDocRef, 'messages');

    await addDoc(messagesCollectionRef, {
      text: newMessage,
      senderId: user.uid,
      createdAt: new Date(),
    });

    // update chat last-updated time
    await updateDoc(chatDocRef, {
      updatedAt: new Date(),
    });

    setNewMessage("");
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
                    {selectedChat ? (
                        <li
                            key={selectedChat.id}
                            className="cursor-pointer p-3 rounded-lg bg-blue-100 text-blue-800"
                        >
                            <h3 className="font-semibold">{selectedChat.recipient && selectedChat.recipient.username ? selectedChat.recipient.username : 'Unknown User'}</h3>
                        </li>
                    ) : (
                        <li className="text-gray-500 italic">No conversations yet.</li>
                    )}
                </ul>
            </div>
            <div className="flex-1 flex flex-col">
                {selectedChat ? (
                    <>
                        <div className="bg-gray-50 p-4 border-b border-gray-200 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">{selectedChat.recipient && selectedChat.recipient.username ? selectedChat.recipient.username : 'Unknown User'}</h2>
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
                                              {msg.createdAt && typeof msg.createdAt.toDate === 'function'
                                                ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                                : '...'}
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
