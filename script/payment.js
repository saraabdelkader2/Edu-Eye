import { ModifyGeneric } from "./modify.js";
import { addNotification } from "./notifications.js";
controllingModify();

function controllingModify() {

    const addBtn = document.querySelector('#add-btn');
    const allBtn = document.querySelector('#all-payments');
    const paymentList = document.querySelector('.payment-list-section');
    const paymentForm = document.querySelector('.payment-form-section');
    const editConfirmButtons = document.querySelector('.add-buttons');
    const favicon = 'media copy/favicons/icons8-money-40.png';
    ModifyGeneric({
        addBtn,
        allBtn,
        listView: paymentList,
        formView: paymentForm,
        editConfirmButtons,
        favicon,
        favicon,
        favicon,
        listTitle: 'All Payments',
        formTitle: 'Add Payment',
        darkModeToggle
    });

}
if (localStorage.getItem('darkMode') === 'enabled') document.body.classList.add('dark-mode');
darkModeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled');
};

const lockIcon = document.getElementById('lock');
if (lockIcon) {
    lockIcon.addEventListener('click', () => { window.location.href = './login.html' });
}

window.addEventListener('beforeunload', () => {
    localStorage.setItem('lastVisitedPage', window.location.pathname);
});

const backToHome = document.querySelector('.back-to-home');
backToHome.addEventListener('click', () => {
    window.location.href = "/dashboard.html";
    //backToHome.style.display='none';
})