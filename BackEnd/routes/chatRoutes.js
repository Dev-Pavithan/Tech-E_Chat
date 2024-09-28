import express from 'express';
import Chat from '../models/chat.js'; // Adjust this path based on your project structure

const router = express.Router();

// Fetch chats
router.get('/chats', async (req, res) => {
    try {
        const chats = await Chat.find(); // Fetch all chats from MongoDB
        res.json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ error: 'Failed to fetch chats' });
    }
});

// Send a chat message
router.post('/chat', async (req, res) => {
    const { contents } = req.body; // Make sure 'contents' is sent as an array
    if (!Array.isArray(contents) || contents.length === 0) {
        return res.status(400).json({ error: "Invalid request. 'contents' should be an array." });
    }

    try {
        // Handle message logic (e.g., save to DB, process with AI, etc.)
        // Simulated AI response for demonstration
        const responseMessage = { candidates: [{ content: { parts: [{ text: "This is a simulated response." }] } }] };
        res.json(responseMessage);
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

export default router;
