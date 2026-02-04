import { addNotification } from "./notifications.js";

const gradeSelect = document.getElementById("Gradee");
const classSelect = document.getElementById("Classs");
const timetableSection = document.querySelector(".timetable-table");
const fillMessage = document.querySelector(".timetable-placeholder");
const tbody = document.querySelector(".timetable-table tbody");
const favicon = 'media copy/favicons/icons8-calendar-80.png';
const darkModeToggle = document.getElementById('darkModeToggle');
const warningElement = document.getElementById('form-warning');
const addClassSelect = document.getElementById("Class");
const addGradeSelect = document.getElementById("Grade");
const allAddedClasses = [];
let currentScheduleData = [];
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];
const API_BASE = 'https://ece2026.onrender.com/webapi';


if (timetableSection) timetableSection.style.display = "none";
if (gradeSelect) gradeSelect.addEventListener("change", handleSelection);
if (classSelect) classSelect.addEventListener("change", handleSelection);

async function handleSelection() {
    const grade = gradeSelect.value;
    const className = classSelect.value;

    if (!grade || !className) {
        if (timetableSection) timetableSection.style.display = "none";
        return;
    }

    if (timetableSection) timetableSection.style.display = "table";
    if (fillMessage) fillMessage.style.display = 'none';
    if (tbody) tbody.innerHTML = "<tr><td colspan='6'>Loading schedule...</td></tr>";

    try {
        const res = await fetch(`${API_BASE}/timetable/${grade}/${className}`);
        const data = await res.json();
        renderTable(data);
    } catch (err) {
        console.error('Error:', err);
        if (tbody) tbody.innerHTML = "<tr><td colspan='6' style='color:red;'>Error loading from server.</td></tr>";
    }
}

function renderTable(scheduleArray) {
    if (!tbody) return;

    currentScheduleData = scheduleArray;

    tbody.innerHTML = "";

    if (!scheduleArray || scheduleArray.length === 0 || scheduleArray.message) {
        tbody.innerHTML = "<tr><td colspan='6'>No schedule available.</td></tr>";
        return;
    }

    scheduleArray.forEach(item => {
                const cleanItem = {};
                Object.keys(item).forEach(k => { cleanItem[k.trim()] = item[k]; });

                const tr = document.createElement("tr");

                const isBreak = days.some(day =>
                    cleanItem[day] && cleanItem[day].toLowerCase().includes("break")
                );

                if (isBreak) {
                    tr.classList.add("break");
                }

                const timeTd = document.createElement("td");
                timeTd.textContent = formatTime(cleanItem.StartTime, cleanItem.EndTime);
                tr.appendChild(timeTd);

                days.forEach(day => {
                            const td = document.createElement("td");
                            const content = cleanItem[day] || "-";

                            if (content.toLowerCase().includes("break")) {
                                td.textContent = "BREAK";
                                td.style.textAlign = "center";
                            } else if (content !== "-") {
                                const parts = content.split('(');
                                td.innerHTML = `<strong>${parts[0].trim()}</strong>${parts[1] ? `<br><small style="color: #666;">${parts[1].replace(')', '')}</small>` : ''}`;
            } else {
                td.textContent = "-";
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });

    renderMobileDay("Sunday");
}

if (addClassSelect) {
    addClassSelect.addEventListener('change', () => {
        if (addGradeSelect.value) renderFullEmptyTable();
    });
}


function formatTimeOnly(timeStr) {
    if (!timeStr) return "";
    let [h, m] = timeStr.split(":").map(Number);
    let h_format = h % 12 || 12;
    return `${h_format}:${m.toString().padStart(2, "0")}`;
}
function updateClassOptions(gradeValue) {
    const defaultClasses = ['A', 'B', 'C', 'D'];
    const extraClasses = allAddedClasses
        .filter(cls => cls.grade.toString() === gradeValue.toString())
        .map(cls => cls.className.toUpperCase());

    const combinedClasses = [...new Set([...defaultClasses, ...extraClasses])];
    if (addClassSelect) {
        addClassSelect.innerHTML = '<option value="" disabled selected hidden>Select Class</option>';
        combinedClasses.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls;
            option.textContent = cls;
            addClassSelect.appendChild(option);
        });
    }
}

if (addGradeSelect) {
    addGradeSelect.addEventListener('change', (e) => {
        updateClassOptions(e.target.value);
    });
}

function formatTime(startTime, endTime) {
    if (!startTime || !endTime) return "";
    let [h1, m1] = startTime.split(":").map(Number);
    let h1_format = h1 % 12 || 12;
    const startStr = `${h1_format}:${m1.toString().padStart(2, "0")}`;

    let [h2, m2] = endTime.split(":").map(Number);
    const periodSuffix = h2 >= 12 ? "PM" : "AM";
    let h2_format = h2 % 12 || 12;
    const endStr = `${h2_format}:${m2.toString().padStart(2, "0")}`;

    return `${startStr} - ${endStr} ${periodSuffix}`;
}
function renderMobileDay(selectedDay) {
    const mobileContainer = document.getElementById('mobile-schedule-items');
    if (!mobileContainer) return;
    
    mobileContainer.innerHTML = '';
    
    currentScheduleData.forEach(period => {
        const cleanPeriod = {};
        Object.keys(period).forEach(k => { cleanPeriod[k.trim()] = period[k]; });

        const content = cleanPeriod[selectedDay] || "-";

        if (content !== "-") {
            const isBreak = content.toLowerCase().includes("break");
            const parts = content.split('(');
            
            mobileContainer.innerHTML += `
                <div class="schedule-card ${isBreak ? 'break-card' : ''}">
                    <div class="time-slot">
                        <span class="start">${formatTimeOnly(cleanPeriod.StartTime)}</span>
                        <div class="line"></div>
                        <span class="end">${formatTimeOnly(cleanPeriod.EndTime)}</span>
                    </div>
                    <div class="details">
                        <h4>${isBreak ? "B R E A K" : parts[0].trim()}</h4>
                        ${!isBreak && parts[1] ? `<p><i class="fa-solid fa-chalkboard-user"></i> ${parts[1].replace(')', '')}</p>` : ''}
                    </div>
                </div>
            `;
        }
    });
}

document.querySelectorAll('.day-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.day-btn').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        renderMobileDay(this.dataset.day);
    });
});

// DARK MODE
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

if (darkModeToggle) {
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
    });
}

if (gradeSelect) {
    gradeSelect.addEventListener("change", (e) => {
        updateMainClassOptions(e.target.value);
    });
}

function updateMainClassOptions(selectedGrade) {
    if (!classSelect) return;
    classSelect.innerHTML = '<option value="" disabled selected hidden>Select Class</option>';
    
    ['A', 'B', 'C', 'D'].forEach(cls => {
        const option = document.createElement('option');
        option.value = cls;
        option.textContent = cls;
        classSelect.appendChild(option);
    });
}
const lockIcon = document.getElementById('lock');
if (lockIcon) {
    lockIcon.addEventListener('click', () => { window.location.href = './index.html' });
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});

const backToHome = document.querySelector('.back-to-home');
backToHome.addEventListener('click', () => {
    const lastPage = localStorage.getItem('lastVisitedPage');

    if (lastPage && lastPage !== window.location.pathname) {
        window.location.href = lastPage;
    } else {
        window.location.href = "/dashboard.html"; // fallback
    }
});

//// SAVE BUTTON LOGIC
//const saveBtn = document.querySelector('.save-button');
//if (saveBtn) {
//    saveBtn.addEventListener('click', () => {
//        if (warningElement) warningElement.style.display = 'none';
//        const grade = document.querySelector('#add-timetable-form #Grade').value;
//        const className = document.querySelector('#add-timetable-form #Class').value;
//        const rows = document.querySelectorAll('#add-timetable-tbody tr:not(.break-row)');

//        if (!grade || !className) {
//            if (warningElement) {
//                warningElement.textContent = `Warning: Please choose class and grade first!`;
//                warningElement.style.display = 'block';
//            }
//            return;
//        }

//        let newEntries = [];
//        let isAllFilled = true;

//        rows.forEach(row => {
//            const subjectInputs = row.querySelectorAll('.subject-input');
//            const teacherInputs = row.querySelectorAll('.teacher-input');

//            subjectInputs.forEach((input, index) => {
//                const subject = input.value.trim();
//                const teacherId = teacherInputs[index].value.trim();
//                const day = input.dataset.day;
//                const periodId = parseInt(input.dataset.period);

//                if (!subject || !teacherId) {
//                    isAllFilled = false;
//                    input.style.borderBottom = "1px solid red";
//                } else {
//                    input.style.borderBottom = "none";
//                    newEntries.push({ grade, class: className, day, periodId, subject, teacherId });
//                }
//            });
//        });

//        if (!isAllFilled) {
//            warningElement.textContent = 'Please fill all periods or put "-" in empty ones', 'error';
//            warningElement.style.backgroundColor = '#f8d7da';
//            warningElement.style.color = '#721c24';
//            warningElement.style.display = 'block';
//            return;
//        }

//        // تحديث المصفوفة
//        masterSchedule = masterSchedule.filter(item => !(item.grade === grade && item.class === className));
//        masterSchedule.push(...newEntries);
//        localStorage.setItem(LOCAL_SCHEDULE_KEY, JSON.stringify(masterSchedule));

//        addNotification(`Timetable for ${grade}-${className} saved successfully!`, 'success');
//        document.querySelector('#all-timetables').click();
//    });
//}
//const confirmModal = document.getElementById("confirm-modal");
//const confirmMsg = document.getElementById("confirm-message");
//const confirmYesBtn = document.getElementById("confirm-yes");
//const confirmNoBtn = document.getElementById("confirm-no");

//function showConfirm(message, onConfirm) {
//    confirmMsg.textContent = message;
//    confirmModal.classList.remove("hidden");

//    confirmYesBtn.onclick = () => {
//        confirmModal.classList.add("hidden");
//        onConfirm();
//    };

//    confirmNoBtn.onclick = () => {
//        confirmModal.classList.add("hidden");
//    };
//}

//// RESET & CANCEL
//const cancelBtn = document.querySelector('.add-buttons button:nth-child(1)');
//if (cancelBtn) {
//    cancelBtn.addEventListener("click", () => {
//        showConfirm("Are you sure? All unsaved changes will be lost.", () => {
//            document.querySelector("#all-timetables").click();
//        });
//    });

//}

//const resetBtn = document.querySelector('.add-buttons button:nth-child(2)');
//if (resetBtn) {
//    resetBtn.addEventListener("click", () => {
//        showConfirm("Reset all fields?", () => {
//            document.querySelectorAll("#add-timetable-form input")
//                .forEach(i => i.value = "");

//            addNotification("Form has been reset", "success");
//            document.querySelector("#all-timetables").click();

//        });
//    });

//}
//function controllingModify() {
//    const addBtn = document.querySelector('#add-btn');
//    const allBtn = document.querySelector('#all-timetables');
//    const timeTableList = document.querySelector('.timetable-list-section');
//    const timeTableForm = document.querySelector('.add-timetable-form');
//    const editConfirmButtons = document.querySelector('.add-buttons');

//    if (addBtn) {
//        ModifyGeneric({
//            addBtn,
//            allBtn,
//            listView: timeTableList,
//            formView: timeTableForm,
//            editConfirmButtons,
//            favicon: favicon,
//            listTitle: 'All Timetables',
//            formTitle: 'Add Timetable',
//            darkModeToggle
//        });
//    }
//}
//controllingModify();

//function renderFullEmptyTable() {
//    const addTbody = document.getElementById("add-timetable-tbody");
//    if (!addTbody) return;

//    addTbody.innerHTML = "";
//    if (warningElement) warningElement.style.display = 'none'; 
//    periods.forEach(period => {
//        const tr = document.createElement("tr");
//        const timeTd = document.createElement("td");
//        timeTd.textContent = formatTime(period.start, period.end);
//        tr.appendChild(timeTd);

//        days.forEach(day => {
//            const td = document.createElement("td");
//            if (period.start === "10:55") {
//                td.textContent = "BREAK";
//                tr.classList.add("break");
//            } else {
//                td.innerHTML = `
//                    <div class="input-group">
//                        <input type="text" class="subject-input" placeholder="Subject" data-day="${day}" data-period="${period.id}">
//                        <input type="text" class="teacher-input" placeholder="Teacher ID" data-day="${day}" data-period="${period.id}">
//                    </div>
//                `;
//            }
//            tr.appendChild(td);
//        });
//        addTbody.appendChild(tr);
//    });
//}
//function getTeacherNameById(teacherId) {
//    const teacher = teachers.find(t => t.teacherNationalId === teacherId);
//    return teacher ? teacher.teacherFirstName : "Unknown Teacher";
//}
//const addBtnElement = document.querySelector('#add-btn');
//if (addBtnElement) {
//    addBtnElement.addEventListener('click', renderFullEmptyTable);
//}

//aside mobile
const asideMobile = document.querySelector('.mobile-aside');
const aside = document.getElementById('aside-mobile');
const asideClose = document.getElementById('aside-close');
asideMobile.addEventListener('click', () => {
    aside.style.setProperty('display', 'flex', 'important');
});
asideClose.addEventListener('click', () => {
    aside.style.setProperty('display', 'none', 'important');

});