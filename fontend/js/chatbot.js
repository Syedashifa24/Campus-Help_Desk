const chatArea = document.getElementById("chatArea");
const userInput = document.getElementById("userInput");

// Display a message in the chat
function addMessage(message, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.classList.add("message", sender + "-message");

    const avatar = document.createElement("div");
    avatar.classList.add("message-avatar");
    avatar.textContent = sender === "bot" ? "AI" : "You";

    const content = document.createElement("div");
    content.classList.add("message-content");

    const paragraph = document.createElement("p");
    paragraph.textContent = message;

    const time = document.createElement("span");
    time.classList.add("message-time");
    time.textContent = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    });

    content.appendChild(paragraph);
    content.appendChild(time);

    if (sender === "bot") {
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(content);
    } else {
        messageDiv.appendChild(content);
    }

    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
}

// Find an answer to the student's question
function getBotResponse(question) {
    const text = question.toLowerCase();

    if (text.includes("hello") || text.includes("hi") ||
        text.includes("hey")) {
        return "Hello! Welcome to Campus Help Desk. How can I assist you?";
    }

    if (text.includes("raise") || text.includes("submit") ||
        text.includes("register complaint")) {
        return "To raise a complaint, open your Student Dashboard and click the Raise Complaint option. Enter the issue details, select a category and priority, and submit the form.";
    }

    if (text.includes("status") || text.includes("track") ||
        text.includes("check complaint")) {
        return "You can check your complaint status by opening My Complaints from your Student Dashboard. Click the View button to see the complaint details and progress.";
    }

    if (text.includes("wifi") || text.includes("internet") ||
        text.includes("network")) {
        return "For Wi-Fi or internet problems, raise a complaint under the Network category. Mention your block, room number and the issue clearly.";
    }

    if (text.includes("water") || text.includes("plumbing") ||
        text.includes("leakage")) {
        return "For water leakage or plumbing problems, submit a complaint under the Maintenance category with the exact location and issue details.";
    }

    if (text.includes("electricity") || text.includes("electrical") ||
        text.includes("light") || text.includes("fan")) {
        return "For electrical problems such as lights, fans or power supply, raise a complaint under the Maintenance category and mention the location.";
    }

    if (text.includes("classroom") || text.includes("projector") ||
        text.includes("lab")) {
        return "For classroom, projector or laboratory issues, select the appropriate category while raising your complaint. Include the room or lab number.";
    }

    if (text.includes("resolved") || text.includes("pending") ||
        text.includes("progress")) {
        return "Your complaint status can be Pending, In Progress or Resolved. Open My Complaints to check the latest status.";
    }

    if (text.includes("thank")) {
        return "You're welcome! I'm happy to help. Have a great day!";
    }

    if (text.includes("contact") || text.includes("help") ||
        text.includes("support")) {
        return "You can submit your issue through the Campus Help Desk. The help-desk staff will review and handle your request.";
    }

    return "Sorry, I couldn't understand your question. Please try asking about raising complaints, checking status, Wi-Fi issues, classroom problems or maintenance.";
}

// Send a message
function sendMessage() {
    const message = userInput.value.trim();

    if (message === "") {
        return;
    }

    addMessage(message, "user");
    userInput.value = "";

    setTimeout(function () {
        const response = getBotResponse(message);
        addMessage(response, "bot");
    }, 500);
}

// Send suggested questions
function sendSuggestion(question) {
    userInput.value = question;
    sendMessage();
}

// Send message when Enter key is pressed
userInput.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        sendMessage();
    }
});

console.log("Campus Help Desk Chatbot loaded successfully!");