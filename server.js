// server.js - Backend for LunaLog Period Tracker
const express = require('express');
const SimplifiedMenstrualCyclePredictor = require('./src/SimplifiedMenstrualCyclePredictor');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const path = require('path');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 5000;

// Initialize the predictor instance - using the simplified version that doesn't require TensorFlow
const predictor = new SimplifiedMenstrualCyclePredictor();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


// MongoDB connection (replace with your MongoDB connection string)
mongoose.connect('mongodb://localhost:27017/lunalog', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch(err => {
    console.error('MongoDB connection error:', err);
});

// Define schemas


const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    birthdate: { type: Date },
    // Add these fields for storing cycle information
    cycleLength: { type: Number, default: 28 },
    periodLength: { type: Number, default: 5 },
    lastPeriodDate: { type: Date },
    createdAt: { type: Date, default: Date.now }
});


const periodDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    flow: { type: String, enum: ['light', 'medium', 'heavy'] },
    symptoms: [String],
    notes: String,
    createdAt: { type: Date, default: Date.now }
});

const wellnessDataSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    type: { type: String, enum: ['stress', 'diet', 'exercise', 'wellness'], required: true },
    data: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now }
});

// Create models
const User = mongoose.model('User', userSchema);
const PeriodData = mongoose.model('PeriodData', periodDataSchema);
const WellnessData = mongoose.model('WellnessData', wellnessDataSchema);

// Use environment variable for JWT secret or fallback to a default (in production, always use env variable)
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SECRET_KEY';

// Auth middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden: Invalid token' });
        }
        
        req.user = user;
        next();
    });
};

// Routes
// User registration
app.post('/api/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { name, email, password, birthdate } = req.body;
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists with this email' });
        }
        
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Create new user
        const user = new User({
            name,
            email,
            password: hashedPassword,
            birthdate: birthdate ? new Date(birthdate) : undefined
        });
        
        await user.save();
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(201).json({ token, userId: user._id });
    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// User login
app.post('/api/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { email, password } = req.body;
        
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Validate password
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );
        
        res.status(200).json({ token, userId: user._id, name: user.name });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error during login' });
    }
});
// Add this route to your server.js file
// Get user profile
app.get('/api/users/profile', authenticateToken, async (req, res) => {
    try {
        // Find user by ID (excluding the password)
        const user = await User.findById(req.user.userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        
        res.status(200).json(user);
    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ message: 'Server error while fetching user profile' });
    }
});
// Update user profile
app.put('/api/users/profile', authenticateToken, async (req, res) => {
    try {
      // Find user by ID
      const user = await User.findById(req.user.userId);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update fields that were sent in the request
      if (req.body.name) user.name = req.body.name;
      if (req.body.email) user.email = req.body.email;
      if (req.body.cycleLength) user.cycleLength = req.body.cycleLength;
      if (req.body.periodLength) user.periodLength = req.body.periodLength;
      
      // Save updated user
      await user.save();
      
      // Return updated user (excluding password)
      const updatedUser = await User.findById(req.user.userId).select('-password');
      res.status(200).json(updatedUser);
    } catch (err) {
      console.error('Error updating user profile:', err);
      res.status(500).json({ message: 'Server error while updating user profile' });
    }
  });

// Add period data
app.post('/api/period', authenticateToken, [
    body('startDate').isISO8601().withMessage('Valid start date is required'),
    body('endDate').optional().isISO8601().withMessage('End date must be valid if provided'),
    body('flow').optional().isIn(['light', 'medium', 'heavy']).withMessage('Flow must be light, medium, or heavy')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { startDate, endDate, flow, symptoms, notes } = req.body;
        
        const periodData = new PeriodData({
            userId: req.user.userId,
            startDate: new Date(startDate),
            endDate: endDate ? new Date(endDate) : undefined,
            flow,
            symptoms,
            notes
        });
        
        await periodData.save();
        
        res.status(201).json({ message: 'Period data saved successfully', periodData });
    } catch (err) {
        console.error('Error saving period data:', err);
        res.status(500).json({ message: 'Server error while saving period data' });
    }
});

// Get period history
app.get('/api/period', authenticateToken, async (req, res) => {
    try {
        const periodData = await PeriodData.find({ userId: req.user.userId })
            .sort({ startDate: -1 });
            
        res.status(200).json(periodData);
    } catch (err) {
        console.error('Error fetching period data:', err);
        res.status(500).json({ message: 'Server error while fetching period data' });
    }
});
// Add these new endpoints to your server.js file to support the data sync

// New endpoint to get user's cycle metrics
app.get('/api/metrics', authenticateToken, async (req, res) => {
    try {
        // Get user's period history
        const periodData = await PeriodData.find({ userId: req.user.userId })
            .sort({ startDate: -1 });
            
        // Calculate metrics from period data
        const metrics = calculateMetrics(periodData);
        
        res.status(200).json(metrics);
    } catch (err) {
        console.error('Error fetching metrics:', err);
        res.status(500).json({ message: 'Server error while calculating metrics' });
    }
});

// Helper function to calculate metrics from period data
function calculateMetrics(periodData) {
    // Initialize metrics
    const metrics = {
        averageCycleLength: 0,
        averagePeriodLength: 0,
        consistencyScore: 0
    };
    
    // Calculate average cycle length if we have enough data
    if (periodData.length >= 2) {
        const cycleLengths = [];
        
        // Sort data by date (newest first should already be the order from find query)
        const sortedData = [...periodData].sort((a, b) => 
            new Date(b.startDate) - new Date(a.startDate)
        );
        
        // Calculate the length of each cycle
        for (let i = 0; i < sortedData.length - 1; i++) {
            const currentStart = new Date(sortedData[i].startDate);
            const nextStart = new Date(sortedData[i + 1].startDate);
            const cycleDays = Math.abs(
                Math.round((currentStart - nextStart) / (1000 * 60 * 60 * 24))
            );
            
            if (cycleDays > 0 && cycleDays < 100) { // Sanity check - exclude unreasonable values
                cycleLengths.push(cycleDays);
            }
        }
        
        if (cycleLengths.length > 0) {
            // Calculate average cycle length
            metrics.averageCycleLength = Math.round(
                cycleLengths.reduce((sum, length) => sum + length, 0) / cycleLengths.length
            );
            
            // Calculate consistency score (inverse of standard deviation)
            const mean = metrics.averageCycleLength;
            const squaredDiffs = cycleLengths.map(length => Math.pow(length - mean, 2));
            const avgSquaredDiff = squaredDiffs.reduce((sum, diff) => sum + diff, 0) / squaredDiffs.length;
            const stdDev = Math.sqrt(avgSquaredDiff);
            
            // Convert standard deviation to a 0-100 consistency score
            // Lower standard deviation = higher consistency
            metrics.consistencyScore = Math.round(Math.max(0, 100 - (stdDev * 5)));
        }
    }
    
    // Calculate average period length
    const periodLengths = [];
    for (const period of periodData) {
        if (period.endDate) {
            const start = new Date(period.startDate);
            const end = new Date(period.endDate);
            const days = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
            
            if (days > 0 && days <= 14) { // Sanity check - exclude unreasonable values
                periodLengths.push(days);
            }
        }
    }
    
    if (periodLengths.length > 0) {
        metrics.averagePeriodLength = Math.round(
            periodLengths.reduce((sum, length) => sum + length, 0) / periodLengths.length
        );
    }
    
    return metrics;
}



// Update the existing prediction endpoint to use the latest metrics
app.get('/api/predict', authenticateToken, async (req, res) => {
    try {
        // Get the user's data
        const user = await User.findById(req.user.userId);
        
        // Get period history
        const periodData = await PeriodData.find({ userId: req.user.userId })
            .sort({ startDate: -1 });
            
        // Get the most recent period date
        let lastPeriodDate;
        if (periodData.length > 0) {
            lastPeriodDate = new Date(periodData[0].startDate);
        } else if (user.lastPeriodDate) {
            lastPeriodDate = new Date(user.lastPeriodDate);
        } else {
            return res.status(400).json({ 
                message: 'No period data found. Please log at least one period.' 
            });
        }
        
        // Calculate metrics
        const metrics = calculateMetrics(periodData);
        
        // Use user's set cycle length as fallback if not enough data for calculation
        const cycleLength = metrics.averageCycleLength || user.cycleLength || 28;
        const periodLength = metrics.averagePeriodLength || user.periodLength || 5;
        
        // Calculate next period start date
        const nextPeriodDate = new Date(lastPeriodDate);
        nextPeriodDate.setDate(lastPeriodDate.getDate() + cycleLength);
        
        // Calculate next period end date
        const nextPeriodEndDate = new Date(nextPeriodDate);
        nextPeriodEndDate.setDate(nextPeriodDate.getDate() + periodLength - 1);
        
        // Calculate fertile window (typically 14 days before next period +/- 2 days)
        const ovulationDate = new Date(nextPeriodDate);
        ovulationDate.setDate(nextPeriodDate.getDate() - 14);
        
        const fertileWindowStart = new Date(ovulationDate);
        fertileWindowStart.setDate(ovulationDate.getDate() - 5);
        
        const fertileWindowEnd = new Date(ovulationDate);
        fertileWindowEnd.setDate(ovulationDate.getDate() + 1);
        
        // Format dates for response
        const formatDate = (date) => {
            return date.toISOString().split('T')[0];
        };
        
        const prediction = {
            lastPeriodDate: formatDate(lastPeriodDate),
            nextPeriodStart: formatDate(nextPeriodDate),
            nextPeriodEnd: formatDate(nextPeriodEndDate),
            fertileWindowStart: formatDate(fertileWindowStart),
            fertileWindowEnd: formatDate(fertileWindowEnd),
            ovulationDate: formatDate(ovulationDate),
            metrics: {
                averageCycleLength: cycleLength,
                averagePeriodLength: periodLength,
                consistencyScore: metrics.consistencyScore || 0
            }
        };
        
        res.status(200).json(prediction);
    } catch (err) {
        console.error('Error generating prediction:', err);
        res.status(500).json({ message: 'Server error while generating prediction' });
    }
});

// Add wellness data (stress, diet, exercise, overall wellness)
app.post('/api/wellness', authenticateToken, [
    body('date').isISO8601().withMessage('Valid date is required'),
    body('type').isIn(['stress', 'diet', 'exercise', 'wellness']).withMessage('Valid type is required')
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    
    try {
        const { date, type, data } = req.body;
        
        const wellnessData = new WellnessData({
            userId: req.user.userId,
            date: new Date(date),
            type,
            data
        });
        
        await wellnessData.save();
        
        res.status(201).json({ message: `${type} data saved successfully`, wellnessData });
    } catch (err) {
        console.error('Error saving wellness data:', err);
        res.status(500).json({ message: 'Server error while saving wellness data' });
    }
});

// Get wellness data
app.get('/api/wellness/:type', authenticateToken, async (req, res) => {
    try {
        const { type } = req.params;
        
        if (!['stress', 'diet', 'exercise', 'wellness', 'all'].includes(type)) {
            return res.status(400).json({ message: 'Invalid wellness type' });
        }
        
        let query = { userId: req.user.userId };
        if (type !== 'all') {
            query.type = type;
        }
        
        const wellnessData = await WellnessData.find(query)
            .sort({ date: -1 });
            
        res.status(200).json(wellnessData);
    } catch (err) {
        console.error('Error fetching wellness data:', err);
        res.status(500).json({ message: 'Server error while fetching wellness data' });
    }
});

// Get AI-driven insights
app.get('/api/insights', authenticateToken, async (req, res) => {
    try {
        // Get user's period history
        const periodData = await PeriodData.find({ userId: req.user.userId })
            .sort({ startDate: -1 });
            
        // Get user's wellness data
        const wellnessData = await WellnessData.find({ userId: req.user.userId })
            .sort({ date: -1 });
            
        // Simple insights generation
        const insights = generateInsights(periodData, wellnessData);
        
        res.status(200).json(insights);
    } catch (err) {
        console.error('Error generating insights:', err);
        res.status(500).json({ message: 'Server error while generating insights' });
    }
});

// Simple insights generation function
function generateInsights(periodData, wellnessData) {
    const insights = {
        cycleInsights: [],
        wellnessInsights: []
    };
    
    // Calculate average cycle length if enough data
    if (periodData.length >= 2) {
        const cycleLengths = [];
        for (let i = 0; i < periodData.length - 1; i++) {
            const current = new Date(periodData[i].startDate);
            const next = new Date(periodData[i + 1].startDate);
            const daysDiff = Math.round((current - next) / (1000 * 60 * 60 * 24));
            if (daysDiff > 0) {  // Ensure we're not dealing with erroneous data
                cycleLengths.push(daysDiff);
            }
        }
        
        if (cycleLengths.length > 0) {
            const avgCycleLength = Math.round(cycleLengths.reduce((a, b) => a + b, 0) / cycleLengths.length);
            insights.cycleInsights.push({
                type: 'cycle_length',
                message: `Your average cycle length is ${avgCycleLength} days.`
            });
            
            // Detect irregular cycles
            const maxCycleLength = Math.max(...cycleLengths);
            const minCycleLength = Math.min(...cycleLengths);
            if (maxCycleLength - minCycleLength > 7) {
                insights.cycleInsights.push({
                    type: 'irregular_cycles',
                    message: 'Your cycle length varies by more than 7 days, which may indicate irregular cycles.'
                });
            }
        }
    }
    
    // Analyze period length if enough data
    if (periodData.length > 0) {
        const periodLengths = [];
        for (const period of periodData) {
            if (period.endDate) {
                const start = new Date(period.startDate);
                const end = new Date(period.endDate);
                const daysDiff = Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1;
                if (daysDiff > 0 && daysDiff <= 14) { // Reasonable range check
                    periodLengths.push(daysDiff);
                }
            }
        }
        
        if (periodLengths.length > 0) {
            const avgPeriodLength = Math.round(periodLengths.reduce((a, b) => a + b, 0) / periodLengths.length);
            insights.cycleInsights.push({
                type: 'period_length',
                message: `Your average period length is ${avgPeriodLength} days.`
            });
            
            // Heavy periods insight
            if (avgPeriodLength > 7) {
                insights.cycleInsights.push({
                    type: 'heavy_periods',
                    message: 'Your periods tend to last longer than average. If you experience heavy bleeding, consider consulting with a healthcare provider.'
                });
            }
        }
    }
    
    // Analyze stress data
    const stressData = wellnessData.filter(data => data.type === 'stress');
    if (stressData.length > 0) {
        // Calculate average stress level
        let totalStressLevel = 0;
        let count = 0;
        
        for (const data of stressData) {
            if (data.data && data.data.stressLevel) {
                totalStressLevel += parseInt(data.data.stressLevel);
                count++;
            }
        }
        
        if (count > 0) {
            const avgStressLevel = Math.round(totalStressLevel / count);
            if (avgStressLevel > 7) {
                insights.wellnessInsights.push({
                    type: 'high_stress',
                    message: 'Your average stress level is high. Consider incorporating stress-reduction techniques into your routine.'
                });
            }
        }
    }
    
    return insights;
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'LunaLog API is running' });
});

// Catch-all for SPA routing (if you're using a frontend framework)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

module.exports = app; // Export for testing