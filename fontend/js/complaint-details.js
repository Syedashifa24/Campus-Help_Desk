// Sample complaint details
const complaints = {
    CHD001: {
        title: "Wi-Fi not working",
        status: "Pending",
        category: "Network",
        priority: "High",
        date: "20 Nov 2026",
        location: "Block A, Room 204",
        description: "The Wi-Fi connection in our classroom is not working properly. Students are unable to access the internet for academic activities.",
        attachment: "No attachment"
    },

    CHD002: {
        title: "Projector issue",
        status: "In Progress",
        category: "Classroom",
        priority: "Medium",
        date: "19 Nov 2026",
        location: "Block B, Room 105",
        description: "The classroom projector is not displaying the presentation properly. It needs to be checked and repaired.",
        attachment: "No attachment"
    },

    CHD003: {
        title: "Water leakage",
        status: "Resolved",
        category: "Maintenance",
        priority: "Low",
        date: "17 Nov 2026",
        location: "Block C, Washroom",
        description: "There was water leakage in the washroom. The maintenance team has completed the repair.",
        attachment: "No attachment"
    }
};

// Get complaint ID from the URL
const params = new URLSearchParams(window.location.search);
const complaintId = params.get("id") || "CHD001";

const complaint = complaints[complaintId];

// Display complaint details
if (complaint) {
    document.getElementById("complaintId").textContent = complaintId;
    document.getElementById("complaintTitle").textContent = complaint.title;
    document.getElementById("complaintStatus").textContent = complaint.status;
    document.getElementById("category").textContent = complaint.category;
    document.getElementById("priority").textContent = complaint.priority;
    document.getElementById("date").textContent = complaint.date;
    document.getElementById("location").textContent = complaint.location;
    document.getElementById("description").textContent = complaint.description;
    document.getElementById("attachmentText").textContent = complaint.attachment;

    updateTimeline(complaint.status);
} else {
    document.getElementById("complaintTitle").textContent =
        "Complaint not found";

    document.getElementById("complaintId").textContent = complaintId;
}

// Update complaint progress timeline
function updateTimeline(status) {
    const steps = document.querySelectorAll("#timeline .timeline-item");

    let currentStep = 1;

    if (status === "In Progress") {
        currentStep = 2;
    } else if (status === "Resolved") {
        currentStep = 3;
    }

    steps.forEach((step, index) => {
        step.classList.remove("completed", "current");

        if (index < currentStep) {
            step.classList.add("completed");
        } else if (index === currentStep) {
            step.classList.add("current");
        }
    });
}

console.log("Complaint Details page loaded successfully!");