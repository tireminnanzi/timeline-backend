const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

console.log('Starting server setup...');

const db = new sqlite3.Database('./movies.db', (err) => {
  if (err) console.error('Database error:', err);
  else console.log('Connected to SQLite');
});

db.serialize(() => {
  db.run("DROP TABLE IF EXISTS movies");
  db.run(`
    CREATE TABLE movies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      yearStart INTEGER NOT NULL,
      yearEnd INTEGER NOT NULL,
      releaseYear INTEGER,
      importance REAL
    )
  `);

  db.get("SELECT COUNT(*) as count FROM movies", (err, row) => {
    if (row.count === 0) {
      db.run("BEGIN TRANSACTION");
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear, importance) VALUES (?, ?, ?, ?, ?)", ["Back to the Future", 1985, 1985, 1985, 38.5]);
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear, importance) VALUES (?, ?, ?, ?, ?)", ["Back to the Future", 1955, 1955, 1985, 38.5]);
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear, importance) VALUES (?, ?, ?, ?, ?)", ["Back to the Future", 2015, 2015, 1985, 38.5]);
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear, importance) VALUES (?, ?, ?, ?, ?)", ["Gladiator", 180, 192, 2000, 43.5]);
      db.run("INSERT INTO movies (title, yearStart, yearEnd, releaseYear, importance) VALUES (?, ?, ?, ?, ?)", ["The Time Machine", 802701, 802701, 1960, 24.5], () => {
        db.run("COMMIT", () => {
          console.log("Inserted initial data with year ranges");
          db.all("SELECT * FROM movies", [], (err, rows) => {
            console.log('Database content after seeding:', rows);
          });
        });
      });
    }
  });
});

app.get('/', (req, res) => {
  console.log('Received request for /');
  res.send('Hello from timeline_backend');
});

app.get('/movies', (req, res) => {
  console.log('Received request for /movies');
  db.all("SELECT * FROM movies", [], (err, rows) => {
    console.log('Query error:', err);
    console.log('Rows:', rows);
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  });
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});