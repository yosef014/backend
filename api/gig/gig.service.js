
const { log } = require('../../middlewares/logger.middleware')
const dbService = require('../../services/db.service')
const logger = require('../../services/logger.service')
const reviewService = require('../review/review.service')
const ObjectId = require('mongodb').ObjectId

module.exports = {
    query,
    getById,
    getByGigname,
    remove,
    update,
    add
}

async function query(filterBy = {}) {
    const criteria = _buildCriteria(filterBy)
    try {
        const collection = await dbService.getCollection('gig')
        var gigs = await collection.find(criteria).toArray()
        
        // gigs = gigs.map(gig => {
        //     delete gig.password
        //     gig.createdAt = ObjectId(gig._id).getTimestamp()
        //     // Returning fake fresh data
        //     // gig.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
        //     return gig
        // })
        return gigs
    } catch (err) {
        logger.error('cannot find gigs', err)
        throw err
    }
}

async function getById(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        const gig = await collection.findOne({ _id: ObjectId(gigId) })
        delete gig.password

        gig.givenReviews = await reviewService.query({ byGigId: ObjectId(gig._id) })
        gig.givenReviews = gig.givenReviews.map(review => {
            delete review.byGig
            return review
        })

        return gig
    } catch (err) {
        logger.error(`while finding gig ${gigId}`, err)
        throw err
    }
}
async function getByGigname(gigname) {
    try {
        const collection = await dbService.getCollection('gig')
        const gig = await collection.findOne({ gigname })
        return gig
    } catch (err) {
        logger.error(`while finding gig ${gigname}`, err)
        throw err
    }
}

async function remove(gigId) {
    try {
        const collection = await dbService.getCollection('gig')
        await collection.deleteOne({ '_id': ObjectId(gigId) })
    } catch (err) {
        logger.error(`cannot remove gig ${gigId}`, err)
        throw err
    }
}

async function update(gig) {
    try {
        // peek only updatable fields!
        // const gigToSave = {
        //     _id: ObjectId(gig._id), // needed for the returnd obj
        //     gigname: gig.gigname,
        //     fullname: gig.fullname,
        //     score: gig.score,
        // }
        const gigId = ObjectId(gig._id)
        delete gig._id
        // console.log(gig);
        const collection = await dbService.getCollection('gig')
        await collection.updateOne({ _id: gigId }, { $set: {...gig} })
        return gig;
    } catch (err) {
        logger.error(`cannot update gig ${gig._id}`, err)
        throw err
    }
}

async function add(gig) {
    try {
        // peek only updatable fields!
        // const gigToAdd = {
        //     gigname: gig.gigname,
        //     password: gig.password,
        //     fullname: gig.fullname,
        //     score: 100
        // }
        const collection = await dbService.getCollection('gig')
        await collection.insertOne(gig)
        return gig
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.txt) {
        const txtCriteria = { $regex: filterBy.txt, $options: 'i' }
        criteria.$or = [
            {
                gigname: txtCriteria
            },
            {
                fullname: txtCriteria
            }
        ]
    }
    if (filterBy.minBalance) {
        criteria.score = { $gte: filterBy.minBalance }
    }
    return criteria
}




