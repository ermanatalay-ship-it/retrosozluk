const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { google } = require("googleapis");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Google Sheets auth ---
function getSheetsClient() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });
  return google.sheets({ version: "v4", auth });
}

const SHEET_ID = process.env.SHEET_ID;
const SHEET_NAME = "data"; // sayfa adı (tab name)

// --- CACHE EKLENTİSİ BAŞLANGIÇ ---
let cachedRows = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60 * 1000; // 1 dakika (ms)

// --- Yardımcı: sheet'i oku + cache'li ---
async function readAllRows(forceRefresh = false) {
  const now = Date.now();
  if (!forceRefresh && cachedRows && (now - cacheTimestamp < CACHE_TTL)) {
    return cachedRows;
  }
  const sheets = getSheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:F`
  });
  const rows = res.data.values || [];
  cachedRows = rows.slice(1); // başlık satırı hariç cache'e yaz
  cacheTimestamp = now;
  return cachedRows;
}

// --- Yardımcı: sheet'e satır ekle (cache reset) ---
async function appendRow(row) {
  const sheets = getSheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:F`,
    valueInputOption: "RAW",
    requestBody: { values: [row] }
  });
  // Cache'i sıfırla
  cachedRows = null;
  cacheTimestamp = 0;
}

// --- Yardımcı: yeni ID üret (basit artan) ---
async function nextId(rows, type) {
  // type=word için A sütunu (id) max + 1
  // entries için de aynı artış yeterli (global id)
  const ids = rows
    .filter(r => r[1] === type)
    .map(r => Number(r[0]))
    .filter(n => !isNaN(n));
  const max = ids.length ? Math.max(...ids) : 0;
  return String(max + 1);
}

// --- API: Başlık ekle veya mevcut başlığa tanım ekle ---
app.post("/words", async (req, res) => {
  try {
    const wordText = (req.body.text || "").trim();
    const entryText = (req.body.entry || "").trim();
    if (!wordText || !entryText) {
      return res.status(400).json({ error: "text ve entry zorunlu" });
    }

    const rows = await readAllRows();

    // mevcut başlık var mı?
    const existingWordRow = rows.find(r => r[1] === "word" && (r[5] || "").trim() === wordText);
    let wordId;
    if (existingWordRow) {
      wordId = existingWordRow[0]; // id
    } else {
      // yeni word
      wordId = await nextId(rows, "word");
      await appendRow([
        wordId,       // id
        "word",       // type
        "",           // word_id (boş)
        "",           // text (boş)
        new Date().toISOString(), // created_at
        wordText      // word_text
      ]);
    }

    // entry ekle
    const entryId = await nextId(await readAllRows(), "entry");
    await appendRow([
      entryId,       // id
      "entry",       // type
      wordId,        // word_id
      entryText,     // text
      new Date().toISOString(), // created_at
      ""             // word_text (boş)
    ]);

    res.json({ word_id: wordId, entry_id: entryId, text: entryText });
  } catch (err) {
    console.error("POST /words error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// --- API: Başlıkları getir ---
app.get("/words", async (req, res) => {
  try {
    const rows = await readAllRows();
    const words = rows
      .filter(r => r[1] === "word")
      .map(r => ({ id: r[0], text: r[5] }));
    // id DESC
    words.sort((a, b) => Number(b.id) - Number(a.id));
    res.json(words);
  } catch (err) {
    console.error("GET /words error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// --- API: Başlığın tanımları ---
app.get("/words/:id/entries", async (req, res) => {
  try {
    const rows = await readAllRows();
    const entries = rows
      .filter(r => r[1] === "entry" && r[2] === req.params.id)
      .map(r => ({
        id: r[0],
        word_id: r[2],
        text: r[3],
        created_at: r[4]
      }));
    // id DESC
    entries.sort((a, b) => Number(b.id) - Number(a.id));
    res.json(entries);
  } catch (err) {
    console.error("GET /words/:id/entries error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// --- API: Yeni tanım ekle ---
app.post("/words/:id/entries", async (req, res) => {
  try {
    const entryText = (req.body.text || "").trim();
    if (!entryText) return res.status(400).json({ error: "text zorunlu" });

    const rows = await readAllRows();
    const entryId = await nextId(rows, "entry");
    await appendRow([
      entryId,
      "entry",
      req.params.id,
      entryText,
      new Date().toISOString(),
      ""
    ]);
    res.json({ id: entryId, word_id: req.params.id, text: entryText });
  } catch (err) {
    console.error("POST /words/:id/entries error:", err);
    res.status(500).json({ error: "server error" });
  }
});

// --- Statik frontend dosyaları ---
app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RetroSozluk (Sheets) running on port ${PORT}`));
