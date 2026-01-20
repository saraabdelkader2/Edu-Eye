import { ModifyGeneric } from "./modify.js";
import { addNotification } from "./notifications.js";
import { classes } from './clist.js';
import { determineClassification } from "./sList.js";

// --- 1. variables--
const LOCAL_CLASSES_KEY = 'schoolClassesList';
const LOCAL_STORAGE_KEY = 'schoolStudentsList';
const ITEMS_PER_PAGE = 10;
let currentPage = 0;
let searchTerm = "";

// DOM elements
const searchInput = document.querySelector('.search-box input');
const darkModeToggle = document.getElementById('darkModeToggle');
const favicon = document.getElementById('favicon');
const registeredClasses = document.querySelector('.registered-classes-number');
const tableBody = document.querySelector('.class-table tbody');
const slider = document.querySelector('.slider .pages');
const backBtn = document.querySelector('.back-page');
const afterBtn = document.querySelector('.after-page');


// --- 2. get information from storage ---
const students = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
const studentCounts = {};


students.forEach(student => {
    student.classification = determineClassification(student.grades);
    const grade = student.grade ? student.grade.toString().trim() : '';
    const cls = student.class ? student.class.toString().trim().toUpperCase() : '';
    const key = `${grade}-${cls}`;
    if (!studentCounts[key]) {
        studentCounts[key] = { total: 0, superior: 0, talented: 0, weak: 0 };
    }
    studentCounts[key].total++;
    const status = (student.classification || "").toLowerCase().trim();
    if (status === 'superior') studentCounts[key].superior++;
    else if (status === 'talented') studentCounts[key].talented++;
    else if (status === 'weak') studentCounts[key].weak++;
});

// --- 3.make class rray and save it to storage---
export let classesArray = JSON.parse(localStorage.getItem(LOCAL_CLASSES_KEY));
if (!classesArray) {
    classesArray = classes.map(c => {
        const key = `${c.grade}-${c.class.trim().toUpperCase()}`;
        const counts = studentCounts[key] || { total: 0, superior: 0, talented: 0, weak: 0 };
        return {
            grade: c.grade,
            className: c.class,
            leadingTeacher: c.leadingTeacher,
            total: counts.total,
            superior: counts.superior,
            talented: counts.talented,
            weak: counts.weak
        };
    });
    saveToStorage();
}

function saveToStorage() {
    localStorage.setItem(LOCAL_CLASSES_KEY, JSON.stringify(classesArray));
}

function sortClasses() {
    classesArray.sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        const order = ['A', 'B', 'C', 'D'];
        return order.indexOf(a.className.toUpperCase()) - order.indexOf(b.className.toUpperCase());
    });
}

// --- 4. دوال العرض والعمليات ---
function renderClasses() {
    tableBody.innerHTML = '';
    const filteredData = classesArray.filter(cls => {
        const matchString = `${cls.grade} ${cls.className} ${cls.leadingTeacher}`.toLowerCase();
        return matchString.includes(searchTerm.toLowerCase());
    });
    const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
    const start = currentPage * ITEMS_PER_PAGE;
    const pageData = filteredData.slice(start, start + ITEMS_PER_PAGE);

    pageData.forEach((cls, i) => {
        const actualIndex = classesArray.indexOf(cls);
        const row = document.createElement('tr');
        if (cls.isEditing) {
            row.innerHTML = `
                <td>${start + i + 1}</td>
                <td><input type="text" value="${cls.grade}-${cls.className}" class="edit-input"></td>
                <td><input type="text" value="${cls.leadingTeacher}" class="edit-input"></td>
                <td><input type="number" value="${cls.total}" class="edit-input-num" min="0"></td>
                <td><input type="number" value="${cls.superior}" class="edit-input-num" min="0"></td>
                <td><input type="number" value="${cls.talented}" class="edit-input-num" min="0"></td>
                <td><input type="number" value="${cls.weak}" class="edit-input-num" min="0"></td>
                <td class="actions flex">
                    <i class="fa-solid fa-check save-btn" title="Save"></i>
                    <i class="fa-solid fa-xmark cancel-btn" title="Cancel"></i>
                </td>`;
            row.querySelector('.save-btn').onclick = () => saveRow(actualIndex, row);
            row.querySelector('.cancel-btn').onclick = () => {
                delete cls.isEditing;
                renderClasses();
            };
        } else {
            row.innerHTML = `
                <td>${start + i + 1}</td>
                <td>${cls.grade} - ${cls.className}</td>
                <td>${cls.leadingTeacher}</td>
                <td>${cls.total || 0}</td>
                <td>${cls.superior || 0}</td>
                <td>${cls.talented || 0}</td>
                <td>${cls.weak || 0}</td>
                <td class="actions flex">
                    <i class="fa-regular fa-trash-can delete-btn"></i>
                    <i class="fa-solid fa-pen-to-square edit-btn"></i>
                </td>`;
            row.querySelector('.edit-btn').onclick = () => {
                cls.isEditing = true;
                renderClasses();
            };
            row.querySelector('.delete-btn').onclick = () => deleteRow(actualIndex);
        }
        tableBody.appendChild(row);
    });
    updateRegisteredClasses();
    updateSliderPages(totalPages);
}

function saveRow(index, rowElement) {
    const inputs = rowElement.querySelectorAll('input');
    const [grade, className] = inputs[0].value.split('-').map(s => s.trim());
    classesArray[index] = {
        ...classesArray[index],
        grade: grade || '',
        className: className || '',
        leadingTeacher: inputs[1].value,
        total: parseInt(inputs[2].value) || 0,
        superior: parseInt(inputs[3].value) || 0,
        talented: parseInt(inputs[4].value) || 0,
        weak: parseInt(inputs[5].value) || 0
    };
    delete classesArray[index].isEditing;
    saveToStorage();
    renderClasses();
    addNotification('Data updated successfully', 'success');
}

function deleteRow(index) {
    const popup = document.querySelector('.reset-pop-up');
    const blurLayer = document.getElementById('blur-layer');
    if (popup && blurLayer) {
        popup.style.display = 'flex';
        blurLayer.style.display = 'block';
    }
    document.getElementById('yes').onclick = () => {
        const deletedClassName = `${classesArray[index].grade} - ${classesArray[index].className}`;
        classesArray.splice(index, 1);
        saveToStorage();
        renderClasses();
        closePopup();
        if (typeof addNotification === 'function') {
            addNotification(`Class (${deletedClassName}) is removed successfully`, 'success');
        }
    };
    document.getElementById('no').onclick = closePopup;

    function closePopup() {
        popup.style.display = 'none';
        blurLayer.style.display = 'none';
    }
}

// --- 5.no repeated classes ---
function initFormActions() {
    const classForm = document.querySelector('.class-form-section form');
    const warningElement = document.getElementById('form-warning');
    const buttons = document.querySelectorAll('.add-buttons button');
    const cancelBtn = buttons[0];
    const resetBtn = buttons[1];
    const saveBtn = buttons[2];

    saveBtn.onclick = (e) => {
        e.preventDefault();
        const classNameVal = classForm.querySelector('[name="className"]').value.trim().toUpperCase();
        const gradeVal = classForm.querySelector('[name="grade"]').value;
        const teacherVal = classForm.querySelector('[name="leadingTeacher"]').value.trim();
        const studentsVal = parseInt(classForm.querySelector('[name="numberOfStudents"]').value) || 0;

        // 1. إخفاء أي تحذير سابق في كل مرة نضغط فيها حفظ
        if (warningElement) {
            warningElement.style.display = 'none';
            warningElement.style.backgroundColor = '#fff3cd'; // اللون الأصفر الافتراضي للتحذير
            warningElement.style.color = '#856404';
        }

        // 2. التحقق من الحقول الفارغة (تعديل الرسالة هنا)
        if (!classNameVal || !teacherVal || !gradeVal || !studentsVal) {
            if (warningElement) {
                warningElement.textContent = 'Error: Please fill in all required fields.';
                warningElement.style.backgroundColor = '#f8d7da'; // تغيير اللون للأحمر لأنها رسالة خطأ
                warningElement.style.color = '#721c24';
                warningElement.style.display = 'block';
                warningElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // 3. التحقق من تكرار الفصل
        const isDuplicate = classesArray.some(cls =>
            cls.grade.toString() === gradeVal.toString() &&
            cls.className.toUpperCase() === classNameVal
        );

        if (isDuplicate) {
            if (warningElement) {
                warningElement.textContent = `Warning: Class ${gradeVal}-${classNameVal} is already registered!`;
                warningElement.style.backgroundColor = '#fff3cd'; // العودة للون الأصفر للتحذير
                warningElement.style.color = '#856404';
                warningElement.style.display = 'block';
                warningElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // --- إذا مر من كل الشروط السابقة، يتم الحفظ بشكل طبيعي ---
        const newClass = {
            grade: gradeVal,
            className: classNameVal,
            leadingTeacher: teacherVal,
            total: studentsVal,
            superior: 0,
            talented: 0,
            weak: 0
        };

        classesArray.push(newClass);
        saveToStorage();
        sortClasses();
        renderClasses();
        classForm.reset();

        addNotification(`Class ${newClass.grade}-${newClass.className} is added successfully`, 'success');
        document.querySelector('#all-classes').click();
    };
    if (resetBtn) resetBtn.onclick = () => {
        classForm.reset();
        if (warningElement) warningElement.style.display = 'none';
    };

    if (cancelBtn) cancelBtn.onclick = () => {
        classForm.reset();
        if (warningElement) warningElement.style.display = 'none';
        document.querySelector('#all-classes').click();
    };
}

// --- 6. الإدارة والتنسيق ---
function updateSliderPages(totalPages) {
    slider.innerHTML = '';

    if (backBtn) backBtn.classList.toggle('disabled', currentPage === 0);
    if (afterBtn) afterBtn.classList.toggle('disabled', currentPage >= totalPages - 1);

    if (totalPages <= 1) return;

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
        if (currentPage > 0) {
            currentPage--;
            renderClasses();
        }
    });
}
if (afterBtn) {
    afterBtn.addEventListener('click', () => {
        const totalPages = getTotalPages();
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderClasses();
        }
    });
}


function updateRegisteredClasses() {
    if (registeredClasses) registeredClasses.textContent = classesArray.length;
}
window.classesArray = classesArray;

function getTotalPages() {
    const filteredData = classesArray.filter(cls => {
        const matchString = `${cls.grade} ${cls.className} ${cls.leadingTeacher}`.toLowerCase();
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

// تشغيل ابتدائي
sortClasses();
renderClasses();
controllingModify();
initFormActions();

// الإعدادات الإضافية
if (localStorage.getItem('darkMode') === 'enabled') document.body.classList.add('dark-mode');
darkModeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
};

const lockIcon = document.getElementById('lock');
if (lockIcon) {
    lockIcon.addEventListener('click', () => { window.location.href = './login.html' });
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});

const backToHome = document.querySelector('.back-to-home');
backToHome.addEventListener('click', () => {
    window.location.href = "/dashboard.html";
    //backToHome.style.display='none';
})