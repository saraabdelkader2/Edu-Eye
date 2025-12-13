// teachers.js (FULL WORKING VERSION – mirrors students.js behavior)

import { ModifyGeneric } from "./modify.js";
import { teachers } from "./tlist.js";
import { addNotification } from "./notifications.js";

// =============================
// Constants & Storage
// =============================
const ID_START = 20;
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

const form = document.getElementById('teacher-form');
const saveButton = document.querySelector('.save-form-button');
const resetButton = document.querySelector('.reset-form-button');
const cancelButton = document.querySelector('.cancel-form-button');

// =============================
// Init ModifyGeneric (NO CHANGES)
// =============================
ModifyGeneric({
    addBtn,
    allBtn,
    listView: teacherList,
    formView: teacherForm,
    editConfirmButtons,
    favicon,
    listFavicon: './icons/teachers.svg',
    formFavicon: './icons/add-teacher.svg',
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
    for (let i = 1; i <= pagesCount; i++) {
        slider.innerHTML += `<p class="page ${i === 1 ? 'active-page' : ''}">${i}</p>`;
    }
    bindSliderEvents();
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
                <td>${teacher.teacherGrade} - ${teacher.teacherClass}</td>
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
// Save Teacher
// =============================
saveButton.addEventListener('click', (e) => {
    e.preventDefault();

    const teacherData = {
        id: '',
        teacherFirstName: form.teacherFirstName.value.trim(),
        teacherLastName: form.teacherLastName.value.trim(),
        Specialization: form.Specialization.value,
        teacherClass: form.teacherClass.value,
        teacherGrade: form.teacherGrade.value,
        teacherGender: form.gender.value,
        teacherAge: form.teacherAge.value,
        teacherNoOfClasses: form.teacherNoOfClasses.value,
        teacherNationality: form.teacherNationality.value,
        teacherNationalId: form.teacherNationalId.value,
        teacherReligion: form.teacherReligion.value,
        teacherDateOfBirth: form.teacherDateOfBirth.value,
        teacherDateOfBirthJoin: form.teacherDateOfBirthJoin.value,
        teacherAddress: form.teacherAddress.value,
        teacherPhone: form.teacherPhone.value,
        teacherQualification: form.teacherQualification.value,
        teacherEmploymentType: form.teacherEmploymentType.value,
        teacherExperience: form.teacherExperience.value,
        teacherStatus: 'active',
        teacherEmail: form.teacherEmail.value
    };

    teachers.push(teacherData);
    reassignIdAndSorting();
    pagesCount = Math.ceil(teachers.length / 10);

    updateSliderPages();
    showTeachers(0);
    form.reset();

    addNotification(`${teacherData.teacherName} added successfully`);
});

// =============================
// Reset / Cancel
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
// Search
// =============================
if (searchInput) {
    searchInput.addEventListener('input', e => {
        const q = e.target.value.toLowerCase();
        const filtered = teachers.filter(t =>
            t.teacherName.toLowerCase().includes(q) || t.id.includes(q)
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
                <td>${teacher.teacherName}</td>
                <td>${teacher.Specialization}</td>
                <td>${teacher.teacherGrade} - ${teacher.teacherClass}</td>
                <td>${teacher.teacherGender}</td>
                <td>${teacher.teacherAge}</td>
                <td>${teacher.teacherNoOfClasses}</td>
            </tr>`;
    });
}

// =============================
// Dark Mode Restore
// =============================
if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}

// =============================
// Init
// =============================
updateSliderPages();
showTeachers(0);



//count females and males count and total count
const registeredTeachersD = document.querySelector('.registered-teachers-number');
let femaleTCount = 0;
let maleTCount = 0;
teachers.forEach(element => {
    if (element.teacherGender === 'Female') {
        femaleTCount++;
    } else {
        maleTCount++;
    }
});
export const registeredTeachers = femaleTCount + maleTCount;
export const femaleTCounted = femaleTCount;
export const maleTCounted = maleTCount;
registeredTeachersD.innerHTML = (femaleTCount + maleTCount);

//helpers 
const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
})

const body = document.body;


// عند تحميل الصفحة، شوف لو المستخدم مفعل Dark Mode
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}

// Toggle عند الضغط على الزرار
darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    // حفظ الحالة في LocalStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
});
// حفظ آخر صفحة مفتوحة عند الخروج أو إعادة تحميل الصفحة
window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});