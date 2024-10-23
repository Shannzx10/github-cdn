const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const { exec } = require('child_process');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Konfigurasi multer untuk menyimpan file sementara
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Endpoint untuk menyajikan halaman HTML
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Fungsi untuk menjalankan perintah shell
const runCommand = (command) => {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(`Error: ${error.message}`);
            }
            if (stderr) {
                reject(`Stderr: ${stderr}`);
            }
            resolve(stdout);
        });
    });
};

// Endpoint untuk meng-upload file
app.post('/upload', upload.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    const fileName = req.file.originalname;
    const fileContent = req.file.buffer.toString('base64');

    try {
        // Meng-upload file ke GitHub
        const response = await axios.put(
            `https://api.github.com/repos/${process.env.GITHUB_REPO}/contents/${fileName}`,
            {
                message: `Upload file ${fileName}`,
                content: fileContent,
            },
            {
                headers: {
                    Authorization: `token ${process.env.GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        // Membangun URL untuk mengakses gambar
        const imageUrl = `https://raw.githubusercontent.com/${process.env.GITHUB_REPO}/main/${fileName}`;

        // Menjalankan perintah Git LFS untuk menambahkan file ke LFS
        await runCommand(`git lfs track "${fileName}" && git add .gitattributes && git add "${fileName}" && git commit -m "Menambahkan file ${fileName} ke LFS" && git push origin main`);

        // Kirim respons setelah semua proses selesai
        res.status(200).json({
            message: 'File uploaded successfully',
            url: imageUrl,
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error uploading file to GitHub or adding to LFS.');
    }
});

// Menjalankan server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
