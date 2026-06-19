let searchTimeout; // متغير لتخزين مؤقت الـ 5 ثوانٍ

function performSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return; // فحص أمان لو الصفحة مفيهاش بحث
    
    const query = searchInput.value.trim();

    // إذا كانت خانة البحث فارغة
    if (query === "") {
        alert("الرجاء كتابة كلمة للبحث!");
        return;
    }

    // 1. تنظيف أي هايلايت قديم فوراً وإيقاف أي مؤقت سابق
    clearHighlights();
    clearTimeout(searchTimeout);

    const bodyContent = document.body;
    const textNodes = [];
    const walk = document.createTreeWalker(bodyContent, NodeFilter.SHOW_TEXT, null, false);
    let node;
    
    // تجميع النصوص داخل الصفحة مع استثناء صندوق البحث والأكواد البرمجية
    while (node = walk.nextNode()) {
        if (!node.parentElement.closest('.search-container') && 
            !node.parentElement.closest('script') && 
            !node.parentElement.closest('style')) {
            textNodes.push(node);
        }
    }

    let foundCount = 0;
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');

    // تلوين الكلمات المتطابقة
    textNodes.forEach(node => {
        // فحص إضافي للتأكد من أن النص يحتوي على حروف وليس فارغاً
        if (node.nodeValue && node.nodeValue.trim() !== "") {
            const matches = node.nodeValue.match(regex);
            if (matches) {
                foundCount++;
                const span = document.createElement('span');
                span.className = "search-match-container"; // كلاس فرعي للحفاظ على بنية الـ HTML
                span.innerHTML = node.nodeValue.replace(regex, `<mark class="custom-highlight">$1</mark>`);
                node.parentNode.replaceChild(span, node);
            }
        }
    });

    // 2. التحقق من النتيجة والانتقال للكلمة
    if (foundCount > 0) {
        const firstMatch = document.querySelector('.custom-highlight');
        if (firstMatch) {
            
            // 🌟 [فتح القائمة تلقائياً لو الكلمة جواها] 🌟
            const insideMenu = firstMatch.closest('.ul1');
            if (insideMenu) {
                const menuUl = insideMenu.querySelector('ul');
                if (menuUl) {
                    menuUl.style.display = 'block'; // فتح القائمة وتثبيتها فوراً
                }
            }

            // الانتقال الفوري للكلمة لتوفير الوقت
            firstMatch.scrollIntoView({ behavior: 'auto', block: 'center' });
        }

        // ⏱️ إزالة الهايلايت وإغلاق القائمة بعد 5 ثوانٍ بالضبط
        searchTimeout = setTimeout(() => {
            clearHighlights();
        }, 5000);

    } else {
        // ❌ إذا لم يتم العثور على الكلمة المطلوبة
        alert("طلبك غير متوفر");
    }
}

// دالة مسح الهايلايت وإعادة النص لشغله الطبيعي بنسبة 100%
function clearHighlights() {
    // 1. مسح الهايلايت وإرجاع النصوص لأصلها
    const containers = document.querySelectorAll('.search-match-container');
    containers.forEach(container => {
        const parent = container.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(container.textContent), container);
            parent.normalize(); 
        }
    });

    // طريقة احتياطية للمسح المباشر لو وجدت
    const highlights = document.querySelectorAll('.custom-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize(); 
        }
    });
    
    // 2. إرجاع القائمة المنسدلة لحالتها الافتراضية المخفية
    const menuUl = document.querySelector('.ul1 ul');
    if (menuUl) {
        menuUl.style.display = ''; 
    }
}

// حماية الكود من الرموز الخاصة
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* 🛑 الأكواد بالأسفل هي المسؤولة عن منع الـ Refresh تماماً */

// منع عمل ريفريش عند الضغط على زر Enter داخل خانة البحث
const searchInputEl = document.getElementById("searchInput");
if (searchInputEl) {
    searchInputEl.addEventListener("keypress", function(e) {
        if (e.key === "Enter") {
            e.preventDefault(); // منع المتصفح من إرسال الفورم وعمل ريفريش
            performSearch();
        }
    });
}

// تأكيد إضافي لمنع الفورم بأكمله من عمل ريفريش لأي سبب
const searchFormEl = document.getElementById("searchForm");
if (searchFormEl) {
    searchFormEl.addEventListener("submit", function(e) {
        e.preventDefault();
    });
}

// كود صفحة إنشاء الحساب وحفظ البيانات (مؤمن بالكامل ضد أخطاء الصفحات الأخرى)
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('userDataForm');
    const toast = document.getElementById('toast');

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();

            const newUser = {
                id: Date.now(),
                username: document.getElementById('username').value.trim(),
                address: document.getElementById('address').value.trim(),
                birthdate: document.getElementById('birthdate').value,
                email: document.getElementById('email').value.trim()
            };

            let usersList = JSON.parse(localStorage.getItem('allUsers')) || [];
            usersList.push(newUser);
            localStorage.setItem('allUsers', JSON.stringify(usersList));

            form.reset();

            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 3000);
            }
        });
    }
});

// كود الترحيب بالمستخدم الحالي عند التحميل
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const hhElement = document.getElementById("hh");
  if (currentUser && currentUser.username && hhElement) {
    hhElement.textContent = "مرحبا " + currentUser.username;
  }
});

// دالة تحديث حالة المركز (مفتوح / مغلق)
function updateDashboardStatus() {
  const statusDiv = document.getElementById("dashboardStatus");
  if (!statusDiv) return; // فحص أمان لو العنصر مش في الصفحة دي
  
  const textSpan = statusDiv.querySelector(".text");
  const status = localStorage.getItem("centerStatus");

  if (status === "open") {
    statusDiv.classList.add("open");
    statusDiv.classList.remove("closed");
    if (textSpan) textSpan.textContent = "المركز مفتوح الآن";
  } else {
    statusDiv.classList.add("closed");
    statusDiv.classList.remove("open");
    if (textSpan) textSpan.textContent = "المركز مغلق الآن";
  }
}

// تشغيل عند فتح الصفحة
document.addEventListener("DOMContentLoaded", updateDashboardStatus);

// تحديث تلقائي لو اتغيرت القيمة من لوحة الأدمن دون الحاجة لعمل ريفريش
window.addEventListener("storage", function(e) {
  if (e.key === "centerStatus") {
    updateDashboardStatus();
  }
});














