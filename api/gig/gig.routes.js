const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {getGig, getGigs, deleteGig, updateGig} = require('./gig.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getGigs)
router.get('/:id', getGig)
router.put('/:id', requireAuth,  updateGig)

// router.put('/:id',  requireAuth, updateGig)
router.delete('/:id',  requireAuth, requireAdmin, deleteGig)

module.exports = router