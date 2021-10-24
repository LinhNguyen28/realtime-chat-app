const express = require('express')
const socketio = require('socket.io')
const http = require('http')
const path = require('path')
const { generateMessage, generateLocationMsg } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

port = process.env.PORT || 3000
app.use(express.static(path.join(__dirname, "../public")))

io.on('connection', (socket) => {

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })
        if (error) {
            return callback(error)
        }
        socket.join(user.room)
        socket.emit("message", generateMessage("ADMIN", "Welcome!"))

        socket.broadcast.to(user.room).emit("message", generateMessage("ADMIN", `${user.username} has joined`))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on("sendMessage", (msg, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return callback("User not found!")
        }
        io.to(user.room).emit("message", generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', ({ latitude, longitude }, callback) => {
        const user = getUser(socket.id)
        if (!user) {
            return callback("User not found!")
        }
        io.to(user.room).emit("location",
            generateLocationMsg(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            io.to(user.room).emit("message", generateMessage("ADMIN", `${user.username} has left`))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log("Server is running at ", port)
})