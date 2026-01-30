import { ModifyGeneric } from "./modify.js";
import { addNotification } from "./notifications.js";

const ITEMS_PER_PAGE = 10;

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
const saveBtn = document.querySelectorAll('.save-form-button');
const resetButton = document.querySelectorAll('.reset-form-button');
const cancelButton = document.querySelectorAll('.cancel-form-button');
const paymentMethodSelect = document.getElementById('payment-method');
const paymentDateInput = document.getElementById('payment-date-input');

let currentPage = 0;
let activeStudent = null;
let allStudents = [];

function sortStudentsByGradeAndClass() {
    students.sort((a, b) => {
        if (a.grade !== b.grade) return a.grade - b.grade;
        const classA = (a.class || "").toString().toUpperCase();
        const classB = (b.class || "").toString().toUpperCase();
        return classA.localeCompare(classB);
    });
}
let students = [];
const API_BASE = 'https://ece2026.onrender.com/webapi';
async function fetchPayments() {
    try {
        const res = await fetch(`${API_BASE}/payment`);
        const data = await res.json();

        if (data.payments && data.payments[0]) {
            const stats = data.payments[0];
            document.querySelector('#paid-students-count').textContent = stats.Paid_Students;
            document.querySelector('#total-students-count').textContent = stats.Total_Students;
            document.querySelector('#un-paid-students-count').textContent = stats.UnPaid_Students;
            document.querySelector('#bus-subscribers-count').textContent = stats.Bus_Subscribers;
        }

        students = data.paymentsTable.map(p => ({
            name: p["Student Name"],
            className: p["Class"],
            feesType: p["Fees Type"],
            amount: p["Amount"],
            status: p["Status"],
            paymentDate: p["Payment Date"]
        }));

        renderStudents(currentPage);
    } catch (err) {
        console.error('Error fetching payments:', err);
    }
}
fetchPayments();

function renderStudents(page = 0) {
    if (!studentsTableBody) return;
    const start = page * ITEMS_PER_PAGE;
    const pageStudents = students.slice(start, start + ITEMS_PER_PAGE);
    studentsTableBody.innerHTML = '';

    pageStudents.forEach((std) => {
        const statusVal = (std.status || "").toString().trim().toLowerCase();

        const isPaid = statusVal === 'paid' || statusVal === 'yes';

        const statusColor = isPaid ? '#28a745' : '#dc3545';

        let displayGrade = "";
        let displayClass = std.className || std.class || "-";

        if (displayClass.includes('-')) {
            const parts = displayClass.split('-');
            displayGrade = parts[0].replace(/G/i, '').trim();
            displayClass = parts[1].trim();
        } else {
            displayGrade = (std.grade || "").toString().replace(/G/i, '').trim();
        }

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${std.name || "Unknown"}</td>
            <td>${displayGrade} - ${displayClass}</td> 
            <td>${getStatusLabel(std)}</td>
            <td>${std.amount || '0'} EGP</td>
            <td style="color: ${statusColor} !important; font-weight: bold;">
                ${isPaid ? 'Paid' : 'Unpaid'}
            </td>
            <td>${std.paymentDate ? 
                new Date(std.paymentDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }) : '-'}
            </td>`;
        studentsTableBody.appendChild(row);
    });
    updateSlider();
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

init();
globalSearch.addEventListener('input', function() {
    const searchTerm = this.value.toLowerCase().trim();

    if (searchTerm === "") {
        renderStudents(currentPage);
    } else {
        const filtered = students.filter(std => {
            const fullName = (std.name || "").toLowerCase();
            const className = (std.className || "").toLowerCase();
            return fullName.includes(searchTerm) || className.includes(searchTerm);
        });
        renderStudentsFiltered(filtered);
    }
});

function renderStudentsFiltered(filtered) {
    if (!studentsTableBody) return;
    studentsTableBody.innerHTML = '';

    filtered.forEach((std) => {
        const statusVal = (std.status || "").toString().toLowerCase().trim();
        const isPaid = statusVal === 'paid' || statusVal === 'yes';
        const statusColor = isPaid ? '#28a745' : '#dc3545';

        let cleanClassName = (std.className || "-").toString().replace(/g/i, '');

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${std.name || "Unknown"}</td>
            <td>${cleanClassName}</td>
            <td>${getStatusLabel(std)}</td>
            <td>${std.amount || '0'} EGP</td>
            <td style="color: ${statusColor}; font-weight: bold;">${isPaid ? 'Paid' : 'Unpaid'}</td>
            <td>${std.paymentDate ? 
                new Date(std.paymentDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                }) : '-'}</td>
        `;
        studentsTableBody.appendChild(row);
    });
}

resetButton.forEach(element => {
    element.addEventListener('click', (e) => {
        e.preventDefault();

        document.body.style.overflow = 'hidden';

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
            document.getElementById('blur-layer').style.display = 'none';
            document.querySelector('.reset-pop-up').style.display = 'none';

        });

    });

});


cancelButton.forEach(element => {
    element.addEventListener('click', () => {

        document.querySelector('.payment-list-section').style.display = 'block';
        document.querySelector('.payment-form-section').style.display = 'none';
        document.querySelectorAll('.add-buttons').forEach(el => el.style.display = 'none');
        document.querySelector('#all-payments').style.backgroundColor = 'var(--white-bg)';
        document.querySelector('#add-btn').style.backgroundColor = 'transparent';
    });

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
        window.location.href = "/dashboard.html";
    }
});

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
});

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


if (searchInput) {
    searchInput.addEventListener('change', async function() {
        const selectedName = this.value;
        const student = allStudents.find(std => std.name === selectedName);

        if (student) {
            try {
                const res = await fetch(`${API_BASE}/studentPage/${student.nationalID}`);
                const detailData = await res.json();

                if (detailData.PersonalInfo && detailData.PersonalInfo[0]) {
                    const info = detailData.PersonalInfo[0];

                    activeStudent = {
                        id: info.StudentID,
                        name: info.FullName,
                        className: info.ClassName
                    };

                    idDisplay.value = activeStudent.id;
                    classDisplay.value = activeStudent.className;

                    updateFeesOptions(activeStudent.id);
                }
            } catch (err) {
                console.error("Error:", err);
                addNotification("failed to load student data", "error");
            }
        }
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


            addNotification(`Payment confirmed for ID: ${activeStudent.id}`, "success");
            updateStats();
            renderStudents(currentPage);
            populateSearchList();

            paymentForm.reset();
            resetFormFields();
        }
    });
}

function updateStats() {

    let paidCount = students.filter(s => {
        const val = (s.status || "").toLowerCase();
        return val === 'paid' || val === 'yes';
    }).length;

}


function getStatusLabel(std) {
    const type = (std.feesType || std.paymentMethod || "").toLowerCase();

    if (type.includes('bus') && type.includes('school')) return '<span>Bus + School</span>';
    if (type.includes('school')) return '<span>School</span>';
    if (type.includes('bus')) return '<span>Bus</span>';

    return '<span>-</span>';
}

function resetFormFields() {
    idDisplay.value = '';
    classDisplay.value = '';
    amountDisplay.value = '';
    if (feesSelect) feesSelect.innerHTML = '<option value="" disabled selected>Select Fees Type</option>';
    activeStudent = null;
}


fetchAllStudentsForSearch();
async function fetchAllStudentsForSearch() {
    try {
        const res = await fetch(`${API_BASE}/students`);
        const data = await res.json();

        if (data.studentlist) {
            allStudents = data.studentlist.map(s => {
                const clean = {};
                Object.keys(s).forEach(k => { clean[k.trim()] = s[k]; });

                return {
                    nationalID: clean["ID Number"],
                    name: clean["Student Name"],
                    className: clean["ClassName"],

                    id: clean["StudentID"] || "Click to get ID"
                };
            });
            populateSearchList();
        }
    } catch (err) {
        console.error('Error fetching students:', err);
    }
}

function populateSearchList() {
    if (!dataList) return;
    dataList.innerHTML = '';
    allStudents.forEach(std => {
        const option = document.createElement('option');
        // هنا هنخلي السيرش بالاسم عشان اليوزر يعرف يختار
        option.value = std.name;
        option.textContent = `Grade: ${std.className}`;
        dataList.appendChild(option);
    });
}
async function updateFeesOptions(studentID) {
    const container = document.getElementById('fees-checkboxes-container');
    if (!container) return;

    container.innerHTML = '<p>Fees loading...</p>';

    try {
        const res = await fetch(`${API_BASE}/paymentstatus/${studentID}`);
        const data = await res.json();

        if (data.success && data.fees) {
            container.innerHTML = '';
            data.fees.forEach(fee => {
                const isPaid = fee.IsPaid === 1;
                const div = document.createElement('div');
                div.className = 'fee-item';
                //div.style.cssText = "display: flex; align-items: center; gap: 10px; padding: 5px;";

                div.innerHTML = `
                    <input type="checkbox" class="fee-input" 
                           id="f-${fee.FeeID}" 
                           value="${fee.FeeID}" 
                           data-amount="${fee.RequiredAmount}"
                           ${isPaid ? 'disabled checked' : ''}>
                    <label for="f-${fee.FeeID}">
                        ${fee.FeeName} - <b>${fee.RequiredAmount} EGP</b>
                    </label>
                `;
                container.appendChild(div);

                if (!isPaid) {
                    div.querySelector('input').addEventListener('change', calculateTotalAmount);
                }
            });
        }
    } catch (err) {
        container.innerHTML = '<p style="color:red"> fees error</p>';
    }
}

function calculateTotalAmount() {
    const checkedBoxes = document.querySelectorAll('.fee-input:checked:not(:disabled)');
    let total = 0;
    checkedBoxes.forEach(cb => {
        total += parseFloat(cb.getAttribute('data-amount')) || 0;
    });

    if (amountDisplay) {
        amountDisplay.value = total;
    }
}

saveBtn.forEach(btn => {
    btn.addEventListener('click', async function(e) {
        e.preventDefault();

        const checkedBoxes = document.querySelectorAll('.fee-input:checked:not(:disabled)');

        if (!activeStudent || checkedBoxes.length === 0) {
            addNotification("Please select a student and fees!", "error");
            return;
        }

        saveBtn.forEach(b => {
            b.disabled = true;
            b.dataset.originalText = b.innerHTML;
            b.innerHTML = '<span class="loader-spinner"></span>...';
            b.style.opacity = '0.7';
        });

        const payload = {
            studentID: parseInt(activeStudent.id),
            paymentDate: paymentDateInput.value || new Date().toISOString().split('T')[0],
            paymentMethod: paymentMethodSelect.value,
            selectedFees: Array.from(checkedBoxes).map(cb => ({
                feeID: parseInt(cb.value),
                amount: parseFloat(cb.getAttribute('data-amount'))
            }))
        };

        try {
            const res = await fetch(`${API_BASE}/addpayment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                addNotification('Payment recorded successfully!', 'success');
                await fetchPayments();
                resetFormFields();
                if (document.getElementById('fees-checkboxes-container')) {
                    document.getElementById('fees-checkboxes-container').innerHTML = '';
                }
                if (cancelButton[0]) cancelButton[0].click();
            } else {
                addNotification('Failed to save payment', 'error');
            }
        } catch (err) {
            console.error("Payment failed", err);
            addNotification("Connection error", "error");
        } finally {
            saveBtn.forEach(b => {
                b.disabled = false;
                b.innerHTML = b.dataset.originalText || "Save";
                b.style.opacity = '1';
            });
        }
    });
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