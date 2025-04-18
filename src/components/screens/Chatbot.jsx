import React, { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi'; 
import { formatQueryForChart } from '../../utils/formatedQuery'; 
import Charts from './Charts';
import Input from "@/components/daisyui/Input/Input";

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null); // Reference for scrolling to the bottom
  const [loading, setLoading] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (input.trim() !== '') {
      const userMessage = { type: 'user', text: input };
      setMessages((prevMessages) => [...prevMessages, userMessage]);
      setInput('');
      setLoading(true);
  
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL;
        const token = localStorage.getItem('sb-access-token');
        const response = await fetch(`${baseUrl}/execute_langflow_api`, {
          method: 'POST',
          headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ input_text: input }),
        });
  
        if (!response.ok) {
          throw new Error(`Server Error: ${response.status} ${response.statusText}`);
        }
  
        const textResponse = await response.text();
        console.log("Raw response received:", textResponse);
  
        let botMessage;
  
        const isJsonResponse = (str) => {
          try {
            const parsedData = JSON.parse(str);
            return parsedData && typeof parsedData === 'object' ? parsedData : null;
          } catch (e) {
            return null;
          }
        };
  
        const data = isJsonResponse(textResponse);
  
        if (data && data.message) {
          console.log("Parsed JSON message:", data.message);
  
          // Format as a chart only if it's valid structured data
          const formattedQuery = formatQueryForChart(data.message);
          botMessage = formattedQuery
            ? { type: 'bot', query: formattedQuery } // Chart response
            : { type: 'bot', text: data.message };  // Plain text response
        } else {
          console.warn("Plain text response detected, displaying as-is.");
          botMessage = { type: 'bot', text: textResponse }; // Display raw text
        }
  
        setMessages((prevMessages) => [...prevMessages, botMessage]);
      } catch (error) {
        console.error('Error sending message to chatbot:', error);
  
        let errorMessage = "Uh oh, something went wrong. I have let my devs know.";
  
        if (error.message.includes("Failed to fetch") || error.message.includes("NetworkError")) {
          errorMessage = "Oops! Unable to connect to the chatbot. Please check your connection or try again later.";
        } else if (error.message.toLowerCase().includes("cors")) {
          errorMessage = "Oops! I ran into an issue. I need to inform our devs.";
        } else if (error.message.startsWith("Server Error")) {
          errorMessage = "The chatbot service is currently unavailable. Please try again later.";
        }
  
        setMessages((prevMessages) => [...prevMessages, { type: 'bot', text: errorMessage }]);
      } finally {
        setLoading(false);
      }
    }
  };
  
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="bg-white shadow-lg rounded-lg flex flex-col justify-between mx-auto mt-4 border border-gray-200 w-1/2 h-[80vh] p-4">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto">
        {messages.map((message, index) => {
          if (message.type === 'bot' && !message.query && (!message.text || message.text.trim() === '')) {
            return null; // Ignore empty bot messages
          }
  
          return (
            <div
              key={index}
              className={`flex items-start mb-4 ${message.type === 'bot' ? 'flex-row' : 'flex-row-reverse'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 text-sm rounded-lg shadow-md ${
                  message.type === 'bot' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}
              >
                {/* Display user's message */}
                {message.type === 'user' && <div>{message.text}</div>}
  
                {/* Display bot's response: Text or Chart */}
                {message.type === 'bot' && message.text && message.text.trim() !== '' && <div>{message.text}</div>}
                {message.type === 'bot' && message.query && (
                  <Charts
                    query={message.query.query}
                    pivotConfig={message.query.pivotConfig}
                    chartType={message.query.chartType}
                  />
                )}
              </div>
            </div>
          );
        })}
        {loading && (
          <div className="flex items-start mb-4">
            <div className="max-w-[70%] px-4 py-2 text-sm rounded-lg shadow-md bg-blue-100 text-blue-800">
              Typing...
            </div>
          </div>
        )}
  
        <div ref={messagesEndRef} />
      </div>
  
      {/* Input Box */}
      <div className="flex items-center border-t border-gray-200 p-2">
        <Input
          className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          placeholder="Enter your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={loading}
        />
        <button
          onClick={handleSendMessage}
          disabled={loading || input.trim() === ''}
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FiSend size={20} />
        </button>
      </div>
    </div>
  );
  
};

export default Chatbot;
