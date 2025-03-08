const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./movies.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite');
});

// Drop old table and create new one with year ranges
db.serialize(() => {
  db.run("DROP TABLE IF EXISTS movies");
  db.run(`
    CREATE TABLE movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      yearStart INTEGER NOT NULL,
      yearEnd INTEGER NOT NULL,
      releaseYear INTEGER
    )
  `);

  // Seed with updated data (ranges and multiple entries for some movies)
  db.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
    if (row.count === 0) {
      // Back to the Future (multiple ranges)
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear) VALUES (?, ?, ?, ?)", ["Back to the Future", 1985, 1985, 1985]);
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear) VALUES (?, ?, ?, ?)", ["Back to the Future", 1955, 1955, 1985]);
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear) VALUES (?, ?, ?, ?)", ["Back to the Future", 2015, 2015, 1985]);
      // Gladiator (range for Commodus' reign)
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear) VALUES (?, ?, ?, ?)", ["Gladiator", 180, 192, 2000]);
      // The Time Machine (single year)
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear) VALUES (?, ?, ?, ?)", ["The Time Machine", 802701, 802701, 1960]);
      console.log("Inserted initial data with year ranges");
    }
  });
});

// API endpoint to get all movies
app.get('/movies', (req, res) => {
  db.all("SELECT * FROM movies", [], (err, rows) => {
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});