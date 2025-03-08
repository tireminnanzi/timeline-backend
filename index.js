app.get('/movies', (req, res) => {
  console.log('Received request for /movies');
  db.all("SELECT * FROM movies", [], (err, rows) => {
    console.log('Query error:', err);
    console.log('Rows:', rows);
    if (err) res.status(500).json({ error: err.message });
    else res.json(rows);
  }) ;
});