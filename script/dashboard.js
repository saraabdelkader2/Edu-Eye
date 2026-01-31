import { addNotification } from "./notifications.js";

const BASE_URL = 'https://ece2026.onrender.com/webapi';

let myBarChart = null;
let myDonutChart = null;

async function init() {
    fillMonths();
    await fetchClasses();
    setCurrentDate();
    await fetchTotalSchoolStudents();

    const classSel = document.getElementById('classSelect');
    const monthSel = document.getElementById('monthSelect');

    if (classSel && classSel.options.length > 1) {
        classSel.selectedIndex = 1;
        updateDashboard(monthSel.value, classSel.value);
    }

    classSel.addEventListener('change', () => updateDashboard(monthSel.value, classSel.value));
    monthSel.addEventListener('change', () => updateDashboard(monthSel.value, classSel.value));
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
async function updateDashboard(month, className) {
    if (!month) return;

    try {
        const monthElement = document.getElementById('currentMonthName');
        if (monthElement) monthElement.innerText = month;

        const studentsRes = await fetch(`${BASE_URL}/students`);
        const studentsData = await studentsRes.json();
        const studentList = studentsData.studentlist || studentsData[" studentlist "] || [];

        const schoolStats = { Talent: 0, Superior: 0, Good: 0, Weak: 0, Fail: 0 };

        studentList.forEach(student => {
            const cls = (student.Classification || "").toString().trim().toLowerCase();

            if (cls.includes('talent')) schoolStats.Talent++;
            else if (cls.includes('superior')) schoolStats.Superior++;
            else if (cls.includes('good')) schoolStats.Good++;
            else if (cls.includes('weak')) schoolStats.Weak++;
            else if (cls.includes('fail')) schoolStats.Fail++;
        });

        safeSetText('talentCount', schoolStats.Talent);
        safeSetText('superiorCount', schoolStats.Superior);
        safeSetText('goodCount', schoolStats.Good);
        safeSetText('weakCount', schoolStats.Weak);
        safeSetText('failCount', schoolStats.Fail);
        safeSetText('countStudents', studentList.length);

        if (className && className !== "") {
            const dashRes = await fetch(`${BASE_URL}/dashboard/${month}/2026/${className}`);
            if (dashRes.ok) {
                const d = await dashRes.json();

                safeSetText('countClasses', d.countClasses || d[" countClasses "] || 0);
                safeSetText('countTeachers', d.countTeachers || d[" countTeachers "] || 0);

                const bP = Math.round(Number(d.boysPercentage || 0));
                safeSetText('boysPercent', bP + "%");
                safeSetText('girlsPercent', (100 - bP) + "%");
                safeSetText('boysCountLabel', d.boysNumber || 0);
                safeSetText('girlsCountLabel', d.girlsNumber || 0);

                renderDonutChart(d);
                renderBarChart(d);
            }
        } else {
            if (myBarChart) {
                myBarChart.destroy();
                myBarChart = null;
            }
            if (myDonutChart) {
                myDonutChart.destroy();
                myDonutChart = null;
            }
        }

    } catch (e) {
        console.error("Dashboard Update Error:", e);
    }
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

function renderDonutChart(d) {
    const ctx = document.getElementById('donutChart').getContext('2d');
    if (myDonutChart) myDonutChart.destroy();

    const mainColor = getComputedStyle(document.documentElement).getPropertyValue('--main').trim();
    const attendance = Math.round(Number(d["attendance Percentage"] || d.attendancePercentage || 0));
    const absence = 100 - attendance;

    myDonutChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Attend', 'Absent'],
            datasets: [{
                data: [attendance, absence],
                backgroundColor: ['#66bb6a', '#ef5350'],
                borderWidth: 0
            }]
        },
        options: {
            cutout: '80%',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        pointStyle: 'rect',
                        padding: 20,
                        boxWidth: 12,
                        font: { size: 12, weight: '500' }
                    }
                },
                tooltip: { enabled: true }
            }
        },
        plugins: [{
            id: 'centerText',
            afterDraw: (chart) => {
                const { ctx, chartArea: { top, width, height } } = chart;
                ctx.save();
                ctx.font = 'bold 28px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = mainColor;
                ctx.fillText(attendance + '%', width / 2, top + (height / 2));
                ctx.restore();
            }
        }]
    });
}

function safeSetText(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerText = (val !== undefined && val !== null) ? val : 0;
}

async function fetchClasses() {
    const sel = document.getElementById('classSelect');
    if (!sel) return;
    try {
        const res = await fetch(`${BASE_URL}/classes`);
        const result = await res.json();
        const classesArray = result.data || [];

        safeSetText('countClasses', classesArray.length);

        sel.innerHTML = '<option value="">Select Class</option>';
        classesArray.forEach(item => {
            const name = item.Class || item["Class "];
            sel.appendChild(new Option(`Class ${name}`, name));
        });
    } catch (e) {
        console.error(e);
    }
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
    const currentMonth = monthNames[today.getMonth()];
    const currentDay = today.getDate();

    const monthSel = document.getElementById('monthSelect');
    if (monthSel) monthSel.value = currentMonth;

    const days = document.querySelectorAll('.day');
    days.forEach(day => {
        if (day.innerText == currentDay && !day.classList.contains('empty')) {
            day.classList.add('active');
        } else {
            day.classList.remove('active');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);

const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
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