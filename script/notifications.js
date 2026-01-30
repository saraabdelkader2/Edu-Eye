const NOTIFICATION_KEY = 'globalNotificationsHistory';
const MAX_NOTIFICATIONS = 50;

// الحصول على كل العناصر (موبايل وديسكتوب)
const notificationsBells = document.querySelectorAll('.notification-icon');
const notificationNumbers = document.querySelectorAll('.notification-number');
const notificationContents = document.querySelectorAll('.notification-content');
const notificationsContainers = document.querySelectorAll('.notifications');

let notificationSound = new Audio('./sounds/notification-sound-effect-372475.mp3');

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
    triggerVisualEffect();
}

function triggerVisualEffect() {
    try {
        notificationSound.currentTime = 0;
        notificationSound.play().catch(() => {});
        // عمل Loop على كل الأجراس لتفعيل التأثير
        notificationsBells.forEach(bell => {
            bell.classList.add('shake-effect');
            setTimeout(() => bell.classList.remove('shake-effect'), 800);
        });
    } catch (e) { console.error(e); }
}

function updateNotificationBadge() {
    const pending = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
    const unreadCount = pending.filter(n => !n.read).length;

    // الحل هنا: نمر على كل دائرة رقم ونحدثها
    notificationNumbers.forEach(num => {
        num.innerHTML = unreadCount;
        num.style.display = unreadCount > 0 ? 'flex' : 'none';
    });
}

function renderNotificationContent(showAll = false) {
    const pending = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');

    notificationContents.forEach(content => {
        content.innerHTML = '';
        if (pending.length === 0) {
            content.innerHTML = '<p class="empty-message">No current notifications</p>';
            return;
        }

        // تحديد العناصر المطلوب عرضها
        const itemsToShow = showAll ? pending : pending.slice(0, 5);

        itemsToShow.forEach(item => {
            const itemClass = item.read ? 'read' : 'unread';
            content.innerHTML += `
                <div class="notification-item ${itemClass}" data-id="${item.id}">
                    <p class="message">${item.message}</p>
                    <span class="timestamp">${item.timestamp}</span>
                    <button class="delete-notification" title="Delete">×</button>
                </div>`;
        });

        // إضافة زر View All إذا لم نكن نعرض الكل بالفعل وهناك أكثر من 5
        if (!showAll && pending.length > 5) {
            const viewAllDiv = document.createElement('div');
            viewAllDiv.classList.add('view-all-link');
            viewAllDiv.innerHTML = `<a href="#" class="viewAllNotifications">View All (${pending.length})</a>`;

            // إضافة حدث الضغط للزر
            viewAllDiv.querySelector('.viewAllNotifications').onclick = (e) => {
                e.preventDefault();
                e.stopPropagation(); // لمنع إغلاق القائمة عند الضغط
                renderNotificationContent(true); // استدعاء الدالة لعرض الكل
            };

            content.appendChild(viewAllDiv);
        }
    });

    // أحداث الحذف (تظل كما هي)
    document.querySelectorAll('.delete-notification').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const id = Number(e.target.closest('.notification-item').dataset.id);
            let p = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
            p = p.filter(n => n.id !== id);
            localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(p));
            renderNotificationContent(showAll);
            updateNotificationBadge();
        };
    });
}

function handleBellClick(event) {
    event.stopPropagation();
    // البحث عن قائمة الإشعارات القريبة من الزر الذي تم ضغطه
    const parent = event.currentTarget.closest('.left-icons');
    const currentContent = parent.querySelector('.notification-content');

    const isVisible = currentContent.style.display === 'block';

    // إغلاق كل القوائم الأخرى
    document.querySelectorAll('.notification-content').forEach(c => c.style.display = 'none');

    currentContent.style.display = isVisible ? 'none' : 'block';

    if (!isVisible) {
        renderNotificationContent();
        let p = JSON.parse(localStorage.getItem(NOTIFICATION_KEY) || '[]');
        p.forEach(n => n.read = true);
        localStorage.setItem(NOTIFICATION_KEY, JSON.stringify(p));
        updateNotificationBadge();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateNotificationBadge();
    // ربط الحدث بكل الحاويات (ديسكتوب + موبايل)
    notificationsContainers.forEach(container => {
        container.addEventListener('click', handleBellClick);
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.left-icons')) {
            document.querySelectorAll('.notification-content').forEach(c => c.style.display = 'none');
        }
    });
});