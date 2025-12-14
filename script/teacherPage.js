import { addNotification } from "./notifications.js";
import { periods } from "./periods.js";

// ================== DOM Elements ==================
const favicon = document.getElementById('favicon');
const teacherPrimaryInfo = document.getElementById('teacherPrimaryInfo');
const buttons = document.querySelector('.buttons');
const editButton = document.querySelector('.edit-button');
const modifyButtons = document.querySelectorAll('.modify-content button');
const modifySections = document.querySelectorAll('.information');

const overViewButton = document.getElementById('overViewButton');
const scheduleTableButton = document.getElementById('scheduleTableButton');

const overViewSection = document.getElementById('overViewSection');
const scheduleSection = document.getElementById('scheduleSection');

// ================== Data ==================
const teacherDataKey = 'selectedTeacherData';
const LOCAL_STORAGE_KEY = 'schoolTeachersList';
let teacherImage = '';
let teacherData = JSON.parse(localStorage.getItem(teacherDataKey)) || null;

if (!teacherData) {
    console.error("Teacher data not found in localStorage");
    window.location.href = "./teacher.html";
}

// ================== Helpers ==================
function controllingPhoto(gender) {
    if (gender === "female") {
        teacherImage = "media copy/students/icons8-person-female-skin-type-4-80.png";
    } else {
        teacherImage = "media copy/students/icons8-person-male-skin-type-4-80.png";
    }
}

function deactivateAll() {
    modifyButtons.forEach(btn => btn.classList.remove('active-button-teacher-page'));
    modifySections.forEach(sec => sec.style.display = 'none');
}

function modifyToggling(button, section) {
    deactivateAll();
    button.classList.add('active-button-teacher-page');
    section.style.display = 'flex';
}

function renderHeader(editMode = false) {
    const gender = (teacherData.teacherGender || "").trim().toLowerCase();
    controllingPhoto(gender);

    teacherPrimaryInfo.innerHTML = `
        <img src="${teacherImage}" alt="" class="profile-photo">
        <div class="basic-primary-information">
            <h3 class="main">${teacherData.teacherFirstName} ${teacherData.teacherLastName}</h3>
            <p class="text-muted">ID: ${teacherData.id}</p>
            <p class="text-muted">Specialization: ${editMode ? `<input class="edit-input" name="Specialization" value="${teacherData.Specialization}">` : teacherData.Specialization}</p>
            <div class="grade-and-section flex">
                <p class="teacher-grade">Grade: ${editMode ? `<input class="edit-input" name="teacherGrade" value="${teacherData.teacherGrade}">` : teacherData.teacherGrade}</p>
                <p class="teacher-class">Class: ${editMode ? `<input class="edit-input" name="teacherClass" value="${teacherData.teacherClass}">` : teacherData.teacherClass}</p>
            </div>
        </div>
    `;
}

function renderTeacherPage(editMode = false) {
    renderHeader(editMode);

    buttons.innerHTML = '';
    buttons.appendChild(editButton);
    //editButton.style.display = 'flex';

    const renderInputs = (value, name) => `<input class="edit-input" name="${name}" value="${value}">`;

    if (!editMode) {
        overViewSection.innerHTML = `
            <div class="teacher-information">
                <h3 class="main">Personal Information</h3>
                <table>
                    <tr><td class="main">Full Name</td><td>${teacherData.teacherFirstName} ${teacherData.teacherLastName}</td></tr>
                    <tr><td class="main">Gender</td><td>${teacherData.teacherGender}</td></tr>
                    <tr><td class="main">Date of Birth</td><td>${teacherData.teacherDateOfBirth}</td></tr>
                    <tr><td class="main">Nationality</td><td>${teacherData.teacherNationality}</td></tr>
                    <tr><td class="main">Religion</td><td>${teacherData.teacherReligion}</td></tr>
                    <tr><td class="main">National ID</td><td>${teacherData.teacherNationalId}</td></tr>
                    <tr><td class="main">Address</td><td>${teacherData.teacherAddress}</td></tr>
                    <tr><td class="main">Email</td><td>${teacherData.teacherEmail}</td></tr>
                </table>
            </div>

            <div class="employment-information">
                <h3 class="main">Employment Information</h3>
                <table>
                    <tr><td class="main">Qualification</td><td>${teacherData.teacherQualification}</td></tr>
                    <tr><td class="main">Employment Type</td><td>${teacherData.teacherEmploymentType}</td></tr>
                    <tr><td class="main">Status</td><td>${teacherData.teacherStatus}</td></tr>
                    <tr><td class="main">Number of Classes</td><td>${teacherData.teacherNoOfClasses}</td></tr>
                </table>
            </div>
        `;
    } else {
        overViewSection.innerHTML = `
            <div class="teacher-information">
                <h3 class="main">Personal Information</h3>
                <table>
                    <tr><td class="main">Full Name</td><td>${renderInputs(`${teacherData.teacherFirstName} ${teacherData.teacherLastName}`, 'fullName')}</td></tr>
                    <tr><td class="main">Gender</td><td>${renderInputs(teacherData.teacherGender, 'teacherGender')}</td></tr>
                    <tr><td class="main">Date of Birth</td><td>${renderInputs(teacherData.teacherDateOfBirth, 'teacherDateOfBirth')}</td></tr>
                    <tr><td class="main">Nationality</td><td>${renderInputs(teacherData.teacherNationality, 'teacherNationality')}</td></tr>
                    <tr><td class="main">Religion</td><td>${renderInputs(teacherData.teacherReligion, 'teacherReligion')}</td></tr>
                    <tr><td class="main">National ID</td><td>${renderInputs(teacherData.teacherNationalId, 'teacherNationalId')}</td></tr>
                    <tr><td class="main">Address</td><td>${renderInputs(teacherData.teacherAddress, 'teacherAddress')}</td></tr>
                    <tr><td class="main">Email</td><td>${renderInputs(teacherData.teacherEmail, 'teacherEmail')}</td></tr>
                </table>
            </div>
            <div class="employment-information">
                <h3 class="main">Employment Information</h3>
                <table>
                    <tr><td class="main">Qualification</td><td>${renderInputs(teacherData.teacherQualification, 'teacherQualification')}</td></tr>
                    <tr><td class="main">Employment Type</td><td>${renderInputs(teacherData.teacherEmploymentType, 'teacherEmploymentType')}</td></tr>
                    <tr><td class="main">Status</td><td>${renderInputs(teacherData.teacherStatus, 'teacherStatus')}</td></tr>
                    <tr><td class="main">Number of Classes</td><td>${renderInputs(teacherData.teacherNoOfClasses, 'teacherNoOfClasses')}</td></tr>
                </table>
            </div>
        `;
    }
}

editButton.addEventListener('click', () => {
    renderTeacherPage(true);

    buttons.innerHTML = '';
    buttons.appendChild(editButton);
    editButton.style.display = 'none';

    const saveButton = document.createElement('button');
    saveButton.className = 'save-button flex';
    saveButton.textContent = 'Save';
    buttons.appendChild(saveButton);

    const cancelButton = document.createElement('button');
    cancelButton.className = 'cancel-button flex';
    cancelButton.textContent = 'Cancel';
    buttons.appendChild(cancelButton);

    const deleteButton = document.createElement('button');
    deleteButton.className = 'delete-button flex';
    deleteButton.textContent = 'Delete';
    buttons.appendChild(deleteButton);

    const gradeSection = document.querySelector('.grade-and-section');
    if (gradeSection) gradeSection.classList.add('disabled-hover');

    // -------- Save --------
    saveButton.onclick = () => {  

        const headerInputs = teacherPrimaryInfo.querySelectorAll('input.edit-input');
        teacherData.Specialization = headerInputs[0]?.value.trim() || '';
        teacherData.teacherGrade = headerInputs[1]?.value.trim() || '';
        teacherData.teacherClass = headerInputs[2]?.value.trim() || '';

        const inputs = overViewSection.querySelectorAll('input.edit-input');
        inputs.forEach(input => {
            const name = input.name;
            const value = input.value.trim();
            switch(name){
                case 'fullName':
                    const parts = value.split(' ');
                    teacherData.teacherFirstName = parts[0] || '';
                    teacherData.teacherLastName = parts.slice(1).join(' ') || '';
                    break;
                default:
                    teacherData[name] = value;
            }
        });

        controllingPhoto(teacherData.teacherGender);

        let allTeachers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        const index = allTeachers.findIndex(t => String(t.id) === String(teacherData.id));
        if (index !== -1) allTeachers[index] = teacherData;
        else allTeachers.push(teacherData);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allTeachers));
        localStorage.setItem(teacherDataKey, JSON.stringify(teacherData));
  editButton.style.display='none';
        renderTeacherPage(false);
        modifyToggling(overViewButton, overViewSection);
        addNotification(`Teacher ${teacherData.teacherFirstName} ${teacherData.teacherLastName} updated successfully`);
    };

    cancelButton.onclick = () => {
        renderTeacherPage(false);
        modifyToggling(overViewButton, overViewSection);
    };
    deleteButton.onclick = () => {
        document.body.style.overflow = 'hidden';
        document.getElementById('blur-layer').style.display = 'block';
        document.querySelector('.reset-pop-up').style.display = 'flex';

        const confirmed = document.getElementById('yes');
        const canceled = document.getElementById('no');

        confirmed.onclick = () => {
            let allTeachers = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
            allTeachers = allTeachers.filter(t => String(t.id) !== String(teacherData.id));
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allTeachers));
            localStorage.removeItem(teacherDataKey);
            document.title=`Teacher ${teacherData.teacherFirstName} ${teacherData.teacherLastName} is removed`;
            addNotification(`Teacher ${teacherData.teacherFirstName} ${teacherData.teacherLastName} removed successfully`);
            setTimeout(() => window.location.href = "./teacher.html", 1500);
        };

        canceled.onclick = () => {
            document.getElementById('blur-layer').style.display = 'none';
            document.querySelector('.reset-pop-up').style.display = 'none';
        };
    };
});

const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
if (localStorage.getItem('darkMode') === 'enabled') body.classList.add('dark-mode');

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
});

document.querySelector('.back-to-home').addEventListener('click', () => {
    window.location.href = "./teacher.html";
});

document.title = `${teacherData.teacherFirstName} ${teacherData.teacherLastName}`;

renderTeacherPage();
modifyToggling(overViewButton, overViewSection);

// ================== Schedule ==================
function renderTeacherSchedule(teacher) {
    const days = ["sunday", "monday", "tuesday", "wednesday", "thursday"];
    const tbody = document.getElementById("scheduleBody");
    tbody.innerHTML = "";

    periods.forEach(period => {
        const row = document.createElement("tr");
        row.innerHTML = `<td class="time-cell">${period.start} - ${period.end}</td>`;
        days.forEach(day => {
            const lesson = teacher.schedule?.[day]?.find(l => l.periodId === period.id);
            row.innerHTML += `<td class="lesson-cell">${lesson ? `<strong>${lesson.subject}</strong><br><small>${lesson.class}</small>` : "-"}</td>`;
        });
        tbody.appendChild(row);
    });
}

scheduleTableButton.addEventListener('click', () => {
    modifyToggling(scheduleTableButton, scheduleSection);
    renderTeacherSchedule(teacherData);
    editButton.style.display = 'none';
});

overViewButton.addEventListener('click', () => {
    modifyToggling(overViewButton, overViewSection);
    renderTeacherPage(false);
    //bla bla
    editButton.style.display='none';
});