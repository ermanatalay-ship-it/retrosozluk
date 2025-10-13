const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const db = new sqlite3.Database("./db.sqlite");

app.use(cors());
app.use(bodyParser.json());

// tabloları oluştur
db.run("CREATE TABLE IF NOT EXISTS words (id INTEGER PRIMARY KEY, text TEXT)");
db.run("CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, word_id INTEGER, text TEXT)");

// kelimeler
app.get("/words", (req, res) => {
  db.all("SELECT * FROM words ORDER BY id DESC", [], (err, rows) => res.json(rows));
});

app.post("/words", (req, res) => {
  db.run("INSERT INTO words (text) VALUES (?)", [req.body.text], function() {
    res.json({ id: this.lastID, text: req.body.text });
  });
});

// entry’ler
app.get("/words/:id/entries", (req, res) => {
  db.all("SELECT * FROM entries WHERE word_id = ?", [req.params.id], (err, rows) => res.json(rows));
});

app.post("/words/:id/entries", (req, res) => {
  db.run("INSERT INTO entries (word_id, text) VALUES (?, ?)", [req.params.id, req.body.text], function() {
    res.json({ id: this.lastID, word_id: req.params.id, text: req.body.text });
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`RetroSozluk API running on port ${PORT}`));
