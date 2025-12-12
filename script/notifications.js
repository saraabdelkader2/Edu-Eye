const NOTIFICATION_KEY = 'globalNotificationsHistory';
const MAX_NOTIFICATIONS = 50;

const notificationsBell = document.querySelector('.notification-icon');
const notificationNumber = document.querySelector('.notification-number');
const notificationContent = document.querySelector('.notification-content');
const notificationsContainer = document.querySelector('.notifications');

let notificationSound = new Audio('./sounds/notification-sound-effect-372475.mp3');

// إضافة notification جديدة
export function addNotification(message) {
    let pending = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
    const newNotification = {
        id: Date.now(),
        message,
        timestamp: new Date().toLocaleString('en-US', { dateStyle: 'short', timeStyle: 'short' }),
        read: false
    };
    pending.unshift(newNotification);
    if (pending.length > MAX_NOTIFICATIONS) pending = pending.slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(pending));

    updateNotificationBadge();
    renderNotificationContent();

    // 🔔 تشغيل الصوت والتأثير فقط عند إشعار جديد
    triggerVisualEffect();
}

// تشغيل الصوت والتأثير البصري
function triggerVisualEffect() {
    if (!notificationsBell) return;
    try {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {}); // لو المتصفح منع التشغيل
        notificationsBell.classList.add('shake-effect');
        setTimeout(() => notificationsBell.classList.remove('shake-effect'), 800);
    } catch (e) {
        console.error("Could not play sound or trigger effect:", e);
    }
}

// تحديث badge
function updateNotificationBadge() {
    const pending = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
    const unreadCount = pending.filter(n => !n.read).length;
    if (notificationNumber) {
        notificationNumber.innerHTML = unreadCount;
        notificationNumber.style.display = unreadCount > 0 ? 'flex' : 'none';
    }
}

// عرض محتوى الإشعارات
function renderNotificationContent(showAll = false) {
    const pending = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
    if (!notificationContent) return;

    notificationContent.innerHTML = '';
    if (pending.length === 0) {
        notificationContent.innerHTML = '<p class="empty-message">No current notifications</p>';
        return;
    }

    const itemsToShow = showAll ? pending : pending.slice(0, 5);

    itemsToShow.forEach(item => {
        const itemClass = item.read ? 'read' : 'unread';
        notificationContent.innerHTML += `
            <div class="notification-item ${itemClass}" data-id="${item.id}">
                <p class="message">${item.message}</p>
                <span class="timestamp">${item.timestamp}</span>
                <button class="delete-notification" title="Delete">×</button>
            </div>
        `;
    });

    // View All
    if (!showAll && pending.length > 5) {
        const viewAllDiv = document.createElement('div');
        viewAllDiv.classList.add('view-all-link');
        viewAllDiv.innerHTML = `<a href="#" id="viewAllNotifications">View All (${pending.length})</a>`;
        notificationContent.appendChild(viewAllDiv);

        const viewAllBtn = document.getElementById('viewAllNotifications');
        if (viewAllBtn) {
            viewAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                renderNotificationContent(true);
            });
        }
    }

    // حذف notifications
    document.querySelectorAll('.delete-notification').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = Number(e.target.closest('.notification-item').dataset.id);
            let pending = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
            pending = pending.filter(n => n.id !== id);
            localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(pending));
            renderNotificationContent(showAll);
            updateNotificationBadge();
        });
    });
}

// الضغط على الجرس
function handleBellClick(event) {
    event.stopPropagation();
    const isVisible = notificationContent.style.display === 'block';
    notificationContent.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        renderNotificationContent();
        let pending = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
        let shouldUpdate = false;

        pending.forEach(n => {
            if (!n.read) {
                n.read = true;
                shouldUpdate = true;
            }
        });

        if (shouldUpdate) {
            localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(pending));
        }

        updateNotificationBadge();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateNotificationBadge();
    if (notificationsContainer) {
        notificationsContainer.addEventListener('click', handleBellClick);
    }

    document.addEventListener('click', (e) => {
        if (notificationContent && notificationContent.style.display === 'block' &&
            !notificationsContainer.contains(e.target)) {
            notificationContent.style.display = 'none';
        }
    });
});