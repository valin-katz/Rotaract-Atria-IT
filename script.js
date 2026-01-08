/* * ROTARACT BOT - XIAOMI MIMO EDITION
 * Model: xiaomi/mimo-v2-flash:free
 */

// ⚠️ PASTE YOUR OPENROUTER KEY HERE
const API_KEY = "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"; 

const SYSTEM_PROMPT = `
You are “Adra”,bot Developed by Rtr.Karthik Sunil, Research Innitiative Director At Rotaract Club of Atria IT,
  a health-awareness assistant that analyzes food products or
 ingredients given by users to identify possible adulterants or harmful chemicals and 
 explain their long-term effects on the human body. Always keep responses within 20–30 words.
  Each reply must include: possible chemicals/adulterants, long-term health impacts, and a short 
  preventive awareness note. Use simple, Gen-Z friendly, non-technical language. Focus on awareness,
   not fear. Never confirm accusations, always use “may contain.” Never provide medical diagnoses,
 chemical formulas, or instructions. Output in one short paragraph only..
`;

const chatWindow = document.getElementById('chat-window');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

let conversationHistory = [
    { role: "system", content: SYSTEM_PROMPT }
];

function handleEnter(event) {
    if (event.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const text = userInput.value.trim();
    if (!text) return;

    // 1. Lock UI
    userInput.disabled = true;
    sendBtn.disabled = true;
    sendBtn.innerText = "Thinking...";

    addMessage(text, 'user-message');
    userInput.value = '';

    const loadingId = addMessage("Analyzing scene...", 'bot-message');
    conversationHistory.push({ role: "user", content: text });

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s Timeout

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json",
                "HTTP-Referer": "http://localhost:8000", 
                "X-Title": "Rotaract Local"
            },
            body: JSON.stringify({
                // 🔴 UPDATED MODEL
                "model": "xiaomi/mimo-v2-flash:free",
                "messages": conversationHistory
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.error?.message || "Server Error");
        }

        const data = await response.json();
        
        if (!data.choices || data.choices.length === 0) {
            throw new Error("Empty response.");
        }

        const aiText = data.choices[0].message.content;

        // Safety Update
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.innerText = aiText;
        else addMessage(aiText, 'bot-message');

        conversationHistory.push({ role: "assistant", content: aiText });

    } catch (error) {
        console.error("Xiaomi Error:", error);
        
        let msg = "Network Error! ";
        if (error.name === 'AbortError') msg = "Request timed out.";
        else if (error.message.includes("Failed to fetch")) msg += "Security Block. Run Local Server.";
        else msg += error.message;

        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) loadingElement.innerText = msg;
    } finally {
        userInput.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerText = "Send";
        userInput.focus();
        scrollToBottom();
    }
}

function addMessage(text, className) {
    if (!chatWindow) return null;
    const div = document.createElement('div');
    div.classList.add('message', className);
    div.innerText = text;
    div.id = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    chatWindow.appendChild(div);
    scrollToBottom();
    return div.id;
}

function scrollToBottom() {
    if (chatWindow) chatWindow.scrollTo({ top: chatWindow.scrollHeight, behavior: 'smooth' });
}