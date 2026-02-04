import { addNotification } from "./notifications.js";

const urlParams = new URLSearchParams(window.location.search);
const classId = urlParams.get('id');
const grade = urlParams.get('grade');
const symbol = urlParams.get('className');
const teacherName = urlParams.get('teacher');
const classSpan = document.querySelector('.className .class');
const teacherP = document.querySelector('.leadingTeacher');
const tables = document.querySelectorAll('.classStudents tbody');

if (grade && symbol) {
    classSpan.textContent = `${grade}-${symbol}`;
}

if (teacherName) {
    teacherP.textContent = `Mrs : ${teacherName}`;
}

if (!grade || !symbol) {
    console.error("Missing grade or symbol");

}

const API_BASE = "https://ece2026.onrender.com/webapi";

async function loadClassDetails() {
    try {
        const response = await fetch(`${API_BASE}/studentsInClass/${grade}/${symbol}`);
        const result = await response.json();

        if (result.success && result.students) {
            renderStudents(result.students);
        }
    } catch (error) {
        console.error("Error fetching students:", error);
    }
}

function renderStudents(students) {
    const classListContainer = document.querySelector('.classListt');

    // 1. حالة عدم وجود طلاب
    if (!students || students.length === 0) {
        classListContainer.innerHTML = `
            <div class="noStudentsDiv">
                <i class="fa-solid fa-user-slash" class="noStudents"></i>
                No students registered yet in this class.
            </div>`;
        return;
    }

    tables.forEach(table => table.innerHTML = '');

    if (students.length < 2) {
        if (tables[1]) tables[1].parentElement.style.display = 'none';

        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${index + 1}</td><td>${student.FullName}</td>`;
            tables[0].appendChild(row);
        });
    } else {
        if (tables[1]) tables[1].parentElement.style.display = 'table';

        const half = Math.ceil(students.length / 2);
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `<td>${index + 1}</td><td>${student.FullName}</td>`;

            if (index < half) {
                tables[0].appendChild(row);
            } else {
                tables[1].appendChild(row);
            }
        });
    }
}
loadClassDetails();
const editButton = document.querySelector('.edit-button');
const buttonsContainer = document.querySelector('.buttons');
const favicon = document.getElementById('favicon');

function renderClassInfo(editMode = false) {
    const classSpan = document.querySelector('.className .class');
    const teacherP = document.querySelector('.leadingTeacher');
    const buttonsContainer = document.querySelector('.buttons');

    if (!editMode) {
        classSpan.textContent = `${grade}-${symbol}`;
        teacherP.textContent = `Mrs : ${teacherName}`;

        buttonsContainer.innerHTML = '';
        const editBtn = document.createElement('button');
        editBtn.className = 'edit-button flex';
        editBtn.innerHTML = `<i class="fa-regular fa-pen-to-square"></i>Edit`;
        editBtn.onclick = () => renderClassInfo(true);
        buttonsContainer.appendChild(editBtn);

        favicon.href = "./media copy/favicons/icons8-class-80.png";
    } else {
        favicon.href = "./media copy/favicons/icons8-class-80.png";

        //classSpan.innerHTML = `<input type="text" id="edit-class-input" value="${grade}-${symbol}" style="width: 70px;">`;
        teacherP.innerHTML = `Mrs : <select id="edit-teacher-select" ></select>`;

        getTeachersOptions(teacherName).then(optionsHTML => {
            const selectElem = document.getElementById('edit-teacher-select');
            if (selectElem) selectElem.innerHTML = optionsHTML;
        });
        buttonsContainer.innerHTML = '';

        const saveButton = document.createElement('button');
        saveButton.className = 'save-button flex';
        saveButton.textContent = 'Save';

        const cancelButton = document.createElement('button');
        cancelButton.className = 'cancel-button flex';
        cancelButton.textContent = 'Cancel';

        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-button flex';
        deleteButton.textContent = 'Delete';
        deleteButton.style.backgroundColor = "#ff4d4d";

        buttonsContainer.append(saveButton, cancelButton, deleteButton);

        cancelButton.onclick = () => renderClassInfo(false);


        saveButton.onclick = async() => {
            const teacherID = document.getElementById('edit-teacher-select').value;
            const teacherNameNew = document.getElementById('edit-teacher-select').options[document.getElementById('edit-teacher-select').selectedIndex].text;

            const payload = {
                symbol: symbol,
                gradeID: parseInt(grade),
                teacherID: parseInt(teacherID)
            };

            try {
                saveButton.disabled = true;
                const response = await fetch(`${API_BASE}/editClass/${classId}`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.ok) {
                    addNotification("Teacher updated successfully!");
                    window.location.href = `./classPage.html?id=${classId}&grade=${grade}&className=${symbol}&teacher=${encodeURIComponent(teacherNameNew)}`;
                } else {
                    alert("Update failed");
                }
            } catch (err) {
                console.error("Save error:", err);
            } finally {
                saveButton.disabled = false;
            }
        };

        deleteButton.onclick = () => {
            document.body.style.overflow = 'hidden';
            document.getElementById('blur-layer').style.display = 'block';
            document.querySelector('.reset-pop-up').style.display = 'flex';

            const confirmed = document.getElementById('yes');
            const canceled = document.getElementById('no');

            confirmed.onclick = async() => {
                if (!classId) {
                    alert("Error: Class ID is missing");
                    return;
                }

                try {
                    confirmed.disabled = true;
                    confirmed.textContent = "Deleting...";

                    const response = await fetch(`${API_BASE}/deleteClass/${classId}`, {
                        method: 'DELETE'
                    });
                    const result = await response.json();

                    if (result.success) {
                        alert("Class Deleted Successfully");
                        window.location.href = "classes.html";
                    } else {
                        alert("Error: " + result.message);
                    }
                } catch (err) {
                    console.error("Delete failed", err);
                } finally {
                    document.getElementById('blur-layer').style.display = 'none';
                    document.querySelector('.reset-pop-up').style.display = 'none';
                    document.body.style.overflow = 'auto';
                }
            };

            canceled.onclick = () => {
                document.getElementById('blur-layer').style.display = 'none';
                document.querySelector('.reset-pop-up').style.display = 'none';
                document.body.style.overflow = 'auto';
            };
        };
    }
}

renderClassInfo(false);
//helpers
document.querySelector('.back-to-home').addEventListener('click', () => {
    window.location.href = "/classes.html";
});
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
async function getTeachersOptions(selectedTeacherName) {
    try {
        const res = await fetch(`${API_BASE}/teachersList`);
        const teachers = await res.json();

        return teachers.map(t => `
            <option value="${t.TeacherID}" ${t.FullName === selectedTeacherName ? 'selected' : ''}>
                ${t.FullName}
            </option>
        `).join('');
    } catch (err) {
        console.error("Error fetching teachers list:", err);
        return '<option value="">Error loading teachers</option>';
    }
}