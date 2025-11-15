console.log('app.js loaded from https://nuelim887.github.io/-JS-/app.js', new Date().toISOString());
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
const pendingMenus = new Set();
const clickSound = new Audio("https://github.com/nuelim887/Sound_Effect/raw/refs/heads/main/Sound_Effect.mp3");
clickSound.volume = 1.0;
const meals = {
  3: ["기장밥", "무청시래기국", "순살 파닭", "두부조림", "김치", "짜먹는 요구르트"],
  4: ["순대국밥", "옥수수맛살전", "오이고추된장무침", "부추겉절이", "김치", "탕후루"],
  5: ["아메리칸 핫도그", "찹쌀밥", "감자튀김", "치즈볼", "김치", "밀감", "초코(딸기)우유"],
  6: ["찰현미밥", "햄김치찌개", "등심돈까스", "감자채볶음", "깻잎순무침", "그린샐러드"],
  7: ["잡채밥", "닭다리튀김", "오이간장초절임", "반달 단무지", "김치", "버터소금쿠키", "패션후르츠주스"],
  10: ["차수수밥", "들깨미역국", "오리불고기", "달걀찜", "양파부추생채", "미니잡채호떡", "쌈무", "김치"],
  11: ["통밀밥", "한우 떡국", "수제 떡갈비구이", "순살 코다리강정", "호두연근조림", "숙주나물", "김치", "빼빼로"],
  12: ["지코바 치밥", "맑은콩나물국", "초코요거꿀떡", "브로콜리깨소스무침", "김치", "조각사과", "스위트자두주스"],
  13: ["찰현미밥", "마라탕", "탕수육", "교자찐만두", "오이무침", "김치", "망고주스"],
  14: ["나물비빔밥", "팽이버섯된장국", "오븐치킨", "미역줄기볶음", "김치", "오렌지", "액상요구르트"],
  17: ["귀리밥", "맑은대구탕", "돈육메란장조림", "부추전", "김치", "적양파청량초절임", "나쵸치킨너겟", "취나물된장무침"],
  18: ["국물떡볶이", "김자반참쌀밥", "달걀실파국", "고구마크로켓", "김말이튀김", "김치", "골드키위", "복숭아쿨피스"],
  19: ["훈제오리볶음밥", "건새우아욱국", "함박스테이크", "꽃맛살샐러드", "오이소박이", "김치", "마카롱", "한라봉주스"],
  20: ["찰현미차조밥", "등뼈감자탕", "순살간장치킨(치토스시즈닝)", "김치전", "꽈리고추찜", "콩나물무침", "김치"],
  21: ["어묵우동", "찹쌀밥", "만두튀김", "김치", "조각메론", "아이스크림"],
  24: ["혼합잡곡밥", "물떡어묵국", "치즈등심돈카츠", "동태포전", "김치", "애느타리버섯볶음", "실곤약초무침"],
  25: ["곤드레밥", "들깨무채국", "안동찜닭", "꼬시래기무침", "김치", "초코비스킷", "파인애플", "액상요구르트"],
  26: ["비엔나컵밥", "두부된장국", "오란다(옛날과자)", "키위사과주스", "김치", "사인머스켓"],
  27: ["귀리밥", "추어탕", "치킨바이트꼬치", "단호박전", "찐만두", "청경채무침", "김치"],
  28: ["크림스파게티", "BBQ폭립", "치커리샐러드", "분홍무피클", "김치", "레드자몽주스", "플라워파이"]
};
const menuListDiv = document.getElementById("menuList");
const messageP = document.getElementById("menuMessage");
const weeklyEl = document.getElementById("weeklyAverage");
const monthlyEl = document.getElementById("monthlyAverage");
const weeklyBestEl = document.getElementById("weeklyBest");
const monthlyBestEl = document.getElementById("monthlyBest");
const holidayMessageEl = document.getElementById("holidayMessage");
const mainIcon = document.getElementById("mainThemeIcon");
const themeOptions = document.getElementById("themeOptions");
if (mainIcon) {
  mainIcon.addEventListener("click", () => {
    themeOptions.classList.toggle("show");
  });
}
if (themeOptions) {
  themeOptions.querySelectorAll(".theme-icon.option").forEach(opt => {
    opt.addEventListener("click", () => {
      const theme = opt.dataset.theme;
      document.body.classList.remove("light", "dark");
      if (theme === "light") document.body.classList.add("light");
      if (theme === "dark") document.body.classList.add("dark");
      localStorage.setItem("selectedTheme", theme);
      themeOptions.classList.remove("show");
      if (mainIcon) {
        if (theme === "light") mainIcon.textContent = "☀️";
        else if (theme === "dark") mainIcon.textContent = "🌙";
        else mainIcon.textContent = "⚙️";
      }
    });
  });
}
const savedTheme = localStorage.getItem("selectedTheme");
if (savedTheme) {
  if (savedTheme === "light") document.body.classList.add("light");
  else if (savedTheme === "dark") document.body.classList.add("dark");
  if (mainIcon) {
    if (savedTheme === "light") mainIcon.textContent = "☀️";
    else if (savedTheme === "dark") mainIcon.textContent = "🌙";
  }
}
function getSeoulNow() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
}
function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}
function getTodayStr() {
  return formatDate(getSeoulNow());
}
function getDayOfMonth() {
  return getSeoulNow().getDate();
}
function getLocalUserId() {
  let id = localStorage.getItem("local_viewer_id");
  if (!id) {
    id = "local_" + Math.random().toString(36).substring(2, 12);
    localStorage.setItem("local_viewer_id", id);
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
let lastDateStr = null;
let lastBeforeLunchState = null;
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
    const avg = count ? (sum / count).toFixed(1) : "아직 평가 없음";
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
    const avg = count ? (sum / count).toFixed(1) : "아직 평가 없음";
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
  card.style.opacity = isRated ? "0.9" : "1";
  const title = document.createElement("b");
  title.textContent = menu;
  const info = document.createElement("div");
  const avgText = typeof avg === "string" ? avg : avg + "점";
  info.textContent = disabledVisual ? "아직 점심시간이 되지 않았습니다." : `평균 평점 : ${avgText} (평가 ${count}개)`;
  const buttonsDiv = document.createElement("div");
  for (let i = 1; i <= 5; i++) {
    const btn = document.createElement("button");
    btn.textContent = "⭐".repeat(i);
    btn.style.opacity = disabledVisual ? "0.5" : (isRated ? "0.6" : "1");
    btn.dataset.menu = menu;
    btn.dataset.score = String(i);
    btn.dataset.date = dateStr;
    btn.addEventListener("click", e => {
      if (isBeforeLunchNow()) {
        alert("아직 점심시간이 되지 않았습니다.");
        return;
      }
      const m = e.currentTarget.dataset.menu;
      const s = parseInt(e.currentTarget.dataset.score, 10);
      const d = e.currentTarget.dataset.date;
      if (ratedMenus.has(m)) {
        alert("이 메뉴는 이미 오늘 평가하셨습니다.");
        return;
      }
      submitRating(m, s, d, buttonsDiv, card);
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
  const day = getDayOfMonth();
  scanLocalStorageRatedForDate(dateStr);
  computeWeeklyMonthlyAverages();
  const statElements = [weeklyEl, weeklyBestEl, monthlyEl, monthlyBestEl];
  if (!meals[day]) {
    if (messageP) {
      messageP.style.color = "red";
      messageP.style.fontSize = "1.1em";
      messageP.style.fontWeight = "bold";
      messageP.style.textAlign = "center";
      messageP.textContent = "오늘의 급식 정보를 찾을 수 없습니다.";
    }
    if (menuListDiv) menuListDiv.innerHTML = "";
    statElements.forEach(el => { if (el) el.style.display = "none"; });
    if (holidayMessageEl) {
      holidayMessageEl.textContent = "즐거운 휴일 되세요!";
      holidayMessageEl.style.display = "block";
    }
    return;
  }
  if (menuListDiv) menuListDiv.innerHTML = "";
  statElements.forEach(el => { if (el) el.style.display = "block"; });
  if (holidayMessageEl) holidayMessageEl.style.display = "none";
  meals[day].forEach(menu => {
    db.collection("ratings").where("date", "==", dateStr).where("menu", "==", menu).get().then(snapshot => {
      let sum = 0, count = 0;
      snapshot.forEach(doc => {
        const v = Number(doc.data().score);
        if (!isNaN(v)) { sum += v; count++; }
      });
      const avg = count ? (sum / count).toFixed(1) : "아직 없음. 첫 번째 평점을 남겨보세요!";
      const isRated = ratedMenus.has(menu);
      const card = createCard(menu, avg, count, isRated, dateStr);
      if (menuListDiv) menuListDiv.appendChild(card);
    });
  });
  lastDateStr = dateStr;
  lastBeforeLunchState = isBeforeLunchNow();
}
function submitRating(menu, score, dateStr, buttonsContainer, card) {
  const userId = getLocalUserId();
  const localKey = buildLocalRatedKey(userId, dateStr, menu);
  db.collection("ratings").add({
    menu, score: parseInt(score, 10), date: dateStr, user: userId
  }).then(() => {
    clickSound.currentTime = 0;
    clickSound.play();
    localStorage.setItem(localKey, "1");
    ratedMenus.add(menu);
    setCardColor(card, score);
    const info = card.querySelector("div:nth-of-type(2)");
    if (info) info.textContent = `평균 평점 : ${score}.0 (평가 1개)`;
    alert(menu + " 평점 " + score + "점이 저장되었습니다!");
    computeWeeklyMonthlyAverages();
  }).catch(err => {
    alert("저장 실패: " + err);
  });
}
loadTodayMenu();
setInterval(() => {
  const nowDateStr = getTodayStr();
  const nowBeforeLunch = isBeforeLunchNow();
  if (nowDateStr !== lastDateStr || nowBeforeLunch !== lastBeforeLunchState) {
    loadTodayMenu();
  }
}, 15000);
