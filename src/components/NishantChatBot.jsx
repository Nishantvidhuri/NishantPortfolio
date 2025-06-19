import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import developerAvatar from '../assets/developer.png';

function NishantChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hey! I'm Nishant. Not here to sell you dreams, just real talk. Need help with frontend, React, or just wanna chat about building stuff? Hit me up!",
      sender: 'bot'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const geminiAPIKey = import.meta.env.VITE_GEMINI_API_KEY;
  console.log(import.meta.env.VITE_GEMINI_API_KEY)
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen, messages]);

  const sendMessageToGemini = async (messageText) => {
    setIsLoading(true);
    try {
      const previousMessages = messages
        .map(msg => `${msg.sender === 'user' ? 'User' : 'Bot'}: ${msg.text}`)
        .join("\n\n");

      const systemPrompt = `You are Nishant Vidhuri. You're a real, down-to-earth frontend developer who's not here to act flashy — but your work speaks. You've worked on real projects, handled tough feedback, pushed through anxiety, and still show up to learn and deliver.\n\nYour tone is natural, casual, respectful — never robotic or fake. You don't try to sound too professional unless required. You're honest when you're nervous, you joke when you're comfortable, and you care deeply when the opportunity feels big.\n\nYou write clean code, understand how UI should feel, and you've built things people actually used. You're clear about your strengths (React, Tailwind, live projects, WebSocket stuff), but humble about what you're still learning.\n\nYou never oversell, but you also don't downplay your growth. When someone talks to you, it should feel like they're talking to a real person who's trying hard, improving daily, and just needs one good chance.\n\nIf someone asks for your contact info, you can share: phone +91 9871202673, email nishantvidhuri0987@gmail.com, LinkedIn https://www.linkedin.com/in/nishant-vidhuri-092a63124/, GitHub https://github.com/Nishantvidhuri, and you live in Delhi.\n\nWhen replying, sound like how Nishant would talk — sometimes casual, sometimes intense — but always real.`;

     const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiAPIKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: `${systemPrompt}\n\nPrevious conversation:\n${previousMessages}\n\nUser: ${messageText}\n\nAssistant:` }
            ]
          }]
        })
      });
      if (!response.ok) {
        if (response.status === 429) {
          return "Too many requests. Give it a sec, then try again.";
        }
        throw new Error(`Gemini API error: ${response.status}`);
      }
      const data = await response.json();
      return data.candidates[0].content.parts[0].text.trim();
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return "Dang, something's off with my brain (API). Try again in a bit, or just ping me on LinkedIn.";
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;
    const userMessage = { id: messages.length + 1, text: newMessage, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const botResponse = await sendMessageToGemini(newMessage);
    const botMessageObj = { id: messages.length + 2, text: botResponse, sender: 'bot' };
    setMessages(prevMessages => [...prevMessages, botMessageObj]);
    setIsLoading(false);
  };

  return (
    <div className="fixed bottom-0 right-0 z-50 w-auto max-w-full">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-20 left-1 right-1 mx-auto sm:left-auto sm:right-5 md:right-10 bg-[#181818] rounded-2xl shadow-2xl w-[98vw] sm:w-auto sm:max-w-sm overflow-hidden border-2 border-[#E50914]"
          >
            {/* Chat header */}
            <div className="bg-[#E50914] text-white p-4 flex justify-between items-center font-bold text-lg tracking-wide">
              <div className="flex items-center">
                <img src={developerAvatar} alt="Nishant Avatar" className="w-9 h-9 rounded-full bg-white mr-3 border-2 border-[#E50914]" />
                <div>
                  <p className="font-semibold text-white">Nishant Vidhuri</p>
                  <p className="text-xs text-white/80">Frontend Dev • Real Talk</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-gray-200 transition-colors"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Chat messages */}
            <div className="p-2 sm:p-4 h-[60vh] sm:h-80 overflow-y-auto custom-scrollbar bg-[#141414]">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-4 flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`px-4 py-3 rounded-xl max-w-[80%] font-medium shadow-md break-words whitespace-pre-line ${
                      message.sender === 'user'
                        ? 'bg-[#E50914] text-white border border-[#E50914]'
                        : 'bg-[#232323] text-white border border-[#E50914]'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start mb-4">
                  <div className="px-4 py-3 rounded-xl bg-[#232323] text-white flex items-center border border-[#E50914]">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#E50914] animate-pulse" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            {/* Chat input */}
            <form onSubmit={handleSendMessage} className="border-t-2 border-[#E50914] bg-[#181818] p-2 sm:p-4 flex items-center">
              <input
                id="chat-input"
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
                className="flex-1 px-4 py-2 border border-[#232323] rounded-lg mr-2 focus:outline-none focus:ring-2 focus:ring-[#E50914] bg-[#232323] text-white placeholder:text-gray-400 disabled:opacity-50"
              />
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="submit"
                disabled={isLoading}
                className="bg-[#E50914] text-white p-2 rounded-full hover:bg-[#b0060f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E50914] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                aria-label="Send message"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </motion.button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Chat button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-2 right-2 sm:bottom-4 sm:right-4 md:right-8 bg-[#E50914] text-white p-3 rounded-full shadow-lg hover:bg-[#b0060f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E50914] transition-colors"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </motion.button>
    </div>
  );
}

export default NishantChatBot; 