const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = process.env.PORT || 6000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
// Serve only required static folders explicitly (avoid exposing project root)
app.use('/css', express.static(path.join(__dirname, 'css')));
app.use('/js', express.static(path.join(__dirname, 'js')));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Database setup
const db = new sqlite3.Database('./museum.db');

// Initialize database tables
db.serialize(() => {
    // Users table
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT DEFAULT 'user',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // Artifacts table
    db.run(`CREATE TABLE IF NOT EXISTS artifacts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        collection_no TEXT NOT NULL,
        accession_no TEXT,
        collection_date TEXT,
        donor TEXT,
        object_type TEXT,
        object_head TEXT,
        description TEXT,
        measurement TEXT,
        gallery_no TEXT,
        found_place TEXT,
        experiment_formula TEXT,
        significance_comment TEXT,
        correction TEXT,
        images TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    // System logs table
    db.run(`CREATE TABLE IF NOT EXISTS system_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        action TEXT,
        details TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
    )`);

    // Create default admin user
    const adminPassword = bcrypt.hashSync('admin123', 10);
    db.run(`INSERT OR IGNORE INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
        ['Admin', 'admin@museum.org', adminPassword, 'admin']);

    // Add sample artifacts for testing
    const sampleArtifacts = [
        {
            collection_no: 'LWM-2023-001',
            accession_no: 'ACC-001',
            collection_date: '1971-03-26',
            donor: 'Freedom Fighter Foundation',
            object_type: 'Document',
            object_head: 'Declaration of Independence',
            description: 'Original document declaring Bangladesh independence',
            measurement: 'A4 size',
            gallery_no: 'G01',
            found_place: 'Dhaka',
            experiment_formula: 'N/A',
            significance_comment: 'Historical document of great importance',
            correction: 'None'
        },
        {
            collection_no: 'LWM-2023-002',
            accession_no: 'ACC-002',
            collection_date: '1971-12-16',
            donor: 'Military Museum',
            object_type: 'Weapon',
            object_head: 'Liberation War Rifle',
            description: 'Rifle used by freedom fighters during the war',
            measurement: 'Length: 110cm',
            gallery_no: 'G02',
            found_place: 'Chittagong',
            experiment_formula: 'N/A',
            significance_comment: 'Symbol of resistance and courage',
            correction: 'None'
        },
        {
            collection_no: 'LWM-2023-003',
            accession_no: 'ACC-003',
            collection_date: '1971-07-01',
            donor: 'Personal Collection',
            object_type: 'Personal Item',
            object_head: 'Freedom Fighter Diary',
            description: 'Personal diary of a freedom fighter',
            measurement: '15cm x 10cm',
            gallery_no: 'G03',
            found_place: 'Sylhet',
            experiment_formula: 'N/A',
            significance_comment: 'Personal account of the war',
            correction: 'None'
        }
    ];

    // Insert sample artifacts
    sampleArtifacts.forEach(artifact => {
        db.run(`INSERT OR IGNORE INTO artifacts (
            collection_no, accession_no, collection_date, donor,
            object_type, object_head, description, measurement,
            gallery_no, found_place, experiment_formula,
            significance_comment, correction
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [artifact.collection_no, artifact.accession_no, artifact.collection_date, artifact.donor,
         artifact.object_type, artifact.object_head, artifact.description, artifact.measurement,
         artifact.gallery_no, artifact.found_place, artifact.experiment_formula,
         artifact.significance_comment, artifact.correction]);
    });
});

// File upload configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'public/uploads/artifacts';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Authentication middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid token' });
        }
        req.user = user;
        next();
    });
};

const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Log system activity
const logActivity = (userId, action, details) => {
    db.run(`INSERT INTO system_logs (user_id, action, details) VALUES (?, ?, ?)`,
        [userId, action, details]);
};

// Routes

// Authentication routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        db.run(`INSERT INTO users (name, email, password) VALUES (?, ?, ?)`,
            [name, email, hashedPassword],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Registration failed' });
                }
                
                logActivity(this.lastID, 'USER_REGISTERED', `New user registered: ${email}`);
                res.status(201).json({ message: 'User registered successfully' });
            });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/auth/login', (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password required' });
        }

        db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            
            if (!user) {
                return res.status(401).json({ error: 'Invalid credentials' });
            }

            try {
                const validPassword = await bcrypt.compare(password, user.password);
                if (!validPassword) {
                    return res.status(401).json({ error: 'Invalid credentials' });
                }

                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    JWT_SECRET,
                    { expiresIn: '24h' }
                );

                logActivity(user.id, 'USER_LOGIN', `User logged in: ${email}`);
                res.json({
                    token,
                    user: {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    }
                });
            } catch (bcryptError) {
                console.error('Password comparison error:', bcryptError);
                return res.status(500).json({ error: 'Authentication error' });
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Something went wrong!' });
    }
});

// Artifact routes
app.get('/api/artifacts', (req, res) => {
    const { searchBy, searchValue, sortBy } = req.query;
    let query = 'SELECT * FROM artifacts';
    let params = [];

    if (searchBy && searchValue) {
        query += ` WHERE ${searchBy} LIKE ?`;
        params.push(`%${searchValue}%`);
    }

    if (sortBy) {
        query += ` ORDER BY ${sortBy}`;
    }

    db.all(query, params, (err, artifacts) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(artifacts);
    });
});

app.post('/api/artifacts', authenticateToken, requireAdmin, upload.array('images', 5), (req, res) => {
    try {
        const {
            collection_no, accession_no, collection_date, donor,
            object_type, object_head, description, measurement,
            gallery_no, found_place, experiment_formula,
            significance_comment, correction
        } = req.body;

        const images = req.files ? req.files.map(file => file.filename).join(',') : '';

        db.run(`INSERT INTO artifacts (
            collection_no, accession_no, collection_date, donor,
            object_type, object_head, description, measurement,
            gallery_no, found_place, experiment_formula,
            significance_comment, correction, images
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [collection_no, accession_no, collection_date, donor,
         object_type, object_head, description, measurement,
         gallery_no, found_place, experiment_formula,
         significance_comment, correction, images],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create artifact' });
            }
            
            logActivity(req.user.id, 'ARTIFACT_CREATED', `Artifact created: ${collection_no}`);
            res.status(201).json({ 
                message: 'Artifact created successfully',
                id: this.lastID 
            });
        });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.put('/api/artifacts/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const updateData = req.body;

    const fields = Object.keys(updateData).map(key => `${key} = ?`).join(', ');
    const values = Object.values(updateData);
    values.push(id);

    db.run(`UPDATE artifacts SET ${fields} WHERE id = ?`, values, function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update artifact' });
        }
        
        logActivity(req.user.id, 'ARTIFACT_UPDATED', `Artifact updated: ${id}`);
        res.json({ message: 'Artifact updated successfully' });
    });
});

app.delete('/api/artifacts/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;

    db.run(`DELETE FROM artifacts WHERE id = ?`, [id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete artifact' });
        }
        
        logActivity(req.user.id, 'ARTIFACT_DELETED', `Artifact deleted: ${id}`);
        res.json({ message: 'Artifact deleted successfully' });
    });
});

// User management routes (admin only)
app.get('/api/users', authenticateToken, requireAdmin, (req, res) => {
    db.all(`SELECT id, name, email, role, created_at FROM users`, (err, users) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(users);
    });
});

app.put('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    db.run(`UPDATE users SET role = ? WHERE id = ?`, [role, id], function(err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to update user' });
        }
        
        logActivity(req.user.id, 'USER_UPDATED', `User role updated: ${id}`);
        res.json({ message: 'User updated successfully' });
    });
});

// System logs route (admin only)
app.get('/api/logs', authenticateToken, requireAdmin, (req, res) => {
    db.all(`SELECT l.*, u.name as user_name FROM system_logs l 
            LEFT JOIN users u ON l.user_id = u.id 
            ORDER BY l.created_at DESC LIMIT 100`, (err, logs) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        res.json(logs);
    });
});

// Dashboard stats route
app.get('/api/dashboard', authenticateToken, (req, res) => {
    db.get(`SELECT COUNT(*) as total_artifacts FROM artifacts`, (err, artifacts) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        
        db.get(`SELECT COUNT(*) as total_users FROM users`, (err, users) => {
            if (err) {
                return res.status(500).json({ error: 'Database error' });
            }
            
            db.get(`SELECT COUNT(*) as total_logs FROM system_logs`, (err, logs) => {
                if (err) {
                    return res.status(500).json({ error: 'Database error' });
                }
                
                // Return both snake_case and camelCase for frontend compatibility
                res.json({
                    total_artifacts: artifacts.total_artifacts,
                    total_users: users.total_users,
                    total_logs: logs.total_logs,
                    totalArtifacts: artifacts.total_artifacts,
                    totalUsers: users.total_users,
                    totalLogs: logs.total_logs,
                    totalViews: 0,
                    recentUploads: 0
                });
            });
        });
    });
});

// Serve the main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
    console.log(`Liberation War Museum Archive Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to access the application`);
});

// Additional admin APIs
// Create user (admin only)
app.post('/api/users', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const { name, email, password, role = 'user' } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Name, email and password are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            `INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)`,
            [name, email, hashedPassword, role],
            function (err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(400).json({ error: 'Email already exists' });
                    }
                    return res.status(500).json({ error: 'Failed to create user' });
                }
                logActivity(req.user.id, 'USER_CREATED', `User created: ${email}`);
                res.status(201).json({ id: this.lastID, message: 'User created successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, requireAdmin, (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM users WHERE id = ?`, [id], function (err) {
        if (err) {
            return res.status(500).json({ error: 'Failed to delete user' });
        }
        logActivity(req.user.id, 'USER_DELETED', `User deleted: ${id}`);
        res.json({ message: 'User deleted successfully' });
    });
});

// Report generation stub (admin only)
app.post('/api/reports/generate', authenticateToken, requireAdmin, (req, res) => {
    res.json({ message: 'Report generated successfully' });
});

// Download basic CSV export (admin only)
app.get('/api/reports/excel', authenticateToken, requireAdmin, (req, res) => {
    db.all(`SELECT collection_no, accession_no, donor, object_type, object_head, collection_date FROM artifacts ORDER BY created_at DESC`, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to generate export' });
        }
        const header = 'Collection No,Accession No,Donor,Object Type,Object Head,Collection Date\n';
        const csv = header + rows.map(r => [r.collection_no, r.accession_no, r.donor, r.object_type, r.object_head, r.collection_date]
            .map(v => (v == null ? '' : String(v).replace(/\"/g, '""')))
            .map(v => /,|\n|\"/.test(v) ? `"${v}"` : v)
            .join(',')).join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="museum-report.csv"');
        res.send(csv);
    });
});
