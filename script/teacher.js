import { ModifyGeneric } from "./modify.js";
import { addNotification } from "./notifications.js";


const API_BASE = "https://ece2026.onrender.com/webapi";
let teachers = [];
let originalTeachers = [];

async function fetchTeachersFromServer() {
    try {
        const response = await fetch(`${API_BASE}/teachers`);
        if (!response.ok) throw new Error("Network error");

        const data = await response.json();
        console.log("API RESPONSE:", data);

        if (!data || !Array.isArray(data.teachers)) {
            throw new Error("Teachers array not found");
        }

        const serverTeachers = data.teachers;

        const mappedTeachers = serverTeachers.map(t => {
            const nameParts = t.FullName.trim().split(" ");

            return {
                id: String(t.TeacherID),
                teacherFirstName: nameParts[0],
                teacherLastName: nameParts.slice(1).join(" "),
                teacherGender: t.Gender,
                teacherAge: t.Age,
                Specialization: t.Specialization,
                teacherNoOfClasses: t.NumOfClasses
            };
        });

        teachers.length = 0;
        teachers.push(...mappedTeachers);
        originalTeachers = [...mappedTeachers];

        refreshUI();

    } catch (error) {
        console.error(error);
        addNotification("Failed to load teachers!", "error");
    }
}


fetchTeachersFromServer();
fetchSubjects();

function refreshUI() {
    sortingOnly();
    pagesCount = Math.ceil(teachers.length / 10);
    currentPage = 0;
    updateSliderPages();
    showTeachers(0);
    const registeredTeachersD = document.querySelector('.registered-teachers-number');
    registeredTeachersD.innerHTML = teachers.length;
}

function showTeachers(page) {
    const start = page * 10;
    const end = start + 10;

    const desktopSlice = teachers.slice(start, end);


    const mobileData = teachers;

    const tableBody = document.querySelector('tbody');
    const tableMobileContainer = document.querySelector('.table-mobile');

    if (tableBody) tableBody.innerHTML = '';
    if (tableMobileContainer) tableMobileContainer.innerHTML = '';

    desktopSlice.forEach((teacher, idx) => {
        const fullName = `${teacher.teacherFirstName} ${teacher.teacherLastName}`;
        if (tableBody) {
            tableBody.innerHTML += `
                <tr data-id="${teacher.id}">
                    <td>${start + idx + 1}</td>
                    <td>${fullName}</td>
                    <td>${teacher.Specialization}</td>
                    <td>${teacher.teacherGender}</td>
                    <td>${teacher.teacherAge}</td>
                    <td>${teacher.teacherNoOfClasses}</td>
                </tr>`;
        }
    });

    mobileData.forEach((teacher) => {
        const fullName = `${teacher.teacherFirstName} ${teacher.teacherLastName}`;


        const genderImage = teacher.teacherGender === "Male" ?
            "media copy/students/icons8-person-male-skin-type-4-80.png" :
            "media copy/students/icons8-person-female-skin-type-4-80.png";

        if (tableMobileContainer) {
            tableMobileContainer.innerHTML += `
            <div class="teacher-card" data-id="${teacher.id}">
                <div class="card-header">
                    <div class="user-icon flex">
                        <img src="${genderImage}" alt="${teacher.teacherGender}">
                        <h4 class="student-name">${fullName}</h4>
                    </div>
                </div>
                <div class="card-body">
                    <div class="info-row"><span class="label">ID</span> <span class="value">${teacher.id}</span></div>
                    <div class="info-row"><span class="label">Spec.</span> <span class="value">${teacher.Specialization}</span></div>
                    <div class="info-row"><span class="label">Gender</span> <span class="value">${teacher.teacherGender}</span></div>
                    <div class="info-row"><span class="label">Age</span> <span class="value">${teacher.teacherAge}</span></div>
                </div>
            </div>`;
        }
    });
    bindRowClicks();
}

let subjects = [];

async function fetchSubjects() {
    try {
        const res = await fetch(`${API_BASE}/subjects`);
        if (!res.ok) throw new Error("Failed to fetch subjects");

        subjects = await res.json();
        populateSubjectsSelect();

    } catch (err) {
        console.error(err);
        addNotification("Failed to load subjects!", "error");
    }
}

function populateSubjectsSelect() {
    const select = document.getElementById("subject-select");
    if (!select) return;

    select.innerHTML = `<option value="">Select Subject</option>`;

    subjects.forEach(sub => {
        select.innerHTML += `
            <option value="${sub.SubjectID}">
                ${sub.SubjectName}
            </option>
        `;
    });
}

// DOM Elements
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
const saveButton = document.querySelectorAll('.save-form-button');
const resetButton = document.querySelectorAll('.reset-form-button');
const cancelButton = document.querySelectorAll('.cancel-form-button');
const favicon = document.getElementById('favicon');
const searchInput = document.querySelector('.search-box input');
const darkModeToggle = document.getElementById('darkModeToggle');


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

// Sorting 
function sortingOnly() {
    teachers.sort((a, b) => {
        const nameA = `${a.teacherFirstName} ${a.teacherLastName}`;
        const nameB = `${b.teacherFirstName} ${b.teacherLastName}`;
        return nameA.localeCompare(nameB, 'ar', { sensitivity: 'base' });
    });



}

// Pagination
let currentPage = 0;
let pagesCount = Math.ceil(teachers.length / 10);

function updateSliderPages() {
    slider.innerHTML = '';

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

function bindRowClicks() {
    const rows = teachersTableBody.querySelectorAll('tr');
    rows.forEach(row => {
        row.onclick = () => {
            handleRowSelection(row.dataset.id);
        };
    });

    const cards = document.querySelectorAll('.teacher-card');
    cards.forEach(card => {
        card.onclick = () => {
            handleRowSelection(card.dataset.id);
        };
    });
}

function handleRowSelection(id) {
    const teacher = teachers.find(t => t.id === id);
    if (teacher) {
        localStorage.setItem('selectedTeacherData', JSON.stringify(teacher));
        window.location.href = `./teacherPage.html?id=${teacher.id}`;
    }
}

// Search
searchInput.addEventListener('input', e => {
    const q = e.target.value.toLowerCase();

    teachers = q ?
        originalTeachers.filter(t =>
            (`${t.teacherFirstName} ${t.teacherLastName}`).toLowerCase().includes(q) ||
            t.id.includes(q)
        ) : [...originalTeachers];

    refreshUI();
});

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
// Save / Add Teacher
// Save / Add Teacher
saveButton.forEach(btn => {
    btn.addEventListener("click", async(e) => {
        e.preventDefault();

        clearWarnings();
        if (!validateTeacherForm(form)) return;

        if (!form.subjectID.value) {
            showError('.warning-subject', 'Subject is required');
            return;
        }

        const currentBtn = e.target;
        const originalContent = currentBtn.innerHTML;
        currentBtn.disabled = true;
        currentBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Saving...`;
        currentBtn.style.opacity = "0.7";

        let genderInput = form.querySelector('input[name="gender"]:checked');
        const teacherGender = genderInput ? genderInput.value : '';

        const payload = {
            firstName: form.teacherFirstName.value.trim(),
            lastName: form.teacherLastName.value.trim(),
            gender: teacherGender,
            religion: form.teacherReligon.value,
            dateOfBirth: form.dob.value,
            nationalID: Number(form.NationalId.value),
            email: form.Temail.value.trim(),
            phone: form.teacherPhone.value.trim(),
            address: form.teacherAddress.value.trim(),
            qualification: form.qualifications.value.trim(),
            subjectID: Number(form.subjectID.value)
        };

        try {
            const res = await fetch(`${API_BASE}/addTeacher`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({}));
                throw new Error('Server rejected the request');
            }

            // --- 2. في حالة النجاح ---
            addNotification("Teacher added successfully");
            form.reset();

            // تحديث القائمة فوراً
            await fetchTeachersFromServer();

            // العودة تلقائياً لجدول المدرسين وإخفاء الفورم
            teacherList.style.display = 'block';
            teacherForm.style.display = 'none';
            editConfirmButtons.style.display = 'none';
            favicon.href = '/./media copy/favicons/icons8-group-80.png'; // إعادة الأيقونة الأصلية

        } catch (err) {
            console.error(err);
            addNotification("Failed to save teacher!", "error");
        } finally {
            // --- 3. إعادة الزر لحالته الطبيعية مهما كانت النتيجة ---
            currentBtn.disabled = false;
            currentBtn.innerHTML = originalContent;
            currentBtn.style.opacity = "1";
        }
    });
});

// Reset / Cancel Form
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

            form.reset();
            teacherList.style.display = 'block';
            teacherForm.style.display = 'none';
            editConfirmButtons.style.display = 'none';
            genderRadios.forEach(radio => radio.checked = false);


            document.body.style.overflow = 'auto';
        });

        canceled.addEventListener('click', () => {
            document.getElementById('blur-layer').style.display = 'none'; // يشغل البلور
            document.querySelector('.reset-pop-up').style.display = 'none'; // يعرض البوب أب

        });
    });
});
cancelButton.forEach(btn => {
    btn.addEventListener('click', () => {
        teacherList.style.display = 'block';
        teacherForm.style.display = 'none';
        editConfirmButtons.style.display = 'none';
    });
});


// Helpers
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

    if (!form.teacherFirstName.value.trim()) {
        showError('.warning-firstname', 'First name is required');
        isValid = false;
    }
    if (!form.teacherLastName.value.trim()) {
        showError('.warning-lastname', 'Last name is required');
        isValid = false;
    }
    if (!form.querySelector('input[name="gender"]:checked')) {
        showError('.warning-gender', 'Please select gender');
        isValid = false;
    }
    if (!form.teacherPhone.value.trim()) {
        showError('.warning-phone', 'Nationality is required');
        isValid = false;
    }
    if (!form.teacherReligon.value.trim()) {
        showError('.warning-religion', 'Religion is required');
        isValid = false;
    }
    if (!form.dob.value) {
        showError('.warning-dob', 'Date of birth is required');
        isValid = false;
    }
    if (!/^\d{14}$/.test(form.NationalId.value.trim())) {
        showError('.warning-national-id', 'National ID must be 14 digits');
        isValid = false;
    }
    if (!form.doj.value) {
        showError('.warning-doj', 'Join date is required');
        isValid = false;
    }
    if (!form.teacherAddress.value.trim()) {
        showError('.warning-address', 'Address is required');
        isValid = false;
    }
    if (!form.qualifications.value.trim()) {
        showError('.warning-qualifications', 'Qualifications are required');
        isValid = false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.Temail.value)) {
        showError('.warning-email', 'Invalid email address');
        isValid = false;
    }

    return isValid;
}

// Dark Mode & Back
const body = document.body;
if (localStorage.getItem('darkMode') === 'enabled') body.classList.add('dark-mode');

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
});

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => { window.location.href = './index.html'; });

const backToHome = document.querySelector('.back-to-home');
backToHome.addEventListener('click', () => {
    const lastPage = localStorage.getItem('lastVisitedPage');

    if (lastPage && lastPage !== window.location.pathname) {
        window.location.href = lastPage;
    } else {
        window.location.href = "/dashboard.html"; // fallback
    }
});


window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
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