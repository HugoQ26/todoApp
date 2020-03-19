const express = require('express');
const app = express();
const path = require('path');
const socket = require('socket.io');
const cors = require('cors');

const PORT = process.env.PORT || 8000;

app.use(cors());

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

app.use((req, res) => {
  res.status(404).send('You typed wrong address');
});

const server = app.listen(PORT, () => {
  console.log('Server is listening on port ' + PORT);
});

const io = socket(server);

let tasks = [];

io.on('connection', socket => {
  console.log('New member ' + socket.id + ' conected');
  io.emit('updateData', tasks);

  socket.on('addTask', task => {
    tasks.push(task);
    io.emit('updateData', tasks);
  });

  socket.on('removeTask', id => {
    tasks = tasks.filter(task => task.id != id);
    io.emit('updateData', tasks);
  });

  socket.on('editTask', ({ id, text }) => {
    console.log(id, text);
    tasks = tasks.map(task => (task.id == id ? { id, name: text } : task));

    io.emit('updateData', tasks);
  });

  socket.on('disconnect', () => {
    console.log('Oh, socket ' + socket.id + ' has left');
  });
});
