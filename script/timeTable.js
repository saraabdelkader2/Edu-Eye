import { addNotification } from "./notifications.js";
import { teachers } from "./tlist.js";
import { periods, masterSchedule as initialSchedule } from "./periods.js"; // تغيير الاسم لتجنب التعارض
import { ModifyGeneric } from "./modify.js";

// DOM ELEMENTS
const gradeSelect = document.getElementById("Gradee");
const classSelect = document.getElementById("Classs");
const timetableSection = document.querySelector(".timetable-table");
const fillMessage = document.querySelector(".timetable-placeholder");
const tbody = document.querySelector(".timetable-table tbody");
const favicon = 'media copy/favicons/icons8-calendar-80.png';
const darkModeToggle = document.getElementById('darkModeToggle'); // تأكد من وجود هذا الـ ID في HTML
const warningElement = document.getElementById('form-warning');

// CONSTANTS & STORAGE KEYS
const LOCAL_CLASSES_KEY = 'schoolClassesList';
const LOCAL_SCHEDULE_KEY = 'schoolMasterSchedule'; // مفتاح الحفظ في LocalStorage
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

// INITIAL STATE 
// دمج البيانات المستوردة مع البيانات المخزنة محلياً
let masterSchedule = JSON.parse(localStorage.getItem(LOCAL_SCHEDULE_KEY)) || initialSchedule;
const allAddedClasses = JSON.parse(localStorage.getItem(LOCAL_CLASSES_KEY)) || [];

const addGradeSelect = document.querySelector('#add-timetable-form #Grade');
const addClassSelect = document.querySelector('#add-timetable-form #Class');

if (timetableSection) timetableSection.style.display = "none";

// EVENTS
if (gradeSelect) gradeSelect.addEventListener("change", handleSelection);
if (classSelect) classSelect.addEventListener("change", handleSelection);

// FUNCTIONS
function handleSelection() {
    const grade = gradeSelect.value;
    const className = classSelect.value;

    if (!grade || !className) {
        timetableSection.style.display = "none";
        return;
    }

    if (timetableSection) timetableSection.style.display = "table";
    if (fillMessage) fillMessage.style.display = 'none';

    const filteredSchedule = masterSchedule.filter(item =>
        item.grade === grade && item.class === className
    );

    renderTable(filteredSchedule);
}

function renderTable(schedule) {
    if (!tbody) return;
    tbody.innerHTML = "";

    periods.forEach(period => {
        const tr = document.createElement("tr");

        if (period.start === "10:55") {
            tr.classList.add("break");
        }

        const timeTd = document.createElement("td");
        timeTd.textContent = formatTime(period.start, period.end);
        tr.appendChild(timeTd);

        if (period.start === "10:55") {
            days.forEach(() => {
                const td = document.createElement("td");
                td.textContent = "Break";
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
            return;
        }

        days.forEach(day => {
            const td = document.createElement("td");
            const lesson = schedule.find(item =>
                item.day === day && item.periodId === period.id
            );

            if (lesson) {
                const teacherName = getTeacherNameById(lesson.teacherId);
                td.innerHTML = `
                    <strong>${lesson.subject}</strong><br>
                    <small>Mr / Ms: ${teacherName}</small>
                `;
            } else {
                td.textContent = "-";
            }
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

function getTeacherNameById(teacherId) {
    const teacher = teachers.find(t => t.teacherNationalId === teacherId);
    return teacher ? teacher.teacherFirstName : "Unknown Teacher";
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

// تعديل دالة التحكم
function controllingModify() {
    const addBtn = document.querySelector('#add-btn');
    const allBtn = document.querySelector('#all-timetables');
    const timeTableList = document.querySelector('.timetable-list-section');
    const timeTableForm = document.querySelector('.add-timetable-form');
    const editConfirmButtons = document.querySelector('.add-buttons');

    if (addBtn) {
        ModifyGeneric({
            addBtn,
            allBtn,
            listView: timeTableList,
            formView: timeTableForm,
            editConfirmButtons,
            favicon: favicon,
            listTitle: 'All Timetables',
            formTitle: 'Add Timetable',
            darkModeToggle
        });
    }
}
controllingModify();

// فورم الإضافة
function renderFullEmptyTable() {
    const addTbody = document.getElementById("add-timetable-tbody");
    if (!addTbody) return;

    addTbody.innerHTML = "";
    if (warningElement) warningElement.style.display = 'none'; // تصفير التحذيرات عند إعادة الرسم
    periods.forEach(period => {
        const tr = document.createElement("tr");
        const timeTd = document.createElement("td");
        timeTd.textContent = formatTime(period.start, period.end);
        tr.appendChild(timeTd);

        days.forEach(day => {
            const td = document.createElement("td");
            if (period.start === "10:55") {
                td.textContent = "BREAK";
                tr.classList.add("break");
            } else {
                td.innerHTML = `
                    <div class="input-group">
                        <input type="text" class="subject-input" placeholder="Subject" data-day="${day}" data-period="${period.id}">
                        <input type="text" class="teacher-input" placeholder="Teacher ID" data-day="${day}" data-period="${period.id}">
                    </div>
                `;
            }
            tr.appendChild(td);
        });
        addTbody.appendChild(tr);
    });
}

if (addClassSelect) {
    addClassSelect.addEventListener('change', () => {
        if (addGradeSelect.value) renderFullEmptyTable();
    });
}

const addBtnElement = document.querySelector('#add-btn');
if (addBtnElement) {
    addBtnElement.addEventListener('click', renderFullEmptyTable);
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

// SAVE BUTTON LOGIC
const saveBtn = document.querySelector('.save-button');
if (saveBtn) {
    saveBtn.addEventListener('click', () => {
        if (warningElement) warningElement.style.display = 'none';
        const grade = document.querySelector('#add-timetable-form #Grade').value;
        const className = document.querySelector('#add-timetable-form #Class').value;
        const rows = document.querySelectorAll('#add-timetable-tbody tr:not(.break-row)');

        if (!grade || !className) {
            if (warningElement) {
                warningElement.textContent = `Warning: Please choose class and grade first!`;
                warningElement.style.display = 'block';
            }
            return;
        }

        let newEntries = [];
        let isAllFilled = true;

        rows.forEach(row => {
            const subjectInputs = row.querySelectorAll('.subject-input');
            const teacherInputs = row.querySelectorAll('.teacher-input');

            subjectInputs.forEach((input, index) => {
                const subject = input.value.trim();
                const teacherId = teacherInputs[index].value.trim();
                const day = input.dataset.day;
                const periodId = parseInt(input.dataset.period);

                if (!subject || !teacherId) {
                    isAllFilled = false;
                    input.style.borderBottom = "1px solid red";
                } else {
                    input.style.borderBottom = "none";
                    newEntries.push({ grade, class: className, day, periodId, subject, teacherId });
                }
            });
        });

        if (!isAllFilled) {
            warningElement.textContent = 'Please fill all periods or put "-" in empty ones', 'error';
            warningElement.style.backgroundColor = '#f8d7da';
            warningElement.style.color = '#721c24';
            warningElement.style.display = 'block';
            return;
        }

        // تحديث المصفوفة
        masterSchedule = masterSchedule.filter(item => !(item.grade === grade && item.class === className));
        masterSchedule.push(...newEntries);
        localStorage.setItem(LOCAL_SCHEDULE_KEY, JSON.stringify(masterSchedule));

        addNotification(`Timetable for ${grade}-${className} saved successfully!`, 'success');
        document.querySelector('#all-timetables').click();
    });
}
const confirmModal = document.getElementById("confirm-modal");
const confirmMsg = document.getElementById("confirm-message");
const confirmYesBtn = document.getElementById("confirm-yes");
const confirmNoBtn = document.getElementById("confirm-no");

function showConfirm(message, onConfirm) {
    confirmMsg.textContent = message;
    confirmModal.classList.remove("hidden");

    confirmYesBtn.onclick = () => {
        confirmModal.classList.add("hidden");
        onConfirm();
    };

    confirmNoBtn.onclick = () => {
        confirmModal.classList.add("hidden");
    };
}

// RESET & CANCEL
const cancelBtn = document.querySelector('.add-buttons button:nth-child(1)');
if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
        showConfirm("Are you sure? All unsaved changes will be lost.", () => {
            document.querySelector("#all-timetables").click();
        });
    });

}

const resetBtn = document.querySelector('.add-buttons button:nth-child(2)');
if (resetBtn) {
    resetBtn.addEventListener("click", () => {
        showConfirm("Reset all fields?", () => {
            document.querySelectorAll("#add-timetable-form input")
                .forEach(i => i.value = "");

            addNotification("Form has been reset", "success");
            document.querySelector("#all-timetables").click();

        });
    });

}

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

// 1. أضف هذا المستمع للحدث (Event Listener) في قسم الأحداث (EVENTS)
if (gradeSelect) {
    gradeSelect.addEventListener("change", (e) => {
        updateMainClassOptions(e.target.value);
    });
}

// 2. أضف هذه الدالة في قسم الوظائف (FUNCTIONS)
function updateMainClassOptions(selectedGrade) {
    if (!classSelect) return;

    // مسح الخيارات القديمة
    classSelect.innerHTML = '<option value="" disabled selected hidden>Select Class</option>';

    if (!selectedGrade) return;

    // استخراج الفصول الفريدة المتاحة لهذا الجريد من الـ masterSchedule
    const availableClasses = masterSchedule
        .filter(item => item.grade === selectedGrade)
        .map(item => item.class);

    // حذف التكرار باستخدام Set
    const uniqueClasses = [...new Set(availableClasses)].sort();

    if (uniqueClasses.length === 0) {
        const option = document.createElement('option');
        option.textContent = "No classes found";
        option.disabled = true;
        classSelect.appendChild(option);
        return;
    }

    // إضافة الفصول المتاحة كخيارات
    uniqueClasses.forEach(className => {
        const option = document.createElement('option');
        option.value = className;
        option.textContent = className;
        classSelect.appendChild(option);
    });
}


const lockIcon = document.getElementById('lock');
if (lockIcon) {
    lockIcon.addEventListener('click', () => { window.location.href = './login.html' });
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