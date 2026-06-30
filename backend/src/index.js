const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('combined'));
app.use(express.json());

//health check route - always have this, its how deoployement platform verify that your app is alive
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

//route will be imported  and mounted here 
// app.use instagram api 
// app.use analytics api

//Globar error handler - catches any error throw in the app
app.use((err, req, res, next) =>{
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: err.message || 'Something went wrong'
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
