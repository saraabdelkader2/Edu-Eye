document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('.login-form');
    const signInBtn = document.querySelector('.sign-in');
    const emailInput = form.adminMail;
    const passwordInput = form.adminPassword;
    const rememberMeCheckbox = document.querySelector('.square-password i');
    let notificationSound = new Audio('./sounds/successed-295058.mp3');

    // mail & pass
    const VALID_EMAIL = "admin@school.edu";
    const VALID_PASSWORD = "00";

    // message container
    let messagePara = document.createElement('p');
    messagePara.classList.add('login-message');
    form.appendChild(messagePara);

    // last page
    const lastPage = localStorage.getItem('lastVisitedPage');

    // handle login
    signInBtn.addEventListener('click', (e) => {
        e.preventDefault();
        messagePara.innerHTML = '';
        messagePara.style.color = "red";

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        if (!email || !password) {
            messagePara.innerText = "Please enter both email and password";
            return;
        }

        if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
            messagePara.innerText = "Incorrect email or password";
            return;
        }

        if (rememberMeCheckbox.classList.contains('fa-square-check')) {
            const userData = { email, password };
            localStorage.setItem('rememberedUser', JSON.stringify(userData));
        } else {
            localStorage.removeItem('rememberedUser');
        }

        messagePara.style.color = "green";
        messagePara.innerText = "Login successful! Redirecting...";
        notificationSound.play().catch(() => {});

        setTimeout(() => {
            const lastPage = localStorage.getItem('lastVisitedPage');

            const isValidLastPage = lastPage &&
                !lastPage.includes('login.html') &&
                lastPage !== '/' &&
                lastPage !== '';

            if (isValidLastPage) {
                window.location.href = lastPage;
            } else {
                window.location.href = "./dashboard.html";
            }
        }, 700);
    });
    passwordInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            messagePara.innerHTML = '';
            messagePara.style.color = "red";

            const email = emailInput.value.trim();
            const password = passwordInput.value.trim();

            if (!email || !password) {
                messagePara.innerText = "Please enter both email and password";
                return;
            }

            if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
                messagePara.innerText = "Incorrect email or password";
                return;
            }

            if (rememberMeCheckbox.classList.contains('fa-square-check')) {
                const userData = { email, password };
                localStorage.setItem('rememberedUser', JSON.stringify(userData));
            } else {
                localStorage.removeItem('rememberedUser');
            }

            messagePara.style.color = "green";
            messagePara.innerText = "Login successful! Redirecting...";
            notificationSound.play().catch(() => {});

            setTimeout(() => {
                const lastPage = localStorage.getItem('lastVisitedPage');

                const isValidLastPage = lastPage &&
                    !lastPage.includes('login.html') &&
                    lastPage !== '/' &&
                    lastPage !== '';

                if (isValidLastPage) {
                    window.location.href = lastPage;
                } else {
                    window.location.href = "./dashboard.html";
                }
            }, 700);

        }
    });
    // Remember Me toggle
    rememberMeCheckbox.addEventListener('click', () => {
        rememberMeCheckbox.classList.toggle('fa-square');
        rememberMeCheckbox.classList.toggle('fa-square-check');
    });

    // Autofill from Remember Me
    const rememberedData = localStorage.getItem('rememberedUser');
    if (rememberedData) {
        const user = JSON.parse(rememberedData);
        emailInput.value = user.email;
        passwordInput.value = user.password;

        rememberMeCheckbox.classList.remove('fa-square');
        rememberMeCheckbox.classList.add('fa-square-check');
    }

    // PASSWORD TOGGLE BUTTON
    const eyeIcon = document.createElement("i");
    eyeIcon.className = "fa-regular fa-eye password-eye";
    passwordInput.parentElement.appendChild(eyeIcon);

    eyeIcon.addEventListener("click", () => {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            eyeIcon.classList.replace("fa-eye", "fa-eye-slash");
        } else {
            passwordInput.type = "password";
            eyeIcon.classList.replace("fa-eye-slash", "fa-eye");
        }
    });
});

if (localStorage.getItem('darkMode') === 'enabled') {
    document.body.classList.add('dark-mode');
}