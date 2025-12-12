import { subjectsByGrade } from "./Subjects.js";
import { addNotification } from "./notifications.js";

const favicon = document.getElementById('favicon');
const studentPrimaryInfo = document.getElementById('studentPrimaryInfo');
const buttons = document.querySelector('.buttons');
const editButton = document.querySelector('.edit-button');
const modifyButtons = document.querySelectorAll('.modify-content button');
const modifySections = document.querySelectorAll('.information');

const overViewButton = document.getElementById('overViewButton');
const academicButton = document.getElementById('academicButton');
const attendanceButton = document.getElementById('attendanceButton');

const overViewSection = document.getElementById('overViewSection');
const academicSection = document.getElementById('academicSection');
const attendanceSection = document.getElementById('attendanceSection');

const gradeMonthSelect = document.getElementById('gradeMonth');
const gradeTable = document.getElementById('gradeTable');

const examOverViewSelect = document.getElementById('examOverView');
const subjectTable = document.querySelector('.subject-table');

let studentData = JSON.parse(localStorage.getItem('selectedStudentData') || null);
let studentImageGenderBased;

renderStudentPage();
// default state
modifyToggling(overViewButton, overViewSection);


if (!studentData) {
    console.error("Student data not found in localStorage");
    window.location.href = "students.html";
}

//Rebuilding page
function renderStudentPage() {
    const gender = (studentData.gender || "").trim().toLowerCase();
    const gurdianCounts = studentData.GurdianCount || (studentData.secondaryGurdianFullName ? 2 : 1);
    controllingPhoto(gender);

    // Basic Info
    studentPrimaryInfo.innerHTML = `
        <img src="${studentImageGenderBased}" alt="" class="profile-photo">
        <div class="basic-primary-information">
            <h3 class="main">${studentData.firstName} ${studentData.lastName}</h3>
            <p class="text-muted">ID Number: ${studentData.id}</p>
            <div class="grade-and-section flex">
                <p class="student-grade">Grade: ${studentData.grade}</p>
                <p class="student-class">Class: ${studentData.class}</p>
            </div>
        </div>
    `;

    // Personal + Guardian Info
    overViewSection.innerHTML = `
        <div class="student-information">
            <h3 class="main">Personal Information</h3>
            <table>
                <tr><td class="main">Full Name</td><td>${studentData.firstName} ${studentData.lastName}</td></tr>
                <tr><td class="main">Date of Birth</td><td>${studentData.dateOfBirth}</td></tr>
                <tr><td class="main">Gender</td><td>${studentData.gender}</td></tr>
                <tr><td class="main">Nationality</td><td>${studentData.Nationality}</td></tr>
                <tr><td class="main">Religion</td><td>${studentData.Religion}</td></tr>
                <tr><td class="main">National ID</td><td>${studentData.NationalId}</td></tr>
                <tr><td class="main">Date of Join</td><td>${studentData.dateOfJoin}</td></tr>
                <tr><td class="main">Address</td><td>${studentData.Address}</td></tr>
            </table>
        </div>
        <div class="gurdian-information">
            <h3 class="main">Guardian Information</h3>
            <table>
                <tr><td class="main">Full Name</td>
                    <td class="two-columns">
                        <span>${studentData.primaryGurdianFullName}</span>
                        ${gurdianCounts === 2 ? `<span>${studentData.secondaryGurdianFullName}</span>` : ""}
                    </td>
                </tr>
                <tr><td class="main">Date of Birth</td>
                    <td class="two-columns">
                        <span>${studentData.primaryGurdianDateOfBirth}</span>
                        ${gurdianCounts === 2 ? `<span>${studentData.secondaryGurdianDateOfBirth}</span>` : ""}
                    </td>
                </tr>
                <tr><td class="main">Relationship</td>
                    <td class="two-columns">
                        <span>${studentData.primaryGurdianRelationShip}</span>
                        ${gurdianCounts === 2 ? `<span>${studentData.secondaryGurdianRelationShip}</span>` : ""}
                    </td>
                </tr>
                <tr><td class="main">Phone</td>
                    <td class="two-columns">
                        <span>${studentData.primaryGurdianPhone}</span>
                        ${gurdianCounts === 2 ? `<span>${studentData.secondaryGurdianPhone}</span>` : ""}
                    </td>
                </tr>
                <tr><td class="main">National ID</td>
                    <td class="two-columns">
                        <span>${studentData.primaryGurdianNationalId}</span>
                        ${gurdianCounts === 2 ? `<span>${studentData.secondaryGurdianNationalId}</span>` : ""}
                    </td>
                </tr>
                <tr><td class="main">Profession</td>
                    <td class="two-columns">
                        <span>${studentData.primaryGurdianProffesion}</span>
                        ${gurdianCounts === 2 ? `<span>${studentData.secondaryGurdianProffesion}</span>` : ""}
                    </td>
                </tr>
                <tr><td class="main">Email</td>
                    <td class="two-columns">
                        <span>${studentData.primaryGurdianEmail}</span>
                        ${gurdianCounts === 2 ? `<span>${studentData.secondaryGurdianEmail}</span>` : ""}
                    </td>
                </tr>
            </table>
        </div>
    `;
}

// --- 5. دالة عرض تفاصيل المادة (الجدول الأيسر) ---
function renderSubjectDetails() {
    // نستخدم قيمة الشهر الحالية من قائمة الشهور
    const selectedMonthLower = gradeMonthSelect.value.trim().toLowerCase();
    const selectedSubject = examOverViewSelect.value.trim();

    // التحقق من أن الجدول موجود وتم اختيار شهر ومادة
    if (!subjectTable || !selectedMonthLower || !selectedSubject || selectedMonthLower === "select month" || selectedSubject === "select subject") {
        subjectTable.innerHTML = `
        <thead><tr><th colspan="3">Assessment</th></tr></thead>
        <tbody>
            <tr><td colspan="3" class="text-muted">Select a month <span class="dangered">then</span> a subject.</td></tr>
        </tbody>`;
        return;
    }

    // البحث عن مفتاح الشهر (Case-Insensitive)
    const gradesKeys = Object.keys(studentData.grades);
    const monthKey = gradesKeys.find(key => key.toLowerCase() === selectedMonthLower);

    if (!monthKey || !studentData.grades[monthKey][selectedSubject]) {
        subjectTable.innerHTML = `
        <thead><tr><th colspan="3">Assessment</th></tr></thead>
        <tbody>
            <tr><td colspan="3" class="text-muted">No details found for ${selectedSubject} in ${selectedMonthLower}.</td></tr>
        </tbody>`;
        return;
    }

    const subjectGrades = studentData.grades[monthKey][selectedSubject];
    // استثناء المفتاح 'final' عند عرض التقييمات الأسبوعية/الجزئية
    const assessmentKeys = Object.keys(subjectGrades).filter(key => key.toLowerCase() !== 'final');
    
    // بناء صفوف التقييمات الجزئية
    const detailsHtml = assessmentKeys.map(key => `
        <tr>
            <td>${key.charAt(0).toUpperCase() + key.slice(1)}</td>
            <td>${subjectGrades[key]}</td>
        </tr>
    `).join('');
    
    // إضافة الصف النهائي
    const finalGradeRow = subjectGrades.final !== undefined ? `
        <tr>
            <td>Monthly Grade</td>
            <td>${subjectGrades.final}</td>
        </tr>
    ` : '';

    subjectTable.innerHTML = `
        <thead>
            <tr>
                <th>Assessment</th>
                <th>Score</th>

            </tr>
        </thead>
        <tbody>
            ${detailsHtml}
            ${finalGradeRow}
        </tbody>`;
}


// --- 6. دالة عرض جدول الدرجات الشهرية (الجدول الأيمن) ---
function renderGradesForSelectedMonth() {

    if (studentData.status && studentData.status.toLowerCase() === "new") {
        gradeTable.innerHTML = `
            <thead>
                <tr><th colspan="2">Subject</th></tr>
            </thead>
            <tbody>
                <tr><td colspan="2" class="text-muted">Student is new, no grades yet.</td></tr>
            </tbody>`;
        renderSubjectDetails();
        return;
    }

    if (!gradeMonthSelect.value || gradeMonthSelect.value === "Grades") {
        gradeTable.innerHTML = `
            <thead>
                <tr><th colspan="2">Subject</th></tr>
            </thead>
            <tbody>
                <tr><td colspan="2" class="text-muted">No Selected Month.</td></tr>
            </tbody>`;
        renderSubjectDetails();
        return;
    }
    if (!gradeMonthSelect.value || gradeMonthSelect.value === "Grades") {
        gradeTable.innerHTML = `
            <thead>
                <tr><th colspan="2">Subject</th></tr>
            </thead>
            <tbody>
                <tr><td colspan="2" class="text-muted">No Selected Month.</td></tr>
            </tbody>`;
        renderSubjectDetails();
        return;
    }

    const selectedMonthLower = gradeMonthSelect.value.trim().toLowerCase();
    const gradesKeys = Object.keys(studentData.grades);
    // البحث عن المفتاح في البيانات (Case-Insensitive)
    const matchingKey = gradesKeys.find(key => key.toLowerCase() === selectedMonthLower);

    if (!matchingKey) {
        gradeTable.innerHTML = `
            <thead>
                <tr><th colspan="2">Subject</th></tr>
            </thead>
            <tbody>
                <tr><td colspan="2" class="text-muted">
                No grades available for this month (${selectedMonthLower}).
                </td></tr>
            </tbody>`;
        renderSubjectDetails();
        return;
    }

    const monthGrades = studentData.grades[matchingKey];
    const subjects = Object.keys(monthGrades);

    gradeTable.innerHTML = `
        <thead>
            <tr><th>Subject</th><th>Final Grade</th></tr>
        </thead>
        <tbody>
            ${subjects.map(sub => `
                <tr>
                    <td>${sub}</td>
                    <td>${monthGrades[sub].final}</td>
                </tr>`).join('')}
        </tbody>`;
        
    renderSubjectDetails();
}

academicButton.addEventListener('click', () => {
                    favicon.href="././media copy/favicons/icons8-change-user-80.png";

    renderStudentPage();
    modifyToggling(academicButton, academicSection);
    buttons.style.display = 'none';
    
    // 1. ملء قائمة المواد
    populateSubjectSelect();
    
    // 2. عرض الدرجات الشهرية والامتحانات
    renderGradesForSelectedMonth();
});


if (gradeMonthSelect) {
    gradeMonthSelect.addEventListener('change', () => {
        renderGradesForSelectedMonth();
    });
}

if (examOverViewSelect) {
    examOverViewSelect.addEventListener('change', renderSubjectDetails);
}


editButton.addEventListener('click', () => {
    editButton.style.display = 'none';
    buttons.innerHTML += `
    <button class="save-button flex">Save</button>
    <button class="cancel-button flex">Cancel</button>
    <button class="delete-button flex">Delete</button>`;
        favicon.href="././media copy/favicons/icons8-edit-profile-80.png";

    // 2. تحويل خلايا معلومات الطالب الأساسية والشخصية والولي إلى حقول إدخال (inputs)
    overViewSection.querySelectorAll('td:nth-child(2)').forEach((td, i) => {
        if (!td.querySelector('input')) {
            if (td.classList.contains('two-columns')) {
                const spans = td.querySelectorAll('span');
                td.innerHTML = '';
                spans.forEach(span => {
                    const input = document.createElement('input');
                    input.value = span.textContent.trim();
                    input.classList.add('edit-input');
                    td.appendChild(input);
                });
            } else {
                const val = td.textContent.trim();
                td.innerHTML = `<input class="edit-input" value="${val}">`;
            }
        }
    });
    // تحويل Basic Info (الاسم، الصف، القسم في الهيدر)
    const nameElem = studentPrimaryInfo.querySelector('h3.main');
    const gradeElem = studentPrimaryInfo.querySelector('.student-grade');
    const classElem = studentPrimaryInfo.querySelector('.student-class');
    const gradeSection = document.querySelector('.grade-and-section');

// إضافة الكلاس الذي يلغي تأثير الـ hover
    if (gradeSection) {
        gradeSection.classList.add('disabled-hover');
    }
    nameElem.innerHTML = `<input class="edit-input" value="${studentData.firstName} ${studentData.lastName}">`;
    gradeElem.innerHTML = `<input class="edit-input" value="${studentData.grade}">`;
    classElem.innerHTML = `<input class="edit-input" value="${studentData.class}">`;

    const saveButton = buttons.querySelector('.save-button');
    const deleteButton = buttons.querySelector('.delete-button');
    const cancelButton = buttons.querySelector('.cancel-button');
    const jsButtons = buttons.querySelector('.js-buttons');

saveButton.addEventListener('click', () => {
            favicon.href="././media copy/favicons/icons8-checked-user-80.png";

        //  update Personal + Guardian 
        overViewSection.querySelectorAll('td:nth-child(2)').forEach((td, i) => {
            const inputs = td.querySelectorAll('input');
            const mainRowIndex = i;

            // تحديث بيانات الطالب (Personal Info) - أول 8 صفوف
            if (inputs.length === 1 && mainRowIndex <= 7) {
                const val = inputs[0].value.trim();
                td.innerHTML = `<span>${val}</span>`; 
                switch (mainRowIndex) {
                    case 0:
                        const parts = val.split(' ');
                        studentData.firstName = parts[0] || '';
                        studentData.lastName = parts.slice(1).join(' ') || '';
                        break;
                    case 1: studentData.dateOfBirth = val; break;
                    case 2: studentData.gender = val; break;
                    case 3: studentData.Nationality = val; break;
                    case 4: studentData.Religon = val; break;
                    case 5: studentData.NationalId = val; break;
                    case 6: studentData.dateOfJoin = val; break;
                    case 7: studentData.Address = val; break;
                }
            }
            // تحديث بيانات أولياء الأمور (Guardian Info)
            else if (inputs.length >= 1 && mainRowIndex > 7) {

                const guardianRowIndex = mainRowIndex - 8;
                
                const updateTdContent = (val1, val2) => {
                    td.innerHTML = `<span>${val1}</span>${val2 ? `<span>${val2}</span>` : ''}`;
                };

                const val1 = inputs[0] ? inputs[0].value.trim() : '';
                const val2 = inputs[1] ? inputs[1].value.trim() : '';

                switch (guardianRowIndex) {
                    case 0: 
                        studentData.primaryGurdianFullName = val1;
                        studentData.secondaryGurdianFullName = val2;
                        updateTdContent(val1, val2);
                        break;
                    case 1: 
                        studentData.primaryGurdianDateOfBirth = val1;
                        studentData.secondaryGurdianDateOfBirth = val2;
                        updateTdContent(val1, val2);
                        break;
                    case 2: 
                        studentData.primaryGurdianRelationShip = val1;
                        studentData.secondaryGurdianRelationShip = val2;
                        updateTdContent(val1, val2);
                        break;
                    case 3: 
                        studentData.primaryGurdianPhone = val1;
                        studentData.secondaryGurdianPhone = val2;
                        updateTdContent(val1, val2);
                        break;
                    case 4: 
                        studentData.primaryGurdianNationalId = val1;
                        studentData.secondaryGurdianNationalId = val2;
                        updateTdContent(val1, val2);
                        break;
                    case 5: 
                        studentData.primaryGurdianProffesion = val1;
                        studentData.secondaryGurdianProffesion = val2;
                        updateTdContent(val1, val2);
                        break;
                    case 6: 
                        studentData.primaryGurdianEmail = val1;
                        studentData.secondaryGurdianEmail = val2;
                        updateTdContent(val1, val2);
                        break;
                }
            }
        });

        // تحديث Basic Info من حقول الإدخال في الهيدر
        const nameInput = studentPrimaryInfo.querySelector('h3.main input');
        const gradeInput = studentPrimaryInfo.querySelector('.student-grade input');
        const classInput = studentPrimaryInfo.querySelector('.student-class input');

        if (nameInput) {
            const parts = nameInput.value.trim().split(' ');
            studentData.firstName = parts[0] || '';
            studentData.lastName = parts.slice(1).join(' ') || '';
        }
        if (gradeInput) studentData.grade = gradeInput.value.trim();
        if (classInput) studentData.class = classInput.value.trim();

        studentData.GurdianCount = studentData.secondaryGurdianFullName ? 2 : 1;

        // تحديث البيانات في الـ Local Storage
        const LOCAL_STORAGE_KEY = 'schoolStudentsList';
        let allStudents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        const index = allStudents.findIndex(s => s.id === studentData.id);
        if (index !== -1) allStudents[index] = { ...studentData };
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allStudents));
        localStorage.setItem('selectedStudentData', JSON.stringify(studentData));

        renderStudentPage();
        
    

    buttons.style.display='none';});

deleteButton.addEventListener('click', () => {
         document.body.style.overflow = 'hidden'; // يمنع السكرول

    document.getElementById('blur-layer').style.display = 'block'; 
    document.querySelector('.reset-pop-up').style.display = 'flex'; 
    const confirmed = document.getElementById('yes');
    const canceled = document.getElementById('no');
    
    confirmed.addEventListener('click',()=>{
        favicon.href="././media copy/favicons/icons8-remove-user-40.png";
        document.title=`${studentData.firstName} ${studentData.lastName} student is removed `;
        addNotification(`${studentData.firstName} ${studentData.lastName} student is removed`);

        const LOCAL_STORAGE_KEY = 'schoolStudentsList';
        let allStudents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        allStudents = allStudents.filter(s => s.id !== studentData.id);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allStudents));
        localStorage.removeItem('selectedStudentData');
        
        setTimeout(() => {
            window.location.href = "students.html";
        }, 2000); 
            })

    canceled.addEventListener('click',()=>{
        document.getElementById('blur-layer').style.display = 'none'; 
        document.querySelector('.reset-pop-up').style.display = 'none';
        renderStudentPage();    
        })
    });

cancelButton.addEventListener('click',()=>{
        renderStudentPage();
        buttons.style.display='none';
    })
});

overViewButton.addEventListener('click',()=>{
                favicon.href="././media copy/favicons/icons8-change-user-80.png";

modifyToggling(overViewButton,overViewSection);
})

attendanceButton.addEventListener('click' ,()=>{
                    favicon.href="././media copy/favicons/icons8-change-user-80.png";

    renderStudentPage();
    buttons.style.display='none';
    modifyToggling(attendanceButton,attendanceSection);
    const attendanceMonthSelect = document.getElementById('attendanceMonthSelect');
    const attendanceTable = document.getElementById('attendanceTable');

// دالة توليد غياب/حضور عشوائي لمدة الشهر
function generateAttendance(month) {

     if (studentData.status && studentData.status.toLowerCase() === "new") {
        attendanceTable.innerHTML = `
            <thead>
                <tr><th>Day</th><th>Status</th></tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="2" class="text-muted">Student is new, no attendance yet</td>
                </tr>
            </tbody>
        `;
        return; // ما نكملش توليد الغياب
    }
    const daysInMonth = {
        'Sep': 30, 'Oct': 31, 'Nov': 30, 'Dec': 31,
        'Jan': 31, 'Feb': 28, 'Mar': 31, 'Apr': 30,
        'May': 31, 'Jun': 30
    };

    const monthDays = daysInMonth[month];
    const statuses = ["Present", "Absent", "Late", "Leave"];
    
    let rowsHtml = '';
    for (let day = 1; day <= monthDays; day++) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        let statusClass = '';
        switch (status) {
            case "Present": statusClass = "status-present"; break;
            case "Absent": statusClass = "status-absent"; break;
            case "Late": statusClass = "status-late"; break;
            case "Leave": statusClass = "status-leave"; break;
        }

        rowsHtml += `
            <tr>
                <td> ${day}</td>
                <td class="${statusClass}">${status}</td>
            </tr>
        `;
    }

    attendanceTable.innerHTML = `
        <thead>
            <tr><th>Day</th><th>Status</th></tr>
        </thead>
        <tbody>
            ${rowsHtml}
        </tbody>
    `;
}

attendanceMonthSelect.addEventListener('change', (e) => {
    const month = e.target.value;
    generateAttendance(month);
});


// إضافة event listener لتحديث الجدول عند اختيار شهر
attendanceMonthSelect.addEventListener('change', (e) => {
    const month = e.target.value;
    generateAttendance(month);
});

})


//helpers
// --- back button---
document.querySelector('.back-to-home').addEventListener('click', () => {
    window.location.href = "/students.html";
});

function deactivateAll()
{
    modifyButtons.forEach(element => {
        element.classList.remove('active-button-student-page');
    });
    modifySections.forEach(element => {
        element.style.display='none';
    });
}

function modifyToggling(button , section){
    deactivateAll();
    button.classList.add('active-button-student-page');
    section.style.display='flex';
}

function getSubjectsByGrade(grade) {
    const numericGrade = Number(grade); 
    const gradeObj = subjectsByGrade.find(g => Number(g.grade) === numericGrade);
    return gradeObj ? gradeObj.subjects : [];
}

function controllingPhoto(gender) {
    if (gender === "female") {
        studentImageGenderBased = "media copy/students/icons8-person-female-skin-type-4-80.png";
    } else if (gender === "male") {
        studentImageGenderBased = "media copy/students/icons8-person-male-skin-type-4-80.png";
    }
}

// --- دالة ملء قائمة المواد الدراسية (Helper) ---
function populateSubjectSelect() {
    if (!examOverViewSelect) return;

    const subjects = getSubjectsByGrade(studentData.grade);

    const optionsHtml = subjects.map(subject => 
        `<option value="${subject}">${subject}</option>`
    ).join('');

    examOverViewSelect.innerHTML = `<option value="" disabled selected hidden>Select Subject</option>` + optionsHtml;
}

//lock icon on click
const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
})

// save this as last visited
window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});

const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;


if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // حفظ الحالة في LocalStorage to make it global
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
});