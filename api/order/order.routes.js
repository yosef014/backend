const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {getOrder, getOrders, deleteOrder, updateOrder} = require('./order.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getOrders)
router.get('/:id', getOrder)
router.put('/:id', requireAuth,  updateOrder)

// router.put('/:id',  requireAuth, updateOrder)
router.delete('/:id',  requireAuth, requireAdmin, deleteOrder)

module.exports = router