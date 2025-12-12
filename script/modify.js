// Helper function to choose color based on mode
function getColor(lightColor, darkColor) {
    return document.body.classList.contains('dark-mode') ? darkColor : lightColor;
}

// Neutral active background for both modes
function getActiveBg() {
    return document.body.classList.contains('dark-mode') ?
        'rgba(255,255,255,0.12)' // واضح على الداكن
        :
        'rgba(0,0,0,0.07)'; // واضح على الفاتح
}

export function Modify(editConfirmButtons, addBtn, allBtn, studentList, studentForm, favicon, favicon1, favicon2, themeToggleBtn) {

    // --- Hover Function ---
    function hoverEffect(btn) {
        btn.addEventListener('mouseenter', () => {
            if (!btn.classList.contains('active-button-student')) {
                btn.style.backgroundColor = getColor('rgba(230,230,230,1)', '#2d2d2d');
            }
        });
        btn.addEventListener('mouseleave', () => {
            if (btn.classList.contains('active-button-student')) {
                btn.style.backgroundColor = getActiveBg();
                btn.style.color = getColor('#000', '#f5f5f5');
            } else {
                btn.style.backgroundColor = 'transparent';
                btn.style.color = getColor('#000', '#f5f5f5');
            }
        });
    }

    hoverEffect(addBtn);
    hoverEffect(allBtn);

    // --- Set Default Colors ---
    function setDefaultColors() {
        allBtn.classList.add('active-button-student');
        allBtn.style.backgroundColor = getActiveBg();
        allBtn.style.color = getColor('#000', '#f5f5f5');

        addBtn.classList.remove('active-button-student');
        addBtn.style.backgroundColor = 'transparent';
        addBtn.style.color = getColor('#000', '#f5f5f5');
    }

    // --- Refresh Theme Function ---
    function refreshTheme() {
        [addBtn, allBtn].forEach(btn => {
            if (btn.classList.contains('active-button-student')) {
                btn.style.backgroundColor = getActiveBg();
                btn.style.color = getColor('#000', '#f5f5f5');
            } else {
                btn.style.backgroundColor = 'transparent';
                btn.style.color = getColor('#000', '#f5f5f5');
            }
        });
    }

    // --- Initial State ---
    studentList.style.display = 'block';
    studentForm.style.display = 'none';
    editConfirmButtons.style.display = 'none';
    favicon.href = favicon1;
    setDefaultColors();

    // --- Button Clicks ---
    addBtn.addEventListener('click', () => {
        studentList.style.display = 'none';
        studentForm.style.display = 'flex';
        editConfirmButtons.style.display = 'flex';

        addBtn.classList.add('active-button-student');
        allBtn.classList.remove('active-button-student');

        refreshTheme();
        favicon.href = favicon2;
    });

    allBtn.addEventListener('click', () => {
        studentList.style.display = 'block';
        studentForm.style.display = 'none';
        editConfirmButtons.style.display = 'none';

        allBtn.classList.add('active-button-student');
        addBtn.classList.remove('active-button-student');

        refreshTheme();
        favicon.href = favicon1;
    });

    // --- Theme Toggle Click ---
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            refreshTheme();
        });
    }

    // --- Refresh Theme on Load (if body already has dark-mode) ---
    refreshTheme();
}