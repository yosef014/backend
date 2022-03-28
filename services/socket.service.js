const { emit } = require('nodemon');
const asyncLocalStorage = require('./als.service');
const logger = require('./logger.service');

var gIo = null

function connectSockets(http, session) {
    gIo = require('socket.io')(http, {
        cors: {
            origin: '*',
        }
    })
    gIo.on('connection', socket => {
        console.log('New socket', socket.id)
        socket.on('disconnect', socket => {
            console.log('Someone disconnected')
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
            emitToUser({ type:'Notefication orderAdded', data:'', userId: ownerUser._id })

        })
        socket.on('chat newMsg', msg => {
            chatToUser({data: msg, userId: '623d16828fc7fd17d4b7bac2' })
            // socket.broadcast.to(socket.myTopic).emit('chat addMsg', msg)

        })
        socket.on('chat typing', ({ username, isDoneTyping = false }) => {
            console.log('broadcasting chat typing');
            broadcast({ type: 'chat userTyping', data: { username, isDoneTyping }, room: socket.myTopic, userId: socket.userId })
        })
        socket.on('chat typing', ({ username, isDoneTyping = false }) => {
            console.log('isDoneTyping', isDoneTyping);
            socket.broadcast.to(socket.myTopic).emit('chat test', { username, isDoneTyping })

        })
        socket.on('user-watch', userId => {
            socket.join('watching:' + userId)
        })
        socket.on('set-user-socket', userId => {
            logger.debug(`Setting (${socket.id}) socket.userId = ${userId}`)
            socket.userId = userId
        })
        socket.on('unset-user-socket', () => {
            delete socket.userId
        })

    })
}

function emitTo({ type, data, label }) {
    if (label) gIo.to('watching:' + label).emit(type, data)
    else gIo.emit(type, data)
}
async function chatToUser({ data, userId }){
    const socket = await _getUserSocket(userId)
    if (socket){
        socket.myTopic = userId
        console.log('mehubarrrrrrrrrrrrr');
        socket.broadcast.to(socket.myTopic).emit('chat addMsg', data)
    }else{
        console.log('lo mehubarrrrrrrrrrrrr');
        emitToUser({ type:'chat newMsgNotefication', data:data, userId: userId })


    }

    

 }

async function emitToUser({ type, data, userId }) {
    logger.debug('Emiting to user socket: ' + userId)
    const socket = await _getUserSocket(userId)
    if (socket) {
        socket.emit(type, data)}
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