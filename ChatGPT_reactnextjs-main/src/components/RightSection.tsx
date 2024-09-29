"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from '@/styles/RightSection.module.css';
import chatgptlogo2 from '@/assets/chatgptlogo2.png';
import nouserlogo from '@/assets/nouserlogo.png';
import Image from 'next/image';
import Image02 from '../assets/chatgptlogo2.png';
import { HashLoader } from 'react-spinners';
import { marked } from 'marked'; // For parsing markdown
import DOMPurify from 'dompurify'; // For sanitizing HTML

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

  const [message, setMessage] = useState<string>(''); // Ensure message is of type string
  const [isSent, setIsSent] = useState<boolean>(true);
  const [allMessages, setAllMessages] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const sendMessage = async () => {
    if (!message.trim()) return;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=` + API_KEY;

    const messagesToSend = [
      ...trainingPrompt,
      ...allMessages,
      { "role": "user", "parts": [{ "text": message }] }
    ];

    setIsSent(false);

    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ "contents": messagesToSend })
      });

      const resjson = await res.json();
      setIsSent(true);

      if (!res.ok) throw new Error(resjson.error || "Failed to get response from AI");

      const responseMessage = resjson.candidates[0].content.parts[0].text;

      const newAllMessages = [
        ...allMessages,
        { "role": "user", "parts": [{ "text": message }] },
        { "role": "model", "parts": [{ "text": responseMessage }] }
      ];

      // Await the saveMessage to ensure it resolves
      await saveMessage('user', message);
      await saveMessage('model', responseMessage);

      setAllMessages(newAllMessages);
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      setIsSent(true);
    }
  };

  const saveMessage = async (role: string, text: string): Promise<void> => {
    const response = await fetch('http://localhost:5000/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, text })
    });

    if (!response.ok) {
      const errorMsg = await response.json();
      console.error('Error saving message:', errorMsg);
    }
  };

  // Ensure the function receives only a string and returns a string
  const sanitizeAndRenderMessage = (message: string): string => {
    const rawHTML: string = marked(message); // Parse markdown to HTML
    return DOMPurify.sanitize(rawHTML); // Sanitize HTML for safe rendering
  };

  // Scroll to the bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allMessages]);

  return (
    <div className={styles.rightSection}>
      <div className={styles.rightin}>
        <div className={styles.chatgptversion}>
          <p className={styles.text1}>Chat</p>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.arrowIcon}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </div>

        {allMessages.length > 0 ? (
          <div className={styles.messages}>
            {allMessages.map((msg, index) => (
              <div key={index} className={`${styles.message} ${msg.role === 'user' ? styles.userMessage : styles.modelMessage}`}>
                <Image src={msg.role === 'user' ? nouserlogo : chatgptlogo2} width={50} height={50} alt="" />
                <div className={styles.details}>
                  <h2>{msg.role === 'user' ? 'You' : 'TECH-E'}</h2>
                  <p dangerouslySetInnerHTML={{ __html: sanitizeAndRenderMessage(msg.parts[0].text) }}></p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className={styles.nochat}>
            <Image src={Image02} width={200} height={200} alt="Help Image" /> {/* Use Image component here */}
            <h1>How can I help you today?</h1>
          </div>
        )}

        <div className={styles.bottomsection}>
          <div className={styles.messagebar}>
            <input type='text' placeholder='Type Your Message ...'
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              className={styles.inputField}
            />
            {isSent ? (
              <svg onClick={sendMessage} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={styles.sendIcon}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
              </svg>
            ) : (
              <HashLoader color="#36d7b7" size={30} />
            )}
          </div>
          <br></br>
          <p>TECH-E can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  );
};

export default RightSection;
