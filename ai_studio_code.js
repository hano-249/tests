// --- STATE MANAGEMENT ---
const defaultState = {
    profile: {
        name: "Hard Gainer",
        weight: 70, // kg
        targetCalories: 3000
    },
    streak: 0,
    lastLogin: null,
    history: [], // Stores completed workouts
    dailyHabits: {
        date: new Date().toDateString(),
        items: [
            { id: 'cal', text: 'Hit Calorie Goal (3000+)', done: false },
            { id: 'prot', text: '160g Protein', done: false },
            { id: 'cre', text: 'Creatine (5g)', done: false },
            { id: 'skin', text: 'Face Wash & Moisturize', done: false },
            { id: 'hair', text: 'Minoxidil / Hair Care', done: false },
            { id: 'sleep', text: '8 Hours Sleep', done: false }
        ]
    }
};

// Load or Initialize Data
let appData = JSON.parse(localStorage.getItem('gainerStackData')) || defaultState;

// Check for new day reset
const todayStr = new Date().toDateString();
if (appData.dailyHabits.date !== todayStr) {
    appData.dailyHabits.date = todayStr;
    appData.dailyHabits.items.forEach(i => i.done = false);
    
    // Simple streak logic
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    if (appData.lastLogin === yesterday.toDateString()) {
        appData.streak += 1;
    } else if (appData.lastLogin !== todayStr) {
        appData.streak = 0; // Reset if day skipped
    }
    appData.lastLogin = todayStr;
    saveData();
}

// Update UI Streak
document.getElementById('streak-count').innerText = appData.streak;

// --- CORE FUNCTIONS ---

function saveData() {
    localStorage.setItem('gainerStackData', JSON.stringify(appData));
}

function router(viewName) {
    const app = document.getElementById('app');
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    
    if(viewName === 'dashboard') {
        document.getElementById('nav-dash').classList.add('active');
        renderDashboard(app);
    } else if (viewName === 'workout') {
        document.getElementById('nav-work').classList.add('active');
        renderWorkout(app);
    } else if (viewName === 'profile') {
        document.getElementById('nav-prof').classList.add('active');
        renderProfile(app);
    }
}

// --- VIEWS ---

function renderDashboard(container) {
    const progress = appData.dailyHabits.items.filter(i => i.done).length;
    const total = appData.dailyHabits.items.length;
    const pct = (progress / total) * 100;

    let html = `
        <div class="card">
            <h2>Daily Progress</h2>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${pct}%"></div>
            </div>
            <p style="text-align:right; margin: 5px 0 0; font-size: 0.8rem; color: var(--text-dim)">${progress}/${total} Completed</p>
        </div>

        <div class="card">
            <h2>Essentials Checklist</h2>
            <div id="habit-list"></div>
        </div>
        
        <div class="card" style="border-left: 4px solid var(--accent)">
            <h2>Gainer Tip</h2>
            <p style="font-size: 0.9rem; color: var(--text-dim)">Liquid calories are your friend. Make a shake if you're under your goal.</p>
        </div>
    `;
    container.innerHTML = html;

    const list = document.getElementById('habit-list');
    appData.dailyHabits.items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `habit-item ${item.done ? 'done' : ''}`;
        div.onclick = () => toggleHabit(index);
        div.innerHTML = `
            <div class="habit-checkbox">${item.done ? '✓' : ''}</div>
            <span>${item.text}</span>
        `;
        list.appendChild(div);
    });
}

function toggleHabit(index) {
    appData.dailyHabits.items[index].done = !appData.dailyHabits.items[index].done;
    saveData();
    renderDashboard(document.getElementById('app'));
}

function renderWorkout(container) {
    // Simple A/B Split for Hard-gainers
    container.innerHTML = `
        <div class="card">
            <h2>Start Session</h2>
            <p style="color: var(--text-dim); margin-bottom: 20px;">Focus on Progressive Overload. Beat last week's numbers.</p>
            <button class="btn-primary" onclick="startSession('A')">Workout A: Upper / Push</button>
            <div style="height:10px"></div>
            <button class="btn-primary" style="background: var(--surface); border: 1px solid var(--primary); color: var(--primary)" onclick="startSession('B')">Workout B: Lower / Pull</button>
        </div>
        
        <div class="card">
            <h2>Recent Logs</h2>
            <div id="logs-container">
                ${appData.history.slice(0, 3).map(log => 
                    `<div style="padding:10px 0; border-bottom:1px solid #333; font-size:0.85rem">
                        <span style="color:var(--primary)">${log.date}</span>: ${log.name} 
                    </div>`
                ).join('')}
            </div>
        </div>
    `;
}

function startSession(type) {
    const exercises = type === 'A' 
        ? ['Push Ups (Weighted)', 'Overhead Press', 'Dips', 'Lateral Raises']
        : ['Squats / Lunges', 'Pull Ups / Rows', 'Deadlifts', 'Bicep Curls'];

    let html = `<div style="padding-bottom: 50px;">
        <h2>Workout ${type}</h2>`;
    
    exercises.forEach(ex => {
        html += `
        <div class="card exercise-card">
            <h3 style="margin-top:0">${ex}</h3>
            <div style="display:flex; gap:10px; align-items:center;">
                <input type="number" placeholder="kg" class="set-input" id="${ex}-weight">
                <span>x</span>
                <input type="number" placeholder="reps" class="set-input" id="${ex}-reps">
                <span style="font-size:0.8rem; color:var(--text-dim)">Set 1</span>
            </div>
            <!-- In a full app, we'd add buttons to add more sets dynamically -->
        </div>`;
    });

    html += `<button class="btn-primary" onclick="finishWorkout('${type}')">Finish Workout</button>
             <button class="btn-secondary" style="margin-top:10px; width:100%; border:none; color: var(--accent)" onclick="router('workout')">Cancel</button>
             </div>`;
    
    document.getElementById('app').innerHTML = html;
}

function finishWorkout(type) {
    appData.history.unshift({
        date: new Date().toLocaleDateString(),
        name: `Workout ${type}`,
        timestamp: Date.now()
    });
    saveData();
    alert("Good work! Recovery starts now. Go eat.");
    router('dashboard');
}

function renderProfile(container) {
    container.innerHTML = `
        <div class="card">
            <h2>Stats</h2>
            <p>Current Streak: <strong style="color:var(--primary)">${appData.streak} Days</strong></p>
            <p>Workouts Logged: <strong>${appData.history.length}</strong></p>
        </div>
        <div class="card">
            <h2>Settings</h2>
            <button class="btn-secondary" onclick="if(confirm('Reset all data?')) { localStorage.clear(); location.reload(); }">Reset Data</button>
        </div>
    `;
}

// Initial Load
router('dashboard');