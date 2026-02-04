import { addNotification } from "./notifications.js";



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



let teacherImage = '';
const API_BASE = "https://ece2026.onrender.com/webapi";
async function fetchTeacherData(id) {
    try {
        const res = await fetch(API_BASE + "/teacherPage/" + id);
        if (!res.ok) throw new Error("Network error");

        const json = await res.json();
        if (!json.success || !json.data) {
            throw new Error("Failed to fetch teacher data");
        }

        var d = json.data;

        teacherData = {
            id: d.TeacherID || "",
            teacherFirstName: d.FirstName ? d.FirstName.trim() : "",
            teacherLastName: d.LastName ? d.LastName.trim() : "",
            teacherFullName: d.FullName ? d.FullName.trim() : "",
            teacherGender: d.Gender || "",
            teacherDateOfBirth: d.DateOfBirth ?
                d.DateOfBirth.replace(/\s/g, "").split("T")[0] : "",
            teacherReligion: d.Religion || "",
            teacherNationalId: d.NationalID || "",
            teacherAddress: d.Address || "",
            teacherPhone: d["Phone"] || "",
            teacherEmail: d.Email ?
                d.Email.replace(/\s/g, "") : "",
            teacherQualification: d.Qualification || "",
            teacherEmploymentType: d.EmploymentType || "",
            teacherStatus: d.Status || "",
            teacherSpecialization: d.Specialization || "",
            teacherNoOfClasses: typeof d.NumberOfClasses === "number" ?
                d.NumberOfClasses : 0
        };

        document.title = teacherData.teacherFullName;

        renderTeacherPage();
        modifyToggling(overViewButton, overViewSection);

        console.log("Fetched teacher data:", teacherData);
    } catch (err) {
        console.error(err);
        addNotification("Failed to load teacher data", "error");
    }
}


const urlParams = new URLSearchParams(window.location.search);
const teacherId = urlParams.get('id');
let teacherData;

if (teacherId) {
    fetchTeacherData(teacherId);
} else {
    // fallback
    const stored = localStorage.getItem('selectedTeacherData');
    if (stored) {
        teacherData = JSON.parse(stored);
        renderTeacherPage();
        modifyToggling(overViewButton, overViewSection);
    } else {
        window.location.href = "./teacher.html";
    }
}
async function updateTeacher() {
    // نعمل object فارغ
    const body = {};

    // نضيف القيم اللي موجودة بس
    if (teacherData.teacherPhone) body.phone = teacherData.teacherPhone;
    if (teacherData.teacherAddress) body.address = teacherData.teacherAddress;
    if (teacherData.teacherQualification) body.qualification = teacherData.teacherQualification;
    if (teacherData.subjectID !== undefined && teacherData.subjectID !== '') {
        body.subjectID = teacherData.subjectID; // أو teacherData.teacherSpecialization لو حابة تبعتي الاسم
    }

    console.log("Payload being sent:", body);

    const res = await fetch(`${API_BASE}/editTeacher/${teacherData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    const json = await res.json();

    console.log("Response from server:", json);

    if (json.success) {
        addNotification("Data updates successfully ");
    } else {
        addNotification("Failed to save", "error");
    }
}



async function deleteTeacher(id) {
    try {
        const res = await fetch(`${API_BASE}/deleteTeacher/${id}`, { method: 'DELETE' });
        const json = await res.json();
        if (!json.success) throw new Error(json.message);
        addNotification("Teacher record is deleted successfully");
        window.location.href = "./teacher.html";
    } catch (err) {
        console.error(err);
        addNotification("Failed to delete a teacher!", "error");
    }
}


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
            <p class="text-muted">Specialization: ${editMode ? `<select class="edit-input" name="subjectID">
  ${subjectsList.map(s =>
    `<option value="${s.SubjectID}">${s.SubjectName}</option>`
  ).join('')}
</select>
` : teacherData.teacherSpecialization}</p>
     
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
                    <tr><td class="main">Religion</td><td>${teacherData.teacherReligion}</td></tr>
                    <tr><td class="main">Phone</td><td>${teacherData.teacherPhone}</td></tr>
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
                    <tr><td class="main">Full Name</td><td>${`${teacherData.teacherFirstName} ${teacherData.teacherLastName}`}</td></tr>
                    <tr><td class="main">Gender</td><td>${teacherData.teacherGender}</td></tr>
                    <tr><td class="main">Date of Birth</td><td>${teacherData.teacherDateOfBirth}</td></tr>
                    <tr><td class="main">Religion</td><td>${teacherData.teacherReligion}</td></tr>
                    <tr><td class="main">Phone</td><td>${renderInputs(teacherData.teacherPhone, 'teacherPhone')}</td></tr>
                    <tr><td class="main">Address</td><td>${renderInputs(teacherData.teacherAddress, 'teacherAddress')}</td></tr>
                    <tr><td class="main">Email</td><td>${teacherData.teacherEmail}</td></tr>
                </table>
            </div>
            <div class="employment-information">
                <h3 class="main">Employment Information</h3>
                <table>
                    <tr><td class="main">Qualification</td><td>${renderInputs(teacherData.teacherQualification, 'teacherQualification')}</td></tr>
                    <tr><td class="main">Employment Type</td><td>${teacherData.teacherEmploymentType}</td></tr>
                    <tr><td class="main">Status</td><td>${teacherData.teacherStatus}</td></tr>
                    <tr><td class="main">Number of Classes</td><td>${teacherData.teacherNoOfClasses}</td></tr>
                </table>
            </div>
        `;
    }
}

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => { window.location.href = './index.html'; });

editButton.addEventListener('click', () => {
    renderTeacherPage(true);
        favicon.href="././media copy/favicons/icons8-edit-profile-80.png";

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
saveButton.onclick = async () => {
    const headerSelect = teacherPrimaryInfo.querySelector('select.edit-input');
teacherData.subjectID = headerSelect?.value || '';
console.log("Subject ID to send:", teacherData.subjectID);

    // نلاقي الـ ID المطابق من subjectsList
    //const subjectObj = subjectsList.find(s => s.SubjectName === selectedSubjectName);
    //teacherData.subjectID = subjectObj ? subjectObj.SubjectID : undefined; // undefined لو مش موجود

    // باقي البيانات
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
            case 'teacherPhone':
                teacherData.teacherPhone = value;
                break;
            case 'teacherAddress':
                teacherData.teacherAddress = value;
                break;
            case 'teacherQualification':
                teacherData.teacherQualification = value;
                break;
        }
    });

    try {
        await updateTeacher();
        renderTeacherPage(false);
        modifyToggling(overViewButton, overViewSection);
    } catch (err) {
        console.error(err);
        addNotification("فشل تحديث بيانات المدرس", "error");
    }
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

       confirmed.onclick = async () => {
    try {
        await deleteTeacher(teacherData.id); // الدالة اللي كتبناها فوق
        document.title = `Teacher ${teacherData.teacherFirstName} ${teacherData.teacherLastName} is removed`;
        addNotification(`Teacher ${teacherData.teacherFirstName} ${teacherData.teacherLastName} removed successfully`);
        setTimeout(() => window.location.href = "./teacher.html", 1500);
    } catch (err) {
        console.error(err);
        addNotification("فشل حذف المدرس", "error");
    }
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


overViewButton.addEventListener('click', () => {
    modifyToggling(overViewButton, overViewSection);
    renderTeacherPage(false);
    //bla bla
    editButton.style.display='none';
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


let subjectsList = [];

async function fetchSubjects() {
    const res = await fetch(`${API_BASE}/subjects`);
    subjectsList = await res.json();
}
fetchSubjects();

let teacherSchedule = [];


async function fetchTeacherSchedule(teacherID) {
    try {
        const res = await fetch(`${API_BASE}/teacherSchedule/${teacherID}`);
        if (!res.ok) throw new Error("Failed to fetch teacher schedule");

        const json = await res.json();
        if (!json.success || !json.data) throw new Error("No schedule data");
console.log("Schedule data:", json.data);

        teacherSchedule = json.data; 
        renderTeacherSchedule();  
        
    } catch (err) {
        console.error(err);
        addNotification("Failed to load teacher timetable !", "error");
    }

}

function renderTeacherSchedule() {
    const desktopBody = document.getElementById('scheduleBody');
    const mobileContainer = document.querySelector('.schedule-items');

    if (!desktopBody || !mobileContainer) return;

    desktopBody.innerHTML = '';
    mobileContainer.innerHTML = '';

    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"];

    // ====== ديسكتوب ======
    const periodsSet = Array.from(new Set(teacherSchedule.map(s => `${s.StartTime} - ${s.EndTime}`)))
                            .sort((a,b) => a.localeCompare(b));

    periodsSet.forEach(period => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${period}</td>`;

        days.forEach(day => {
            const lesson = teacherSchedule.find(s => s.DayOfWeek === day && `${s.StartTime} - ${s.EndTime}` === period);
            row.innerHTML += `<td>${lesson ? `${lesson.SubjectName} <br> (${lesson.ClassName.replace(/^G/, '')})  <br> <span class="room">Room ${lesson.RoomNumber}</span>` : '-'}</td>`;
        });

        desktopBody.appendChild(row);
    });

    // ====== موبايل ======
    const dayMap = { Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday' };
    const dayButtons = document.querySelectorAll('.day-btn');

    function renderMobileDay(selectedDay) {
        mobileContainer.innerHTML = '';
        const filteredLessons = teacherSchedule.filter(s => s.DayOfWeek === selectedDay);

        filteredLessons.forEach(session => {
            mobileContainer.innerHTML += `
                <div class="schedule-card">
                    <div class="time-slot">
                        <span class="start">${session.StartTime}</span>
                        <div class="line"></div>
                        <span class="end">${session.EndTime}</span>
                    </div>
                    <div class="class-details">
                        <h4>${session.SubjectName}</h4>
                        <p><i class="fa-solid fa-door-open"></i> ${session.ClassName.replace(/^G/, '')}</p>
                        <!--<p><i class="fa-solid fa-chalkboard-user"></i> ${session.TeacherName}</p>-->
                        <p><i class="fa-solid fa-door-open"></i> Room: ${session.RoomNumber}</p>
                    </div>
                </div>
            `;
        });
    }

    renderMobileDay('Sunday');

    dayButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            dayButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedDay = dayMap[btn.innerText];
            renderMobileDay(selectedDay);
        });
    });
}

scheduleTableButton.addEventListener('click', () => {
    modifyToggling(scheduleTableButton, scheduleSection);
    editButton.style.display = 'none';
    if (teacherData?.id) fetchTeacherSchedule(teacherData.id);
});