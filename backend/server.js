const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const app = express();
const db = new sqlite3.Database("./db.sqlite");

app.use(cors());
app.use(bodyParser.json());

// --- Veritabanı tabloları ---
db.run("CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY, text TEXT UNIQUE)");
db.run("CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, word_id INTEGER, text TEXT, created_at TEXT)");

// --- API endpointleri ---

// Başlık ekle veya varsa entry ekle
app.post("/words", (req, res) => {
  const wordText = req.body.text;
  const entryText = req.body.entry;

  db.get("SELECT * FROM words WHERE text = ?", [wordText], (err, row) => {
    if (row) {
      // başlık zaten varsa → entry ekle
      db.run(
        "INSERT INTO entries (word_id, text, created_at) VALUES (?, ?, datetime('now'))",
        [row.id, entryText],
        function () {
          res.json({ word_id: row.id, entry_id: this.lastID, text: entryText });
        }
      );
    } else {
      // yeni başlık + entry
      db.run("INSERT INTO words (text) VALUES (?)", [wordText], function () {
        const newWordId = this.lastID;
        db.run(
          "INSERT INTO entries (word_id, text, created_at) VALUES (?, ?, datetime('now'))",
          [newWordId, entryText],
          function () {
            res.json({ word_id: newWordId, entry_id: this.lastID, text: entryText });
          }
        );
      });
    }
  });
});

// Başlıkları getir
app.get("/words", (req, res) => {
  db.all("SELECT * FROM words ORDER BY id DESC", [], (err, rows) => res.json(rows));
});

// Entry’leri getir
app.get("/words/:id/entries", (req, res) => {
  db.all("SELECT * FROM entries WHERE word_id = ? ORDER BY id DESC", [req.params.id], (err, rows) => res.json(rows));
});

// Entry ekle
app.post("/words/:id/entries", (req, res) => {
  db.run(
    "INSERT INTO entries (word_id, text, created_at) VALUES (?, ?, datetime('now'))",
    [req.params.id, req.body.text],
    function () {
      res.json({ id: this.lastID, word_id: req.params.id, text: req.body.text });
    }
  );
});

// --- Statik frontend dosyaları ---
app.use(express.static(path.join(__dirname, "public")));

// SPA fallback
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// --- Sunucu başlat ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RetroSozluk running on port ${PORT}`));
