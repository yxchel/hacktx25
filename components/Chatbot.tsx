
import { GoogleGenAI, Chat } from '@google/genai';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BotMessageSquareIcon, SendIcon, XIcon, SparklesIcon } from './icons';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initializeChat = useCallback(() => {
    if (process.env.API_KEY) {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      chatRef.current = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are 'Cosmo', a friendly and knowledgeable chatbot assistant for Toyota Stellar Finance. Your goal is to answer questions about Toyota vehicles, financing, leasing, and general car-buying advice. Keep your answers helpful, concise, and in a slightly futuristic, encouraging tone. Do not answer questions unrelated to cars or finance. Format your responses with markdown for readability.`
        },
      });
      setMessages([
        { sender: 'bot', text: "Hello! I'm Cosmo, your guide to the universe of Toyota finance. How can I help you today?" },
      ]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isOpen && !chatRef.current) {
        initializeChat();
    }
  }, [isOpen, initializeChat]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      if (!chatRef.current) {
        throw new Error("Chat not initialized");
      }
      
      const stream = await chatRef.current.sendMessageStream({ message: input });
      
      let botResponse = '';
      setMessages(prev => [...prev, { sender: 'bot', text: '' }]);
      
      for await (const chunk of stream) {
        botResponse += chunk.text;
        setMessages(prev => {
            const newMessages = [...prev];
            newMessages[newMessages.length - 1].text = botResponse;
            return newMessages;
        });
      }

    } catch (error) {
      console.error('Chatbot error:', error);
      setMessages((prev) => [...prev, { sender: 'bot', text: 'An error occurred in the cosmos. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-indigo-500"
        aria-label="Toggle Chatbot"
      >
        {isOpen ? <XIcon className="w-8 h-8" /> : <BotMessageSquareIcon className="w-8 h-8" />}
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[90vw] max-w-md h-[70vh] max-h-[600px] bg-slate-900/80 backdrop-blur-xl border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          <header className="flex items-center justify-between p-4 border-b border-slate-700">
            <div className="flex items-center">
              <SparklesIcon className="w-6 h-6 text-indigo-400 mr-2" />
              <h3 className="font-bold text-lg text-white">Stellar Finance Assistant</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
              <XIcon className="w-6 h-6" />
            </button>
          </header>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex items-end gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.sender === 'bot' && <BotMessageSquareIcon className="w-8 h-8 p-1.5 bg-indigo-600 text-white rounded-full flex-shrink-0"/>}
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-700 text-slate-200 rounded-bl-none'}`}>
                   <div className="prose prose-sm prose-invert" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br />') }} />
                   {isLoading && msg.sender === 'bot' && index === messages.length -1 && <div className="typing-indicator"><span>.</span><span>.</span><span>.</span></div>}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700 flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about financing..."
              className="flex-1 bg-slate-800 border border-slate-600 rounded-full py-2 px-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading || !input.trim()} className="ml-2 bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors">
              <SendIcon className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
      <style>{`
        .animate-fade-in-up {
          animation: fadeInUp 0.3s ease-out forwards;
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .prose a { color: #818cf8; }
        .prose ul { padding-left: 1.25rem; }
        .prose li::marker { color: #818cf8; }
        .typing-indicator span {
            animation-name: blink;
            animation-duration: 1.4s;
            animation-iteration-count: infinite;
            animation-fill-mode: both;
            margin: 0 1px;
        }
        .typing-indicator span:nth-child(2) { animation-delay: .2s; }
        .typing-indicator span:nth-child(3) { animation-delay: .4s; }
        @keyframes blink {
            0% { opacity: .2; }
            20% { opacity: 1; }
            100% { opacity: .2; }
        }
      `}</style>
    </>
  );
};

export default Chatbot;
