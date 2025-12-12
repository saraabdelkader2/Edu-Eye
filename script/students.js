import { Modify } from "./modify.js";
import { students } from "./sList.js";
import { addNotification } from "./notifications.js";
import { subjectsByGrade } from "./Subjects.js";


const ID_START = 345699855;
const LOCAL_STORAGE_KEY = 'schoolStudentsList';
let storedStudents = localStorage.getItem(LOCAL_STORAGE_KEY);
const favicon = document.getElementById('favicon');
const searchInput = document.querySelector('.search-box input');
if (storedStudents) {
    // إذا وُجدت بيانات، استبدل القائمة الحالية بها
    students.splice(0, students.length, ...JSON.parse(storedStudents));
}

//ترتيب الطلاب أبجدي و إعطائهم ID
reassignIdAndSorting(students);

let schoolStudents = students.length;
let studentSliderPages = Math.ceil(schoolStudents / 10);

//controlling student modify start
const addBtn = document.querySelector('#add-btn');
const allBtn = document.querySelector('#all-students');
const studentList = document.querySelector('.student-list-section');
const studentForm = document.querySelector('.student-form-section');
const editConfirmButtons = document.querySelector('.add-buttons');

//slider clicking
const slider = document.querySelector('.slider .pages');
const firstPage = document.querySelector('.slider .first-page');
const studentsTableBody = document.querySelector('tbody');
updateSliderPages(studentSliderPages);
const favicon1 = "././media copy/favicons/icons8-group-80.png";
const favicon2 = "././media copy/favicons/stydent-add.png";

//controlling student modify start and add buttons
Modify(editConfirmButtons, addBtn, allBtn, studentList, studentForm, favicon, favicon1, favicon2); //controlling student modify end
//default always show 1st page

showStudents(0);
let currentPage = 0;

//count females and males count and total count
const registeredStudents = document.querySelector('.registered-students-number');
let femaleCount = 0;
let maleCount = 0;
students.forEach(element => {
    if (element.gender === 'Female') {
        femaleCount++;
    } else {
        maleCount++;
    }
});
export const resgisteredStudentsCount = femaleCount + maleCount;
export const femaleCounted = femaleCount;
export const maleCounted = maleCount;
registeredStudents.innerHTML = (femaleCount + maleCount);
console.log(resgisteredStudentsCount, femaleCounted, maleCounted);


//const uploadBox = document.querySelector('#uploadBox');
const form = document.querySelector('#student-form');
const saveButton = document.querySelector('.save-form-button');
const resetButton = document.querySelector('.reset-form-button');
const cancelButton = document.querySelector('.cancel-form-button');
let matchedStudent;




const gurdianRadios = document.querySelectorAll('input[name="gurdian"]');
const primaryGurdianSection = document.querySelector(".primary-guardian-form");
const secondaryyGurdianSection = document.querySelector(".Secondary-guardian-form");
const gurdianSection = document.querySelectorAll(".gurdian-section");
const genderRadios = document.querySelectorAll('input[name="gender"]');

saveButton.addEventListener('click', () => {

    if (!validateForm()) return; // التحقق من الحقول العامة

    const selectedGender = getSelectedGender(genderRadios);
    const selectedGurdianCount = getSelectedGurdian(gurdianRadios);

    // بيانات Primary Guardian
    const primaryGurdianFullName = document.getElementById('primaryGurdianFullName').value.trim();
    const primaryGurdianRelationship = document.getElementById('primaryseconaryGurdianRelationship').value.trim();
    const primaryGurdianNationalId = document.getElementById('primaryGurdianNationalId').value.trim();
    const primaryGurdianPhone = document.getElementById('primaryGurdianPhone').value.trim();
    const primaryGurdianProfession = document.getElementById('primaryGurdianProfession').value.trim();
    const primaryGurdianDob = document.getElementById('primaryGurdianDob').value.trim();
    const primaryGurdianEmail = document.getElementById('primaryGurdianEmail').value.trim();

    // بيانات Secondary Guardian
    let secondaryGurdianFullName = '';
    let secondaryGurdianRelationship = '';
    let secondaryGurdianNationalId = '';
    let secondaryGurdianPhone = '';
    let secondaryGurdianProfession = '';
    let secondaryGurdianDob = '';
    let secondaryGurdianEmail = '';

    if (selectedGurdianCount === "2") {
        secondaryGurdianFullName = document.getElementById('seconaryGurdianFullName').value.trim();
        secondaryGurdianRelationship = document.getElementById('seconaryGurdianRelationship').value.trim();
        secondaryGurdianNationalId = document.getElementById('seconaryGurdianNationalId').value.trim();
        secondaryGurdianPhone = document.getElementById('seconaryGurdianPhone').value.trim();
        secondaryGurdianProfession = document.getElementById('secondaryGurdianProfession').value.trim();
        secondaryGurdianDob = document.getElementById('secondaryGurdianDob').value.trim();
        secondaryGurdianEmail = document.getElementById('seconaryGurdianEmail').value.trim();

        // التحقق من Secondary Guardian
        if (!secondaryGurdianFullName || !secondaryGurdianRelationship || !secondaryGurdianNationalId) {
            showWarning("Please fill all required secondary guardian fields", document.getElementById('seconaryGurdianFullName'));
            return;
        }
    }
    // التحقق من Primary Guardian
    if (!primaryGurdianFullName || !primaryGurdianRelationship || !primaryGurdianNationalId) {
        showWarning("Please fill all required primary guardian fields", document.getElementById('primaryGurdianFullName'));
        return;
    }

    // ---------------- STUDENT DATA ----------------
    const studentData = {
        id: '',
        firstName: form.studentFirstName.value.trim(),
        lastName: form.studentLastName.value.trim(),
        gender: selectedGender,
        dateOfBirth: form.dob.value,
        grade: document.querySelector('input[name="Grade"]').value,
        class: document.querySelector('input[name="Class"]').value,
        dateOfJoin: form.doj.value,
        Nationality: form.studentNationality.value,
        Religon: form.studentReligon.value,
        NationalId: form.NationalId.value,
        Address: form.studentAddress.value,
        GurdianCount: selectedGurdianCount,
        Attendance: '94%',
        classification: 'talented',
        status: 'new',

        primaryGurdianFullName,
        primaryGurdianEmail,
        primaryGurdianNationalId,
        primaryGurdianRelationShip: primaryGurdianRelationship,
        primaryGurdianPhone,
        primaryGurdianProffesion: primaryGurdianProfession,
        primaryGurdianDateOfBirth: primaryGurdianDob,

        secondaryGurdianFullName,
        secondaryGurdianEmail,
        secondaryGurdianNationalId,
        secondaryGurdianRelationShip: secondaryGurdianRelationship,
        secondaryGurdianPhone,
        secondaryGurdianProffesion: secondaryGurdianProfession,
        secondaryGurdianDateOfBirth: secondaryGurdianDob,
    };
    const gradeObj = subjectsByGrade.find(g => g.grade === studentData.grade);
    const subjects = gradeObj ? gradeObj.subjects : [];

    // إنشاء درجات ابتدائية صفرية
    studentData.grades = generateEmptyGrades(subjects);



    students.push(studentData);
    addNotification(`${studentData.firstName} ${studentData.lastName} "student is added" `);
    saveStudentsToStorage();
    reassignIdAndSorting(students);
    updateDisplayAfterAddition();
    form.reset();
    favicon.href = "././media copy/favicons/icons8-checked-user-80.png"


    // اخفاء السكشن بعد الحفظ
    gurdianSection.forEach(section => section.style.display = 'none');
});


const backToHome = document.querySelector('.back-to-home');
backToHome.addEventListener('click', () => {
    window.location.href = "/dashboard.html";
    //backToHome.style.display='none';
})


function isNationalIdDuplicate(nationalId, studentsList) {
    if (!nationalId) return false;
    // .some() تبحث عن عنصر واحد يحقق الشرط وتوقف العملية (أسرع من forEach)
    return studentsList.some(student => student.NationalId === nationalId);
}


resetButton.addEventListener('click', (e) => {
    e.preventDefault();

    document.body.style.overflow = 'hidden'; // يمنع السكرول

    document.getElementById('blur-layer').style.display = 'block'; // يشغل البلور
    document.querySelector('.reset-pop-up').style.display = 'flex'; // يعرض البوب أب
    const confirmed = document.getElementById('yes');
    const canceled = document.getElementById('no');
    confirmed.addEventListener('click', () => {
        document.getElementById('blur-layer').style.display = 'none';
        document.querySelector('.reset-pop-up').style.display = 'none';

        form.reset(); // يمسح كل الـ inputs

        // امسحي الجيندر
        genderRadios.forEach(radio => radio.checked = false);

        // امسحي الجارديان (الراديو)
        gurdianRadios.forEach(radio => radio.checked = false);

        // اخفي كل السكشنات
        primaryGurdianSection.style.display = 'none';
        secondaryyGurdianSection.style.display = 'none';

        // يرجع السكرول
        document.body.style.overflow = 'auto';
    });

    canceled.addEventListener('click', () => {
        document.getElementById('blur-layer').style.display = 'none'; // يشغل البلور
        document.querySelector('.reset-pop-up').style.display = 'none'; // يعرض البوب أب

    });

});


cancelButton.addEventListener('click', () => {

    studentList.style.display = 'block';
    studentForm.style.display = 'none';
    editConfirmButtons.style.display = 'none';

    allBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
    addBtn.style.backgroundColor = 'transparent';
})

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
})


// ======= Search safety check =======

if (!searchInput) {
    console.warn('search input not found: check selector ".search-box input"');
} else {
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toLowerCase();
        if (!query) {
            // لو الحقل فاضي، عرض كل الطلاب (الصفحة الحالية أو الصفحة الأولى)
            showStudents(currentPage);
            return;
        }

        const filteredStudents = students.filter(student => {
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            // تأكد إن id سترينج قبل toLowerCase
            const id = (student.id || '').toString().toLowerCase();
            return fullName.includes(query) || id.includes(query);
        });

        showFilteredStudents(filteredStudents);
    });
}

// ======= Helper: render filtered results =======
function showFilteredStudents(list) {
    // مسح الجدول
    studentsTableBody.innerHTML = '';

    if (!list || list.length === 0) {
        studentsTableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:12px;">No results</td></tr>`;
        return;
    }

    list.forEach((student, idx) => {
        // نفس منطق الألوان والتصنيفات
        let classificationclass = '';
        switch (student.classification) {
            case 'superior':
                classificationclass = 'classification-superior';
                break;
            case 'weak':
                classificationclass = 'classification-weak';
                break;
            case 'talented':
                classificationclass = 'classification-talented';
                break;
            default:
                classificationclass = '';
        }

        studentsTableBody.insertAdjacentHTML('beforeend',
            `<tr data-full-student-id="${student.id}">
                <td>${idx + 1}</td>
                <td>${student.id}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.grade} - ${student.class}</td>
                <td>${student.gender}</td>
                <td>${student.Attendance}</td>
                <td class="${classificationclass}">${student.classification}</td>
            </tr>`);
    });

    // أعدّ ربط أحداث النقر على الصفوف
    const allRows = studentsTableBody.querySelectorAll('tr');
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

//gender selection
function getSelectedGender(genderRadios) {
    let selected = Array.from(genderRadios).find(radio => radio.checked);
    return selected ? selected.value : null;
}

function getSelectedGurdian(gurdianRadios) {
    let selected = Array.from(gurdianRadios).find(radio => radio.checked);
    return selected ? selected.value : null;
}

function updateDisplayAfterAddition() {
    // 1. إعادة حساب متغيرات عدد الطلاب وعدد الصفحات
    schoolStudents = students.length;
    studentSliderPages = Math.ceil(schoolStudents / 10);

    // 2. تحديث السلايدر بالكامل
    updateSliderPages(studentSliderPages);

    // 3. عرض الطلاب (سنعرض الصفحة الأولى دائماً بعد الإضافة)
    showStudents(0);

    // 4. تحديث عداد الطلاب الإجمالي
    registeredStudents.innerHTML = (femaleCount + maleCount);
}


//برتب الطلاب واديلهم ال id مبني أيضا ع الترتيب
function reassignIdAndSorting(students) {

    //alphaptic name sorting arabic & english
    students.sort((a, b) =>
        a.firstName.localeCompare(b.firstName, 'ar', { sensitivity: 'base' })
    );

    students.forEach((student, index) => {
        // ID الجديد هو رقم البداية + الـ index (الموقع الحالي للطالب)
        const newIdNumber = ID_START + index;
        student.id = newIdNumber.toString();
    });
    saveStudentsToStorage();
}


function saveStudentsToStorage() {
    // 1. تحويل المصفوفة إلى نص (String)
    const studentsJson = JSON.stringify(students);
    // 2. التخزين باستخدام المفتاح الثابت
    localStorage.setItem(LOCAL_STORAGE_KEY, studentsJson);

    // (اختياري: لو كانت القائمة فارغة، نمسحها من التخزين)
    if (students.length === 0) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
}

// بخلي عدد الأرقام الي تبان ف السلايدر منيه علي عدد الطلاب
function updateSliderPages(pagesCount) {
    slider.innerHTML = '';
    for (let i = 1; i <= pagesCount; i++) {
        slider.innerHTML += `<p class="first-page ${i === 1 ? 'active-page' : ''}">${i}</p>`;
    }

    // ⚠️ الخطوة 2 هي الأهم: يجب إعادة ربط الـ listeners هنا
    reinitializeSliderListeners(); // سيتم تعريفها في الخطوة 2
}

//gurdian controlling

// show/hide guardian sections based on selection
gurdianSection.forEach(section => section.style.display = 'none'); // افتراضي مخفية
// التحكم في ظهور السكشنات بعد اختيار العدد
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
//what is clicked from slider ?
function reinitializeSliderListeners() {
    // 1. إعادة تحديد العناصر بعد تحديث الـ DOM
    const clickedPageNew = document.querySelectorAll('.slider *');

    // 2. إزالة الـ Listeners القديمة وإضافة الجديدة
    clickedPageNew.forEach(element => {
        // نستخدم element.onclick لتجنب تعقيد removeEventListener
        element.onclick = () => {
            const content = element.innerHTML.trim();

            if (/^-?\d+(\.\d+)?$/.test(content)) {
                currentPage = parseInt(content) - 1;
                showStudents(currentPage);
            } else if (element.classList.contains('back-page')) {
                currentPage = Math.max(0, currentPage - 1);
                showStudents(currentPage);
            } else if (element.classList.contains('after-page')) {
                currentPage = Math.min(studentSliderPages - 1, currentPage + 1);
                showStudents(currentPage);
            }

            // تحديث الـ Active Class
            clickedPageNew.forEach(el => el.classList.remove('active-page'));
            const pageButton = Array.from(clickedPageNew).find(el => el.innerHTML.trim() == (currentPage + 1).toString());

            if (pageButton) {
                pageButton.classList.add('active-page');
            }
        };
    });
}

function showStudents(page) {
    let startIndex = page * 10;
    let endIndex = startIndex + 10;
    let studesOnThisPage = students.slice(startIndex, endIndex);
    studentsTableBody.innerHTML = ``;
    let rowsHtml = '';
    studesOnThisPage.forEach((student, index) => {
                //controlling color
                let classificationclass = '';
                switch (student.classification) {
                    case 'superior':
                        classificationclass = 'classification-superior';
                        break;
                    case 'weak':
                        classificationclass = 'classification-weak';
                        break;
                    case 'talented':
                        classificationclass = 'classification-talented';
                        break;

                    case 'developing':
                        classificationclass = '';
                        break;
                    default:
                        classificationclass = ''; // لأي تصنيف آخر


                }
                studentsTableBody.innerHTML +=
                    `<tr data-local-index="${index}" data-full-student-id="${student.id}">
                            <td>${startIndex + index+1}</td>
                            <td>${student.id}</td>
                            <td>${`${student.firstName} ${student.lastName}`}</td>
                            <td>${`${student.grade} - ${student.class}`}</td>
                            <td>${student.gender}</td>
                            <td>${student.Attendance}</td>
                            <td class="${classificationclass}">${student.classification}</td>
                        
                        </tr>`;
            const allRows = studentsTableBody.querySelectorAll('tr');
                            allRows.forEach(row => {
                                row.addEventListener('click', (event) => {
                                    const studentId = row.getAttribute('data-full-student-id');
            // 1. البحث عن الطالب بالـ ID
            const clickedStudent = students.find(s => s.id === studentId);

            if (clickedStudent) {
                // 2. 🔑 تخزين بيانات الطالب في localStorage
                localStorage.setItem('selectedStudentData', JSON.stringify(clickedStudent));

                // 3. الانتقال إلى الصفحة الجديدة
                window.location.href = "../studentPage.html";
            }
        });
        });
    });
};
function showWarning(message, inputElement = null) {
    const warningElement = inputElement 
        ? inputElement.closest('div').querySelector('.warning') 
        : document.querySelector('.form-warning');

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
    // 1. تحقق من جميع الحقول النصية المطلوبة
    const requiredInputs = form.querySelectorAll('input[required]');
    for (const input of requiredInputs) {
        if (!input.value.trim()) {
            showWarning(`Please fill in the required field: ${input.placeholder || input.name}`, input);
            return false;
        }
    }

    // 2. تحقق من اختيار الجنس
    const genderRadios = document.querySelectorAll('input[name="gender"]');
    if (!getSelectedGender(genderRadios)) {
        showWarning("Please select the student's gender");
        return false;
    }

    // 3. تحقق من اختيار عدد الجاردين
    const gurdianRadios = document.querySelectorAll('input[name="gurdian"]');
    const gurdianCount = getSelectedGurdian(gurdianRadios);
    if (!gurdianCount) {
        showWarning("Please select number of guardians");
        return false;
    }

    // 4. تحقق من ملء السكشنات الخاصة بالجاردين بناءً على العدد المختار
    if (gurdianCount === "1") {
        const primaryInputs = primaryGurdianSection.querySelectorAll('input[required]');
        for (const input of primaryInputs) {
            if (!input.value.trim()) {
                showWarning(`Please fill in primary guardian field: ${input.placeholder || input.name}`, input);
                return false;
            }
        }
    } else if (gurdianCount === "2") {
        const primaryInputs = primaryGurdianSection.querySelectorAll('input[required]');
        const secondaryInputs = secondaryGurdianSection.querySelectorAll('input[required]');
        for (const input of [...primaryInputs, ...secondaryInputs]) {
            if (!input.value.trim()) {
                showWarning(`Please fill in guardian field: ${input.placeholder || input.name}`, input);
                return false;
            }
        }
    }
// 6. تحقق من طول الرقم القومي للجارديان
const primaryGurdianNationalId = document.getElementById('primaryGurdianNationalId').value.trim();
if (primaryGurdianNationalId.length !== 14) {
    showWarning("Primary Guardian National ID must be 14 digits", document.getElementById('primaryGurdianNationalId'));
    return false;
}

if (gurdianCount === "2") {
    const secondaryGurdianNationalId = document.getElementById('seconaryGurdianNationalId').value.trim();
    if (secondaryGurdianNationalId.length !== 14) {
        showWarning("Secondary Guardian National ID must be 14 digits", document.getElementById('seconaryGurdianNationalId'));
        return false;
    }
}

    // 5. تحقق من الرقم القومي
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

    return true; // كل شيء تمام
}
const darkModeToggle = document.getElementById('darkModeToggle');
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

function generateEmptyGrades(subjects) {
    const months = ['sep','oct','Nov','Dec','Jan','Feb','Mar','Apr','May','Jun'];
    const grades = {};

    months.forEach(month => {
        grades[month] = {};
        subjects.forEach(subject => {
            grades[month][subject] = { week1: 0, week2: 0, week3: 0, week4: 0, final: 0 };
        });
    });

    return grades;
}