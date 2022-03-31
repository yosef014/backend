const { emit } = require('nodemon');
const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

const usersLogin = [];
function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        socket.userId = socket.id
        console.log('New socket', socket.id)
        socket.on('disconnect', () => {
        const foundSocket = usersLogin.findIndex(mySocket => mySocket.socketId === socket.id)
            if(foundSocket !== -1){
                usersLogin.splice(foundSocket, 1);
            }
        })
        socket.on('chat topic', topic => {
            if (socket.myTopic === topic) return;
            if (socket.myTopic) {
                socket.leave(socket.myTopic)
            }
            socket.join(topic)
            socket.myTopic = topic
        })
        socket.on('newOrderAded', ownerUser => {
             gIo.emit('Notefication orderAdded', ownerUser)
            // emitToUser({ type:'Notefication orderAdded', data:'', userId: ownerUser._id })
        })
        socket.on('statusChanged', order => {
            // gIo.emit('Notefication statusChanged' , order.status)
            broadcast({ type:'Notefication statusChanged', data:'yosef', userId: order.seller._id })
        })
        
        socket.on('user-watch', userId => {
            socket.join('watching:' + userId)
        })
        socket.on('set-user-socket', userId => {
            logger.debug(`Setting (${socket.id}) socket.userId = ${userId}`)
            socket.userId = userId
            usersLogin.push({socketId: socket.id, userId: userId})
        })
        socket.on('unset-user-socket', () => {
            const foundSocket = usersLogin.findIndex(mySocket => mySocket.socketId === socket.id)

            if(foundSocket !== -1){
                usersLogin.splice(foundSocket, 1);
            }

            delete socket.userId
        })

    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}



async function emitToUser({ type, data, userId }) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = await _getUserSocket(userId)
    if (socket) socket.emit(type, data)
    else {
        console.log('User socket not found');
        _printSockets();
    }
}

// Send to all sockets BUT not the current socket
async function broadcast({ type, data, room = null, userId }) {
    console.log('BROADCASTING', JSON.stringify(arguments));
    const excludedSocket = await _getUserSocket(userId)
    if (!excludedSocket) {

        return;
    }
    logger.debug('broadcast to all but user: ', userId)
    if (room) {
        excludedSocket.broadcast.to(room).emit(type, data)
    } else {
        excludedSocket.broadcast.emit(type, data)
    }
}

async function _getUserSocket(userId) {
    const sockets = await _getAllSockets();
    const socket = sockets.find(s => s.userId == userId)
    return socket;
}
async function _getAllSockets() {
    const sockets = await gIo.fetchSockets();
    return sockets;
}

async function _printSockets() {
    const sockets = await _getAllSockets()
    console.log(`Sockets: (count: ${sockets.length}):`)
    sockets.forEach(_printSocket)
}
function _printSocket(socket) {
    console.log(`Socket - socketId: ${socket.id} userId: ${socket.userId}`)
}

module.exports = {
    connectSockets,
    emitTo,
    emitToUser,
    broadcast,
}
