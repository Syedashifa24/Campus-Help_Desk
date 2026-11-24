const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");
const sendBtn = document.getElementById("sendBtn");

// Display messages
function addMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = "message " + sender + "-message";

    const content = document.createElement("div");
    content.className = "message-content";

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    const time = document.createElement("span");
    time.className = "message-time";
    time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    content.appendChild(paragraph);
    content.appendChild(time);

    if (sender === "bot") {
        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = "AI";

        messageDiv.appendChild(avatar);
    }

    messageDiv.appendChild(content);
    chatArea.appendChild(messageDiv);

    chatArea.scrollTop = chatArea.scrollHeight;
}

// Generate chatbot response
function getBotResponse(question) {

    const text = question.toLowerCase().trim();

    if (/\b(hi|hello|hey)\b/.test(text)) {
        return "Hello! Welcome to Campus Help Desk. How can I assist you?";
    }

    if (/\b(raise|submit|register|file)\b/.test(text) &&
        /\b(complaint|issue|problem|request)\b/.test(text)) {
        return "To raise a complaint, open your Student Dashboard and click Raise Complaint. Enter the title, category, priority, location and description, then submit the form.";
    }

    if (/\b(status|track|progress)\b/.test(text)) {
        return "Open My Complaints from your Student Dashboard. You can view your complaint status and click View to check its details.";
    }

    if (/\b(wifi|internet|network)\b/.test(text)) {
        return "For Wi-Fi or internet problems, raise a complaint under the Network category. Mention your block, room number and issue clearly.";
    }

    if (/\b(water|plumbing|leakage|tap)\b/.test(text)) {
        return "For water leakage or plumbing problems, raise a complaint under Maintenance and mention the exact location.";
    }

    if (/\b(electricity|electrical|light|fan|power)\b/.test(text)) {
        return "For electrical problems such as lights, fans or power supply, select Maintenance and describe the issue and location.";
    }

    if (/\b(classroom|projector|laboratory|lab)\b/.test(text)) {
        return "For classroom or laboratory problems, select the appropriate category and mention the classroom or lab number.";
    }

    if (/\b(lost|found|missing)\b/.test(text)) {
        return "For lost and found items, raise a complaint under the Lost and Found category. Include the item's description and location.";
    }

    if (/\b(pending|resolved|in progress)\b/.test(text)) {
        return "Pending means your complaint is waiting for action. In Progress means it is being handled. Resolved means the issue has been addressed.";
    }

    if (/\b(priority|urgent|emergency)\b/.test(text)) {
        return "Choose the priority according to the seriousness of your issue. Use High for urgent problems and Low for minor issues.";
    }

    if (/\b(contact|admin|support|help)\b/.test(text)) {
        return "You can submit your issue through Campus Help Desk. The administrator or help-desk staff will review and handle your request.";
    }

    if (/\b(thank|thanks)\b/.test(text)) {
        return "You're welcome! Happy to help. Have a great day!";
    }

    if (/\b(bye|goodbye)\b/.test(text)) {
        return "Goodbye! Thank you for using Campus Help Desk.";
    }

    return "Sorry, I couldn't understand your question. You can ask me about raising complaints, checking status, Wi-Fi, electricity, classrooms, maintenance or lost and found.";
}

// Send message
function sendMessage() {

    const message = userInput.value.trim();

    if (message === "") {
        return;
    }

    addMessage(message, "user");
    userInput.value = "";
    userInput.focus();

    sendBtn.disabled = true;

    setTimeout(function () {
        const response = getBotResponse(message);
        addMessage(response, "bot");
        sendBtn.disabled = false;
    }, 400);
}

// Suggested questions
function sendSuggestion(question) {
    userInput.value = question;
    sendMessage();
}

// Enter key support
userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

console.log("Campus Help Desk Chatbot loaded successfully!");