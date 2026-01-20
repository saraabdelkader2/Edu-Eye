// teachers.js (CORRECTED & FULL VERSION)

import { ModifyGeneric } from "./modify.js";
import { teachers } from "./tlist.js";
import { addNotification } from "./notifications.js";

// =============================
// Constants & Storage
// =============================
const ID_START = 1;
const LOCAL_STORAGE_KEY = 'schoolTeachersList';

const favicon = document.getElementById('favicon');
const searchInput = document.querySelector('.search-box input');
const darkModeToggle = document.getElementById('darkModeToggle');

// =============================
// Load from LocalStorage
// =============================
const storedTeachers = localStorage.getItem(LOCAL_STORAGE_KEY);
if (storedTeachers) {
    teachers.splice(0, teachers.length, ...JSON.parse(storedTeachers));
}

// =============================
// DOM Elements
// =============================
const addBtn = document.getElementById('add-btn');
const allBtn = document.getElementById('all-teachers');
const teacherList = document.querySelector('.teacher-list-section-1');
const teacherForm = document.querySelector('.teacher-form-section');
const editConfirmButtons = document.querySelector('.add-buttons');

const teachersTableBody = document.querySelector('tbody');
const slider = document.querySelector('.slider .pages');
const backBtn = document.querySelector('.back-page');
const afterBtn = document.querySelector('.after-page');

const form = document.getElementById('teacher-form');
const saveButton = document.querySelector('.save-form-button');
const resetButton = document.querySelector('.reset-form-button');
const cancelButton = document.querySelector('.cancel-form-button');

// =============================
// Init ModifyGeneric
// =============================
ModifyGeneric({
    addBtn,
    allBtn,
    listView: teacherList,
    formView: teacherForm,
    editConfirmButtons,
    favicon,
    listFavicon: '/./media copy/favicons/icons8-group-80.png',
    formFavicon: '././media copy/favicons/stydent-add.png',
    listTitle: 'All Teachers',
    formTitle: 'Add Teacher',
    darkModeToggle
});

// =============================
// Sorting + ID Assignment
// =============================
function reassignIdAndSorting() {
    teachers.sort((a, b) => {
        const nameA = `${a.teacherFirstName} ${a.teacherLastName}`;
        const nameB = `${b.teacherFirstName} ${b.teacherLastName}`;
        return nameA.localeCompare(nameB, 'ar', { sensitivity: 'base' });
    });

    // Reassign IDs
    teachers.forEach((teacher, index) => {
        teacher.id = (ID_START + index).toString();
    });

    saveTeachersToStorage();
}

function saveTeachersToStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(teachers));
}

reassignIdAndSorting();

// =============================
// Pagination
// =============================
let currentPage = 0;
let pagesCount = Math.ceil(teachers.length / 10);

function updateSliderPages() {
    slider.innerHTML = '';

    // تفعيل / تعطيل الأسهم
    if (backBtn) backBtn.classList.toggle('disabled', currentPage === 0);
    if (afterBtn) afterBtn.classList.toggle('disabled', currentPage >= pagesCount - 1);

    for (let i = 1; i <= pagesCount; i++) {
        slider.innerHTML += `
            <p class="page ${i === currentPage + 1 ? 'active-page' : ''}">${i}</p>
        `;
    }

    bindSliderEvents();
}

if (backBtn) {
    backBtn.addEventListener('click', () => {
        if (currentPage > 0) {
            currentPage--;
            showTeachers(currentPage);
            updateSliderPages();
        }
    });
}
if (afterBtn) {
    afterBtn.addEventListener('click', () => {
        if (currentPage < pagesCount - 1) {
            currentPage++;
            showTeachers(currentPage);
            updateSliderPages();
        }
    });
}

function bindSliderEvents() {
    const pages = slider.querySelectorAll('.page');
    pages.forEach((page, index) => {
        page.onclick = () => {
            currentPage = index;
            showTeachers(currentPage);
            pages.forEach(p => p.classList.remove('active-page'));
            page.classList.add('active-page');
        };
    });
}

// =============================
// Render Teachers
// =============================
function showTeachers(page) {
    const start = page * 10;
    const end = start + 10;
    const slice = teachers.slice(start, end);

    teachersTableBody.innerHTML = '';

    slice.forEach((teacher, idx) => {
                teachersTableBody.innerHTML += `
            <tr data-id="${teacher.id}">
                <td>${start + idx + 1}</td>
                <td>${`${teacher.teacherFirstName} ${teacher.teacherLastName}`}</td>
                <td>${teacher.Specialization}</td>
             
                <td>${teacher.teacherGender}</td>
                <td>${teacher.teacherAge}</td>
                <td>${teacher.teacherNoOfClasses}</td>
            </tr>`;
    });

    bindRowClicks();
}

function bindRowClicks() {
    const rows = teachersTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        row.onclick = () => {
            const id = row.dataset.id;
            const teacher = teachers.find(t => t.id === id);
            if (teacher) {
                localStorage.setItem('selectedTeacherData', JSON.stringify(teacher));
                window.location.href = './teacherPage.html';
            }
        };
    });
}

// =============================
// Search
// =============================
if (searchInput) {
    searchInput.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = teachers.filter(t =>
            (`${t.teacherFirstName} ${t.teacherLastName}`).toLowerCase().includes(q) || t.id.includes(q)
        );
        renderFiltered(filtered);
    });
}

function renderFiltered(list) {
    teachersTableBody.innerHTML = '';
    if (!list.length) {
        teachersTableBody.innerHTML = `<tr><td colspan="7">No results</td></tr>`;
        return;
    }

    list.forEach((teacher, idx) => {
        teachersTableBody.innerHTML += `
            <tr data-id="${teacher.id}">
                <td>${idx + 1}</td>
                <td>${teacher.teacherFirstName} ${teacher.teacherLastName}</td>
                <td>${teacher.Specialization}</td>
                <td>${teacher.teacherGender}</td>
                <td>${teacher.teacherAge}</td>
                <td>${teacher.teacherNoOfClasses}</td>
            </tr>`;
    });
}

// =============================
// Save / Add Teacher
// =============================
saveButton.addEventListener('click', (e) => {
    e.preventDefault();

    clearWarnings(); // نضمن مسح أي تحذيرات سابقة

    if (!validateTeacherForm(form)) return;

    const newNationalId = form.NationalId.value.trim();

    // ========= Duplicate Check =========
    const exists = teachers.some(t => t.teacherNationalId === newNationalId);
    if (exists) {
        // رسالة خطأ أسفل الحقل
        showError('.warning-national-id', `National ID already exists!`);
        return; // يمنع الإضافة
    }

    // ========= Create Teacher Data =========
    const teacherData = {
        id: '',
        teacherFirstName: form.teacherFirstName.value.trim(),
        teacherLastName: form.teacherLastName.value.trim(),
        teacherGender: form.gender.value,
        teacherNationality: form.teacherNationality.value,
        teacherReligion: form.teacherReligon.value,
        teacherDateOfBirth: form.dob.value,
        teacherAge: calculateAge(form.dob.value),
      
        teacherNationalId: newNationalId,
        teacherAddress: form.teacherAddress.value,
        teacherDateOfJoin: form.doj.value,
        teacherQualification: form.qualifications.value,
        teacherEmploymentType: form.type.value,
        Specialization: form.specification.value,
        teacherStatus: form.status.value,
        teacherEmail: form.Temail.value,
        teacherNoOfClasses: '0'
    };

    teachers.push(teacherData);
    reassignIdAndSorting();const counts = updateTeacherCounts();


    pagesCount = Math.ceil(teachers.length / 10);
    updateSliderPages();
    showTeachers(0);

    form.reset();

    addNotification(`${teacherData.teacherFirstName} ${teacherData.teacherLastName} Teacher added successfully`);
});


// =============================
// Reset / Cancel Form
// =============================
resetButton.addEventListener('click', (e) => {
    e.preventDefault();
    form.reset();
});

cancelButton.addEventListener('click', () => {
    teacherList.style.display = 'block';
    teacherForm.style.display = 'none';
    editConfirmButtons.style.display = 'none';
});

// =============================
// Helpers
// =============================
function clearWarnings() {
    document.querySelectorAll('.warning').forEach(w => w.textContent = '');
}

function showError(selector, message) {
    const el = document.querySelector(selector);
    if (el) el.textContent = message;
}

function validateTeacherForm(form) {
    clearWarnings();
    let isValid = true;

    if (!form.teacherFirstName.value.trim()) { showError('.warning-firstname', 'First name is required'); isValid = false; }
    if (!form.teacherLastName.value.trim()) { showError('.warning-lastname', 'Last name is required'); isValid = false; }
    if (!form.querySelector('input[name="gender"]:checked')) { showError('.warning-gender', 'Please select gender'); isValid = false; }
    if (!form.teacherNationality.value.trim()) { showError('.warning-nationality', 'Nationality is required'); isValid = false; }
    if (!form.teacherReligon.value.trim()) { showError('.warning-religion', 'Religion is required'); isValid = false; }
    if (!form.dob.value) { showError('.warning-dob', 'Date of birth is required'); isValid = false; }
    if (!/^\d{14}$/.test(form.NationalId.value.trim())) { showError('.warning-national-id', 'National ID must be 14 digits'); isValid = false; }
    if (!form.doj.value) { showError('.warning-doj', 'Join date is required'); isValid = false; }
    if (!form.teacherAddress.value.trim()) { showError('.warning-address', 'Address is required'); isValid = false; }
    if (!form.qualifications.value.trim()) { showError('.warning-qualifications', 'Qualifications are required'); isValid = false; }
    if (!form.type.value.trim()) { showError('.warning-type', 'Employment type is required'); isValid = false; }
    if (!form.status.value.trim()) { showError('.warning-status', 'Status is required'); isValid = false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.Temail.value)) { showError('.warning-email', 'Invalid email address'); isValid = false; }

    return isValid;
}

function calculateAge(dateOfBirth) {
    if (!dateOfBirth) return '';
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (today.getMonth() < birthDate.getMonth() || 
        (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// =============================
// Dark Mode & Back
// =============================
const body = document.body;
if (localStorage.getItem('darkMode') === 'enabled') body.classList.add('dark-mode');

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
});

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => { window.location.href = './login.html'; });

const backToHome = document.querySelector('.back-to-home');
backToHome.addEventListener('click', () => { window.location.href = "/dashboard.html"; });

// =============================
// Initial Render
// =============================
updateSliderPages();
showTeachers(0);

//count females and males count and total count
const registeredTeachersD = document.querySelector('.registered-teachers-number');
function updateTeacherCounts() {
    let femaleTCount = 0;
    let maleTCount = 0;

    teachers.forEach(t => {
        if (t.teacherGender === 'Female') femaleTCount++;
        else maleTCount++;
    });

    registeredTeachersD.innerHTML = femaleTCount + maleTCount;

    // لو عايزة تصدرهم
    return { total: femaleTCount + maleTCount, female: femaleTCount, male: maleTCount };
}
updateTeacherCounts();

//helpers 


// حفظ آخر صفحة مفتوحة عند الخروج أو إعادة تحميل الصفحة
window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});