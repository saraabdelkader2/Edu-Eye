// Color Helpers
const searchInput = document.querySelector('.search-box');


function getColor(lightColor, darkColor) {
    return document.body.classList.contains('dark-mode') ? darkColor : lightColor;
}

function getActiveBg() {
    return document.body.classList.contains('dark-mode') ?
        'rgba(255,255,255,0.12)' :
        'rgba(0,0,0,0.07)';
}

// =============================
// Generic Modify Function
// =============================
export function ModifyGeneric({
    addBtn,
    allBtn,
    listView,
    formView,
    editConfirmButtons,
    favicon,
    listFavicon,
    formFavicon,
    listTitle = 'All',
    formTitle = 'Add',
    themeToggleBtn,
    activeClass = 'active-button'
}) {

    // -------------------------
    // Hover Effect
    // -------------------------
    function hoverEffect(btn) {
        btn.addEventListener('mouseenter', () => {
            if (!btn.classList.contains(activeClass)) {
                btn.style.backgroundColor = getColor(
                    'rgba(230,230,230,1)',
                    '#2d2d2d'
                );
            }
        });

        btn.addEventListener('mouseleave', () => {
            if (btn.classList.contains(activeClass)) {
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

    // -------------------------
    // Default State
    // -------------------------
    function setDefault() {
        allBtn.classList.add(activeClass);
        allBtn.style.backgroundColor = getActiveBg();
        allBtn.style.color = getColor('#000', '#f5f5f5');

        addBtn.classList.remove(activeClass);
        addBtn.style.backgroundColor = 'transparent';
        addBtn.style.color = getColor('#000', '#f5f5f5');
        searchInput.style.display = 'flex';

        listView.style.display = 'block';
        formView.style.display = 'none';
        if (editConfirmButtons) editConfirmButtons.style.display = 'none';

        document.title = listTitle;
        if (favicon && listFavicon) favicon.href = listFavicon;
    }

    // -------------------------
    // Refresh Theme
    // -------------------------
    function refreshTheme() {
        [addBtn, allBtn].forEach(btn => {
            if (btn.classList.contains(activeClass)) {
                btn.style.backgroundColor = getActiveBg();
                btn.style.color = getColor('#000', '#f5f5f5');
            } else {
                btn.style.backgroundColor = 'transparent';
                btn.style.color = getColor('#000', '#f5f5f5');
            }
        });
    }

    // -------------------------
    // Events
    // -------------------------
    addBtn.addEventListener('click', () => {
        listView.style.display = 'none';
        formView.style.display = 'flex';
        if (editConfirmButtons) editConfirmButtons.style.display = 'flex';

        addBtn.classList.add(activeClass);
        allBtn.classList.remove(activeClass);

        document.title = formTitle;
        if (favicon && formFavicon) favicon.href = formFavicon;
        searchInput.style.display = 'none';
        refreshTheme();

    });

    allBtn.addEventListener('click', () => {
        listView.style.display = 'block';
        formView.style.display = 'none';
        if (editConfirmButtons) editConfirmButtons.style.display = 'none';

        allBtn.classList.add(activeClass);
        addBtn.classList.remove(activeClass);
        searchInput.style.display = 'flex';

        document.title = listTitle;
        if (favicon && listFavicon) favicon.href = listFavicon;

        refreshTheme();
    });

    // -------------------------
    // Theme Toggle
    // -------------------------
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            refreshTheme();
        });
    }

    // Init
    setDefault();
    refreshTheme();
}