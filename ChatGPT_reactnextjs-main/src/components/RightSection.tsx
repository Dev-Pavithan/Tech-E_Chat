"use client";
import React, { useState } from 'react';
import styles from '@/styles/RightSection.module.css';
import chatgptlogo2 from '@/assets/chatgptlogo2.png';
import nouserlogo from '@/assets/nouserlogo.png';
import Image from 'next/image';
import { HashLoader } from 'react-spinners';
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API;

const RightSection: React.FC = () => {
  const trainingPrompt = [
    {
      "role": "user",
      "parts": [{ "text": "This is Introductory dialogue for any prompt: 'Hello, my dear friend, I am the Tech-E. I will be happy to help you.'" }]
    },
    {
      "role": "model",
      "parts": [{ "text": "okay" }]
    }
  ];

  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(true);
  const [allMessages, setAllMessages] = useState<any[]>([]);

  const sendMessage = async () => {
    if (!message.trim()) return; // Prevent sending empty messages

    let url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=` + API_KEY;

    let messagesToSend = [
      ...trainingPrompt,
      ...allMessages,
      {
        "role": "user",
        "parts": [{ "text": message }]
      }
    ];

    setIsSent(false);

    try {
      // Send request to AI model
      let res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "contents": messagesToSend })
      });

      let resjson = await res.json();
      setIsSent(true);
      
      if (!res.ok) throw new Error(resjson.error || "Failed to get response from AI");

      let responseMessage = resjson.candidates[0].content.parts[0].text;

      let newAllMessages = [
        ...allMessages,
        {
          "role": "user",
          "parts": [{ "text": message }]
        },
        {
          "role": "model",
          "parts": [{ "text": responseMessage }]
        }
      ];

      // Save both user message and AI response to backend
      const saveMessage = async (role: string, text: string): Promise<void> => {
        const response = await fetch('http://localhost:5000/api/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ role, text })
        });
        if (!response.ok) {
          const errorMsg = await response.json();
          console.error('Error saving message:', errorMsg);
        }
      };

      await saveMessage('user', message);
      await saveMessage('model', responseMessage);

      setAllMessages(newAllMessages);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSent(true); // Ensure loader is removed in case of error
    }
  };

  return (
    <div className={styles.rightSection}>
      <div className={styles.rightin}>
        <div className={styles.chatgptversion}>
          <p className={styles.text1}>Chat</p>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {allMessages.length > 0 ? (
          <div className={styles.messages}>
            {allMessages.map((msg, index) => (
              <div key={index} className={styles.message}>
                <Image src={msg.role === 'user' ? nouserlogo : chatgptlogo2} width={50} height={50} alt="" />
                <div className={styles.details}>
                  <h2>{msg.role === 'user' ? 'You' : 'TECH-E'}</h2>
                  <p>{msg.parts[0].text}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.nochat}>
            <div className={styles.s1}>
              <h1>How can I help you today?</h1>
            </div>
            <div className={styles.s2}>
              <div className={styles.suggestioncard}>
                <h2>Recommend activities</h2>
                <p>psychology behind decision-making</p>
              </div>
            </div>
          </div>
        )}

        <div className={styles.bottomsection}>
          <div className={styles.messagebar}>
            <input type='text' placeholder='Type Your Message ...'
              onChange={(e) => setMessage(e.target.value)}
              value={message}
            />
            {isSent ? (
              <svg onClick={sendMessage} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            ) : (
              <HashLoader color="#36d7b7" size={30} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RightSection;
