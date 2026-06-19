// ⚙️ إعدادات الفايربيز الموحدة لمشروعك Marcaz Shabab
const firebaseConfig = {
    apiKey: "AIzaSyBpDxW-UlQSFqYfnUCTSb4acEe7pp8dV_c",
    authDomain: "marcazshabab.firebaseapp.com",
    databaseURL: "https://marcazshabab-default-rtdb.firebaseio.com",
    projectId: "marcazshabab",
    storageBucket: "marcazshabab.firebasestorage.app",
    messagingSenderId: "403954625189",
    appId: "1:403954625189:web:b49405402e5fcdf1723b4c"
};

// تشغيل الفايربيز إذا لم يكن قد تم تشغيله مسبقاً في الصفحة
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
const database = firebase.database();

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
        if (node.nodeValue && node.nodeValue.trim() !== "") {
            const matches = node.nodeValue.match(regex);
            if (matches) {
                foundCount++;
                const span = document.createElement('span');
                span.className = "search-match-container"; 
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
        alert("طلبك غير متوفر");
    }
}

// دالة مسح الهايلايت وإعادة النص لشغله الطبيعي بنسبة 100%
function clearHighlights() {
    const containers = document.querySelectorAll('.search-match-container');
    containers.forEach(container => {
        const parent = container.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(container.textContent), container);
            parent.normalize(); 
        }
    });

    const highlights = document.querySelectorAll('.custom-highlight');
    highlights.forEach(highlight => {
        const parent = highlight.parentNode;
        if (parent) {
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize(); 
        }
    });
    
    const menuUl = document.querySelector('.ul1 ul');
    if (menuUl) {
        menuUl.style.display = ''; 
    }
}

// حماية الكود من الرموز الخاصة
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/* منع عمل ريفريش عند الضغط على زر Enter داخل خانة البحث */
document.addEventListener("DOMContentLoaded", () => {
    const searchInputEl = document.getElementById("searchInput");
    if (searchInputEl) {
        searchInputEl.addEventListener("keypress", function(e) {
            if (e.key === "Enter") {
                e.preventDefault(); 
                performSearch();
            }
        });
    }

    const searchFormEl = document.getElementById("searchForm");
    if (searchFormEl) {
        searchFormEl.addEventListener("submit", function(e) {
            e.preventDefault();
        });
    }
});

// ترحيب الحساب (يقرأ الحساب الحالي المسجل محلياً من آخر عملية دخول للجهاز)
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const hhElement = document.getElementById("hh");
  if (currentUser && currentUser.username && hhElement) {
    hhElement.textContent = "مرحبا " + currentUser.username;
  }
});

/* 🌟 الربط الحي والسحابي مع Firebase لحالة المركز (مفتوح / مغلق) دون الحاجة لـ localStorage */
function listenToCenterStatus() {
  const statusDiv = document.getElementById("dashboardStatus");
  if (!statusDiv) return; // فحص أمان
  
  const textSpan = statusDiv.querySelector(".text");

  // الاستماع للتحديثات القادمة من الداشبورد لحظياً عبر الإنترنت
  database.ref('centerStatus').on('value', (snapshot) => {
    const status = snapshot.val() || "closed";

    if (status === "open") {
      statusDiv.classList.add("open");
      statusDiv.classList.remove("closed");
      if (textSpan) textSpan.textContent = "المركز مفتوح الآن";
    } else {
      statusDiv.classList.add("closed");
      statusDiv.classList.remove("open");
      if (textSpan) textSpan.textContent = "المركز مغلق الآن";
    }
  });
}

// تشغيل مراقبة حالة المركز فور تحميل الصفحة
document.addEventListener("DOMContentLoaded", listenToCenterStatus);












