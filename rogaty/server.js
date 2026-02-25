const express = require('express');
const app = express();
const apiRoutes = require('./routes/api');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api', apiRoutes);

// Error handling middleware (wymagane w zadaniu)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Coś poszło bardzo nie tak...');
});

app.listen(PORT, () => console.log(`Serwer Rogaty działa na http://localhost:${PORT}`));