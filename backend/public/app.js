const API_URL = "https://retrosozluk.onrender.com";

// Ana sayfa için kelimeleri listele
async function loadWords() {
  const res = await fetch(`${API_URL}/words`);
  const words = await res.json();
  const list = document.getElementById("wordList");
  if (list) {
    list.innerHTML = "";
    words.forEach(w => {
      const li = document.createElement("li");
      li.innerHTML = `<a href="word.html?id=${w.id}">${w.text}</a>`;
      list.appendChild(li);
    });
  }
}

// Yeni kelime ekle
async function addWord() {
  const input = document.getElementById("wordInput");
  if (!input.value) return;
  await fetch(`${API_URL}/words`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value })
  });
  input.value = "";
  loadWords();
}

// word.html için entry’leri yükle
async function loadEntries() {
  const params = new URLSearchParams(window.location.search);
  const wordId = params.get("id");
  if (!wordId) return;

  // kelime başlığını getir
  const resWord = await fetch(`${API_URL}/words`);
  const words = await resWord.json();
  const word = words.find(w => w.id == wordId);
  document.getElementById("wordTitle").innerText = word ? word.text : "Kelime";

  // entry’leri getir
  const res = await fetch(`${API_URL}/words/${wordId}/entries`);
  const entries = await res.json();
  const list = document.getElementById("entryList");
  if (list) {
    list.innerHTML = "";
    entries.forEach(e => {
      const li = document.createElement("li");
      li.textContent = e.text;
      list.appendChild(li);
    });
  }
}

// Yeni entry ekle
async function addEntry() {
  const params = new URLSearchParams(window.location.search);
  const wordId = params.get("id");
  const input = document.getElementById("entryInput");
  if (!input.value) return;
  await fetch(`${API_URL}/words/${wordId}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: input.value })
  });
  input.value = "";
  loadEntries();
}

// Sayfa yüklenince uygun fonksiyonu çağır
window.onload = () => {
  if (document.getElementById("wordList")) loadWords();
  if (document.getElementById("entryList")) loadEntries();
};
