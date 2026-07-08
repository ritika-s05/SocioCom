require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const supabase = require('./config/supabase');


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

const analyticsRoutes = require('./routes/analytics');
app.use('/api/analytics', analyticsRoutes);

//route will be imported  and mounted here 
const instagramRoutes = require('./routes/instagram');
app.use('/api/instagram', instagramRoutes);
// app.use instagram api 

const woocommerceRoutes = require('./routes/woocommerce');
app.use('/api/woocommerce', woocommerceRoutes);
// app.use analytics api

//Globar error handler - catches any error throw in the app
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: err.message,
  });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
