const firebaseConfig = {
  apiKey: "AIzaSyBEyWpxDCxGLohqW2yyu7IaRjT-FvoOf3E",
  authDomain: "webapp-project-fd0d7.firebaseapp.com",
  projectId: "webapp-project-fd0d7",
  storageBucket: "webapp-project-fd0d7.firebasestorage.app",
  messagingSenderId: "804457776339",
  appId: "1:804457776339:web:c3dcc8045b0183c1740026",
  measurementId: "G-HE4M2LM7PF"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

const ratedMenus = new Set();
const clickSound = new Audio("https://github.com/nuelim887/Sound_Effect/raw/refs/heads/main/Sound_Effect.mp3");
clickSound.volume = 1.0;

const meals = {
  1: ["깍두기볶음밥", "요구르트", "계란후라이", "김치깻잎", "배추김치", "딸기쨈", "통곡물식빵"],
  2: ["칼국수", "매콤닭가슴살", "오이부추무침", "배추김치", "미니샌드위치"],
  28: ["크림스파게티", "BBQ폭립", "치커리샐러드", "분홍무피클", "김치", "레드자몽주스", "플라워파이"]
};

const menuListDiv = document.getElementById("menuList");
const messageP = document.getElementById("menuMessage");
const weeklyEl = document.getElementById("weeklyAverage");
const monthlyEl = document.getElementById("monthlyAverage");
const weeklyBestEl = document.getElementById("weeklyBest");
const monthlyBestEl = document.getElementById("monthlyBest");
const holidayMessageEl = document.getElementById("holidayMessage");

function getSeoulNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}
function formatDate(d) {
  return d.getFullYear() + "-" + ("0" + (d.getMonth() + 1)).slice(-2) + "-" + ("0" + d.getDate()).slice(-2);
}
function getTodayStr() {
  return formatDate(getSeoulNow());
}
function getDayOfMonth() {
  return getSeoulNow().getDate();
}

function getLocalUserId() {
  let id = localStorage.getItem("local_user_id");
  if (!id) {
    id = "user_" + Math.floor(Math.random() * 100000000);
    localStorage.setItem("local_user_id", id);
  }
  return id;
}

function buildLocalRatedKey(userId, dateStr, menu) {
  return `${userId}_rated_${dateStr}_${encodeURIComponent(menu)}`;
}

function scanLocalStorageRatedForDate(dateStr) {
  ratedMenus.clear();
  const user = getLocalUserId();
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k) continue;
    const prefix = `${user}_rated_${dateStr}_`;
    if (k.startsWith(prefix)) {
      const menu = decodeURIComponent(k.substring(prefix.length));
      if (menu) ratedMenus.add(menu);
    }
  }
}

function isBeforeLunchNow() {
  const now = getSeoulNow();
  const hours = now.getHours();
  const minutes = now.getMinutes();
  return hours < 12 || (hours === 12 && minutes < 30);
}

function setCardColor(card, score) {
  if (!card) return;
  if (score <= 2) card.style.background = "#ffb3b3";
  else if (score === 3) card.style.background = "#fff6b3";
  else card.style.background = "#b9f7b3";
}

function computeWeeklyMonthlyAverages() {
  const seoulNow = getSeoulNow();
  const currentDay = seoulNow.getDay();
  const weekStart = new Date(seoulNow);
  const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;
  weekStart.setDate(seoulNow.getDate() + diffToMonday);
  const weekStartStr = formatDate(weekStart);
  const todayStr = formatDate(seoulNow);
  const monthStart = todayStr.slice(0, 7) + "-01";

  db.collection("ratings").where("date", ">=", weekStartStr).where("date", "<=", todayStr).get().then(snapshot => {
    let sum = 0, count = 0, menuScores = {};
    snapshot.forEach(doc => {
      const v = Number(doc.data().score);
      if (!isNaN(v)) {
        sum += v; count++;
        if (!menuScores[doc.data().menu]) menuScores[doc.data().menu] = { sum: 0, count: 0 };
        menuScores[doc.data().menu].sum += v;
        menuScores[doc.data().menu].count++;
      }
    });
    const avg = count ? (sum / count).toFixed(1) : "아직 없음. 첫 번째 평점을 남겨보세요!";
    if (weeklyEl) weeklyEl.textContent = `📊 이번 주 평균: ${avg} (평가 ${count}개)`;
    let bestMenu = "없음", bestScore = 0;
    Object.keys(menuScores).forEach(m => {
      const s = menuScores[m].sum / menuScores[m].count;
      if (s > bestScore) { bestScore = s; bestMenu = m; }
    });
    if (weeklyBestEl) weeklyBestEl.textContent = `🏆 이번 주 인기 1등: ${bestMenu} (${bestScore.toFixed(1)}) 🏆`;
  });

  db.collection("ratings").where("date", ">=", monthStart).where("date", "<=", todayStr).get().then(snapshot => {
    let sum = 0, count = 0, menuScores = {};
    snapshot.forEach(doc => {
      const v = Number(doc.data().score);
      if (!isNaN(v)) {
        sum += v; count++;
        if (!menuScores[doc.data().menu]) menuScores[doc.data().menu] = { sum: 0, count: 0 };
        menuScores[doc.data().menu].sum += v;
        menuScores[doc.data().menu].count++;
      }
    });
    const avg = count ? (sum / count).toFixed(1) : "아직 없음. 첫 번째 평점을 남겨보세요!";
    if (monthlyEl) monthlyEl.textContent = `📊 이번 달 평균: ${avg} (평가 ${count}개)`;
    let bestMenu = "없음", bestScore = 0;
    Object.keys(menuScores).forEach(m => {
      const s = menuScores[m].sum / menuScores[m].count;
      if (s > bestScore) { bestScore = s; bestMenu = m; }
    });
    if (monthlyBestEl) monthlyBestEl.textContent = `🏆 이번 달 인기 1등: ${bestMenu} (${bestScore.toFixed(1)}) 🏆`;
  });
}

function createCard(menu, avg, count, isRated, dateStr) {
  const disabledVisual = isBeforeLunchNow();
  const card = document.createElement("div");
  const title = document.createElement("b");
  title.textContent = menu;
  const info = document.createElement("p");
  info.textContent = typeof avg === "string" ? `평균 평점 : ${avg}` : `평균 평점 : ${avg} (평가 ${count}개)`;
  const buttonsDiv = document.createElement("div");

  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.textContent = "⭐".repeat(i);
    btn.style.opacity = disabledVisual ? 0.5 : (isRated ? 0.6 : 1);
    btn.dataset.menu = menu;
    btn.dataset.score = String(i);
    btn.dataset.date = dateStr;
    btn.addEventListener("click", e => {
      if (isBeforeLunchNow()) { alert("아직 점심시간이 되지 않았습니다."); return; }
      const m = e.currentTarget.dataset.menu;
      const s = parseInt(e.currentTarget.dataset.score, 10);
      const d = e.currentTarget.dataset.date;
      if (ratedMenus.has(m)) { alert("이 메뉴는 이미 오늘 평가하셨습니다."); return; }
      submitRating(m, s, d, buttonsDiv, info);
    });
    buttonsDiv.appendChild(btn);
  }

  card.appendChild(title);
  card.appendChild(document.createElement("br"));
  card.appendChild(info);
  card.appendChild(buttonsDiv);
  return card;
}

function loadTodayMenu() {
  const dateStr = getTodayStr();
  scanLocalStorageRatedForDate(dateStr);
  menuListDiv.innerHTML = "";
  const day = getDayOfMonth();
  const todayMeal = meals[day];
  if (!todayMeal) {
    messageP.textContent = "급식 데이터가 없습니다.";
    holidayMessageEl.style.display = "";
    holidayMessageEl.textContent = "오늘은 급식이 없습니다!";
    return;
  }
  messageP.textContent = "오늘 급식 메뉴를 평가해주세요.";
  holidayMessageEl.style.display = "none";
  todayMeal.forEach(menu => {
    db.collection("ratings").where("date", "==", dateStr).where("menu", "==", menu).get().then(snapshot => {
      let sum = 0, count = 0;
      snapshot.forEach(doc => { const v = Number(doc.data().score); if (!isNaN(v)) { sum += v; count++; } });
      const avg = count ? (sum / count).toFixed(1) : "아직 없음. 첫 번째 평점을 남겨보세요!";
      const isRated = ratedMenus.has(menu);
      const card = createCard(menu, avg, count, isRated, dateStr);
      if (menuListDiv) menuListDiv.appendChild(card);
    });
  });
}

function submitRating(menu, score, dateStr, buttonsContainer, info) {
  const userId = getLocalUserId();
  const localKey = buildLocalRatedKey(userId, dateStr, menu);

  db.collection("ratings").add({ menu, score: parseInt(score, 10), date: dateStr, user: userId }).then(() => {
    clickSound.currentTime = 0; clickSound.play();
    localStorage.setItem(localKey, "1");
    ratedMenus.add(menu);
    setCardColor(info.parentNode, score);
    info.textContent = `평균 평점 : ${score}.0 (평가 1개)`;
    Array.from(buttonsContainer.children).forEach(btn => btn.style.opacity = 0.6);
    alert(menu + " 평점 " + score + "점이 저장되었습니다!");
    computeWeeklyMonthlyAverages();
  }).catch(err => { alert("저장 실패: " + err); });
}

document.getElementById("mainThemeIcon").addEventListener("click", () => {
  document.getElementById("themeOptions").classList.toggle("show");
});
document.querySelectorAll(".theme-icon.option").forEach(opt => {
  opt.addEventListener("click", e => {
    const theme = e.currentTarget.dataset.theme;
    document.body.className = theme;
    localStorage.setItem("theme", theme);
    document.getElementById("themeOptions").classList.remove("show");
  });
});

const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.body.className = savedTheme;

loadTodayMenu();

setInterval(() => { getSeoulNow(); }, 15000);
