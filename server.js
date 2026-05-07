const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { PythonShell } = require('python-shell');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'SUPER_SECRET_UPI_KEY';

// Connect to MongoDB
mongoose.connect('mongodb://127.0.0.1:27017/upi_fraud_db')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    // Ensure default admin user exists
    try {
        const adminExists = await User.findOne({ name: 'admin' });
        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('password123', 10);
            await new User({ name: 'admin', email: 'admin@upi.com', password: hashedPassword }).save();
            console.log('💡 Demo account created: admin / password123');
        }
    } catch (e) {
        console.error("Error creating demo user:", e);
    }
  })
  .catch(err => console.error('MongoDB connection error. Is MongoDB running?'));

// 1. Define User Schema
const userSchema = new mongoose.Schema({
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt:{ type: Date, default: Date.now }
});
const User = mongoose.model('User', userSchema);

// 2. Define Transaction Schema
const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id: String,
    amount: Number,
    senderUpi: String,
    receiverUpi: String,
    transactionTime: String,
    deviceType: String,
    prediction: String,
    confidence: Number,
    riskScore: Number,
    reasons: [String],
    createdAt: { type: Date, default: Date.now }
});
const Transaction = mongoose.model('Transaction', transactionSchema);

const app = express();
app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 3. JWT Middleware
const verifyToken = (req, res, next) => {
    // Check httpOnly cookie first, then fallback to auth header
    const token = req.cookies.token || (req.headers['authorization'] && req.headers['authorization'].split(' ')[1]);
    
    if (!token) return res.status(401).json({ error: "Access denied" });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ error: "Invalid Token" });
        req.userId = decoded.userId;
        next();
    });
};

// ======================== AUTHENTICATION ========================

// REGISTER API
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) return res.status(400).json({ error: "All fields required" });

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();
        res.status(201).json({ message: "Registration successful" });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ error: "Email already exists" });
        res.status(500).json({ error: "Server error during registration" });
    }
});

// LOGIN API
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Search by email OR name (since the UI uses "Username" which could be either)
        const user = await User.findOne({ 
            $or: [ { email: email }, { name: email } ] 
        });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: "Invalid username/email or password" });
        }
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '12h' });
        // Set an httpOnly cookie. Omit maxAge to create a session cookie that deletes upon browser close.
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
        });
        res.json({ token, user: { name: user.name, email: user.email } });
    } catch (err) {
        res.status(500).json({ error: "Server error during login" });
    }
});

// LOGOUT API
app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out successfully" });
});

// ======================== PROTECTED ROUTES ========================

// Main Prediction Endpoint
app.post('/api/predict', verifyToken, async (req, res) => {
    try {
        console.log("Received transaction from UI:", req.body);
        
        // Upgraded Feature Mapping for the new Hybrid ML Model (11 features)
        const amount = Number(req.body.amount || req.body.Amount) || 0;
        const avg_user_txn = Number(req.body.avg_user_txn || req.body.AvgTransactionAmount) || 500;
        const trans_hour = Number(req.body.transaction_hour || req.body.trans_hour) || new Date().getHours();
        const date = req.body.transactionDate ? new Date(req.body.transactionDate) : new Date();
        
        const mlInputData = {
            amount: amount,
            avg_user_txn: avg_user_txn,
            amount_ratio: Number(req.body.amount_ratio || req.body.Amount_to_Avg_Ratio) || (avg_user_txn > 0 ? amount / avg_user_txn : 0),
            log_amount: Math.log1p(amount), 
            failed_attempts: Number(req.body.failed_attempts || req.body.FailedAttempts) || 0,
            transaction_hour: trans_hour,
            risk_score_location: Number(req.body.risk_score_location || 0),
            risk_score_merchant: Number(req.body.risk_score_merchant || 0),
            device_type: req.body.deviceType === 'web' ? 1 : 0, 
            is_weekend: (date.getDay() === 0 || date.getDay() === 6) ? 1 : 0,
            is_night_transaction: (trans_hour < 6 || trans_hour > 22) ? 1 : 0
        };
        
        console.log("Passing to Upgraded ML Engine:", mlInputData);

        let options = {
            mode: 'text',
            pythonOptions: ['-u'],
            scriptPath: path.join(__dirname, 'Backend ML'), 
            args: [JSON.stringify(mlInputData)]
        };

        const messages = await PythonShell.run('predict.py', options);
        const mlOutput = JSON.parse(messages[messages.length - 1]);
        console.log("Prediction Outcome:", mlOutput);

        const newTx = new Transaction({
            userId: req.userId,
            id: 'TXN' + Date.now().toString().slice(-6),
            amount: req.body.amount,
            senderUpi: req.body.senderUpi,
            receiverUpi: req.body.receiverUpi,
            transactionTime: req.body.transactionTime,
            deviceType: req.body.deviceType,
            prediction: mlOutput.prediction,
            confidence: mlOutput.confidence,
            riskScore: mlOutput.risk_score,
            reasons: mlOutput.reasons
        });
        await newTx.save().catch(err => console.error("DB Save Error:", err));

        return res.json({
            id: newTx.id,
            timestamp: newTx.createdAt,
            prediction: mlOutput.prediction,
            confidence: mlOutput.confidence,
            risk_score: mlOutput.risk_score,
            reasons: mlOutput.reasons
        });

    } catch (err) {
        console.error("Express Error:", err);
        return res.status(500).json({ error: "Prediction Server Failed" });
    }
});

// History endpoint
app.get('/api/history', verifyToken, async (req, res) => {
    try {
        const history = await Transaction.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(50);
        res.json(history);
    } catch (err) {
        res.status(500).json([]);
    }
});

app.delete('/api/history/clear', verifyToken, async (req, res) => {
    try {
        await Transaction.deleteMany({ userId: req.userId });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Could not clear history" });
    }
});

app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
    try {
        const totalTransactions = await Transaction.countDocuments({ userId: req.userId });
        const fraudDetected = await Transaction.countDocuments({ userId: req.userId, prediction: 'Fraud' });
        const safeTransactions = await Transaction.countDocuments({ userId: req.userId, prediction: 'Legit' });
        res.json({ totalTransactions, fraudDetected, safeTransactions });
    } catch (err) {
        res.status(500).json({ totalTransactions: 0, fraudDetected: 0, safeTransactions: 0 });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`🚀 API Server running on http://localhost:${PORT}`);
});
