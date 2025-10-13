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
