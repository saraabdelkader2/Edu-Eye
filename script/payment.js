import { ModifyGeneric } from "./modify.js";
import { addNotification } from "./notifications.js";
import { feesPrices } from "./fees.js";

const LOCAL_STORAGE_KEY = 'schoolStudentsList';
const ITEMS_PER_PAGE = 10;

// ====== عناصر الـ DOM ======
let students = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
const globalSearch = document.querySelector('.search-box input');

const searchInput = document.getElementById('student-search-input');
const dataList = document.getElementById('students-list');
const idDisplay = document.getElementById('id-display');
const classDisplay = document.getElementById('class-display');
const feesSelect = document.getElementById('fees');
const amountDisplay = document.getElementById('payment-amount');
const paymentForm = document.getElementById('payment-form');
const warningElement = document.getElementById('form-warning');
const studentsTableBody = document.querySelector('.payment-table tbody');
const slider = document.querySelector('.slider .pages');
const darkModeToggle = document.getElementById('darkModeToggle');
const backBtn = document.querySelector('.back-page');
const afterBtn = document.querySelector('.after-page');
const saveBtn = document.querySelector('.save-form-button');
const resetButton = document.querySelector('.reset-form-button');
const cancelButton = document.querySelector('.cancel-form-button');


const paymentMethodSelect = document.getElementById('payment-method');
const paymentDateInput = document.getElementById('payment-date-input');

let currentPage = 0;
let activeStudent = null;

// --- 1. ترتيب الطلاب (جريد ثم كلاس) ---
function sortStudentsByGradeAndClass() {
    students.sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        const classA = (a.class || "").toString().toUpperCase();
        const classB = (b.class || "").toString().toUpperCase();
        return classA.localeCompare(classB);
    });
}

// --- 2. ملء قائمة البحث بـ ID المدرسة ---
function populateSearchList() {
    if (!dataList) return;
    dataList.innerHTML = '';
    students.forEach(std => {
        const option = document.createElement('option');
        // هنا نستخدم std.id (ID المدرسة) ليظهر في قائمة البحث
        option.value = `${std.firstName} ${std.lastName} | G: ${std.grade} | ID: ${std.id}`;
        dataList.appendChild(option);
    });
}

if (searchInput) {
    searchInput.addEventListener('input', function() {
        if (warningElement) warningElement.style.display = 'none';
    });

    searchInput.addEventListener('change', function() {
        const inputValue = this.value;
        const match = inputValue.match(/ID:\s*(\w+)/);

        if (match) {
            const schoolId = match[1];
            activeStudent = students.find(std => String(std.id) === String(schoolId));

            if (activeStudent) {
                idDisplay.value = activeStudent.NationalId || "N/A"; // عرض القومي كمرجع
                classDisplay.value = `${activeStudent.grade} - ${activeStudent.class}`;
                updateFeesOptions(activeStudent);
                amountDisplay.value = '';
            }
        } else if (inputValue.trim() !== "") {
            // إظهار تحذير إذا كانت البيانات غير موجودة
            warningElement.textContent = 'Warning: Student is not found! Please select from the dropdown list.';
            warningElement.style.display = 'block';
            this.value = "";
            resetFormFields();
        }
    });
}

// --- 4. تحديث خيارات المصاريف المتاحة للطالب ---
function updateFeesOptions(student) {
    if (!feesSelect) return;
    feesSelect.innerHTML = '<option value="" disabled selected hidden>Select Fees Type</option>';

    const isPaidSchool = (student.schoolStatus || "").toLowerCase() === 'yes';
    const isPaidBus = (student.busStatus || "").toLowerCase() === 'yes';

    if (isPaidSchool && isPaidBus) {
        feesSelect.innerHTML += '<option value="" disabled>Full Fees Already Paid</option>';
    } else {
        if (!isPaidSchool) {
            feesSelect.innerHTML += '<option value="school">School Fees</option>';
            feesSelect.innerHTML += '<option value="school&bus">School + Bus</option>';
        }
        if (!isPaidBus) {
            feesSelect.innerHTML += '<option value="bus">Bus Fees Only</option>';
        }
    }
}

// --- 5. حساب المبلغ تلقائياً عند اختيار النوع ---
if (feesSelect) {
    feesSelect.addEventListener('change', function() {
        if (!activeStudent) return;

        // تنظيف الجريد للبحث في ملف الأسعار
        const gradeKey = String(activeStudent.grade).replace(/\D/g, "");
        const selectedType = this.value;
        const prices = feesPrices[gradeKey];

        if (!prices) {
            alert(`⚠️ Prices for Grade ${gradeKey} not found in fees.js`);
            amountDisplay.value = "0.00";
            return;
        }

        let total = 0;
        if (selectedType === 'school') total = prices.school || 0;
        else if (selectedType === 'bus') total = prices.bus || 0;
        else if (selectedType === 'school&bus') total = (prices.school || 0) + (prices.bus || 0);

        amountDisplay.value = total;
    });
}

if (paymentForm) {
    paymentForm.addEventListener('submit', function(e) {
        e.preventDefault();

        if (!activeStudent) {
            alert("Please select a student first!");
            return;
        }

        const selectedType = feesSelect.value;
        if (!selectedType) {
            alert("Please select Fees Type!");
            return;
        }

        // تحديث الطالب في المصفوفة الأصلية
        const index = students.findIndex(std => String(std.id) === String(activeStudent.id));

        if (index !== -1) {
            if (selectedType === 'school') students[index].schoolStatus = 'Yes';
            else if (selectedType === 'bus') students[index].busStatus = 'Yes';
            else if (selectedType === 'school&bus') {
                students[index].schoolStatus = 'Yes';
                students[index].busStatus = 'Yes';
            }

            // حفظ التعديلات في LocalStorage
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));

            // إشعار نجاح وتحديث الواجهة
            addNotification(`Payment confirmed for ID: ${activeStudent.id}`, "success");
            updateStats();
            renderStudents(currentPage);
            populateSearchList();

            // إعادة ضبط الفورم
            paymentForm.reset();
            resetFormFields();
        }
    });
}

// --- 7. الإحصائيات والجدول ---
function updateStats() {
    let paidCount = students.filter(s => s.schoolStatus.trim().toLowerCase() === 'yes').length;
    let busCount = students.filter(s => s.busStatus.trim().toLowerCase() === 'yes').length;

    if (document.querySelector('#paid-students-count')) document.querySelector('#paid-students-count').innerHTML = paidCount;
    if (document.querySelector('#total-students-count')) document.querySelector('#total-students-count').innerHTML = students.length;
    if (document.querySelector('#un-paid-students-count')) document.querySelector('#un-paid-students-count').innerHTML = students.length - paidCount;
    if (document.querySelector('#bus-subscribers-count')) document.querySelector('#bus-subscribers-count').innerHTML = busCount;
}

function renderStudents(page = 0) {
    if (!studentsTableBody) return;
    const start = page * ITEMS_PER_PAGE;
    const pageStudents = students.slice(start, start + ITEMS_PER_PAGE);
    studentsTableBody.innerHTML = '';

    pageStudents.forEach((std) => {
        const gradeKey = String(std.grade).replace(/\D/g, "");
        const prices = feesPrices[gradeKey] || { school: 0, bus: 0 };

        // تحديد الحالة مع إضافة تنسيق اللون
        const isPaid = std.schoolStatus.trim().toLowerCase() === 'yes';
        const statusText = isPaid ? 'Paid' : 'Unpaid';
        const statusColor = isPaid ? '#28a745' : '#dc3545'; // أخضر للدافع وأحمر للي مش دافع

        // حساب المبلغ المدفوع
        let paidAmount = 0;
        if ((std.schoolStatus || '').toLowerCase() === 'yes') paidAmount += prices.school || 0;
        if ((std.busStatus || '').toLowerCase() === 'yes') paidAmount += prices.bus || 0;

        const row = document.createElement('tr');
        row.innerHTML = `
        <td>${std.firstName} ${std.lastName}</td>
        <td>${std.grade} - ${std.class}</td>
        <td>${getStatusLabel(std)}</td>
        <td>${paidAmount.toLocaleString()} EGP</td>
        <td style="color: ${statusColor}; font-weight: bold;">${statusText}</td>
        <td>${std.paymentDate ? new Date(std.paymentDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }) : '-'}</td>
    `;
        studentsTableBody.appendChild(row);
    });


    updateSlider();
}

function getStatusLabel(std) {
    const s = std.schoolStatus.trim().toLowerCase() === 'yes';
    const b = std.busStatus.trim().toLowerCase() === 'yes';
    if (s && b) return '<span>Bus + School</span>';
    if (s) return '<span>School</span>';
    if (b) return '<span>Bus</span>';
    return '<span>-</span>';
}

function resetFormFields() {
    idDisplay.value = '';
    classDisplay.value = '';
    amountDisplay.value = '';
    if (feesSelect) feesSelect.innerHTML = '<option value="" disabled selected>Select Fees Type</option>';
    activeStudent = null;
}

function updateSlider() {
    const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
    if (!slider) return;
    slider.innerHTML = '';


    if (backBtn) {
        backBtn.classList.toggle('disabled', currentPage === 0);
    }

    if (afterBtn) {
        afterBtn.classList.toggle('disabled', currentPage >= totalPages - 1 || totalPages <= 1);
    }

    // بناء أرقام الصفحات
    for (let i = 1; i <= totalPages; i++) {
        const p = document.createElement('p');
        p.textContent = i;
        if (i === currentPage + 1) p.classList.add('active-page');
        p.onclick = () => {
            currentPage = i - 1;
            renderStudents(currentPage);
        };
        slider.appendChild(p);
    }
}
if (backBtn) {
    backBtn.onclick = () => {
        if (currentPage > 0) {
            currentPage--;
            renderStudents(currentPage);
        }
    };
}

if (afterBtn) {
    afterBtn.onclick = () => {
        const totalPages = Math.ceil(students.length / ITEMS_PER_PAGE);
        if (currentPage < totalPages - 1) {
            currentPage++;
            renderStudents(currentPage);
        }
    };
}

function init() {
    sortStudentsByGradeAndClass();
    updateStats();
    populateSearchList();
    renderStudents(currentPage);
    ModifyGeneric({
        addBtn: document.querySelector('#add-btn'),
        allBtn: document.querySelector('#all-payments'),
        listView: document.querySelector('.payment-list-section'),
        formView: document.querySelector('.payment-form-section'),
        editConfirmButtons: document.querySelector('.add-buttons'),

        favicon: 'media copy/favicons/icons8-money-40.png',
        listTitle: 'All Payments',
        formTitle: 'Add Payment',
        darkModeToggle
    });
}
saveBtn.addEventListener('click', function(e) {
    e.preventDefault();

    if (!activeStudent) {
        warningElement.textContent = 'Please select student first.';
        warningElement.style.display = 'block';
        return;
    }
    if (!feesSelect.value || !paymentMethodSelect.value) {
        warningElement.textContent = 'Error: Please fill in all required fields.';
        warningElement.style.backgroundColor = '#f8d7da';
        warningElement.style.color = '#721c24';
        warningElement.style.display = 'block';
        warningElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const index = students.findIndex(std => String(std.id) === String(activeStudent.id));
    if (index !== -1) {
        // تحديث الحالات
        if (feesSelect.value === 'school') students[index].schoolStatus = 'Yes';
        else if (feesSelect.value === 'bus') students[index].busStatus = 'Yes';
        else if (feesSelect.value === 'school&bus') {
            students[index].schoolStatus = 'Yes';
            students[index].busStatus = 'Yes';
        }

        students[index].paymentMethod = paymentMethodSelect.value;
        students[index].paymentDate = paymentDateInput.value || new Date().toISOString().split('T')[0];

        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(students));
        addNotification('Payment saved successfully', 'success');

        renderStudents(currentPage);
        updateStats();
        paymentForm.reset();
        resetFormFields();
    }
});

init();

if (globalSearch) {
    globalSearch.addEventListener('input', function() {
        const searchTerm = this.value.toLowerCase().trim();

        if (searchTerm === "") {
            students = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
        } else {
            const allStudents = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)) || [];
            students = allStudents.filter(std => {
                const fullName = `${std.firstName} ${std.lastName}`.toLowerCase();
                const studentId = String(std.id).toLowerCase();
                return fullName.includes(searchTerm) || studentId.includes(searchTerm);
            });
        }

        // العودة للصفحة الأولى وتحديث العرض
        currentPage = 0;
        renderStudents(currentPage);
    });
}


resetButton.addEventListener('click', (e) => {
    e.preventDefault();

    document.body.style.overflow = 'hidden'; // no scroll

    document.getElementById('blur-layer').style.display = 'block';

    document.querySelector('.reset-pop-up').style.display = 'flex';
    const confirmed = document.getElementById('yes');
    const canceled = document.getElementById('no');
    confirmed.addEventListener('click', () => {
        document.getElementById('blur-layer').style.display = 'none';
        document.querySelector('.reset-pop-up').style.display = 'none';

        paymentForm.reset();

        document.body.style.overflow = 'auto';
    });

    canceled.addEventListener('click', () => {
        document.getElementById('blur-layer').style.display = 'none'; // يشغل البلور
        document.querySelector('.reset-pop-up').style.display = 'none'; // يعرض البوب أب

    });

});


cancelButton.addEventListener('click', () => {

    document.querySelector('.payment-list-section').style.display = 'block';
    document.querySelector('.payment-form-section').style.display = 'none';
    document.querySelector('.add-buttons').style.display = 'none';

    document.querySelector('#all-payments').style.backgroundColor = 'var(--white-bg)';
    document.querySelector('#add-btn').style.backgroundColor = 'transparent';
});
window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
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

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
});

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