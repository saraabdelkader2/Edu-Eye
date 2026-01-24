import { ModifyGeneric } from "./modify.js";
import { students } from "./sList.js";
import { addNotification } from "./notifications.js";
import { subjectsByGrade } from "./Subjects.js";
import { determineClassification } from "./sList.js";
import { classes } from "./clist.js";


const ID_START = 345699855;
export const LOCAL_STORAGE_KEY = 'schoolStudentsList';
let storedStudents = localStorage.getItem(LOCAL_STORAGE_KEY);
const favicon = document.getElementById('favicon');
const searchInput = document.querySelector('.search-box input');
const darkModeToggle = document.getElementById('darkModeToggle');
const addBtn = document.querySelector('#add-btn');
const allBtn = document.querySelector('#all-students');
const studentList = document.querySelector('.student-list-section');
const studentForm = document.querySelector('.student-form-section');
const editConfirmButtons = document.querySelector('.add-buttons');

// Sync the students array with stored data while maintaining the original array reference
if (storedStudents) {
    students.splice(0, students.length, ...JSON.parse(storedStudents));
}
const gradeSelect = document.getElementById('Grade');
const classSelect = document.getElementById('Class');

//slider clicking
let schoolStudents = students.length;
let studentSliderPages = Math.ceil(schoolStudents / 10);
const slider = document.querySelector('.slider .pages');
const firstPage = document.querySelector('.slider .first-page');
const studentsTableBody = document.querySelector('tbody');
let currentPage = 0;

controllingModify();
//reassign students
reassignIdAndSorting(students);
//default always show 1st page
showStudents(0);
updateSliderPages(studentSliderPages);


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



const form = document.querySelector('#student-form');
const saveButtons = document.querySelectorAll('.save-form-button');
const resetButtons = document.querySelectorAll('.reset-form-button');
const cancelButtons = document.querySelectorAll('.cancel-form-button');
let matchedStudent;
const gurdianRadios = document.querySelectorAll('input[name="gurdian"]');
const primaryGurdianSection = document.querySelector(".primary-guardian-form");
const secondaryyGurdianSection = document.querySelector(".Secondary-guardian-form");
const gurdianSection = document.querySelectorAll(".gurdian-section");
const genderRadios = document.querySelectorAll('input[name="gender"]');
//add buttons control -------------------------------
saveButtons.forEach(btn => {
    btn.addEventListener('click', () => {

        if (!validateForm()) return;

        const selectedGender = getSelectedGender(genderRadios);
        const selectedGurdianCount = getSelectedGurdian(gurdianRadios);

        // بيانات Primary Guardian
        const primaryGurdianFirstName = document.getElementById('primaryGurdianFirstName').value.trim();
        const primaryGurdianSecondName = document.getElementById('primaryGurdianSecondName').value.trim();
        const primaryGurdianRelationship = document.getElementById('primaryseconaryGurdianRelationship').value.trim();
        const primaryGurdianNationalId = document.getElementById('primaryGurdianNationalId').value.trim();
        const primaryGurdianPhone = document.getElementById('primaryGurdianPhone').value.trim();
        const primaryGurdianProfession = document.getElementById('primaryGurdianProfession').value.trim();
        const primaryGurdianDob = document.getElementById('primaryGurdianDob').value.trim();
        const primaryGurdianEmail = document.getElementById('primaryGurdianEmail').value.trim();
        const primaryGurdianAddress = document.getElementById('primaryGurdianAddress').value.trim();

        // بيانات Secondary Guardian
        let seconaryGurdianFirstName = '';
        let seconaryGurdianSecondName = '';
        let secondaryGurdianRelationship = '';
        let secondaryGurdianNationalId = '';
        let secondaryGurdianPhone = '';
        let secondaryGurdianProfession = '';
        let secondaryGurdianDob = '';
        let secondaryGurdianEmail = '';
        let secondaryGurdianAddress = '';

        if (selectedGurdianCount === "2") {
            seconaryGurdianFirstName = document.getElementById('seconaryGurdianFirstName').value.trim();
            seconaryGurdianSecondName = document.getElementById('seconaryGurdianSecondName').value.trim();
            secondaryGurdianRelationship = document.getElementById('seconaryGurdianRelationship').value.trim();
            secondaryGurdianNationalId = document.getElementById('seconaryGurdianNationalId').value.trim();
            secondaryGurdianPhone = document.getElementById('seconaryGurdianPhone').value.trim();
            secondaryGurdianProfession = document.getElementById('secondaryGurdianProfession').value.trim();
            secondaryGurdianDob = document.getElementById('secondaryGurdianDob').value.trim();
            secondaryGurdianEmail = document.getElementById('seconaryGurdianEmail').value.trim();
            secondaryGurdianAddress = document.getElementById('secondaryGurdianAddress').value.trim();

            // التحقق من Secondary Guardian
            if (!seconaryGurdianFirstName || !seconaryGurdianSecondName || !secondaryGurdianRelationship || !secondaryGurdianNationalId) {
                showWarning(
                    "Please fill all required secondary guardian fields",
                    document.getElementById('seconaryGurdianFirstName')
                );
                document.getElementById('seconaryGurdianSecondName');
                return;
            }
        }

        // التحقق من Primary Guardian
        if (!primaryGurdianFirstName || !primaryGurdianSecondName || !primaryGurdianRelationship || !primaryGurdianNationalId) {
            showWarning(
                "Please fill all required primary guardian fields",
                document.getElementById('primaryGurdianFirstName')
            );
            document.getElementById('primaryGurdianSecondName');
            return;
        }

        const gradeInput = document.getElementById('Grade').value;

        const studentData = {
            id: '',
            firstName: form.studentFirstName.value.trim(),
            lastName: form.studentLastName.value.trim(),
            gender: selectedGender,
            dateOfBirth: form.dob.value,
            grade: gradeSelect.value,
            class: classSelect.value.toUpperCase(),
            dateOfJoin: form.doj.value,
            Religon: form.studentReligon.value,
            NationalId: form.NationalId.value,
            //Address: form.studentAddress.value,
            GurdianCount: selectedGurdianCount,
            Attendance: '94%',
            status: 'new',
            busStatus: 'no',
            schoolStatus: 'no',
            paymentDate: '',
            paymentMethod: '',

            primaryGurdianFirstName,
            primaryGurdianSecondName,
            primaryGurdianEmail,
            primaryGurdianNationalId,
            primaryGurdianRelationShip: primaryGurdianRelationship,
            primaryGurdianPhone,
            primaryGurdianProffesion: primaryGurdianProfession,
            primaryGurdianDateOfBirth: primaryGurdianDob,
            primaryGurdianAddress,

            seconaryGurdianFirstName,
            seconaryGurdianSecondName,
            secondaryGurdianEmail,
            secondaryGurdianNationalId,
            secondaryGurdianRelationShip: secondaryGurdianRelationship,
            secondaryGurdianPhone,
            secondaryGurdianProffesion: secondaryGurdianProfession,
            secondaryGurdianDateOfBirth: secondaryGurdianDob,
            secondaryGurdianAddress
        };

        const gradeObj = subjectsByGrade.find(g => g.grade === studentData.grade);
        const subjects = gradeObj ? gradeObj.subjects : [];

        // إنشاء درجات ابتدائية صفرية
        studentData.grades = generateEmptyGrades(subjects);
        studentData.classification = determineClassification(studentData.grades);

        students.push(studentData);
        addNotification(`Student ${studentData.firstName} ${studentData.lastName} is added `);
        saveStudentsToStorage();
        reassignIdAndSorting(students);
        updateDisplayAfterAddition();
        form.reset();
        favicon.href = "././media copy/favicons/icons8-checked-user-80.png";

        // اخفاء السكشن بعد الحفظ
        gurdianSection.forEach(section => section.style.display = 'none');
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
            genderRadios.forEach(radio => radio.checked = false);

            gurdianRadios.forEach(radio => radio.checked = false);

            primaryGurdianSection.style.display = 'none';
            secondaryyGurdianSection.style.display = 'none';

            document.body.style.overflow = 'auto';

            studentList.style.display = 'block';
            studentForm.style.display = 'none';
            editConfirmButtons.style.display = 'none';

            allBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
            addBtn.style.backgroundColor = 'transparent';
        });

        canceled.addEventListener('click', () => {
            document.getElementById('blur-layer').style.display = 'none'; // يشغل البلور
            document.querySelector('.reset-pop-up').style.display = 'none'; // يعرض البوب أب

        });

    });
})

cancelButtons.forEach(btn => {
    btn.addEventListener('click', () => {

        studentList.style.display = 'block';
        studentForm.style.display = 'none';
        editConfirmButtons.style.display = 'none';

        allBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
        addBtn.style.backgroundColor = 'transparent';
    });
})

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
            // بيانات الاسم والـ ID
            const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
            const id = (student.id || '').toString().toLowerCase();

            // بيانات الصف والفصل (Grade & Class)
            const grade = (student.grade || '').toString().toLowerCase();
            const className = (student.class || '').toString().toLowerCase();
            const gradeAndClass = `${grade}-${className}`.toLowerCase(); // يدعم البحث عن "1-a" مثلاً

            // التحقق من وجود الكلمة في أي من هذه الحقول
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
        // تحديد كلاس التصنيف بناءً على الحالة
        const statusMap = {
            'superior': 'classification-superior',
            'weak': 'classification-weak',
            'talented': 'classification-talented'
        };
        const classificationclass = statusMap[student.classification] || '';

        const rowHTML = `
            <tr data-full-student-id="${student.id}" style="cursor: pointer;">
                <td>${idx + 1}</td>
                <td>${student.id}</td>
                <td>${student.firstName} ${student.lastName}</td>
                <td>${student.grade} - ${student.class}</td>
                <td>${student.gender}</td>
                <td>${student.Attendance}</td>
                <td class="${classificationclass}">${student.classification}</td>
            </tr>`;

        studentsTableBody.insertAdjacentHTML('beforeend', rowHTML);
    });

    // ربط أحداث النقر
    bindRowClicks();
}

// دالة مساعدة لربط النقر بعد البحث (عشان الكود ميتكررش)
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

function updateSliderPages(pagesCount) {
    slider.innerHTML = '';

    // 🔒 تعطيل / تفعيل الأسهم
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

function showStudents(page) {
    // 1. تحديد الطلاب لنسخة الديسكتوب (10 فقط)
    let startIndex = page * 10;
    let endIndex = startIndex + 10;
    let studentsOnThisPage = students.slice(startIndex, endIndex);

    const studentsTableBody = document.querySelector('tbody');
    const mobileContainer = document.querySelector('.table-mobile');

    // تفريغ المحتوى
    studentsTableBody.innerHTML = '';
    mobileContainer.innerHTML = '';

    // --- أولاً: ملء الجدول (للديسك توب فقط - 10 طلاب) ---
    studentsOnThisPage.forEach((student, index) => {
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


        const tr = document.createElement('tr');
        tr.style.cursor = 'pointer';
        tr.innerHTML = `
            <td>${startIndex + index + 1}</td>
            <td>${student.id}</td>
            <td>${student.firstName} ${student.lastName}</td>
            <td>${student.grade} - ${student.class}</td>
            <td>${student.gender}</td>
            <td>${student.Attendance}</td>
            <td class="${classificationclass}">${student.classification}</td>
        `;
        tr.addEventListener('click', () => openStudentProfile(student));
        studentsTableBody.appendChild(tr);
    });
    //`${}`
    // --- ثانياً: ملء الكروت (للموبايل - كل الطلاب بدون تقيد بالصفحة) ---
    // هنا نستخدم مصفوفة students الكاملة وليس الجزء المقطوع
    students.forEach((student) => {
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
                <div class="info-row"><span class="label">Attendance%</span> <span class="value">${student.Attendance}</span></div>
                <div class="info-row"><span class="label">Classification</span> <span class="value ${classificationclass}">${student.classification}</span></div>
            </div>
        `;
        card.addEventListener('click', () => openStudentProfile(student));
        mobileContainer.appendChild(card);
    });
}

// دالة موحدة لفتح الملف الشخصي
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
        for (const input of[...primaryInputs, ...secondaryInputs]) {
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

//Helpers
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

function controllingModify() {
    //controlling student modify start

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

function isNationalIdDuplicate(nationalId, studentsList) {
    if (!nationalId) return false;
    return studentsList.some(student => student.NationalId === nationalId);
}

//dark mode start--------------------------
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

//dark mode end -----------------------------

// حفظ آخر صفحة مفتوحة عند الخروج أو إعادة تحميل الصفحة
window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});
// تحديث الفصول بناءً على المرحلة المختارة
// 1. هنجيب الفصول من الـ Local Storage عشان نشوف "N" اللي ضفتيه
const savedClasses = JSON.parse(localStorage.getItem('schoolClassesList')) || [];

// 2. لما نختار الـ Grade
if (gradeSelect) {
    gradeSelect.addEventListener('change', function() {
        const selectedGrade = this.value; // رقم المرحلة

        // مسح القديم
        classSelect.innerHTML = '<option value="" disabled selected hidden>Class</option>';

        // فلترة من المصفوفة اللي جاية من الـ LocalStorage (اللي فيها N)
        const available = savedClasses.filter(c => c.grade.toString() === selectedGrade.toString());

        if (available.length > 0) {
            available.forEach(item => {
                const option = document.createElement('option');
                option.value = item.className; // تأكدي إنها className زي ما سميناها في المصفوفة
                option.textContent = item.className;
                classSelect.appendChild(option);
            });
            classSelect.disabled = false;
        } else {
            classSelect.disabled = true;
        }
    });
}

function updateClassOptions(gradeNumber) {
    if (!classSelect) return;

    // 1. مسح الفصول القديمة
    classSelect.innerHTML = '<option value="" disabled selected hidden>Class</option>';

    // 2. فلترة الفصول المتاحة للمرحلة دي من المصفوفة بتاعتك
    const availableClasses = classes.filter(c => c.grade === gradeNumber);

    // 3. إضافة الفصول المتاحة للقائمة
    if (availableClasses.length > 0) {
        availableClasses.forEach(item => {
            const option = document.createElement('option');
            option.value = item.class;
            option.textContent = item.class;
            classSelect.appendChild(option);
        });
        classSelect.disabled = false; // تفعيل القائمة
    } else {
        // لو مفيش فصول للمرحلة دي
        const option = document.createElement('option');
        option.textContent = "No classes available";
        classSelect.appendChild(option);
        classSelect.disabled = true;
    }
}
const asideMobile = document.querySelector('.mobile-aside');
const aside = document.getElementById('aside-mobile');
const asideClose = document.getElementById('aside-close');
asideMobile.addEventListener('click', () => {
    aside.style.setProperty('display', 'flex', 'important');
});
asideClose.addEventListener('click', () => {
    aside.style.setProperty('display', 'none', 'important');

})