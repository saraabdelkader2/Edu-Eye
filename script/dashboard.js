import { addNotification } from "./notifications.js";

const BASE_URL = 'https://ece2026.onrender.com/webapi';


let myBarChart = null;
let myDonutChart = null;
var ALL_DATA = {
    students: [],
    teachers: [],
    classes: [],
    subjects: [],
    payments: []
};

async function init() {
    var loader = document.getElementById('full-page-loader');
    if (loader) {
        loader.style.display = 'flex';
        loader.style.opacity = '1';
    }

    try {
        console.log("System Initializing: Loading all data...");

        var results = await Promise.all([
            fetch(BASE_URL + '/students').then(function(r) { return r.json(); }),
            fetch(BASE_URL + '/teachers').then(function(r) { return r.json(); }),
            fetch(BASE_URL + '/classes').then(function(r) { return r.json(); }),
            fetch(BASE_URL + '/subjects').then(function(r) { return r.json(); }),
            fetch(BASE_URL + '/payment').then(function(r) { return r.json(); })
        ]);

        ALL_DATA.students = results[0].studentlist || [];

        var resTeachers = results[1];
        if (resTeachers && resTeachers.teachers && resTeachers.teachers.recordsets && resTeachers.teachers.recordsets[0]) {
            ALL_DATA.teachers = resTeachers.teachers.recordsets[0];
        } else {
            ALL_DATA.teachers = [];
        }

        ALL_DATA.classes = results[2].data || results[2].classes || results[2] || [];

        ALL_DATA.subjects = results[3] || [];

        ALL_DATA.payments = results[4].payments || [];

        console.log("Data Sync Complete. Teachers found:", ALL_DATA.teachers.length);

        syncInitialUI();

    } catch (error) {
        console.error("Critical Start-up Error:", error);
    } finally {
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(function() {
                loader.style.display = 'none';
            }, 600);
        }
        setupEventListeners();
    }
}

function syncInitialUI() {
    console.log("Syncing UI with Teachers Count:", ALL_DATA.teachers.length);

    // 1. الأرقام الأساسية
    safeSetText('countStudents', ALL_DATA.students.length);
    safeSetText('countTeachers', ALL_DATA.teachers.length); // ده هيعرض الرقم صح
    safeSetText('countClasses', ALL_DATA.classes.length);

    // 2. توزيع تصنيفات الطلاب (الموهوبين، المتفوقين...)
    let stats = { Talented: 0, Superior: 0, Good: 0, Fail: 0 };
    ALL_DATA.students.forEach(s => {
        if (stats.hasOwnProperty(s.Classification)) stats[s.Classification]++;
    });
    safeSetText('talentCount', stats.Talented);
    safeSetText('superiorCount', stats.Superior);
    safeSetText('goodCount', stats.Good);
    safeSetText('failCount', stats.Fail);

    // 3. بيانات الدفع والباكي باص
    if (ALL_DATA.payments && ALL_DATA.payments.length > 0) {
        var p = ALL_DATA.payments[0];
        safeSetText('busCount', p.Bus_Subscribers || 0);
        safeSetText('paidStudentsCount', p.Paid_Students || 0);
    }

    // 4. ملء الـ Select Menu
    var classSel = document.getElementById('classSelect');
    if (classSel) {
        classSel.innerHTML = '<option value="">Select Class</option>';
        ALL_DATA.classes.forEach(function(item) {
            var name = item.Class || item.class || "";
            if (name) classSel.appendChild(new Option(name, name));
        });
        if (classSel.options.length > 1) {
            classSel.selectedIndex = 1;
            var monthSel = document.getElementById('monthSelect');
            updateDashboard(monthSel ? monthSel.value : 'February', classSel.value);
        }
    }

    fillMonths();
    setCurrentDate();
}

function setupEventListeners() {
    const classSel = document.getElementById('classSelect');
    const monthSel = document.getElementById('monthSelect');
    if (classSel && monthSel) {
        classSel.onchange = () => updateDashboard(monthSel.value, classSel.value);
        monthSel.onchange = () => updateDashboard(monthSel.value, classSel.value);
    }
}

function setInitialLoading() {
    const ids = [
        'countStudents', 'busCount', 'paidStudentsCount', 'countClasses',
        'talentCount', 'superiorCount', 'goodCount', 'failCount',
        'boysCountLabel', 'girlsCountLabel', 'boysPercent', 'girlsPercent', 'attendancePercentText'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "...";
    });
}

function getTargetMonth(monthName, year) {
    const monthMap = {
        January: '01',
        February: '02',
        March: '03',
        April: '04',
        May: '05',
        June: '06',
        July: '07',
        August: '08',
        September: '09',
        October: '10',
        November: '11',
        December: '12'
    };
    return monthMap[monthName] || '01';
}

async function fetchTotalSchoolStudents() {
    try {
        const res = await fetch(`${BASE_URL}/payment`);
        const result = await res.json();

        const paymentInfo = result[" payments "] || result.payments;

        if (paymentInfo && paymentInfo.length > 0) {
            const stats = paymentInfo[0];

            const total = stats[" Total_Students "] || stats.Total_Students || 0;
            safeSetText('countStudents', total);

            const busSubscribers = stats[" Bus_Subscribers "] || stats.Bus_Subscribers || 0;
            safeSetText('busCount', busSubscribers);

            const paidStudents = stats[" Paid_Students "] || stats.Paid_Students || 0;
            safeSetText('paidStudentsCount', paidStudents);

            console.log("Data updated successfully:", { total, busSubscribers, paidStudents });
        }
    } catch (e) {
        console.error("Error in fetching bus ,payment Data", e);
    }
}
async function fetchClasses() {
    const sel = document.getElementById('classSelect');
    if (!sel) return;
    try {
        const res = await fetch(`${BASE_URL}/classes`);
        const result = await res.json();
        const classesArray = result.data || result.classes || [];

        safeSetText('countClasses', classesArray.length);

        sel.innerHTML = '<option value="">Select Class</option>';

        classesArray.forEach(item => {
            const name = item.Class || item.class || "";
            if (name) {
                sel.appendChild(new Option(name, name));
            }
        });
    } catch (e) {
        console.error("Error fetching classes:", e);
        addNotification("خطأ في جلب قائمة الفصول", "error");
    }
}
async function fetchAcademicPerformance() {
    try {
        const res = await fetch(`${BASE_URL}/students`);
        const result = await res.json();

        const students = result.studentlist || [];

        let stats = {
            Talented: 0,
            Superior: 0,
            Good: 0,
            Fail: 0,
            Weak: 0
        };

        students.forEach(student => {
            const classification = student.Classification;
            if (stats.hasOwnProperty(classification)) {
                stats[classification]++;
            }
        });

        safeSetText('talentCount', stats.Talented);
        safeSetText('superiorCount', stats.Superior);
        safeSetText('goodCount', stats.Good);
        safeSetText('failCount', stats.Fail);

        console.log("Academic Performance Sync (from student list):", stats);

    } catch (e) {
        console.error("Error fetching students for academic performance:", e);
    }
}
async function updateDashboard(month, className) {
    if (!month || !className) return;

    const monthElement = document.getElementById('currentMonthName');
    if (monthElement) monthElement.innerText = month;

    setLoading(['boysCountLabel', 'girlsCountLabel', 'boysPercent', 'girlsPercent', 'attendancePercentText']);
    generateCalendar();

    const targetMonth = getTargetMonth(month, 2026);
    const url = `${BASE_URL}/dashboard/${targetMonth}/2026/${className}`;
    console.log("Fetching dashboard data from:", url);

    try {
        const dashRes = await fetch(url);
        if (!dashRes.ok) throw new Error(`HTTP error! status: ${dashRes.status}`);

        const d = await dashRes.json();
        console.log("Dashboard API response:", d);

        if (d.countTeachers !== undefined) {
            safeSetText('countTeachers', d.countTeachers);
        }
        if (d.countStudents !== undefined) {
            safeSetText('countStudents', d.countStudents);
        }
        if (d.countClasses !== undefined) {
            safeSetText('countClasses', d.countClasses);

        }

        const boysNumber = Number(d.boysNumber) || 0;
        const girlsNumber = Number(d.girlsNumber) || 0;
        const total = boysNumber + girlsNumber;

        let boysPercentage = total > 0 ? (boysNumber / total) * 100 : 0;
        let girlsPercentage = total > 0 ? (girlsNumber / total) * 100 : 0;

        safeSetText('boysPercent', Math.round(boysPercentage) + "%");
        safeSetText('girlsPercent', Math.round(girlsPercentage) + "%");
        safeSetText('boysCountLabel', boysNumber);
        safeSetText('girlsCountLabel', girlsNumber);

        renderBarChart(d);
        renderDonutChart(d, month, className);

    } catch (e) {
        console.error("Dashboard Update Error:", e);
        addNotification("خطأ في جلب بيانات الداشبورد", "error");
    }
}

function getAttendanceForMonth(d, monthName, className) {
    if (!Array.isArray(d.MonthPercentage)) {
        console.log("MonthPercentage is not an array, fallback to attendancePercentage:", d.attendancePercentage);
        return Math.round(Number(d.attendancePercentage || 0));
    }

    const year = "2026";
    const monthNum = String(monthNameToNumber(monthName)).padStart(2, '0');
    const targetMonth = `${year}-${monthNum}`;

    const item = d.MonthPercentage.find(mp =>
        mp.TargetMonth === targetMonth && mp.ClassName.toLowerCase() === className.toLowerCase()
    );

    if (!item) {
        console.log("No match for class", className, "falling back to general attendance:", d.attendancePercentage);
        return Math.round(Number(d.attendancePercentage || 0));
    }

    return Math.round(Number(item.StudentAttendancePercentage));
}

function renderBarChart(d) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if (myBarChart) myBarChart.destroy();

    const week = d.WeekPercentage || [];
    const classTotal = d.countStudents || d[" countStudents "] || 0;

    myBarChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: week.map(w => w.DayName),
            datasets: [{
                    label: 'Present',
                    data: week.map(w => w.StudentsPresentToday || 0),
                    backgroundColor: '#66bb6a',
                    borderRadius: 5
                },
                {
                    label: 'Absent',
                    data: week.map(w => Math.max(0, classTotal - (w.StudentsPresentToday || 0))),
                    backgroundColor: '#ef5350',
                    borderRadius: 5
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rect',
                        boxWidth: 10,
                        boxHeight: 10,
                        font: {
                            size: 10
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

function renderDonutChart(d, month, className) {
    const canvas = document.getElementById('donutChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (myDonutChart) {
        myDonutChart.destroy();
        myDonutChart = null;
    }

    let attendanceVal = getAttendanceForMonth(d, month, className);

    const totalStudents = (Number(d.boysNumber) || 0) + (Number(d.girlsNumber) || 0);

    if (isNaN(attendanceVal) || attendanceVal === null) attendanceVal = 0;
    if (totalStudents === 0) attendanceVal = 0;

    const presentCount = Math.round((attendanceVal / 100) * totalStudents);
    attendanceVal = Math.round((presentCount / totalStudents) * 100);

    const absenceVal = 100 - attendanceVal;

    myDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Present', 'Absent'],
            datasets: [{
                data: [attendanceVal, absenceVal],
                backgroundColor: ['#66bb6a', '#ef5350'],
                hoverBackgroundColor: ['#43a047', '#e53935'],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(item) {
                            return `${item.label}: ${item.raw}%`;
                        }
                    }
                }
            }
        }
    });

    safeSetText('attendancePercentText', attendanceVal + "%");
}


function safeSetText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = (val !== undefined && val !== null) ? val : 0;
}

function monthNameToNumber(monthName) {
    const months = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    return months.indexOf(monthName) + 1; // January = 1
}

function fillMonths() {
    const mSel = document.getElementById('monthSelect');
    if (!mSel) return;
    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    mSel.innerHTML = '';
    months.forEach(m => mSel.appendChild(new Option(m, m)));
}

function setCurrentDate() {
    const today = new Date();
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const currentMonthName = monthNames[today.getMonth()];
    const currentYear = today.getFullYear();

    const monthHeader = document.getElementById('currentMonthName');
    const monthSel = document.getElementById('monthSelect');

    if (monthHeader) monthHeader.innerText = currentMonthName;
    if (monthSel) monthSel.value = currentMonthName;

    generateCalendar(today.getMonth(), currentYear);
}

function generateCalendar(targetMonth = null, targetYear = null) {
    const grid = document.querySelector('.calendar-grid');
    if (!grid) return;

    const now = new Date();
    const month = (targetMonth !== null) ? targetMonth : now.getMonth();
    const year = (targetYear !== null) ? targetYear : now.getFullYear();
    const today = now.getDate();

    const isThisMonth = (month === now.getMonth() && year === now.getFullYear());

    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    let daysHtml = "";
    const dayNames = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

    dayNames.forEach(name => {
        daysHtml += `<div class="day-header">${name}</div>`;
    });

    for (let x = firstDayIndex; x > 0; x--) {
        daysHtml += `<div class="day prev-date">${prevLastDay - x + 1}</div>`;
    }

    for (let i = 1; i <= lastDay; i++) {
        const isToday = (isThisMonth && i === today) ? 'today' : '';
        daysHtml += `<div class="day ${isToday}">${i}</div>`;
    }

    grid.innerHTML = daysHtml;
}

document.addEventListener('DOMContentLoaded', generateCalendar);

document.addEventListener('DOMContentLoaded', init);

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './index.html'
})

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

function setLoading(ids) {
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerText = "...";
    });
}