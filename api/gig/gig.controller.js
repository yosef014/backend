const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const gigService = require('./gig.service')

async function getGigs(req, res) {
    try {
        const gigs = await gigService.query(req.query)
        res.send(gigs)
    } catch (err) {
        logger.error('Cannot get gigs', err)
        res.status(500).send({ err: 'Failed to get gigs' })
    }
}

async function deleteGig(req, res) {
    try {
        await gigService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete gig', err)
        res.status(500).send({ err: 'Failed to delete gig' })
    }
}


async function addGig(req, res) {
    try {
        var gig = req.body
        gig.byUserId = req.session.user._id
        gig = await gigService.add(gig)
        
        // prepare the updated gig for sending out
        gig.aboutUser = await userService.getById(gig.aboutUserId)
        
        // Give the user credit for adding a gig
        var user = await userService.getById(gig.byUserId)
        user.score += 10;
        user = await userService.update(user)
        gig.byUser = user
        const fullUser = await userService.getById(user._id)

        console.log('CTRL SessionId:', req.sessionID);
        socketService.broadcast({type: 'gig-added', data: gig, userId: gig.byUserId})
        socketService.emitToUser({type: 'gig-about-you', data: gig, userId: gig.aboutUserId})
        socketService.emitTo({type: 'user-updated', data: fullUser, label: fullUser._id})

        res.send(gig)

    } catch (err) {
        console.log(err)
        logger.error('Failed to add gig', err)
        res.status(500).send({ err: 'Failed to add gig' })
    }
}

module.exports = {
    getGigs,
    deleteGig,
    addGig
}