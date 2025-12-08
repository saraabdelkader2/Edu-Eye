import { Modify } from "./modify.js";
import { students } from "./sList.js";
const ID_START = 345699855;
const LOCAL_STORAGE_KEY = 'schoolStudentsList';
let storedStudents = localStorage.getItem(LOCAL_STORAGE_KEY);

if (storedStudents) {
    // إذا وُجدت بيانات، استبدل القائمة الحالية بها
    students.splice(0, students.length, ...JSON.parse(storedStudents));
}



reassignIdAndSorting(students);

//------------------------------------Defining--------------------------------
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


// بخلي عدد الأرقام الي تبان ف السلايدر منيه علي عدد الطلاب
function updateSliderPages(pagesCount) {
    slider.innerHTML = '';
    for (let i = 1; i <= pagesCount; i++) {
        slider.innerHTML += `<p class="first-page ${i === 1 ? 'active-page' : ''}">${i}</p>`;
    }

    // ⚠️ الخطوة 2 هي الأهم: يجب إعادة ربط الـ listeners هنا
    reinitializeSliderListeners(); // سيتم تعريفها في الخطوة 2
}



//controlling student modify start and add buttons
Modify(editConfirmButtons, addBtn, allBtn, studentList, studentForm); //controlling student modify end

//always show 1st page
showStudents(0);


let currentPage = 0;

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
                        classificationclass = 'classification-developing';
                        break;
                    default:
                        classificationclass = ''; // لأي تصنيف آخر


                }
                studentsTableBody.innerHTML +=
                    `    <!-- Row 1 -->
                        <tr data-local-index="${index}" data-full-student-id="${student.id}">
                            <td>${startIndex + index+1}</td>
                            <td>${student.id}</td>
                            <td>${`${student.firstName} ${student.lastName}`}</td>
                            <td>${`${student.class} - ${student.section}`}</td>
                            <td>${student.gender}</td>
                            <td>${student.attendance}</td>
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

//count females and males count and total count
const registeredStudents = document.querySelector('.registered-students-number');
let femaleCount = 0;
let maleCount = 0;
students.forEach(element => {
    if (element.studentGender === 'Female') {
        femaleCount++;
    } else {
        maleCount++;
    }
});
registeredStudents.innerHTML = (femaleCount + maleCount);




//------------------------------------ Student Form Section --------------------------------
//const form = document.querySelector('#student-form');
//const firstNameInput = form.studentFirstName;
//const lastNameInput = form.studentLastName;
//// اختيار كل radio buttons الخاصة بالـ gender
//const genderRadios = document.querySelectorAll('input[name="gender"]');
//const dateOfBirth = form.dob;
//const classInput = document.querySelector('input[name="Classes"]');
//const sectionInput = document.querySelector('input[name="Section"]');
//const NationalId = document.getElementById('NationalId').value;
//const uploadBox = document.getElementById('uploadBox');
const uploadBox = document.querySelector('#uploadBox');
//const fileInput = document.getElementById('fileInput');
//const userName = document.getElementById('userName').value;
//const password = document.getElementById('password').value;
//const fatherName = document.getElementById('fatherName').value;
//const fatherContact = document.getElementById('fatherContact').value;
//const fatherOccupation = document.getElementById('fatherOccupation').value;
//const motherName = document.getElementById('motherName').value;
//const motherContact = document.getElementById('motherContact').value;
//const annualIncome = document.getElementById('annualIncome').value;
//const studentPhone = document.getElementById('studentPhone').value;
//const studentMail = document.getElementById('studentMail').value;
//const areaAndStreet = document.getElementById('areaAndStreet').value;
//const district = document.getElementById('district').value;
//const pincode = document.getElementById('pincode').value;
//const state = document.getElementById('state').value;

const form = document.querySelector('#student-form');
const saveButton = document.querySelector('.save-form-button');
const resetButton = document.querySelector('.reset-form-button');
const cancelButton = document.querySelector('.cancel-form-button');
    let matchedStudent;


function isNationalIdDuplicate(nationalId, studentsList) {
    if (!nationalId) return false;
    // .some() تبحث عن عنصر واحد يحقق الشرط وتوقف العملية (أسرع من forEach)
    return studentsList.some(student => student.NationalId === nationalId);
}
const notificationNumber=document.querySelector('.notification-number');
const notificationIcon=document.querySelector('.notification-icon');
const notifications=document.querySelector('.notifications');
const notificationContent =document.querySelector('.notification-content ');



let notificationSound = new Audio('././sounds/notification-sound-effect-372475.mp3');

if(notificationNumber.innerHTML === '0' )
{
    notificationNumber.style.display='none';
}


notifications.addEventListener('click' ,()=>{
    // 🔔 فحص حالة العرض الحالية
    if (notificationContent.style.display === 'block') {
        // لو كان ظاهراً، نجعله يختفي
        notificationContent.style.display = 'none';
        notificationContent.innerHTML=``;notifications.classList.remove('has-content');
    } else {
        // لو كان مختفياً، نجعله يظهر
        notificationContent.style.display = 'block';        
        notificationNumber.innerHTML=`0`;
        if (notificationNumber.innerHTML === '0') {
            notificationNumber.style.display = 'none';
        }

    }
});
saveButton.addEventListener('click', () => {

    const firstNameInput = form.studentFirstName;
    const lastNameInput = form.studentLastName;

    const genderRadios = document.querySelectorAll('input[name="gender"]');
    const dateOfBirth = form.dob;
    const classInput = document.querySelector('input[name="Classes"]');
    const sectionInput = document.querySelector('input[name="Section"]');

    const nationalIdInput = document.getElementById('NationalId');
    let currentNationalId = nationalIdInput.value;   // ← تصحيح مهم

    // البيانات الإضافية
    const currentUserName = document.getElementById('userName').value;
    const currentPassword = document.getElementById('password').value;
    const currentFatherName = document.getElementById('fatherName').value;
    const currentFatherContact = document.getElementById('fatherContact').value;
    const currentFatherOccupation = document.getElementById('fatherOccupation').value;
    const currentMotherName = document.getElementById('motherName').value;
    const currentMotherContact = document.getElementById('motherContact').value;
    const currentAnnualIncome = document.getElementById('annualIncome').value;
    const currentStudentPhone = document.getElementById('studentPhone').value;
    const currentStudentMail = document.getElementById('studentMail').value;
    const currentAreaAndStreet = document.getElementById('areaAndStreet').value;
    const currentDistrict = document.getElementById('district').value;
    const currentPincode = document.getElementById('pincode').value;
    const currentState = document.getElementById('state').value;
    const warning=document.querySelector('.national-id-warning');

//لو عمل سيف من غير ما يدخل الرقم
    if (!currentNationalId) {
        warning.innerHTML='This field is required';
        setTimeout(() => {
                warning.style.display='block';
            }, 30);
        nationalIdInput.focus();
        //تحكم بحيث لو بدء يكتب الورنينج يختفي
        nationalIdInput.addEventListener('input', () => {
             warning.style.display = 'none';
            });        
            nationalIdInput.focus();
        return;
    }
//لو دخل رقم أصلا موجود
    if (isNationalIdDuplicate(currentNationalId, students)) {
        warning.innerHTML=`
        <i class="fa-solid fa-triangle-exclamation"></i> This National ID is already registered.`;
    setTimeout(() => {
        warning.style.display='block';
    }, 30);
        nationalIdInput.focus();nationalIdInput.addEventListener('input', () => {
    warning.style.display = 'none';
});
        return;
    }
//لو رقم مش صح

    if (currentNationalId.length !== 14) {
        warning.innerHTML=`
        <i class="fa-solid fa-triangle-exclamation"></i> Invalid national id.`;
    setTimeout(() => {
        warning.style.display='block';
    }, 30);
        nationalIdInput.focus();nationalIdInput.addEventListener('input', () => {
    warning.style.display = 'none';
});
        return;
    }

    const studentData = {
        id: '',
        firstName: firstNameInput.value,
        lastName: lastNameInput.value,
        gender: getSelectedGender(genderRadios),
        dateOfBirth: dateOfBirth.value,
        class: classInput.value,
        section: sectionInput.value,
        userName: currentUserName,
        password: currentPassword,
        fatherName: currentFatherName,
        fatherContact: currentFatherContact,
        fatherOccupation: currentFatherOccupation,
        motherName: currentMotherName,
        motherContact: currentMotherContact,
        annualIncome: currentAnnualIncome,
        studentPhone: currentStudentPhone,
        studentMail: currentStudentMail,
        areaAndStreet: currentAreaAndStreet,
        district: currentDistrict,
        pincode: currentPincode,
        state: currentState,
        NationalId: currentNationalId,
        attendance: '90%',
        classification: 'developing'
    };

    students.push(studentData);
    pushOne();
    saveStudentsToStorage();
    notificationContent.innerHTML+=`<p>New student is added</p>
               `;
    

    if (studentData.gender === 'Female') {
        femaleCount++;
    } else {
        maleCount++;
    }

    reassignIdAndSorting(students);
    updateDisplayAfterAddition();
    form.reset();
});

const backToHome=document.querySelector('.back-to-home');
backToHome.addEventListener('click',()=>{
    window.location.href="/dashboard.html";
    //backToHome.style.display='none';
})




function pushOne()
{
    notificationNumber.innerHTML++;
        notificationNumber.style.display='flex';
        notifications.classList.add('has-content');

    notificationSound.currentTime = 0; // السطر ده مهم عشان لو ضغطت بسرعة الصوت يبتدي من الأول كل مرة
    notificationSound.play();
    notificationIcon.classList.add('shake-effect');
}

resetButton.addEventListener('click', () =>{
    form.reset();

});
cancelButton.addEventListener('click' ,( )=>{
      studentList.style.display = 'block';
        studentForm.style.display = 'none';  editConfirmButtons.style.display = 'none';

        allBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
        addBtn.style.backgroundColor = 'transparent';
})

//لو ضغطت ف اي حته جوا البوكس يفتحلي ادخل فايل 
uploadBox.addEventListener('click', () => {
    fileInput.click(); // يفتح نافذة اختيار الملف
});

//أخد الفايل والون الايقون واعمل دن
fileInput.addEventListener('change', () => {
    const file = fileInput.files[0];
    if (file) {

        uploadBox.innerHTML=` <i class="fa-regular fa-file-image upload-icon" style="color:#28A745"></i>
                                    <p>Drop your files to upload<br /><span class='file-name'>${file.name}</span></p>`;
//        uploadBox.querySelector('p span').innerHTML =
//            `<i class="fa-solid fa-circle-check" 
//            style="font-size: 14px;
//            color: #64966f;
//            margin-right: 5px;">
//            </i> ${file.name}`; //   عرض اسم الفايل
//uploadBoxIcon.innerHTML=`<i class="fa-regular fa-file-image"></i>`;
//        uploadBoxIcon.style.color = '#28A745';
    }
});

//gender selection
function getSelectedGender(genderRadios) {
    let selected = Array.from(genderRadios).find(radio => radio.checked);
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
    });     saveStudentsToStorage();
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
