import { addNotification } from "./notifications.js";


//lock icon on click
const lockIcon = document.getElementById('lock');
lockIcon.addEventListener('click', () => {
    window.location.href = './login.html'
})

// save this as last visited
window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});


//dark mode
const darkModeToggle = document.getElementById('darkModeToggle');
const body = document.body;
const appearanceSelect = document.getElementById('apperance');


if (localStorage.getItem('darkMode') === 'enabled') {
    body.classList.add('dark-mode');
}

darkModeToggle.addEventListener('click', () => {
    body.classList.toggle('dark-mode');

    // حفظ الحالة في LocalStorage to make it global
    if (body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        appearanceSelect.value = 'dark';
    } else {
        localStorage.setItem('darkMode', 'disabled');
        appearanceSelect.value = 'light';
    }
});
appearanceSelect.addEventListener('change', () => {
    if (appearanceSelect.value === 'dark') {
        body.classList.add('dark-mode');
        localStorage.setItem('darkMode', 'enabled');
    } else {
        body.classList.remove('dark-mode');
        localStorage.setItem('darkMode', 'disabled');
    }
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