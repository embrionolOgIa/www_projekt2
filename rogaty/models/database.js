const sqlite3 = require('sqlite3').verbose();
const path = require('path');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './rogaty.db';
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) console.error('Błąd połączenia z bazą:', err.message);
    else console.log('Połączono z bazą Rogaty.');
});

db.serialize(() => {
    //tabela albumow
    db.run(`CREATE TABLE IF NOT EXISTS albums (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        price REAL NOT NULL,
        description TEXT,
        img TEXT DEFAULT 'default.jpg'
    )`);

    // tabela recenzji z relacja do albumow
    db.run(`CREATE TABLE IF NOT EXISTS reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        album_id INTEGER,
        author TEXT,
        content TEXT,
        rating INTEGER,
        FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT, 
        subject TEXT, 
        message TEXT
    )`);
    
    // seedowanie
    db.get("SELECT count(*) as count FROM albums", (err, row) => {
        if (row.count === 0) {
            const stmt = db.prepare("INSERT INTO albums (title, price, description, img) VALUES (?, ?, ?, ?)");
            stmt.run("CIEMNOŚĆ ABSOLUTNA", 66.6, "Debiutancki album pełen nienawiści.", "c1.jpg");
            stmt.run("RYTUAŁ KRWI", 50.0, "Surowe brzmienie z piwnicy.", "c2.jpg");
            stmt.finalize();
            console.log("Dodano przykładowe dane.");
        }
    });
});

module.exports = db;