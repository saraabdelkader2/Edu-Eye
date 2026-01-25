import { ModifyGeneric } from "./modify.js";
import { addNotification } from "./notifications.js";
import { subjectsByGrade } from "./Subjects.js";
import { determineClassification } from "./sList.js";

//DOM elements
let students = [];
const ID_START = 345699855;
export const LOCAL_STORAGE_KEY = 'schoolStudentsList';
const favicon = document.getElementById('favicon');
const searchInput = document.querySelector('.search-box input');
const darkModeToggle = document.getElementById('darkModeToggle');
const addBtn = document.querySelector('#add-btn');
const allBtn = document.querySelector('#all-students');
const studentList = document.querySelector('.student-list-section');
const studentForm = document.querySelector('.student-form-section');
const editConfirmButtons = document.querySelector('.add-buttons');
const gradeSelect = document.getElementById('Grade');
const classSelect = document.getElementById('Class');
const registeredStudents = document.querySelector('.registered-students-number');
const slider = document.querySelector('.slider .pages');
const firstPage = document.querySelector('.slider .first-page');
const studentsTableBody = document.querySelector('tbody');

const API_BASE = "https://ece2026.onrender.com/webapi";

async function loadStudentsFromAPI() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        const data = await res.json();

        const listFromApi = data.studentlist || [];

        const apiStudents = listFromApi.map(s => {
            const fullName = s["Student Name"] || "Unknown Student";
            const nameParts = fullName.split(" ");
            return {
                nationalId: s["ID Number"],
                schoolId: s["SchoolID"] || s["ID Number"],
                id: s["SchoolID"] || s["ID Number"],
                firstName: nameParts[0] || "Unknown",
                lastName: nameParts.slice(1).join(" ") || " ",
                gender: s["Gender"] || "Male",
                grade: s["ClassName"] ? s["ClassName"].split("-")[0].replace("G", "") : "1",
                class: s["ClassName"] ? s["ClassName"].split("-")[1] : "A",
                Attendance: (s["Attendance %"] || 0) + "%",
                classification: s["Classification"] || determineClassification(s.grades || {})
            };
        });

        students = apiStudents;

        reassignSortingOnly(students);
        updateDisplayAfterAddition();

    } catch (err) {
        console.error("API Error:", err);
        addNotification("Failed to load students from server");
    }
}
export async function getStudentsData() {
    try {
        const response = await fetch(`${BASE_URL}/students`);
        const data = await response.json();

        const studentsList = data.students || data;

        return studentsList.map(student => {
            return {
                ...student,
                classification: determineClassification(student.grades)
            };
        });
    } catch (error) {
        console.error("خطأ في جلب البيانات من الـ API:", error);
    }
}
//slider clicking
let schoolStudents;
let studentSliderPages;
let currentPage = 0;
let femaleCount;
let maleCount;

async function initApp() {
    await loadStudentsFromAPI();
    await loadClassesToSelect();
    controllingModify();

    schoolStudents = students.length;
    studentSliderPages = Math.ceil(schoolStudents / 10);

    showStudents(0);
    updateSliderPages(studentSliderPages);

    femaleCount = students.filter(s => s.gender === 'Female').length;
    maleCount = students.filter(s => s.gender !== 'Female').length;
    registeredStudents.innerHTML = students.length;
}

initApp();

const form = document.querySelector('#student-form');
const saveButtons = document.querySelectorAll('.save-form-button');
const resetButtons = document.querySelectorAll('.reset-form-button');
const cancelButtons = document.querySelectorAll('.cancel-form-button');
let matchedStudent;
const gurdianRadios = document.querySelectorAll('input[name="gurdian"]');
const primaryGurdianSection = document.querySelector(".primary-guardian-form");
const secondaryyGurdianSection = document.querySelector(".Secondary-guardian-form");
const gurdianSection = document.querySelectorAll(".gurdian-section");

//add buttons control  start-------------------------------
saveButtons.forEach(btn => {
    btn.addEventListener('click', async() => {
        if (!validateForm()) return;

        // ====== Student gender & Guardian count ======
        const studentRadios = document.querySelectorAll('input[name="gender"]');
        const selectedGender = getSelectedGender(studentRadios);
        const selectedGurdianCount = getSelectedGurdian(gurdianRadios);

        // ====== Primary Guardian ======
        const primaryGurdianFirstName = document.getElementById('primaryGurdianFirstName').value.trim();
        const primaryGurdianSecondName = document.getElementById('primaryGurdianSecondName').value.trim();
        const primaryGurdianRelationship = document.getElementById('primaryseconaryGurdianRelationship').value.trim();
        const primaryGurdianNationalId = document.getElementById('primaryGurdianNationalId').value.trim();
        const primaryGurdianPhone = document.getElementById('primaryGurdianPhone').value.trim();
        const primaryGurdianProfession = document.getElementById('primaryGurdianProfession').value.trim();
        const primaryGurdianDob = document.getElementById('primaryGurdianDob').value.trim();
        const primaryGurdianEmail = document.getElementById('primaryGurdianEmail').value.trim();
        const primaryGurdianAddress = document.getElementById('primaryGurdianAddress').value.trim();
        const primaryGenderRadios = document.querySelectorAll('input[name="primaryGender"]');
        const primaryGurdianGender = getSelectedGender(primaryGenderRadios);

        // ====== Secondary Guardian (Logic Simplified) ======
        let secondaryGurdianData = {};
        if (selectedGurdianCount === "2") {
            secondaryGurdianData = {
                secondaryGurdianFirstName: document.getElementById('seconaryGurdianFirstName').value.trim(),
                secondaryGurdianSecondName: document.getElementById('seconaryGurdianSecondName').value.trim(),
                secondaryGurdianRelationShip: document.getElementById('seconaryGurdianRelationship').value.trim(),
                secondaryGurdianNationalId: document.getElementById('seconaryGurdianNationalId').value.trim(),
                secondaryGurdianPhone: document.getElementById('seconaryGurdianPhone').value.trim(),
                secondaryGurdianProffesion: document.getElementById('secondaryGurdianProfession').value.trim(),
                secondaryGurdianDateOfBirth: document.getElementById('secondaryGurdianDob').value.trim(),
                secondaryGurdianEmail: document.getElementById('seconaryGurdianEmail').value.trim(),
                secondaryGurdianAddress: document.getElementById('secondaryGurdianAddress').value.trim(),
                secondaryGurdianGender: getSelectedGender(document.querySelectorAll('input[name="secondaryGender"]'))
            };
        }

        // ====== Student Data Construction ======
        const studentData = {
            firstName: form.studentFirstName.value.trim(),
            lastName: form.studentLastName.value.trim(),
            gender: selectedGender,
            dateOfBirth: form.dob.value,
            grade: gradeSelect.value,
            class: classSelect.value.toUpperCase(),
            dateOfJoin: form.doj.value,
            Religon: form.studentReligon.value,
            NationalId: form.NationalId.value,
            schoolId: generateSchoolId(),
            GurdianCount: selectedGurdianCount,
            Attendance: '0%',

            ...secondaryGurdianData,

            primaryGurdianFirstName,
            primaryGurdianSecondName,
            primaryGurdianEmail,
            primaryGurdianNationalId,
            primaryGurdianRelationShip: primaryGurdianRelationship,
            primaryGurdianPhone,
            primaryGurdianProffesion: primaryGurdianProfession,
            primaryGurdianDateOfBirth: primaryGurdianDob,
            primaryGurdianAddress,
            primaryGurdianGender
        }

        // ====== API Call  ======
        try {
            const savedStudent = await saveStudentToServer(studentData);

            if (savedStudent) {
                await loadStudentsFromAPI();
                addNotification(`Student ${studentData.firstName} added and synced with server`);
                form.reset();
                updateDisplayAfterAddition();
                gurdianSection.forEach(section => section.style.display = 'none');
                favicon.href = "././media copy/favicons/icons8-checked-user-80.png";

                // العودة لجدول الطلاب
                studentList.style.display = 'block';
                studentForm.style.display = 'none';
            }
        } catch (error) {
            console.error("Save process failed:", error);
            addNotification("Error: Could not save student to server");
        }
    });
});

resetButtons.forEach(btn => {
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
            const studentGenderRadios = document.querySelectorAll('input[name="gender"]');
            const primaryGenderRadios = document.querySelectorAll('input[name="primaryGender"]');
            const secondaryGenderRadios = document.querySelectorAll('input[name="secondaryGender"]');

            // تفريغ الاختيارات
            studentGenderRadios.forEach(radio => radio.checked = false);
            primaryGenderRadios.forEach(radio => radio.checked = false);
            secondaryGenderRadios.forEach(radio => radio.checked = false);
            gurdianRadios.forEach(radio => radio.checked = false);

            primaryGurdianSection.style.display = 'none';
            secondaryyGurdianSection.style.display = 'none';

            document.body.style.overflow = 'auto';

            studentList.style.setProperty('display', 'block', 'important');
            studentForm.style.setProperty('display', 'none', 'important');
            editConfirmButtons.style.setProperty('display', 'none', 'important');

            allBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
            addBtn.style.backgroundColor = 'transparent';

        });

        canceled.addEventListener('click', () => {
            document.getElementById('blur-layer').style.display = 'none';
            document.querySelector('.reset-pop-up').style.display = 'none';

        });

    });
});
cancelButtons.forEach(btn => {
    btn.addEventListener('click', () => {

        studentList.style.display = 'block';
        studentForm.style.display = 'none';
        editConfirmButtons.style.display = 'none';

        allBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
        addBtn.style.backgroundColor = 'transparent';
    });
});
//add buttons control  end-------------------------------

// ======= Search safety check =======
if (!searchInput) {
    console.warn('search input not found: check selector ".search-box input"');
} else {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();

        if (!query) {
            showStudents(currentPage);
            return;
        }

        const filteredStudents = students.filter(student => {
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            const id = (student.id || '').toString().toLowerCase();

            const grade = (student.grade || '').toString().toLowerCase();
            const className = (student.class || '').toString().toLowerCase();
            const gradeAndClass = `${grade}-${className}`.toLowerCase(); // يدعم البحث عن "1-a" مثلاً

            return fullName.includes(query) ||
                id.includes(query) ||
                grade.includes(query) ||
                className.includes(query) ||
                gradeAndClass.includes(query);
        });

        showFilteredStudents(filteredStudents);
    });
}

function showFilteredStudents(list) {
    studentsTableBody.innerHTML = '';

    if (!list || list.length === 0) {
        studentsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:12px;">No results</td></tr>`;
        return;
    }

    list.forEach((student, idx) => {
        const statusMap = {
            'Superior': 'classification-superior',
            'Weak': 'classification-weak',
            'Talented': 'classification-talented',
            'Fail': 'classification-fail'
        };
        const classificationclass = statusMap[student.classification] || '';
        let attendanceText = student.Attendance === '0%' ? 'No Attendance' : student.Attendance;
        let attendanceClass = student.Attendance === '0%' ? 'attendance-zero' : '';
        const rowHTML = `
            <tr data-full-student-id="${student.id}" style="cursor: pointer;">
                <td>${idx + 1}</td>
                <td>${student.schoolId}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.grade} - ${student.class}</td>
                <td>${student.gender}</td>
                <td class="${attendanceClass}">${attendanceText}</td>
                <td class="${classificationclass}">${student.classification}</td>
            </tr>`;

        studentsTableBody.insertAdjacentHTML('beforeend', rowHTML);
    });

    bindRowClicks();
}

function bindRowClicks() {
    const allRows = studentsTableBody.querySelectorAll('tr[data-full-student-id]');
    allRows.forEach(row => {
        row.onclick = () => {
            const studentId = row.getAttribute('data-full-student-id');
            const clickedStudent = students.find(s => s.id === studentId);
            if (clickedStudent) {
                localStorage.setItem('selectedStudentData', JSON.stringify(clickedStudent));
                window.location.href = "../studentPage.html";
            }
        };
    });
}

function updateDisplayAfterAddition() {
    schoolStudents = students.length;
    studentSliderPages = Math.ceil(schoolStudents / 10);

    updateSliderPages(studentSliderPages);
    showStudents(0);

    let femaleCount = 0;
    let maleCount = 0;
    students.forEach(s => {
        if (s.gender === 'Female') femaleCount++;
        else maleCount++;
    });

    registeredStudents.innerHTML = (femaleCount + maleCount);
}

function reassignSortingOnly(students) {
    students.sort((a, b) => {
        const nameA = a.firstName || "";
        const nameB = b.firstName || "";
        return nameA.localeCompare(nameB, 'ar', { sensitivity: 'base' });
    });
    saveStudentsDisplayOrder();
}



function generateSchoolId() {
    if (students.length === 0) return ID_START.toString();

    const allIds = students.map(s => parseInt(s.schoolId || 0));
    const maxId = Math.max(...allIds);

    return (maxId + 1).toString();
}

function saveStudentsDisplayOrder() {
    const studentsJson = JSON.stringify(students);
    localStorage.setItem(LOCAL_STORAGE_KEY, studentsJson);
    if (students.length === 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
}

function updateSliderPages(pagesCount) {
    slider.innerHTML = '';

    const backBtn = document.querySelector('.back-page');
    const afterBtn = document.querySelector('.after-page');

    if (backBtn) backBtn.classList.toggle('disabled', currentPage === 0);
    if (afterBtn) afterBtn.classList.toggle('disabled', currentPage >= pagesCount - 1);

    for (let i = 1; i <= pagesCount; i++) {
        slider.innerHTML += `
            <p class="first-page ${i === currentPage + 1 ? 'active-page' : ''}">
                ${i}
            </p>`;
    }

    reinitializeSliderListeners();
}

//what is clicked from slider ?
function reinitializeSliderListeners() {
    const clickedPageNew = document.querySelectorAll('.slider *');
    clickedPageNew.forEach(element => {
        element.onclick = () => {

            if (element.classList.contains('disabled')) return;

            const content = element.innerHTML.trim();
            if (/^\d+$/.test(content)) {
                currentPage = parseInt(content) - 1;
                showStudents(currentPage);
            } else if (element.classList.contains('back-page')) {
                currentPage = Math.max(0, currentPage - 1);
                showStudents(currentPage);
            } else if (element.classList.contains('after-page')) {
                currentPage = Math.min(studentSliderPages - 1, currentPage + 1);
                showStudents(currentPage);
            }

            updateSliderPages(studentSliderPages);
        };
    });

}

// show/hide guardian sections based on selection
gurdianSection.forEach(section => section.style.display = 'none');
gurdianRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        const selectedCount = getSelectedGurdian(gurdianRadios);
        primaryGurdianSection.style.display = 'none';
        secondaryyGurdianSection.style.display = 'none';

        if (selectedCount === "1") {
            primaryGurdianSection.style.display = 'block';
        } else if (selectedCount === "2") {
            primaryGurdianSection.style.display = 'block';
            secondaryyGurdianSection.style.display = 'block';
        }
    });
});

function showStudents(page) {
    let startIndex = page * 10;
    let endIndex = startIndex + 10;
    let studentsOnThisPage = students.slice(startIndex, endIndex);

    const studentsTableBody = document.querySelector('tbody');
    const mobileContainer = document.querySelector('.table-mobile');

    studentsTableBody.innerHTML = '';
    mobileContainer.innerHTML = '';

    studentsOnThisPage.forEach((student, index) => {
        let attendanceText = student.Attendance === '0%' ? 'No Attendance' : student.Attendance;
        let attendanceClass = student.Attendance === '0%' ? 'attendance-zero' : '';
        //controlling color
        let classificationclass = '';
        switch (student.classification) {
            case 'Superior':
                classificationclass = 'classification-superior';
                break;
            case 'Weak':
                classificationclass = 'classification-weak';
                break;
            case 'Talented':
                classificationclass = 'classification-talented';
                break;
            case 'Fail':
                classificationclass = 'classification-fail';
                break;
            case 'developing':
                classificationclass = '';
                break;
            default:
                classificationclass = ''; // لأي تصنيف آخر
        }


        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${student.schoolId}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.grade} - ${student.class}</td>
            <td>${student.gender}</td>
                <td class="${attendanceClass}">${attendanceText}</td>
            <td class="${classificationclass}">${student.classification}</td>
        `;
        tr.addEventListener('click', () => openStudentProfile(student));
        studentsTableBody.appendChild(tr);
    });

    students.forEach((student) => {
        let attendanceText = student.Attendance === '0%' ? 'No Attendance' : student.Attendance;
        let attendanceClass = student.Attendance === '0%' ? 'attendance-zero' : '';
        let classificationclass = '';
        switch (student.classification) {
            case 'Superior':
                classificationclass = 'classification-superior';
                break;
            case 'Weak':
                classificationclass = 'classification-weak';
                break;
            case 'Talented':
                classificationclass = 'classification-talented';
                break;
            case 'Fail':
                classificationclass = 'classification-fail';
                break;
            case 'developing':
                classificationclass = '';
                break;
            default:
                classificationclass = ''; // لأي تصنيف آخر
        }
        const card = document.createElement('div');
        let imgSrc = '';
        card.className = 'student-card';
        if (student.gender === 'female' || student.gender === 'Female') {
            imgSrc = 'media copy/students/icons8-person-female-skin-type-4-80.png';
        } else {
            imgSrc = 'media copy/students/icons8-person-male-skin-type-4-80.png'
        }
        card.innerHTML = `
            <div class="card-header">
                <div class="user-icon flex">
                    <img src="${imgSrc}" alt="">
                    <h4 class="student-name">${student.firstName} ${student.lastName}</h4>
                </div>
            </div>
            <div class="card-body">
                <div class="info-row"><span class="label">ID Number</span> <span class="value">${student.id}</span></div>
                <div class="info-row"><span class="label">Class</span> <span class="value">${student.grade}-${student.class}</span></div>
                <div class="info-row"><span class="label">Attendance%</span> <span class="value ${attendanceClass}">${attendanceText}</span></div>
                <div class="info-row"><span class="label">Classification</span> <span class="value ${classificationclass}">${student.classification}</span></div>
            </div>
        `;
        card.addEventListener('click', () => openStudentProfile(student));
        mobileContainer.appendChild(card);
    });
}

function openStudentProfile(student) {
    localStorage.setItem('selectedStudentData', JSON.stringify(student));
    window.location.href = "../studentPage.html";
}

function showWarning(message, inputElement = null) {
    const warningElement = inputElement ?
        inputElement.closest('div').querySelector('.warning') :
        document.querySelector('.form-warning');

    if (warningElement) {
        warningElement.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${message}`;
        warningElement.classList.add('warning');
    }

    if (inputElement) {
        inputElement.focus();
        inputElement.addEventListener('input', () => {
            warningElement.classList.remove('warning');
            warningElement.innerHTML = '';
        }, { once: true });
    }
}

function validateForm() {
    const gradeSelect = document.getElementById('Grade');
    const classSelect = document.getElementById('Class');

    if (!gradeSelect.value) {
        showWarning("Please select a Grade", gradeSelect);
        return false;
    }
    if (!classSelect.value) {
        showWarning("Please select a Class", classSelect);
        return false;
    }

    // Required inputs for student
    const requiredInputs = form.querySelectorAll('input[required]');
    for (const input of requiredInputs) {
        if (!input.value.trim()) {
            showWarning(`Please fill in the required field: ${input.placeholder || input.name}`, input);
            return false;
        }
    }

    // Gender
    if (!getSelectedGender(document.querySelectorAll('input[name="gender"]'))) {
        showWarning("Please select the student's gender");
        return false;
    }

    // Guardian count
    const gurdianCount = getSelectedGurdian(gurdianRadios);
    if (!gurdianCount) {
        showWarning("Please select number of guardians");
        return false;
    }

    // Primary guardian check
    const primaryInputs = primaryGurdianSection.querySelectorAll('input[required]');
    for (const input of primaryInputs) {
        if (!input.value.trim()) {
            showWarning(`Please fill in primary guardian field: ${input.placeholder || input.name}`, input);
            return false;
        }
    }
    if (!getSelectedGender(document.querySelectorAll('input[name="primaryGender"]'))) {
        showWarning("Please select Primary Guardian gender");
        return false;
    }
    const primaryGurdianNationalId = document.getElementById('primaryGurdianNationalId').value.trim();
    if (primaryGurdianNationalId.length !== 14) {
        showWarning("Primary Guardian National ID must be 14 digits", document.getElementById('primaryGurdianNationalId'));
        return false;
    }

    // Secondary guardian check ONLY if count = 2
    if (gurdianCount === "2") {
        const secondaryInputs = secondaryyGurdianSection.querySelectorAll('input[required]');
        for (const input of secondaryInputs) {
            if (!input.value.trim()) {
                showWarning(`Please fill in secondary guardian field: ${input.placeholder || input.name}`, input);
                return false;
            }
        }
        if (!getSelectedGender(document.querySelectorAll('input[name="secondaryGender"]'))) {
            showWarning("Please select Secondary Guardian gender");
            return false;
        }
        const secondaryGurdianNationalId = document.getElementById('seconaryGurdianNationalId').value.trim();
        if (secondaryGurdianNationalId.length !== 14) {
            showWarning("Secondary Guardian National ID must be 14 digits", document.getElementById('seconaryGurdianNationalId'));
            return false;
        }
    }

    // National ID uniqueness
    const nationalId = form.NationalId.value;
    if (!nationalId) {
        showWarning("Please enter National ID", form.NationalId);
        return false;
    } else if (isNationalIdDuplicate(nationalId, students)) {
        showWarning("This National ID is already registered", form.NationalId);
        return false;
    } else if (nationalId.length !== 14) {
        showWarning("Invalid National ID length", form.NationalId);
        return false;
    }

    return true;
}

function generateEmptyGrades(subjects) {
    const months = ['sep', 'oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const grades = {};

    months.forEach(month => {
        grades[month] = {};
        subjects.forEach(subject => {
            grades[month][subject] = { week1: 0, week2: 0, week3: 0, week4: 0, final: 0 };
        });
    });

    return grades;
}
async function loadClassesToSelect() {
    try {
        const res = await fetch(`${API_BASE}/classes`);
        const data = await res.json();

        //console.log("البيانات القادمة من السيرفر:", data); // للتأكد من شكل البيانات في الكونسول

        let classesArray = [];

        // طريقة آمنة للوصول للبيانات (تجنب خطأ الـ undefined)
        if (data && data.classes && data.classes.recordsets && data.classes.recordsets[0]) {
            classesArray = data.classes.recordsets[0];
        } else if (data && data.classes && Array.isArray(data.classes)) {
            // احتمالية أخرى أن البيانات تأتي كمصفوفة مباشرة
            classesArray = data.classes;
        }

        window.allAvailableClasses = classesArray;
        console.log("تم تحميل الفصول بنجاح:", window.allAvailableClasses);

    } catch (err) {
        console.error("Error fetching classes:", err);
        addNotification("Failed to load classes from server");
    }
}
gradeSelect.addEventListener('change', function() {
    const selectedGrade = this.value; // مثلا "1"
    classSelect.innerHTML = '<option value="" disabled selected hidden>Class</option>';

    if (!window.allAvailableClasses || window.allAvailableClasses.length === 0) {
        console.warn("قائمة الفصول فارغة، تأكد من اتصال السيرفر");
        return;
    }

    // فلترة الفصول: نبحث عن الكلاسات التي تبدأ بـ G ثم رقم المرحلة
    const filtered = window.allAvailableClasses.filter(c => {
        const className = c.ClassName || "";
        return className.startsWith(`G${selectedGrade}-`);
    });

    if (filtered.length > 0) {
        filtered.forEach(item => {
            const option = document.createElement('option');
            // استخراج حرف الفصل فقط (A, B, C) من الاسم الكامل (G1-A)
            const parts = item.ClassName.split('-');
            const displayValue = parts[1] || item.ClassName;

            option.value = displayValue;
            option.textContent = displayValue;
            classSelect.appendChild(option);
        });
        classSelect.disabled = false;
    } else {
        classSelect.disabled = true;
        const option = document.createElement('option');
        option.textContent = "No sections";
        classSelect.appendChild(option);
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


async function saveStudentToServer(studentData) {
    try {
        const response = await fetch(`${API_BASE}/students`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(studentData)
        });
        if (!response.ok) throw new Error('فشل الاتصال بالسيرفر');
        return await response.json();
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}
//functions
function controllingModify() {
    //controlling student modify start and add buttons
    ModifyGeneric({
        addBtn,
        allBtn,
        listView: studentList,
        formView: studentForm,
        editConfirmButtons,
        favicon,
        listFavicon: '/./media copy/favicons/icons8-group-80.png',
        formFavicon: '././media copy/favicons/stydent-add.png',
        listTitle: 'All Students',
        formTitle: 'Add Student',
        darkModeToggle
    });
}
const backToHome = document.querySelector('.back-to-home');
backToHome.addEventListener('click', () => {
    const lastPage = localStorage.getItem('lastVisitedPage');

    if (lastPage && lastPage !== window.location.pathname) {
        window.location.href = lastPage;
    } else {
        window.location.href = "/dashboard.html"; // fallback
    }
});
const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
})

//gender selection
function getSelectedGender(genderRadios) {
    let selected = Array.from(genderRadios).find(radio => radio.checked);
    return selected ? selected.value : null;
}

function getSelectedGurdian(gurdianRadios) {
    let selected = Array.from(gurdianRadios).find(radio => radio.checked);
    return selected ? selected.value : null;
}


function isNationalIdDuplicate(nationalId, studentsList) {
    if (!nationalId) return false;
    return studentsList.some(student => student.NationalId === nationalId);
}
//dark mode start--------------------------
const body = document.body;
if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}
darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // حفظ الحالة في LocalStorage
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
    } else {
        localStorage.setItem('darkMode', 'disabled');
    }
});
//dark mode end -----------------------------

window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});