const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {log} = require('../../middlewares/logger.middleware')
const {addGig, getGigs, deleteGig} = require('./gig.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', log, getGigs)
router.post('/',  log, requireAuth, addGig)
router.delete('/:id',  requireAuth, deleteGig)

module.exports = router