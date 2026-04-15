// ===== Bible Reading App - 5 Chapters Daily Plan =====
// Always 5 chapters per day: 1 NT + 4 OT until OT finishes, then 5 NT
// Start Date: April 13, 2026
// Day 1: April 13, Day 2: April 14, Day 3: April 15 (Today)

// ===== Vercel Blob Cloud Storage Integration =====
const API_BASE_URL = window.location.origin + '/api';

let lastCloudSave = 0;
const CLOUD_SAVE_DEBOUNCE = 2000;

// User management
let currentUser = null;
let otherUser = null;
let viewingOtherUser = false;

// Progress storage
let userProgress = {
    user1: { completedDays: [], name: "Belidet" },
    user2: { completedDays: [], name: "Ephi" }
};

// ===== New Testament & Old Testament Bible Data =====
const ntBooks = [
    { name: "Matthew", chapters: 28 },
    { name: "Mark", chapters: 16 },
    { name: "Luke", chapters: 24 },
    { name: "John", chapters: 21 },
    { name: "Acts", chapters: 28 },
    { name: "Romans", chapters: 16 },
    { name: "1 Corinthians", chapters: 16 },
    { name: "2 Corinthians", chapters: 13 },
    { name: "Galatians", chapters: 6 },
    { name: "Ephesians", chapters: 6 },
    { name: "Philippians", chapters: 4 },
    { name: "Colossians", chapters: 4 },
    { name: "1 Thessalonians", chapters: 5 },
    { name: "2 Thessalonians", chapters: 3 },
    { name: "1 Timothy", chapters: 6 },
    { name: "2 Timothy", chapters: 4 },
    { name: "Titus", chapters: 3 },
    { name: "Philemon", chapters: 1 },
    { name: "Hebrews", chapters: 13 },
    { name: "James", chapters: 5 },
    { name: "1 Peter", chapters: 5 },
    { name: "2 Peter", chapters: 3 },
    { name: "1 John", chapters: 5 },
    { name: "2 John", chapters: 1 },
    { name: "3 John", chapters: 1 },
    { name: "Jude", chapters: 1 },
    { name: "Revelation", chapters: 22 }
];

const otBooks = [
    { name: "Genesis", chapters: 50 },
    { name: "Exodus", chapters: 40 },
    { name: "Leviticus", chapters: 27 },
    { name: "Numbers", chapters: 36 },
    { name: "Deuteronomy", chapters: 34 },
    { name: "Joshua", chapters: 24 },
    { name: "Judges", chapters: 21 },
    { name: "Ruth", chapters: 4 },
    { name: "1 Samuel", chapters: 31 },
    { name: "2 Samuel", chapters: 24 },
    { name: "1 Kings", chapters: 22 },
    { name: "2 Kings", chapters: 25 },
    { name: "1 Chronicles", chapters: 29 },
    { name: "2 Chronicles", chapters: 36 },
    { name: "Ezra", chapters: 10 },
    { name: "Nehemiah", chapters: 13 },
    { name: "Esther", chapters: 10 },
    { name: "Job", chapters: 42 },
    { name: "Psalms", chapters: 150 },
    { name: "Proverbs", chapters: 31 },
    { name: "Ecclesiastes", chapters: 12 },
    { name: "Song of Solomon", chapters: 8 },
    { name: "Isaiah", chapters: 66 },
    { name: "Jeremiah", chapters: 52 },
    { name: "Lamentations", chapters: 5 },
    { name: "Ezekiel", chapters: 48 },
    { name: "Daniel", chapters: 12 },
    { name: "Hosea", chapters: 14 },
    { name: "Joel", chapters: 3 },
    { name: "Amos", chapters: 9 },
    { name: "Obadiah", chapters: 1 },
    { name: "Jonah", chapters: 4 },
    { name: "Micah", chapters: 7 },
    { name: "Nahum", chapters: 3 },
    { name: "Habakkuk", chapters: 3 },
    { name: "Zephaniah", chapters: 3 },
    { name: "Haggai", chapters: 2 },
    { name: "Zechariah", chapters: 14 },
    { name: "Malachi", chapters: 4 }
];

// Reading plan structure: each day has exactly 5 chapters total
let readingPlan = [];

// Generate the daily reading plan (always 5 chapters per day)
function generateReadingPlan() {
    const plan = [];
    let ntBookIndex = 0;
    let ntChapter = 1;
    let otBookIndex = 0;
    let otChapter = 1;
    
    let ntCompleted = false;
    let otCompleted = false;
    let day = 1;
    
    console.log("Generating reading plan with 5 chapters per day...");
    
    while (!ntCompleted || !otCompleted) {
        const reading = {
            day: day,
            ntPassages: [],
            otPassages: [],
            completed: false,
            isCurrent: false,
            date: null
        };
        
        let chaptersAdded = 0;
        const targetChapters = 5;
        
        // If OT is not finished, add OT chapters first (up to 4)
        if (!otCompleted) {
            let otChaptersToAdd = Math.min(4, targetChapters - chaptersAdded);
            let otAdded = 0;
            
            while (otAdded < otChaptersToAdd && otBookIndex < otBooks.length) {
                const book = otBooks[otBookIndex];
                const remainingInBook = book.chapters - otChapter + 1;
                const toTake = Math.min(otChaptersToAdd - otAdded, remainingInBook);
                
                reading.otPassages.push({
                    book: book.name,
                    startChapter: otChapter,
                    endChapter: otChapter + toTake - 1
                });
                
                otChapter += toTake;
                otAdded += toTake;
                chaptersAdded += toTake;
                
                if (otChapter > book.chapters) {
                    otBookIndex++;
                    otChapter = 1;
                }
            }
            
            // Check if OT is now finished
            if (otBookIndex >= otBooks.length) {
                otCompleted = true;
                console.log(`OT completed on day ${day}`);
            }
            
            // Add 1 NT chapter if we still need chapters
            if (chaptersAdded < targetChapters && !ntCompleted && ntBookIndex < ntBooks.length) {
                const book = ntBooks[ntBookIndex];
                reading.ntPassages.push({
                    book: book.name,
                    chapter: ntChapter
                });
                chaptersAdded++;
                
                // Move to next NT chapter
                if (ntChapter < book.chapters) {
                    ntChapter++;
                } else {
                    ntBookIndex++;
                    ntChapter = 1;
                }
                
                // Check if NT is finished
                if (ntBookIndex >= ntBooks.length) {
                    ntCompleted = true;
                    console.log(`NT completed on day ${day}`);
                }
            }
        }
        
        // If OT is finished, fill all remaining chapters with NT (5 NT chapters per day)
        if (otCompleted && !ntCompleted) {
            let ntChaptersToAdd = targetChapters - chaptersAdded;
            let ntAdded = 0;
            
            while (ntAdded < ntChaptersToAdd && ntBookIndex < ntBooks.length) {
                const book = ntBooks[ntBookIndex];
                const remainingInBook = book.chapters - ntChapter + 1;
                const toTake = Math.min(ntChaptersToAdd - ntAdded, remainingInBook);
                
                if (toTake === 1) {
                    reading.ntPassages.push({
                        book: book.name,
                        chapter: ntChapter
                    });
                } else {
                    reading.ntPassages.push({
                        book: book.name,
                        startChapter: ntChapter,
                        endChapter: ntChapter + toTake - 1
                    });
                }
                
                ntChapter += toTake;
                ntAdded += toTake;
                chaptersAdded += toTake;
                
                if (ntChapter > book.chapters) {
                    ntBookIndex++;
                    ntChapter = 1;
                }
                
                if (ntBookIndex >= ntBooks.length) {
                    ntCompleted = true;
                    console.log(`NT completed on day ${day}`);
                    break;
                }
            }
        }
        
        // If both testaments are finished, break
        if (ntCompleted && otCompleted) {
            if (reading.ntPassages.length > 0 || reading.otPassages.length > 0) {
                plan.push(reading);
            }
            break;
        }
        
        plan.push(reading);
        day++;
        
        // Safety break
        if (day > 500) break;
    }
    
    console.log(`Generated ${plan.length} days of readings (${plan.length * 5} total chapters)`);
    return plan;
}

// Initialize reading plan
readingPlan = generateReadingPlan();

// Set start date to April 13, 2026
// Day 1: April 13, Day 2: April 14, Day 3: April 15 (Today)
const START_DATE = new Date(2026, 3, 13); // April 13, 2026 (month is 0-indexed, so 3 = April)

function assignDatesToPlan() {
    readingPlan.forEach((day, index) => {
        const date = new Date(START_DATE);
        date.setDate(START_DATE.getDate() + index);
        day.date = date;
    });
}
assignDatesToPlan();

// Pre-populate existing progress - Days 1, 2, and 3 completed
// Day 1 (April 13): Matthew 1, Genesis 1-4
// Day 2 (April 14): Matthew 2, Genesis 5-8
// Day 3 (April 15 - Today): Matthew 3, Genesis 9-12
function prePopulateProgress() {
    // Mark Days 1, 2, and 3 as completed
    for (let day = 1; day <= 3; day++) {
        const dayIndex = day - 1;
        if (readingPlan[dayIndex]) {
            readingPlan[dayIndex].completed = true;
        }
    }
    
    const completedDays = [1, 2, 3];
    userProgress.user1.completedDays = [...completedDays];
    userProgress.user2.completedDays = [...completedDays];
    
    saveAllProgress();
    
    console.log('Pre-populated progress: Days 1-3 completed');
    console.log('Day 1 (April 13): Matthew 1, Genesis 1-4');
    console.log('Day 2 (April 14): Matthew 2, Genesis 5-8');
    console.log('Day 3 (April 15 - Today): Matthew 3, Genesis 9-12');
}

// ===== Cloud Sync Functions =====
async function loadProgressFromCloud(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/sync?user=${userId}`);
        if (!response.ok) throw new Error('Failed to load from cloud');
        const data = await response.json();
        return data.completedDays || [];
    } catch (error) {
        console.error('Cloud load failed:', error);
        return null;
    }
}

async function saveProgressToCloud(userId, completedDays, force = false) {
    const now = Date.now();
    if (!force && now - lastCloudSave < CLOUD_SAVE_DEBOUNCE) {
        return false;
    }
    try {
        const response = await fetch(`${API_BASE_URL}/sync`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, completedDays })
        });
        if (!response.ok) throw new Error('Failed to save to cloud');
        lastCloudSave = now;
        return true;
    } catch (error) {
        console.error('Cloud save failed:', error);
        return false;
    }
}

async function syncProgressForUser(userId) {
    const cloudProgress = await loadProgressFromCloud(userId);
    const storageKey = `bible-reading-${userId}`;
    const localProgress = localStorage.getItem(storageKey);
    const localDays = localProgress ? JSON.parse(localProgress) : [];
    
    if (cloudProgress !== null && cloudProgress.length > 0) {
        if (cloudProgress.length > localDays.length) {
            return cloudProgress;
        } else if (localDays.length > cloudProgress.length) {
            await saveProgressToCloud(userId, localDays, true);
            return localDays;
        }
        return cloudProgress;
    }
    return localDays;
}

function saveLocalProgress(userId, completedDays) {
    localStorage.setItem(`bible-reading-${userId}`, JSON.stringify(completedDays));
}

function saveAllProgress() {
    saveLocalProgress('user1', userProgress.user1.completedDays);
    saveLocalProgress('user2', userProgress.user2.completedDays);
    saveProgressToCloud('user1', userProgress.user1.completedDays);
    saveProgressToCloud('user2', userProgress.user2.completedDays);
}

// ===== User Management =====
function showUserSelector() {
    const selector = document.getElementById('user-selector');
    if (selector) selector.style.display = 'flex';
}

function selectUser(userId) {
    currentUser = userId;
    viewingOtherUser = false;
    document.getElementById('user-selector').style.display = 'none';
    document.getElementById('app-container').style.display = 'block';
    document.getElementById('viewing-banner').style.display = 'none';
    loadUserProgress();
}

function viewOtherUser() {
    if (!currentUser) return;
    viewingOtherUser = true;
    otherUser = currentUser === 'user1' ? 'user2' : 'user1';
    const banner = document.getElementById('viewing-banner');
    banner.style.display = 'flex';
    banner.querySelector('span').textContent = 
        `👁️ Viewing ${otherUser === 'user1' ? userProgress.user1.name : userProgress.user2.name}'s progress`;
    loadUserProgress(true);
}

function switchBackToSelf() {
    viewingOtherUser = false;
    document.getElementById('viewing-banner').style.display = 'none';
    loadUserProgress();
}

async function loadUserProgress(viewing = false) {
    const targetUser = viewing ? otherUser : currentUser;
    if (!targetUser) return;
    
    const completedDays = await syncProgressForUser(targetUser);
    userProgress[targetUser].completedDays = completedDays;
    
    readingPlan.forEach(day => {
        day.completed = completedDays.includes(day.day);
    });
    
    updateCurrentDay();
    renderReadingList(viewing);
    updateProgressBar();
    renderCalendar(viewing);
    updateTodayHighlight(viewing);
    updateStatistics(viewing);
}

function toggleDay(dayNum) {
    if (viewingOtherUser) {
        showToast("You cannot mark someone else's reading as complete", "warning");
        return;
    }
    
    const day = readingPlan.find(d => d.day === dayNum);
    if (day) {
        day.completed = !day.completed;
        updateCurrentDay();
        
        userProgress[currentUser].completedDays = readingPlan.filter(d => d.completed).map(d => d.day);
        saveAllProgress();
        
        const card = document.querySelector(`.day-card[data-day="${dayNum}"]`);
        if (card) {
            card.style.transform = 'scale(0.98)';
            setTimeout(() => card.style.transform = '', 150);
        }
        
        renderReadingList(false);
        updateProgressBar();
        renderCalendar(false);
        updateTodayHighlight(false);
        updateStatistics(false);
        
        if (day.completed) {
            showToast(`Day ${dayNum} marked as read!`, "success");
        } else {
            showToast(`Day ${dayNum} marked as unread`, "info");
        }
    }
}

// ===== Statistics Functions =====
function updateStatistics(viewing = false) {
    const targetUser = viewing ? otherUser : currentUser;
    if (!targetUser) return;
    
    const stats = calculateStatistics(targetUser);
    
    document.getElementById('stat-completed').textContent = stats.completedDays;
    document.getElementById('stat-total').textContent = stats.totalDays;
    document.getElementById('stat-percentage').textContent = `${stats.percentage}%`;
    document.getElementById('stat-streak').textContent = stats.currentStreak;
    document.getElementById('stat-nt-read').textContent = stats.ntChaptersRead;
    document.getElementById('stat-ot-read').textContent = stats.otChaptersRead;
    document.getElementById('stat-total-chapters').textContent = stats.totalChaptersRead;
    
    const userName = targetUser === 'user1' ? userProgress.user1.name : userProgress.user2.name;
    const viewBtn = document.getElementById('view-other-btn');
    if (viewBtn) {
        viewBtn.style.display = currentUser ? 'inline-block' : 'none';
        viewBtn.textContent = `👥 View ${currentUser === 'user1' ? 'Ephi' : 'Belidet'}`;
    }
}

function calculateStatistics(userId) {
    const userCompletedDays = userProgress[userId].completedDays;
    const completedDays = userCompletedDays.length;
    const totalDays = readingPlan.length;
    const percentage = Math.round((completedDays / totalDays) * 100);
    
    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let i = 0; i < readingPlan.length; i++) {
        const dayDate = new Date(readingPlan[i].date);
        dayDate.setHours(0, 0, 0, 0);
        if (dayDate > today) continue;
        if (userCompletedDays.includes(readingPlan[i].day)) {
            streak++;
        } else {
            if (dayDate <= today) {
                streak = 0;
            }
        }
    }
    
    let ntChaptersRead = 0;
    let otChaptersRead = 0;
    
    userCompletedDays.forEach(dayNum => {
        const day = readingPlan[dayNum - 1];
        if (day) {
            if (day.ntPassages && day.ntPassages.length > 0) {
                day.ntPassages.forEach(passage => {
                    if (passage.chapter) {
                        ntChaptersRead += 1;
                    } else if (passage.startChapter && passage.endChapter) {
                        ntChaptersRead += (passage.endChapter - passage.startChapter + 1);
                    }
                });
            }
            
            if (day.otPassages && day.otPassages.length > 0) {
                otChaptersRead += day.otPassages.reduce((sum, p) => 
                    sum + (p.endChapter - p.startChapter + 1), 0);
            }
        }
    });
    
    return {
        completedDays,
        totalDays,
        percentage,
        currentStreak: streak,
        ntChaptersRead,
        otChaptersRead,
        totalChaptersRead: ntChaptersRead + otChaptersRead
    };
}

function showToast(message, type = "info") {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast show ${type}`;
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

// ===== UI Rendering Functions =====
function updateCurrentDay() {
    readingPlan.forEach(day => day.isCurrent = false);
    // Find the first uncompleted day
    for (let i = 0; i < readingPlan.length; i++) {
        if (!readingPlan[i].completed) {
            readingPlan[i].isCurrent = true;
            break;
        }
    }
}

function updateProgressBar() {
    const targetUser = viewingOtherUser ? otherUser : currentUser;
    if (!targetUser) return;
    
    const completedCount = userProgress[targetUser].completedDays.length;
    const totalDays = readingPlan.length;
    const percentage = (completedCount / totalDays) * 100;
    
    document.getElementById('completed-count').textContent = completedCount;
    document.getElementById('total-days').textContent = totalDays;
    document.getElementById('progress-fill').style.width = `${percentage}%`;
}

function formatPassage(ntPassages, otPassages) {
    let html = '';
    
    if (ntPassages && ntPassages.length > 0) {
        html += `<div class="passage-nt">`;
        html += `<span class="testament-label NT">NT</span>`;
        
        ntPassages.forEach((passage, idx) => {
            if (passage.chapter) {
                html += `<span class="passage-book">${passage.book}</span> `;
                html += `<span class="passage-chapter">${passage.chapter}</span>`;
            } else if (passage.startChapter && passage.endChapter) {
                html += `<span class="passage-book">${passage.book}</span> `;
                if (passage.startChapter === passage.endChapter) {
                    html += `<span class="passage-chapter">${passage.startChapter}</span>`;
                } else {
                    html += `<span class="passage-chapter">${passage.startChapter}-${passage.endChapter}</span>`;
                }
            }
            if (idx < ntPassages.length - 1) {
                html += `<span class="passage-separator">, </span>`;
            }
        });
        html += `</div>`;
    }
    
    if (otPassages && otPassages.length > 0) {
        html += `<div class="passage-ot">`;
        html += `<span class="testament-label OT">OT</span>`;
        html += `<div class="ot-passages">`;
        
        otPassages.forEach((p, idx) => {
            if (p.startChapter === p.endChapter) {
                html += `<span class="passage-book">${p.book}</span> <span class="passage-chapter">${p.startChapter}</span>`;
            } else {
                html += `<span class="passage-book">${p.book}</span> <span class="passage-chapter">${p.startChapter}-${p.endChapter}</span>`;
            }
            if (idx < otPassages.length - 1) {
                html += `<span class="passage-separator">, </span>`;
            }
        });
        html += `</div></div>`;
    }
    
    return html;
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

function getDaySuffix(day) {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
}

function renderReadingList(viewing = false) {
    const container = document.getElementById('reading-list');
    if (!container) return;
    container.innerHTML = '';
    
    readingPlan.forEach(day => {
        const passageHTML = formatPassage(day.ntPassages, day.otPassages);
        const dateText = formatDate(day.date);
        const daySuffix = getDaySuffix(day.day);
        
        const dayCard = document.createElement('div');
        dayCard.className = `day-card ${day.completed ? 'completed' : ''} ${day.isCurrent ? 'current' : ''}`;
        dayCard.setAttribute('data-day', day.day);
        
        dayCard.innerHTML = `
            <div class="card-left">
                <div class="day-badge">
                    <span class="day-number-large">${day.day}</span>
                    <span class="day-suffix">${daySuffix}</span>
                </div>
                <div class="date-badge">
                    <span class="date-icon">📅</span>
                    <span class="date-text">${dateText}</span>
                </div>
            </div>
            <div class="card-middle">
                <div class="passage-container">
                    ${passageHTML}
                </div>
                <div class="reading-meta">
                    ${day.isCurrent ? '<span class="current-badge">Current Reading</span>' : ''}
                </div>
            </div>
            <div class="card-right">
                <label class="checkbox-wrapper ${viewing ? 'disabled' : ''}">
                    <input type="checkbox" ${day.completed ? 'checked' : ''} data-day="${day.day}" ${viewing ? 'disabled' : ''}>
                    <span class="checkbox-custom">
                        <svg class="checkbox-icon" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                        </svg>
                    </span>
                </label>
                <div class="completion-status ${day.completed ? 'completed' : ''}">
                    ${day.completed ? 'Read' : 'Mark Read'}
                </div>
            </div>
        `;
        
        container.appendChild(dayCard);
    });
    
    if (!viewing) {
        document.querySelectorAll('.checkbox-wrapper input:not([disabled])').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const dayNum = parseInt(e.target.dataset.day);
                toggleDay(dayNum);
            });
        });
    }
}

let currentCalendarDate = new Date();

function renderCalendar(viewing = false) {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    
    const monthDisplay = document.getElementById('month-year-display');
    if (monthDisplay) {
        monthDisplay.textContent = currentCalendarDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    const calendarDays = document.getElementById('calendar-days');
    if (!calendarDays) return;
    calendarDays.innerHTML = '';
    
    for (let i = 0; i < startingDayOfWeek; i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarDays.appendChild(emptyDay);
    }
    
    const targetUser = viewing ? otherUser : currentUser;
    const userCompletedDays = targetUser ? userProgress[targetUser]?.completedDays : [];
    
    for (let day = 1; day <= totalDays; day++) {
        const date = new Date(year, month, day);
        date.setHours(0, 0, 0, 0);
        
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        
        const readingDay = readingPlan.find(d => {
            const dDate = new Date(d.date);
            dDate.setHours(0, 0, 0, 0);
            return dDate.getTime() === date.getTime();
        });
        
        let dayContent = `<span class="day-number">${day}</span>`;
        
        if (readingDay) {
            dayElement.classList.add('has-reading');
            if (userCompletedDays && userCompletedDays.includes(readingDay.day)) {
                dayElement.classList.add('completed-reading');
            }
            
            const ntText = readingDay.ntPassages && readingDay.ntPassages.length > 0 
                ? readingDay.ntPassages.map(p => {
                    if (p.chapter) return `${p.book} ${p.chapter}`;
                    if (p.startChapter && p.endChapter) return `${p.book} ${p.startChapter}-${p.endChapter}`;
                    return '';
                }).join(', ') 
                : '';
                
            const otText = readingDay.otPassages.map(p => 
                `${p.book} ${p.startChapter}${p.startChapter !== p.endChapter ? '-' + p.endChapter : ''}`
            ).join(', ');
                
            dayElement.setAttribute('data-tooltip', `Day ${readingDay.day}: NT: ${ntText} | OT: ${otText}`);
            dayContent += `<span class="reading-indicator"></span>`;
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        if (date.getTime() === today.getTime()) {
            dayElement.classList.add('today');
            dayContent += `<span class="today-indicator">Today</span>`;
        }
        
        dayElement.innerHTML = dayContent;
        calendarDays.appendChild(dayElement);
    }
}

function updateTodayHighlight(viewing = false) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayReading = readingPlan.find(d => {
        const dDate = new Date(d.date);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === today.getTime();
    });
    
    const highlightElement = document.getElementById('today-highlight');
    if (!highlightElement) return;
    
    const targetUser = viewing ? otherUser : currentUser;
    const isCompleted = todayReading && targetUser && 
        userProgress[targetUser]?.completedDays.includes(todayReading.day);
    
    if (todayReading) {
        const passageHTML = formatPassage(todayReading.ntPassages, todayReading.otPassages);
        const dateText = today.toLocaleDateString('en-US', { 
            weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
        });
        
        highlightElement.innerHTML = `
            <div class="today-header">
                <div class="today-icon">📖</div>
                <div class="today-title-section">
                    <span class="today-label">Today's Reading</span>
                    <span class="today-full-date">${dateText}</span>
                </div>
            </div>
            <div class="today-content">
                <div class="today-passage-section">
                    <div class="today-day">Day ${todayReading.day}</div>
                    <div class="today-passage">${passageHTML}</div>
                </div>
                <button class="btn-mark-read ${isCompleted ? 'completed' : ''}" 
                        data-day="${todayReading.day}" 
                        ${isCompleted || viewing ? 'disabled' : ''}>
                    <span class="btn-icon">${isCompleted ? '✓' : '◉'}</span>
                    <span class="btn-text">${isCompleted ? 'Completed' : 'Mark as Read'}</span>
                </button>
            </div>
        `;
        
        if (!viewing && !isCompleted) {
            const markReadBtn = highlightElement.querySelector('.btn-mark-read');
            if (markReadBtn) {
                markReadBtn.addEventListener('click', () => toggleDay(todayReading.day));
            }
        }
    } else {
        const nextReading = readingPlan.find(d => {
            const dDate = new Date(d.date);
            dDate.setHours(0, 0, 0, 0);
            return dDate >= today && !userProgress[targetUser]?.completedDays.includes(d.day);
        });
        
        if (nextReading) {
            const nextDate = new Date(nextReading.date);
            const passageHTML = formatPassage(nextReading.ntPassages, nextReading.otPassages);
            highlightElement.innerHTML = `
                <div class="today-header">
                    <div class="today-icon">📅</div>
                    <div class="today-title-section">
                        <span class="today-label">Next Reading</span>
                        <span class="today-full-date">${nextDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                    </div>
                </div>
                <div class="today-content">
                    <div class="today-passage-section">
                        <div class="today-day">Day ${nextReading.day}</div>
                        <div class="today-passage">${passageHTML}</div>
                    </div>
                    <div class="today-message">📖 Coming soon</div>
                </div>
            `;
        } else {
            highlightElement.innerHTML = `
                <div class="today-header">
                    <div class="today-icon">🎉</div>
                    <div class="today-title-section">
                        <span class="today-label">Congratulations!</span>
                        <span class="today-full-date">${today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                </div>
                <div class="today-content">
                    <div class="today-message">You've completed the entire Bible reading plan! 🎉</div>
                </div>
            `;
        }
    }
}

function initCalendarNavigation() {
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() - 1);
            renderCalendar(viewingOtherUser);
        });
    }
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentCalendarDate.setMonth(currentCalendarDate.getMonth() + 1);
            renderCalendar(viewingOtherUser);
        });
    }
}

function setupNotifications() {
    if ('Notification' in window && 'serviceWorker' in navigator) {
        const banner = document.getElementById('notification-banner');
        
        if (Notification.permission === 'granted') {
            banner.classList.add('hidden');
            scheduleDailyNotification();
        } else if (Notification.permission !== 'denied') {
            banner.classList.remove('hidden');
            
            document.getElementById('enable-notifications').addEventListener('click', async () => {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    banner.classList.add('hidden');
                    scheduleDailyNotification();
                }
            });
        }
    }
}

function scheduleDailyNotification() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
        navigator.serviceWorker.register('service-worker.js')
            .then(registration => {
                console.log('Service Worker registered');
                
                const now = new Date();
                const notificationTime = new Date();
                notificationTime.setHours(8, 0, 0, 0);
                
                if (now > notificationTime) {
                    notificationTime.setDate(notificationTime.getDate() + 1);
                }
                
                const timeUntilNotification = notificationTime - now;
                
                setTimeout(() => {
                    registration.showNotification('Bible Reading - Daily Reminder', {
                        body: 'Time for your daily Bible reading! 5 chapters today.',
                        icon: 'icons/icon-192x192.png',
                        badge: 'icons/icon-72x72.png',
                        vibrate: [200, 100, 200],
                        tag: 'daily-reading',
                        renotify: true,
                        actions: [
                            { action: 'open', title: 'Open Reading' },
                            { action: 'mark', title: 'Mark as Read' }
                        ]
                    });
                    
                    setInterval(() => {
                        registration.showNotification('Bible Reading - Daily Reminder', {
                            body: 'Time for your daily Bible reading! 5 chapters today.',
                            icon: 'icons/icon-192x192.png',
                            badge: 'icons/icon-72x72.png',
                            vibrate: [200, 100, 200],
                            tag: 'daily-reading',
                            renotify: true
                        });
                    }, 24 * 60 * 60 * 1000);
                }, timeUntilNotification);
            })
            .catch(error => {
                console.error('Service Worker registration failed:', error);
            });
    }
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    prePopulateProgress();
    showUserSelector();
    
    document.getElementById('select-user1')?.addEventListener('click', () => selectUser('user1'));
    document.getElementById('select-user2')?.addEventListener('click', () => selectUser('user2'));
    document.getElementById('view-other-btn')?.addEventListener('click', viewOtherUser);
    document.getElementById('back-to-self-btn')?.addEventListener('click', switchBackToSelf);
    
    initCalendarNavigation();
    setupNotifications();
    
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js').catch(error => {
                console.error('Service Worker registration failed:', error);
            });
        });
    }
});