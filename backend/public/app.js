const API_URL = "https://retrosozluk.onrender.com";

// Başlıkları listele (entry sayısı ile birlikte)
async function loadWords() {
  const res = await fetch(`${API_URL}/words`);
  const words = await res.json();

  const list = document.getElementById("wordList");
  if (list) {
    list.innerHTML = "";
    for (const w of words) {
      const resEntries = await fetch(`${API_URL}/words/${w.id}/entries`);
      const entries = await resEntries.json();
      const li = document.createElement("li");
      li.innerHTML = `<a href="word.html?id=${w.id}">${w.text} (${entries.length})</a>`;
      list.appendChild(li);
    }
  }
}

// Yeni başlık + ilk tanım ekle
async function addWordWithEntry() {
  const wordInput = document.getElementById("wordInput");
  const entryInput = document.getElementById("entryInput");
  if (!wordInput.value || !entryInput.value) return;

  await fetch(`${API_URL}/words`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text: wordInput.value, entry: entryInput.value })
  });

  wordInput.value = "";
  entryInput.value = "";
  loadWords();
}

// word.html için tanımları yükle
async function loadEntries() {
  const params = new URLSearchParams(window.location.search);
  const wordId = params.get("id");
  if (!wordId) return;

  const resWord = await fetch(`${API_URL}/words`);
  const words = await resWord.json();
  const word = words.find(w => w.id == wordId);
  document.getElementById("wordTitle").innerText = word ? word.text : "Başlık";

  const res = await fetch(`${API_URL}/words/${wordId}/entries`);
  const entries = await res.json();
  const list = document.getElementById("entryList");
  if (list) {
    list.innerHTML = "";
    entries.forEach(e => {
      // Tarihi formatla
      const date = new Date(e.created_at);
      const formattedDate = date.toLocaleString("tr-TR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });

      // <p> oluştur
      const p = document.createElement("p");
      p.innerHTML = `${e.text} <span class="timestamp">(${formattedDate})</span>`;
      list.appendChild(p);
    });
  }
}

// Yeni tanım ekle
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
