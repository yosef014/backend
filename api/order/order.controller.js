const orderService = require("./order.service");
const socketService = require("../../services/socket.service");
const logger = require("../../services/logger.service");

async function getOrder(req, res) {
  try {
    const order = await orderService.getById(req.params.id);
    res.send(order);
  } catch (err) {
    logger.error("Failed to get order", err);
    res.status(500).send({ err: "Failed to get order" });
  }
}

async function getOrders(req, res) {
  try {
    const filterBy = {
      txt: req.query?.txt || "",
      minBalance: +req.query?.minBalance || 0,
    };
    const orders = await orderService.query(filterBy);
    res.send(orders);
  } catch (err) {
    logger.error("Failed to get orders", err);
    res.status(500).send({ err: "Failed to get orders" });
  }
}

async function deleteOrder(req, res) {
  try {
    await orderService.remove(req.params.id);
    res.send({ msg: "Deleted successfully" });
  } catch (err) {
    logger.error("Failed to delete order", err);
    res.status(500).send({ err: "Failed to delete order" });
  }
}
async function addOrder(req, res) {
  try {
    const order = req.body;
    // order.byUserId = req.session.user._id;
    const addedOrder = await orderService.add(order);
    res.json(addedOrder);
  } catch (err) {
    logger.error("Failed to add toy", err);
    res.status(500).send({ err: "Failed to add toy" });
  }
}

async function updateOrder(req, res) {
  try {
    const order = req.body;
    console.log(order);
    const savedOrder = await orderService.update(order);
    res.send(savedOrder);
  } catch (err) {
    logger.error("Failed to update order", err);
    res.status(500).send({ err: "Failed to update order" });
  }
}

module.exports = {
  getOrder,
  getOrders,
  deleteOrder,
  updateOrder,
  addOrder,
};
