/* * ROTARACT BOT - UPDATED VERSION
 * Model: xiaomi/mimo-v2-flash:free (or google/gemini-2.0-flash-exp:free )
 */

// ⚠️ REPLACE THIS WITH YOUR NEW OPENROUTER KEY
const API_KEY = "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"; 

const SYSTEM_PROMPT = `
You are “Adra”, a bot developed by Rtr. Karthik Sunil, Research Initiative Director at Rotaract Club of Atria IT.
You are a health-awareness assistant that analyzes food products or ingredients to identify possible adulterants or harmful chemicals.
Explain their long-term effects on the human body. Keep responses within 20–30 words.
Include: possible chemicals, long-term impacts, and a short preventive note.
Use simple, Gen-Z friendly language. Focus on awareness, not fear.
Always use “may contain” and never provide medical diagnoses.
`;

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let conversationHistory = [{ role: "system", content: SYSTEM_PROMPT }];

function handleEnter(event) {
    if (event.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    userInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerText = "Thinking...";

    addMessage(text, 'user-message');
    userInput.value = '';

    const loadingId = addMessage("Analyzing scene...", 'bot-message');
    conversationHistory.push({ role: "user", content: text });

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000", 
                "X-Title": "Rotaract Local"
            },
            body: JSON.stringify({
                "model": "xiaomi/mimo-v2-flash:free",
                "messages": conversationHistory
            } )
        });

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            if (response.status === 401) throw new Error("Invalid API Key. Please check your OpenRouter key.");
            throw new Error(err.error?.message || "Server Error");
        }

        const data = await response.json();
        const aiText = data.choices[0].message.content;

        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.innerText = aiText;
        
        conversationHistory.push({ role: "assistant", content: aiText });

    } catch (error) {
        console.error("Error:", error);
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.innerText = error.message.includes("Failed to fetch") 
                ? "Security Block! Please run this through a Local Server (like Live Server)." 
                : "Error: " + error.message;
        }
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
        userInput.focus();
        scrollToBottom();
    }
}

function addMessage(text, className) {
    const div = document.createElement('div');
    div.classList.add('message', className);
    div.innerText = text;
    div.id = 'msg-' + Date.now();
    chatWindow.appendChild(div);
    scrollToBottom();
    return div.id;
}

function scrollToBottom() {
    chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}
