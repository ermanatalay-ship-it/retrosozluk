const API_URL = "https://retrosozluk.onrender.com";

// Başlıkları listele (entry sayısı ile birlikte)
async function loadWords() {
  const res = await fetch(`${API_URL}/words`);
  const words = await res.json();

  const list = document.getElementById("wordList");
  if (list) {
    list.innerHTML = "";
    for (const w of words) {
      // entry sayısını getir
      const resEntries = await fetch(`${API_URL}/words/${w.id}/entries`);
      const entries = await resEntries.json();
      const li = document.createElement("li");
      li.innerHTML = `<a href="word.html?id=${w.id}">${w.text} (${entries.length})</a>`;
      list.appendChild(li);
    }
  }
}

// Yeni başlık + ilk entry ekle
async function addWordWithEntry() {
  const wordInput = document.getElementById("wordInput");
  const entryInput = document.getElementById("entryInput");
  if (!wordInput.value || !entryInput.value) return;

  // önce başlık ekle
  const res = await fetch(`${API_URL}/words`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: wordInput.value })
  });
  const newWord = await res.json();

  // sonra ilk entry ekle
  await fetch(`${API_URL}/words/${newWord.id}/entries`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: entryInput.value })
  });

  wordInput.value = "";
  entryInput.value = "";
  loadWords();
}

// Sayfa yüklenince başlıkları getir
window.onload = () => {
  if (document.getElementById("wordList")) loadWords();
};
// word.html için entry’leri yükle
async function loadEntries() {
  const params = new URLSearchParams(window.location.search);
  const wordId = params.get("id");
  if (!wordId) return;

  // başlık adını getir
  const resWord = await fetch(`${API_URL}/words`);
  const words = await resWord.json();
  const word = words.find(w => w.id == wordId);
  document.getElementById("wordTitle").innerText = word ? word.text : "Başlık";

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

// Sayfa yüklenince uygun fonksiyonları çağır
window.onload = () => {
  if (document.getElementById("wordList")) loadWords();
  if (document.getElementById("entryList")) loadEntries();
};
