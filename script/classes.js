import { ModifyGeneric } from "./modify.js";
import { addNotification } from "./notifications.js";


// --- 1. variables ---
const ITEMS_PER_PAGE = 10;
let classesArray = [];
let currentPage = 0;
let searchTerm = "";
let teachersArray = [];
// DOM elements
const searchInput = document.querySelector('.search-box input');
const darkModeToggle = document.getElementById('darkModeToggle');
const favicon = document.getElementById('favicon');
const registeredClasses = document.querySelector('.registered-classes-number');
const tableBody = document.querySelector('.class-table tbody');
const slider = document.querySelector('.slider .pages');
const backBtn = document.querySelector('.back-page');
const afterBtn = document.querySelector('.after-page');
const formWarning = document.getElementById('form-warning');


const API_BASE = "https://ece2026.onrender.com/webapi";

async function fetchClasses() {
    try {
        const res = await fetch(`${API_BASE}/classes`);
        if (!res.ok) throw new Error('Failed to fetch classes');

        const response = await res.json();
        console.log("Classes API Response:", response);

        // Use response.data instead of response directly
        const dataArray = Array.isArray(response.data) ? response.data : [];

        // داخل دالة fetchClasses
        return dataArray.map(c => {
            const fullClassName = c["Class"] || "";
            const nameParts = fullClassName.split('-');

            const gradePart = nameParts[0] ? nameParts[0].replace('G', '').trim() : "";
            const classLetter = nameParts[1] ? nameParts[1].trim() : "";

            return {
                classId: c.ClassID,
                teacherId: c.TeacherID || null,
                grade: gradePart,
                className: classLetter,
                leadingTeacher: c["The leading teacher"] || "N/A",
                room: c["Room No."] || "-",
                total: c["Num of students"] || 0,
                talented: c["Talent"] || 0,
                superior: c["Superior"] || 0,
                good: c["Good"] || 0,
                weak: c["Weak"] || 0,
                fail: c["Fail"] || 0
            };
        });

    } catch (err) {
        console.error("Fetch Classes Error:", err);
        return [];
    }
}

function sortClasses() {
    classesArray.sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        const order = ['A', 'B', 'C', 'D'];
        return order.indexOf(a.className.toUpperCase()) - order.indexOf(b.className.toUpperCase());
    });
}

function renderClasses() {
    tableBody.innerHTML = '';
    const filteredData = classesArray.filter(cls =>
        `${cls.grade} ${cls.className} ${cls.leadingTeacher}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const start = currentPage * ITEMS_PER_PAGE;
    const pageData = filteredData.slice(start, start + ITEMS_PER_PAGE);

    pageData.forEach((cls, i) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${start + i + 1}</td>
            <td>${cls.grade} - ${cls.className}</td>
            <td>${cls.leadingTeacher || 'N/A'}</td>
            <td>${cls.total}</td>
            <td>${cls.superior}</td>
            <td>${cls.talented}</td>
            <td>${cls.weak}</td>
        `;

        row.addEventListener('click', () => {
            const url = `./classPage.html?id=${cls.classId}&grade=${cls.grade}&className=${cls.className}&teacher=${encodeURIComponent(cls.leadingTeacher)}`;

            console.log("Navigating to:", url);
            window.location.href = url;
        });
        tableBody.appendChild(row);
    });
    updateSliderPages(Math.ceil(filteredData.length / ITEMS_PER_PAGE));
    updateRegisteredClasses();
}



async function populateTeachersDropdown() {
    const select = document.getElementById('teacherSelect');
    if (!select) return;

    try {
        const res = await fetch(`${API_BASE}/teachersList`);
        if (!res.ok) throw new Error('Failed to fetch teachers');

        const teachers = await res.json();

        localStorage.setItem('teachersArray', JSON.stringify(teachers));
        teachersArray = teachers;

        select.innerHTML = '<option value="">-- Select Teacher --</option>';

        teachers.forEach(teacher => {
            const option = document.createElement('option');
            option.value = teacher.TeacherID;
            option.textContent = teacher.FullName;
            select.appendChild(option);
        });

    } catch (err) {
        console.error('Error fetching teachers:', err);
    }
}

async function addNewClass(payload) {
    console.log("Sending Payload to API:", JSON.stringify(payload));

    try {
        const res = await fetch(`${API_BASE}/addClass`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

    } catch (err) {
        console.error("Save Error:", err);
        addNotification("Error saving class!");
    }
}

function initFormActions() {
    document.addEventListener('click', async(e) => {
        if (e.target && e.target.classList.contains('save-form-button')) {
            e.preventDefault();

            const gradeElem = document.getElementById('grade');
            const symbolInput = document.querySelector('input[name="className"]');
            const teacherSelect = document.getElementById('teacherSelect');

            const grade = gradeElem ? gradeElem.value : '';
            const symbol = symbolInput ? symbolInput.value.trim().toUpperCase() : '';
            const teacherID = teacherSelect ? teacherSelect.value : '';

            if (!grade || !symbol || !teacherID) {
                const formWarning = document.getElementById('form-warning');
                if (formWarning) {
                    formWarning.textContent = 'Please fill all fields!';
                    formWarning.style.display = 'block';
                }
                return;
            }

            const payload = {
                symbol: symbol,
                gradeID: parseInt(grade, 10),
                teacherID: parseInt(teacherID, 10)
            };

            // --- التعديل هنا لعمل تأثير الـ Saving ---
            const saveBtn = e.target;
            const originalText = saveBtn.innerHTML; // نحفظ الشكل الأصلي (ربما يحتوي على أيقونة)

            saveBtn.disabled = true; // تعطيل الزر
            saveBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Saving...`; // تغيير النص وإضافة أنيميشن تحميل
            saveBtn.style.opacity = "0.7";
            saveBtn.style.cursor = "not-allowed";

            try {
                await addNewClass(payload);

                addNotification("Class added successfully!");

                if (symbolInput) symbolInput.value = '';
                if (teacherSelect) teacherSelect.value = '';

                classesArray = await fetchClasses();
                renderClasses();

                document.querySelector('.class-list-section').style.display = 'block';
                document.querySelector('.class-form-section').style.display = 'none';
                document.querySelector('.add-buttons').style.display = 'none';

            } catch (err) {
                console.error("Submit Error:", err);
                addNotification("Failed to save class", "error");
            } finally {
                saveBtn.disabled = false;
                saveBtn.innerHTML = originalText;
                saveBtn.style.opacity = "1";
                saveBtn.style.cursor = "pointer";
            }
        }
    });
}
const resetButton = document.querySelectorAll('.reset-form-button');
const cancelButton = document.querySelectorAll('.cancel-form-button');

resetButton.forEach(btn => {

    btn.addEventListener('click', (e) => {
        e.preventDefault();
        document.body.style.overflow = 'hidden'; // no scroll
        document.getElementById('blur-layer').style.display = 'block';
        document.querySelector('.reset-pop-up').style.display = 'flex';
        const confirmed = document.getElementById('yes');
        const canceled = document.getElementById('no');
        confirmed.addEventListener('click', () => {
            document.getElementById('blur-layer').style.display = 'none';
            document.querySelector('.reset-pop-up').style.display = 'none';
            const symbolInput = document.querySelector('input[name="className"]');
            const teacherSelect = document.getElementById('teacherSelect');
            if (symbolInput) symbolInput.value = '';
            if (teacherSelect) teacherSelect.value = '';
            document.querySelector('.class-list-section').style.display = 'block';
            document.querySelector('.class-form-section').style.display = 'none';
            document.querySelector('.add-buttons').style.display = 'none';
            document.body.style.overflow = 'auto';
        });
        canceled.addEventListener('click', () => {
            document.getElementById('blur-layer').style.display = 'none';
            document.querySelector('.reset-pop-up').style.display = 'none';
        });
    });
});
cancelButton.forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelector('.class-list-section').style.display = 'block';
        document.querySelector('.class-form-section').style.display = 'none';
        document.querySelector('.add-buttons').style.display = 'none';
        document.body.style.overflow = 'auto';
    });
});


function clearClassForm() {


}

function updateSliderPages(totalPages) {
    const slider = document.querySelector('.slider .pages');
    slider.innerHTML = '';

    if (backBtn) backBtn.classList.toggle('disabled', currentPage === 0);
    if (afterBtn) afterBtn.classList.toggle('disabled', currentPage >= totalPages - 1);

    for (let i = 1; i <= totalPages; i++) {
        const p = document.createElement('p');
        p.textContent = i;
        if (i === currentPage + 1) p.className = 'active-page';
        p.onclick = () => {
            currentPage = i - 1;
            renderClasses();
        };
        slider.appendChild(p);
    }
}
if (backBtn) {
    backBtn.addEventListener('click', () => {
        if (currentPage === 0) return;
        currentPage--;
        renderClasses();
    });
}
if (afterBtn) {
    afterBtn.addEventListener('click', () => {
        const totalPages = getTotalPages();
        if (currentPage >= totalPages - 1) return;
        currentPage++;
        renderClasses();
    });
}

function updateRegisteredClasses() {
    const registeredClasses = document.querySelector('.registered-classes-number');
    if (registeredClasses) registeredClasses.textContent = classesArray.length;
}


function getTotalPages() {
    const filteredData = classesArray.filter(cls => {
        const matchString = `
            ${cls.grade}
            ${cls.className}
            ${cls.leadingTeacher}
        `.toLowerCase();

        return matchString.includes(searchTerm.toLowerCase());
    });

    return Math.ceil(filteredData.length / ITEMS_PER_PAGE);
}


if (searchInput) {
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        currentPage = 0;
        renderClasses();
    });
}
async function initClasses() {
    if (!teachersArray || teachersArray.length === 0) {
        await populateTeachersDropdown();
    }
    classesArray = await fetchClasses();
    sortClasses();
    renderClasses();
}

window.addEventListener('DOMContentLoaded', async() => {
    initFormActions();
    await populateTeachersDropdown();
    await initClasses();
    controllingModify();
});

function controllingModify() {
    ModifyGeneric({
        addBtn: document.querySelector('#add-btn'),
        allBtn: document.querySelector('#all-classes'),
        listView: document.querySelector('.class-list-section'),
        formView: document.querySelector('.class-form-section'),
        editConfirmButtons: document.querySelector('.add-buttons'),
        favicon,
        listTitle: 'All Classes',
        formTitle: 'Add Class',
        darkModeToggle
    });
}

const body = document.body;


if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
});

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
aside.style.setProperty('display', 'none', 'important');