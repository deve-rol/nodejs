const express = require('express');
const path = require('path');
const indexRouter = require('./routes/index');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const PORT = 3000;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Use the router for handling routes
app.use('/', indexRouter);

// Catch-all route for handling 404 errors
app.use((req, res, next) => {
    res.status(404).sendFile(path.join(__dirname, 'views', '404.html'));
});

// Создаём HTTP сервер на базе Express
const server = http.createServer(app);

// Привязываем WebSocket к этому серверу
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('Client connected');

    ws.on('message', (data) => {
        // Ретрансляция другим клиентам
        wss.clients.forEach(client => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(data);
            }
        });
    });

    ws.on('close', () => console.log('Client disconnected'));
});

// Запуск сервера
server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
