const express = require('express');
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;


//middleware for handing POST requests
app.use(express.json());

//connecting mongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

//defining API path 
app.use('/', userRoutes);

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
