const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use('/tmp', express.static(path.join(__dirname, 'tmp')));
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.set('json spaces', 2);
app.use(cors())

const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://shannz-restfull-api-default-rtdb.firebaseio.com"
});
const db = admin.database();
console.log('C> Database Connected ✅');

const tmpDir = path.join(__dirname, 'tmp');
if (!fs.existsSync(tmpDir)){
    fs.mkdirSync(tmpDir);
    console.log('C> Created tmp Dir ✅');
}
console.log('C> Root Directory In', process.cwd());

let totalRequests = 0;

function formatUptime(uptimeInSeconds) {
    const seconds = Math.floor(uptimeInSeconds % 60);
    const minutes = Math.floor((uptimeInSeconds / 60) % 60);
    const hours = Math.floor((uptimeInSeconds / (60 * 60)) % 24);
    const days = Math.floor((uptimeInSeconds / (60 * 60 * 24)) % 30);
    const months = Math.floor(uptimeInSeconds / (60 * 60 * 24 * 30));

    return `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''} ${minutes} minute${minutes !== 1 ? 's' : ''} ${seconds} second${seconds !== 1 ? 's' : ''}`;
}

app.use((req, res, next) => {
    const excludedEndpoints = [
        '/server/stats',
        '/login',
        '/register',
        '/dashboard',
        '/docs',
        '/support',
        '/auth/my',
        '/admin',
        '/home',
        '/voice-cover'
    ];

    if (!excludedEndpoints.includes(req.path)) {
        totalRequests++;
    }
    next();
});

app.get('/server/stats', (req, res) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const stats = {
        totalRequests: totalRequests,
        uptime: formatUptime(uptime),
        uptimeRaw: uptime,
        memoryUsage: memoryUsage,
        cpuUsage: cpuUsage
    };
    fs.writeFileSync('serverStats.json', JSON.stringify(stats, null, 2));
    res.json(stats);
});

if (fs.existsSync('serverStats.json')) {
    const savedStats = JSON.parse(fs.readFileSync('serverStats.json'));
    totalRequests = savedStats.totalRequests || 0;
}

// Import Routers
const indexR = require('./routes/index');
const aiR = require('./routes/ai');
const toolsR = require('./routes/tools');
const serverR = require('./routes/server');
const searchR = require('./routes/search');
const animeR = require('./routes/anime');
const islamicR = require('./routes/islamic');
const downloaderR = require('./routes/downloader');
const ephotoR = require('./routes/ephoto360');
const flamingtextR = require('./routes/flamingtext');
const beritaR = require('./routes/berita');
const primbonR = require('./routes/primbon');
const authR = require('./routes/auth');

// Use Routers
app.use('/', indexR);
app.use('/ai', aiR);
app.use('/tools', toolsR);
app.use('/server', serverR);
app.use('/search', searchR);
app.use('/anime', animeR);
app.use('/islamic', islamicR);
app.use('/downloader', downloaderR);
app.use('/ephoto360', ephotoR);
app.use('/flamingtext', flamingtextR);
app.use('/berita', beritaR);
app.use('/primbon', primbonR);
app.use('/auth', authR);

const PORT = process.env.PORT || 1001;
app.listen(PORT, () => {
    console.log(`C> The server is running on port ${PORT}`);
});
