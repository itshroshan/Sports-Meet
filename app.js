
const sportsCatalog = [
    { id: "E001", name: "Cricket (Men)", category: "Outdoor", dynamicTime: "May 26, 10:00 AM", venue: "Main Ground", fee: "₹500", status: "Open" },
    { id: "E002", name: "Basketball (Women)", category: "Outdoor", dynamicTime: "May 26, 02:00 PM", venue: "Court 1", fee: "₹300", status: "Open" },
    { id: "E003", name: "100m Sprint (Athletics)", category: "Track", dynamicTime: "May 27, 09:00 AM", venue: "Athletic Track", fee: "Free", status: "Closed" },
    { id: "E004", name: "Volleyball (Men)", category: "Outdoor", dynamicTime: "May 27, 11:30 AM", venue: "Court 2", fee: "₹250", status: "Open" },
    { id: "E005", name: "Chess (Universal)", category: "Indoor", dynamicTime: "May 28, 10:00 AM", venue: "Seminar Hall", fee: "Free", status: "Open" }
];


let registrations = JSON.parse(localStorage.getItem('sports_registrations')) || [];
let feedbacks = JSON.parse(localStorage.getItem('sports_feedbacks')) || [];

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setupClock();
    setupConditionalFormFields(); 
    renderPageViews();
});


function initTheme() {
    const toggleBtn = document.getElementById("themeToggle");
    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            const dark = document.documentElement.getAttribute("data-theme") === "dark";
            document.documentElement.setAttribute("data-theme", dark ? "light" : "dark");
        });
    }
}

function setupClock() {
    const container = document.getElementById("liveClock");
    if (!container) return;
    const tick = () => {
        container.textContent = new Date().toLocaleString();
    };
    tick();
    setInterval(tick, 1000); 
}

function setupConditionalFormFields() {
    const typeSelect = document.getElementById("participationType");
    const teamName = document.getElementById("teamName");
    const teamSize = document.getElementById("teamSize");

    if (typeSelect) {
        typeSelect.addEventListener("change", () => {
            const isTeam = typeSelect.value === "Team";
            teamName.disabled = !isTeam;
            teamSize.disabled = !isTeam;
            teamName.required = isTeam;
            teamSize.required = isTeam;
            if (!isTeam) {
                teamName.value = "";
                teamSize.value = "";
            }
        });
    }
}

function renderPageViews() {
    const path = window.location.pathname;

    
    if (path.includes("sports.html")) {
        renderCatalog();
        renderRegistrations();
        attachFormHandler(handleRegistrationSubmit);
    } else if (path.includes("feedback.html")) {
        renderFeedbacks();
        attachFormHandler(handleFeedbackSubmit);
    }
}

function attachFormHandler(handlerFunc) {
    const f = document.getElementById("bookingForm");
    if (f) f.addEventListener("submit", handlerFunc);
}

function renderCatalog() {
    const tbody = document.getElementById("catalogTableBody");
    if (!tbody) return;
    tbody.innerHTML = sportsCatalog.map(ev => `
        <tr>
            <td><strong>${ev.id}</strong></td>
            <td>${ev.name}</td>
            <td>${ev.category}</td>
            <td>${ev.venue}</td>
            <td>${ev.fee}</td>
            <td><span class="status-badge" style="background-color: ${ev.status === 'Open' ? 'var(--success-color)' : 'var(--danger-color)'}">${ev.status}</span></td>
        </tr>
    `).join('');
}

function renderRegistrations() {
    const tbody = document.getElementById("tableBody");
    const countSpan = document.getElementById("totalCount");
    if (!tbody) return;

    countSpan.textContent = registrations.length;
    tbody.innerHTML = registrations.map(r => `
        <tr>
            <td><strong>${r.registerNo}</strong></td>
            <td>${r.name}</td>
            <td>${r.eventName}</td>
            <td>${r.type}</td>
            <td>${r.dept}</td>
            <td><button class="btn-danger" onclick="deleteRegistration('${r.id}')">Cancel</button></td>
        </tr>
    `).join('');
}

function renderFeedbacks() {
    const tbody = document.getElementById("tableBody");
    const countSpan = document.getElementById("totalCount");
    const avgSpan = document.getElementById("avgRating");
    if (!tbody) return;

    countSpan.textContent = feedbacks.length;
    const avg = feedbacks.length ? (feedbacks.reduce((acc, curr) => acc + curr.rating, 0) / feedbacks.length).toFixed(1) : "0.0";
    avgSpan.textContent = avg;

    tbody.innerHTML = feedbacks.map(f => `
        <tr>
            <td><strong>${f.id}</strong></td>
            <td>${f.name}</td>
            <td>${f.registerNo}</td>
            <td>${f.event}</td>
            <td>⭐ ${f.rating}</td>
            <td><button class="btn-danger" onclick="deleteFeedback('${f.id}')">Remove</button></td>
        </tr>
    `).join('');
}

function handleRegistrationSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const registerNo = document.getElementById("registerNo").value.trim().toUpperCase();
    const email = document.getElementById("email").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const dept = document.getElementById("department").value;
    const year = document.getElementById("yearOfStudy").value;
    const eventId = document.getElementById("eventSelect").value;
    const type = document.getElementById("participationType").value;
    const tName = document.getElementById("teamName").value.trim();
    const tSize = parseInt(document.getElementById("teamSize").value);

    const targetedEvent = sportsCatalog.find(ev => ev.id === eventId);


    if (!/^[a-zA-Z\s]{3,50}$/.test(name)) return flashMsg("Invalid student name format (Letters only, 3-50 chars).", "error");
    if (!/^[A-Z0-9]{5,15}$/.test(registerNo)) return flashMsg("Invalid Registration Number format.", "error");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return flashMsg("Invalid configuration for field: Email Address.", "error");
    if (!/^\d{10}$/.test(mobile)) return flashMsg("Mobile number entry must exactly equal 10 digits.", "error");
    if (!targetedEvent) return flashMsg("Please choose an event selection profile.", "error");
    
    if (targetedEvent.status === "Closed") {
        return flashMsg(`Registration Closed! Cannot join ${targetedEvent.name}.`, "error");
    }

    const isDuplicate = registrations.some(r => r.registerNo === registerNo && r.eventId === eventId);
    if (isDuplicate) {
        return flashMsg(`Duplication Fault: Entry for registration profile already documented for ${targetedEvent.name}.`, "error");
    }

    if (type === "Team") {
        if (!tName) return flashMsg("Team Name string field structural definition missing.", "error");
        if (isNaN(tSize) || tSize < 2 || tSize > 6) return flashMsg("Structural Constraint: Team size tracking expects inputs bounded inside [2, 6].", "error");
    }

    const entry = { id: 'REG-' + Date.now(), name, registerNo, email, mobile, dept, year, eventId, eventName: targetedEvent.name, type, teamName: tName, teamSize: tSize };
    registrations.push(entry);
    localStorage.setItem('sports_registrations', JSON.stringify(registrations));

    flashMsg(`Success! Entry compiled dynamically under identifier: ${entry.id}`, "success");
    document.getElementById("bookingForm").reset();
    document.getElementById("teamName").disabled = true;
    document.getElementById("teamSize").disabled = true;
    renderRegistrations();
}

function handleFeedbackSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("studentName").value.trim();
    const registerNo = document.getElementById("registerNo").value.trim().toUpperCase();
    const event = document.getElementById("eventAttended").value;
    const rating = parseInt(document.getElementById("rating").value);
    const comments = document.getElementById("comments").value.trim();

    if (!/^[A-Z0-9]{5,15}$/.test(registerNo)) return flashMsg("Invalid configuration pattern on Registration Number.", "error");
    if (!event) return flashMsg("Select a target event attended index value.", "error");
    if (isNaN(rating) || rating < 1 || rating > 5) return flashMsg("Invalid index assignment on rating.", "error");
    if (comments.length < 20) return flashMsg("Comments text box length requires a minimum of 20 distinct characters.", "error");

    const feedbackObj = { id: 'FB-' + Math.floor(1000 + Math.random() * 9000), name, registerNo, event, rating, comments };
    feedbacks.push(feedbackObj);
    localStorage.setItem('sports_feedbacks', JSON.stringify(feedbacks));

    flashMsg("Feedback logged successfully into live calculation metrics.", "success");
    document.getElementById("bookingForm").reset();
    renderFeedbacks();
}

window.deleteRegistration = function(id) {
    if (confirm("Revoke this sports entry tracking registration parameter?")) {
        registrations = registrations.filter(r => r.id !== id);
        localStorage.setItem('sports_registrations', JSON.stringify(registrations));
        renderRegistrations();
        flashMsg("Registration trace cancelled efficiently.", "success");
    }
};

window.deleteFeedback = function(id) {
    if (confirm("Delete this index item entry value?")) {
        feedbacks = feedbacks.filter(f => f.id !== id);
        localStorage.setItem('sports_feedbacks', JSON.stringify(feedbacks));
        renderFeedbacks();
        flashMsg("Feedback data index removed.", "success");
    }
};

function flashMsg(text, mode) {
    const box = document.getElementById("formMessage");
    if (!box) return;
    box.textContent = text;
    box.className = `message ${mode}`;
    setTimeout(() => { box.className = "message"; }, 5000);
}