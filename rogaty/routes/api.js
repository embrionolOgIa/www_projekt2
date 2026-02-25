const express = require('express');
const router = express.Router();
const db = require('../models/database');
const validator = require('validator');
require('dotenv').config();

// endpointy public

// pobierz liste albumow
router.get('/albums', (req, res) => {
    db.all("SELECT * FROM albums", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//pobierz recenzje
router.get('/albums/:id/reviews', (req, res) => {
    const sql = "SELECT * FROM reviews WHERE album_id = ?";
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

//kontakt
router.post('/contact', (req, res) => {
    const { email, subject, message } = req.body;
    if (!validator.isEmail(email)) {
        return res.status(400).json({ error: "Nieprawidłowy adres email." });
    }
    const stmt = db.prepare("INSERT INTO messages (email, subject, message) VALUES (?, ?, ?)");
    stmt.run(email, subject, message, (err) => {
        if (err) return res.status(500).json({ error: "Błąd bazy danych." });
        res.json({ success: "Wiadomość została wysłana." });
    });
});

// dodaj recenzje
router.post('/reviews', (req, res) => {
    const { album_id, author, content, rating } = req.body;
    const sql = "INSERT INTO reviews (album_id, author, content, rating) VALUES (?, ?, ?, ?)";
    db.run(sql, [album_id, author || 'Anonim', content, rating], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Recenzja dodana." });
    });
});


//middlewere
const authMiddleware = (req, res, next) => {
    //haslo
    const providedPass = req.headers['x-admin-password'];
    const correctPass = process.env.ADMIN_SECRET;

    if (!providedPass || providedPass !== correctPass) {
        return res.status(401).json({ error: "Brak dostepu!" });
    }
    next();
};


// endpointy z haslem

// dodaj album
router.post('/albums', authMiddleware, (req, res) => {
    const { title, price, description, img } = req.body;
    const sql = "INSERT INTO albums (title, price, description, img) VALUES (?, ?, ?, ?)";
    db.run(sql, [title, price, description, img], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Album dodany." });
    });
});

// edytuj album
router.put('/albums/:id', authMiddleware, (req, res) => {
    const { title, price, description, img } = req.body;
    const sql = "UPDATE albums SET title = ?, price = ?, description = ?, img = ? WHERE id = ?";
    db.run(sql, [title, price, description, img, req.params.id], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Album zaktualizowany." });
    });
});

// usun album
router.delete('/albums/:id', authMiddleware, (req, res) => {
    //tzreba jesszcze usunac recenzje przed
    db.run("DELETE FROM reviews WHERE album_id = ?", [req.params.id], (err) => {
        db.run("DELETE FROM albums WHERE id = ?", [req.params.id], function(err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: "Album usunięty." });
        });
    });
});

module.exports = router;