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

let studentImageGenderBased;
let studentData;
let studentScores = [];

window.addEventListener('DOMContentLoaded', initPage);

function getNationalIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('nid');
}

async function initPage() {
    const nid = getNationalIdFromURL();
    if (!nid) {
        alert("invalid student nid");
        window.location.href = "./students.html";
        return;
    }

    studentData = await fetchStudentData(nid);
    if (!studentData) {
        window.location.href = "./students.html";
        return;
    }

    renderStudentPage();
    modifyToggling(overViewButton, overViewSection);

}

async function fetchStudentData(nationalId) {
    try {
        const res = await fetch(`https://ece2026.onrender.com/webapi/studentPage/${nationalId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (!data.PersonalInfo || data.PersonalInfo.length === 0) {
            throw new Error("No personal info found");
        }

        const student = {
            id: data.PersonalInfo[0].StudentID,
            fullName: data.PersonalInfo[0].FullName,
            dateOfBirth: data.PersonalInfo[0].BirthDate,
            gender: data.PersonalInfo[0].Gender,
            Religion: data.PersonalInfo[0].Religion,
            NationalId: data.PersonalInfo[0].NationalID,
            dateOfJoin: data.PersonalInfo[0].EnrollmentDate,
            grade: data.PersonalInfo[0].ClassName.split('-')[0].replace("G", ""),
            class: data.PersonalInfo[0].ClassName.split('-')[1],
            Address: data.PersonalInfo[0].FatherAddress,
            guardians: data.GaurdInfo || []
        };

        student.primaryGuardian = student.guardians.find(g => g.IsPrimary) || null;
        student.secondaryGuardians = student.guardians.filter(g => !g.IsPrimary);

        return student;
    } catch (err) {
        console.error("Failed to fetch student data:", err);
        alert("error while getting info");
        return null;
    }
    document.title = `${student.fullName}`;

}
async function fetchStudentScores(studentId) {
    try {
        const res = await fetch(
            `https://ece2026.onrender.com/webapi/studentScores/${studentId}`
        );

        if (!res.ok) {
            console.error("HTTP Error:", res.status);
            return [];
        }

        const data = await res.json();

        if (!data.success) {
            console.error("API returned success:false");
            return [];
        }

        return data.data;
    } catch (err) {
        console.error("fetchStudentScores error:", err);
        return [];
    }
}


function renderStudentPage() {
    const gender = (studentData.gender || "").trim().toLowerCase();
    controllingPhoto(gender);
    const formatDate = (date) => date ? new Date(date).toLocaleDateString() : '—';

    studentPrimaryInfo.innerHTML = `
        <img src="${studentImageGenderBased}" alt="" class="profile-photo">
        <div class="basic-primary-information">
            <h3 class="main">${studentData.fullName}</h3>
            <p class="text-muted">ID: ${studentData.id}</p>
            <div class="grade-and-section flex">
                <p>Grade: ${studentData.grade}</p><p>Class: ${studentData.class}</p>
            </div>
        </div>
    `;

    const personalHtml = `
        <div class="student-information">
            <h3 class="main-title">Personal Details</h3>
            <div class="info-grid">
                <div class="info-item"><b>Full Name:</b> ${studentData.fullName}</div>
                <div class="info-item"><b>Birth Date:</b> ${formatDate(studentData.dateOfBirth)}</div>
                <div class="info-item"><b>Gender:</b> ${studentData.gender}</div>
                <div class="info-item"><b>Religion:</b> ${studentData.Religion}</div>
                <div class="info-item"><b>National ID:</b> ${studentData.NationalId}</div>
                <div class="info-item"><b>Join Date:</b> ${formatDate(studentData.dateOfJoin)}</div>
                <div class="info-item"><b>Address:</b> ${studentData.Address}</div>
            </div>
        </div>
    `;

    const guardianCardsHtml = studentData.guardians.map(g => `
        <div class="guardian-card">
            <div class="guardian-header">
                <span class="relation-badge">${g.Relationship}</span>
                <span class="guardian-name">${g.GuardianName}</span>
            </div>
            <div class="guardian-body">
                <p><span class="label">Phone:</span> ${g.GuardianPhone}</p>
                <p><span class="label">N-ID:</span> ${g.GuardianNationalID}</p>
                <p><span class="label">Job:</span> ${g.GuardianOccupation}</p>
                <p><span class="label">Email:</span> ${g.GuardianEmail}</p>
            </div>
        </div>
    `).join('');

    const guardianSectionHtml = `
        <div class="guardian-section">
            <h3 class="main-title">Guardian Information</h3>
            <div class="guardians-container">
                ${guardianCardsHtml}
            </div>
        </div>
    `;

    overViewSection.innerHTML = personalHtml + guardianSectionHtml;
}

academicButton.addEventListener('click', async() => {
    modifyToggling(academicButton, academicSection);
    editButton.style.setProperty('display', 'none', 'important');

    studentScores = await fetchStudentScores(studentData.id);

    if (!studentScores.length) {
        const table = document.querySelector('.grades table');
        if (table) {
            table.innerHTML = `
            <thead>
                <tr>
                    <th>Subject</th>
                    <th>Score</th>
                    <th>Assessment</th>
                    <th>Notes</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td colspan="5" class="text-muted" style="text-align:center;">
                        Student has no academic records or is new.
                    </td>
                </tr>
            </tbody>
        `;
        }
        return;
    }


    renderGradesTable(studentScores);
});

function renderGradesTable(scores) {
    const table = academicSection.querySelector(".grades table");
    if (!table) return;

    if (!scores || scores.length === 0) {
        table.innerHTML = `<p class="text-muted">No scores recorded</p>`;
        return;
    }

    const rowsHtml = scores.map(s => `
    <tr>
        <td title="Teacher: ${s.TeacherName || '-'}">${s.SubjectName}</td>
        <td>${s.ScoreAchieved}</td>
        <td>${s.AssessmentType}</td>            
        <td>${s.Notes || '-'}</td>
        <td>${new Date(s.ScoreDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
    </tr>
`).join('');


    table.innerHTML = `
        <table class="grade-table">
            <thead>
                <tr>
                    <th title=>Subject</th>            
                    <th>Score</th>
                    <th>Assessment</th>
                    <!--<th>Teacher</th>-->
                    <th>Notes</th>
                    <th>Date</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}

editButton.addEventListener('click', () => {
    editButton.style.display = 'none';

    buttons.innerHTML = `
        <button class="save-button">Save</button>
        <button class="cancel-button">Cancel</button>
        <button class="delete-button">Delete</button>
    `;
    buttons.style.display = 'flex';

    const nameElem = studentPrimaryInfo.querySelector('h3.main');
    const gradeElem = studentPrimaryInfo.querySelector('.grade-and-section p:nth-child(1)');
    const classElem = studentPrimaryInfo.querySelector('.grade-and-section p:nth-child(2)');

    nameElem.innerHTML = `<input class="edit-input edit-input-name" value="${studentData.fullName}">`;
    gradeElem.innerHTML = `<input class="edit-input edit-input-grade" value="${studentData.grade}">`;
    classElem.innerHTML = `<input class="edit-input edit-input-class" value="${studentData.class}">`;

    document.querySelector('.info-grid').style.padding = '25px';

    overViewSection.querySelectorAll('.info-item').forEach((div) => {
        const parts = div.textContent.split(':');
        const label = parts[0].trim();
        const value = parts[1] ? parts[1].trim() : '';

        if (['Birth Date', 'Religion', 'National ID'].includes(label)) {
            div.innerHTML = `
                <b>${label}:</b>
                <input class="edit-input edit-input-field"
                    data-label="${label}"
                    value="${value}">
            `;
        } else {
            div.innerHTML = `<b>${label}:</b> ${value}`;
        }
    });

    buttons.addEventListener('click', async(e) => {

        if (e.target.classList.contains('save-button')) {
            try {
                const payload = {};

                // 1. معالجة الاسم (تقسيمه إلى 3 أجزاء كما يطلب الـ API)
                const fullName = studentPrimaryInfo.querySelector('.edit-input-name').value.trim();
                if (fullName !== studentData.fullName) {
                    const parts = fullName.split(' ');
                    payload.firstName = parts[0] || "";
                    payload.middleName = parts[1] || "";
                    payload.lastName = parts.slice(2).join(' ') || "";
                }

                // 2. معالجة السنة الدراسية (Grade) - التأكد أنها رقم
                const gradeVal = studentPrimaryInfo.querySelector('.edit-input-grade').value.trim();
                if (gradeVal && Number(gradeVal) !== Number(studentData.grade)) {
                    payload.grade = Number(gradeVal);
                }

                // 3. معالجة رمز الفصل (Symbol) - التأكد أنه حرف واحد
                const classVal = studentPrimaryInfo.querySelector('.edit-input-class').value.trim().toUpperCase();
                if (classVal && classVal !== studentData.class.toUpperCase()) {
                    payload.symbol = classVal; // أرسل الحرف كما هو (مثل A أو B)
                }

                // 4. جلب الحقول من الـ Grid
                const inputs = overViewSection.querySelectorAll('.edit-input-field');
                inputs.forEach(input => {
                    const label = input.getAttribute('data-label');
                    const val = input.value.trim();

                    if (label === 'Religion' && val !== studentData.Religion) payload.religion = val;
                    if (label === 'National ID' && val !== studentData.NationalId) payload.nationalID = val;
                    if (label === 'Birth Date') {
                        // تحويل التاريخ من الصيغة المحلية (Locale) إلى صيغة API (YYYY-MM-DD)
                        const dateObj = new Date(val);
                        if (!isNaN(dateObj)) {
                            const isoDate = dateObj.toISOString().split('T')[0];
                            payload.dateOfBirth = isoDate;
                        }
                    }
                });

                if (Object.keys(payload).length === 0) {
                    addNotification("No changes detected");
                    return;
                }

                // إرسال الطلب
                const res = await fetch(`https://ece2026.onrender.com/webapi/editStudent/${studentData.id}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                const result = await res.json(); // محاولة قراءة رد السيرفر لمعرفة الخطأ بالتحديد

                if (!res.ok) {
                    throw new Error(result.message || "Failed to update");
                }

                addNotification("Updated Successfully!");
                setTimeout(() => location.reload(), 1000);

            } catch (err) {
                console.error("Update Error:", err);
                addNotification("Error: " + err.message);
            }
        }

        if (e.target.classList.contains('cancel-button')) {
            renderStudentPage();
            buttons.style.display = 'none';
            editButton.style.display = 'flex';
        }

        if (e.target.classList.contains('delete-button')) {
            // إظهار البوب أب
            document.getElementById('blur-layer').style.display = 'block';
            document.querySelector('.reset-pop-up').style.display = 'flex';

            const confirmed = document.getElementById('yes');
            const canceled = document.getElementById('no');

            // عند الضغط على NO
            canceled.addEventListener('click', () => {
                document.getElementById('blur-layer').style.display = 'none';
                document.querySelector('.reset-pop-up').style.display = 'none';
                renderStudentPage();
            });

            // عند الضغط على YES
            confirmed.addEventListener('click', async() => {
                try {
                    const res = await fetch(
                        `https://ece2026.onrender.com/webapi/deleteStudent/${studentData.id}`, { method: 'DELETE' }
                    );

                    if (!res.ok) throw new Error("Delete failed");

                    addNotification("Student deleted successfully!");
                    setTimeout(() => {
                        window.location.href = './students.html';
                    }, 1000);

                } catch (err) {
                    console.error(err);
                    addNotification("Delete error: " + err.message);
                }
            });
        }

    });
});

function formatDateToISO(dateStr) {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return isNaN(date) ? dateStr : date.toISOString().split('T')[0];
}
overViewButton.addEventListener('click', () => {
    favicon.href = "././media copy/favicons/icons8-change-user-80.png";

    modifyToggling(overViewButton, overViewSection);
    editButton.style.display = 'flex';
});
async function fetchStudentAttendance(studentId) {
    try {
        const res = await fetch(`https://ece2026.onrender.com/webapi/attendance/${studentId}`);
        if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

        const data = await res.json();

        if (!data.success || !data.attendance) return [];

        return data.attendance;
    } catch (err) {
        console.error("Error fetching attendance:", err);
        return [];
    }
}

function renderAttendanceTable(attendance = []) {
    const tableContainer = attendanceSection.querySelector(".attendance-table-container");

    if (!tableContainer) return;

    if (!attendance.length) {
        tableContainer.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Day</th>
                        <th>Status</th>
                        <th>Late?</th>
                        <th>Minutes Late</th>
                        <th>Entry Time</th>
                        <th>Exit Time</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td colspan="7" style="text-align:center; color:#888;">
                            No attendance records found or student is new.
                        </td>
                    </tr>
                </tbody>
            </table>
        `;
        return;
    }

    const rowsHtml = attendance.map(a => `
    <tr class="${a.IsLate ? 'late' : ''}">
    <td>${new Date(a.AttendanceDate).toLocaleDateString('en-GB', { day:'numeric', month:'long', year:'numeric' })}</td>
    <td>${a.DayName}</td>
    <td>${a.AttendanceStatus}</td>
    <td>${a.IsLate ? 'Yes' : 'No'}</td>
    <td>${a.MinutesLate || 0}</td>
    <td>${a.SchoolEntryTime}</td>
    <td>${a.SchoolExitTime}</td>
</tr>

    `).join('');

    tableContainer.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Date</th>
                    <th>Day</th>
                    <th>Status</th>
                    <th>Late?</th>
                    <th>Minutes Late</th>
                    <th>Entry Time</th>
                    <th>Exit Time</th>
                </tr>
            </thead>
            <tbody>
                ${rowsHtml}
            </tbody>
        </table>
    `;
}
attendanceButton.addEventListener('click', async() => {
    modifyToggling(attendanceButton, attendanceSection);
    editButton.style.setProperty('display', 'none', 'important');

    const attendanceRecords = await fetchStudentAttendance(studentData.id);
    renderAttendanceTable(attendanceRecords);
});


//    favicon.href = "././media copy/favicons/icons8-change-user-80.png";

//    renderStudentPage();
//    buttons.style.display = 'none';
//    modifyToggling(attendanceButton, attendanceSection);
//    const attendanceMonthSelect = document.getElementById('attendanceMonthSelect');
//    const attendanceTable = document.getElementById('attendanceTable');

//    // دالة توليد غياب/حضور عشوائي لمدة الشهر
//    function generateAttendance(month) {

//        if (studentData.status && studentData.status.toLowerCase() === "new") {
//            attendanceTable.innerHTML = `
//            <thead>
//                <tr><th>Day</th><th>Status</th></tr>
//            </thead>
//            <tbody>
//                <tr>
//                    <td colspan="2" class="text-muted">Student is new, no attendance yet</td>
//                </tr>
//            </tbody>
//        `;
//            return; // ما نكملش توليد الغياب
//        }
//        const daysInMonth = {
//            'Sep': 30,
//            'Oct': 31,
//            'Nov': 30,
//            'Dec': 31,
//            'Jan': 31,
//            'Feb': 28,
//            'Mar': 31,
//            'Apr': 30,
//            'May': 31,
//            'Jun': 30
//        };

//        const monthDays = daysInMonth[month];
//        const statuses = ["Present", "Absent", "Late", "Leave"];

//        let rowsHtml = '';
//        for (let day = 1; day <= monthDays; day++) {
//            const status = statuses[Math.floor(Math.random() * statuses.length)];
//            let statusClass = '';
//            switch (status) {
//                case "Present":
//                    statusClass = "status-present";
//                    break;
//                case "Absent":
//                    statusClass = "status-absent";
//                    break;
//                case "Late":
//                    statusClass = "status-late";
//                    break;
//                case "Leave":
//                    statusClass = "status-leave";
//                    break;
//            }

//            rowsHtml += `
//            <tr>
//                <td> ${day}</td>
//                <td class="${statusClass}">${status}</td>
//            </tr>
//        `;
//        }

//        attendanceTable.innerHTML = `
//        <thead>
//            <tr><th>Day</th><th>Status</th></tr>
//        </thead>
//        <tbody>
//            ${rowsHtml}
//        </tbody>
//    `;
//    }

//    attendanceMonthSelect.addEventListener('change', (e) => {
//        const month = e.target.value;
//        generateAttendance(month);
//    });


//    // إضافة event listener لتحديث الجدول عند اختيار شهر
//    attendanceMonthSelect.addEventListener('change', (e) => {
//        const month = e.target.value;
//        generateAttendance(month);
//    });

//})


//helpers
// --- back button---
document.querySelector('.back-to-home').addEventListener('click', () => {
    window.location.href = "/students.html";
});

function deactivateAll() {
    modifyButtons.forEach(element => {
        element.classList.remove('active-button-student-page');
    });
    modifySections.forEach(element => {
        element.style.display = 'none';
    });
}

function modifyToggling(button, section) {
    deactivateAll();
    button.classList.add('active-button-student-page');
    section.style.display = 'flex';
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

//function populateSubjectSelect(scores) {
//    const subjectSelect = academicSection.querySelector("#subjectSelect");

//    if (!subjectSelect) {
//        console.warn("subjectSelect not found in DOM");
//        return;
//    }

//    subjectSelect.innerHTML = '';
//    subjectSelect.innerHTML = '<option value="all">All Subjects</option>';

//    const subjects = [...new Set(scores.map(s => s.SubjectName))];

//    subjects.forEach(subject => {
//        const option = document.createElement("option");
//        option.value = subject;
//        option.textContent = subject;
//        subjectSelect.appendChild(option);
//    });
//}


//lock icon on click
const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './index.html'
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