const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        const criteria = _buildCriteria(filterBy)
        const collection = await dbService.getCollection('gig')
        const gigs = await collection.find(criteria).toArray()
        return gigs
    } catch (err) {
        logger.error('cannot find gigs', err)
        throw err
    }

}

async function remove(gigId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('gig')
        // remove only if user is owner/admin
        const criteria = { _id: ObjectId(gigId) }
        if (!isAdmin) criteria.byUserId = ObjectId(userId)
        await collection.deleteOne(criteria)
    } catch (err) {
        logger.error(`cannot remove gig ${gigId}`, err)
        throw err
    }
}


async function add(gig) {
    try {
        const gigToAdd = {
            byUserId: ObjectId(gig.byUserId),
            aboutUserId: ObjectId(gig.aboutUserId),
            txt: gig.txt
        }
        const collection = await dbService.getCollection('gig')
        await collection.insertOne(gigToAdd)
        return gigToAdd;
    } catch (err) {
        logger.error('cannot insert gig', err)
        throw err
    }
}

function _buildCriteria(filterBy) {
    const criteria = {}
    if (filterBy.byUserId) criteria.byUserId = filterBy.byUserId
    return criteria
}

module.exports = {
    query,
    remove,
    add
}


