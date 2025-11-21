const chatbox = document.getElementById("chatbox");

// ---- Conversation memory (RAM + localStorage) ----
let conversation = [];

// Load stored conversation history (for context)
if (localStorage.getItem("conversationMemory")) {
    conversation = JSON.parse(localStorage.getItem("conversationMemory"));
}

// ------------ Load Chat History UI ------------
if (localStorage.getItem("chatHistory")) {
    chatbox.innerHTML = localStorage.getItem("chatHistory");
    chatbox.scrollTop = chatbox.scrollHeight;
}

// ------------ Add Message + Save ------------
function addMessage(role, text) {
    const div = document.createElement("div");
    div.classList.add("message");

    if (role === "You") div.classList.add("user-message");
    else div.classList.add("ai-message");

    div.innerHTML = `<b>${role}:</b> ${text}`;
    chatbox.appendChild(div);

    // Save UI history
    localStorage.setItem("chatHistory", chatbox.innerHTML);

    chatbox.scrollTop = chatbox.scrollHeight;
}

// ------------ Typing Indicator ------------
function showTyping() {
    const typingDiv = document.createElement("div");
    typingDiv.id = "typing";
    typingDiv.classList.add("message", "ai-message", "typing");
    typingDiv.innerHTML = "AI is typing...";
    chatbox.appendChild(typingDiv);
    chatbox.scrollTop = chatbox.scrollHeight;
}

function removeTyping() {
    const typingDiv = document.getElementById("typing");
    if (typingDiv) typingDiv.remove();
}

// ------------ Send Message ------------
document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("userInput").addEventListener("keypress", e => {
    if (e.key === "Enter") sendMessage();
});
async function sendMessage() {
    const input = document.getElementById("userInput");
    const message = input.value.trim();
    if (!message) return;

    addMessage("You", message);
    input.value = "";

    // Add user message to conversation memory
    conversation.push({ role: "You", content: message });
    localStorage.setItem("conversationMemory", JSON.stringify(conversation));

    showTyping();

    // Build context prompt string
    let contextPrompt = "You are an AI assistant. Always respond in **bullet points** or numbered points if appropriate, with short and clear sentences.\n\n";

    conversation.forEach(msg => {
        contextPrompt += `${msg.role}: ${msg.content}\n`;
    });

    try {
        const response = await puter.ai.chat(contextPrompt, {
            model: "gpt-5-nano"
        });

        removeTyping();

        addMessage("AI", response);

        // Add AI response to conversation memory
        conversation.push({ role: "AI", content: response });
        localStorage.setItem("conversationMemory", JSON.stringify(conversation));
    } catch (err) {
        removeTyping();
        addMessage("AI", "❌ Error: Could not get a response. Try again.");
        console.error(err);
    }
}


// ------------ Dark Mode ------------
const toggleBtn = document.getElementById("toggleDark");

toggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    toggleBtn.textContent =
        document.body.classList.contains("dark") ? "Light Mode" : "Dark Mode";

    localStorage.setItem("theme",
        document.body.classList.contains("dark") ? "dark" : "light"
    );
});

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
    document.body.classList.add("dark");
    toggleBtn.textContent = "Light Mode";
}

// ------------ Clear Chat Button ------------
document.getElementById("clearChatBtn").addEventListener("click", () => {
    chatbox.innerHTML = "";                 
    conversation = [];                      
    localStorage.removeItem("chatHistory"); 
    localStorage.removeItem("conversationMemory");
});

