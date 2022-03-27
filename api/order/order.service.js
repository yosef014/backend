const dbService = require("../../services/db.service");
const logger = require("../../services/logger.service");
const reviewService = require("../review/review.service");
const ObjectId = require("mongodb").ObjectId;

module.exports = {
  query,
  getById,
  getByOrdername,
  remove,
  update,
  add,
};

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy);
  try {
    const collection = await dbService.getCollection("order");
    var orders = await collection.find(criteria).toArray();

    // orders = orders.map(order => {
    //     delete order.password
    //     order.createdAt = ObjectId(order._id).getTimestamp()
    //     // Returning fake fresh data
    //     // order.createdAt = Date.now() - (1000 * 60 * 60 * 24 * 3) // 3 days ago
    //     return order
    // })
    return orders;
  } catch (err) {
    logger.error("cannot find orders", err);
    throw err;
  }
}

async function getById(orderId) {
  try {
    const collection = await dbService.getCollection("order");
    const order = await collection.findOne({ _id: ObjectId(orderId) });
    delete order.password;

    order.givenReviews = await reviewService.query({
      byOrderId: ObjectId(order._id),
    });
    order.givenReviews = order.givenReviews.map((review) => {
      delete review.byOrder;
      return review;
    });

    return order;
  } catch (err) {
    logger.error(`while finding order ${orderId}`, err);
    throw err;
  }
}
async function getByOrdername(ordername) {
  try {
    const collection = await dbService.getCollection("order");
    const order = await collection.findOne({ ordername });
    return order;
  } catch (err) {
    logger.error(`while finding order ${ordername}`, err);
    throw err;
  }
}

async function remove(orderId) {
  try {
    const collection = await dbService.getCollection("order");
    await collection.deleteOne({ _id: ObjectId(orderId) });
  } catch (err) {
    logger.error(`cannot remove order ${orderId}`, err);
    throw err;
  }
}

async function update(order) {
  try {
    // peek only updatable fields!
    const orderToSave = {
      _id: ObjectId(order._id), // needed for the returnd obj
      ordername: order.ordername,
      fullname: order.fullname,
      score: order.score,
    };
    const collection = await dbService.getCollection("order");
    await collection.updateOne({ _id: orderToSave._id }, { $set: orderToSave });
    return orderToSave;
  } catch (err) {
    logger.error(`cannot update order ${order._id}`, err);
    throw err;
  }
}

async function add(order) {
  try {
    console.log(order);
    // peek only updatable fields!
    const orderToAdd = {
      createdAt:order.createdAt,
      imgUrl:order.imgUrl,
      description:order.description,
      title:order.title,
      buyer: order.buyer,
      seller: order.seller,
      gig: order.gig,
      status:order.status,
    };
    const collection = await dbService.getCollection("order");
    await collection.insertOne(orderToAdd);
    return orderToAdd;
  } catch (err) {
    logger.error("cannot insert order", err);
    throw err;
  }
}

function _buildCriteria(filterBy) {
  const criteria = {};
  if (filterBy.txt) {
    const txtCriteria = { $regex: filterBy.txt, $options: "i" };
    criteria.$or = [
      {
        ordername: txtCriteria,
      },
      {
        fullname: txtCriteria,
      },
    ];
  }
  if (filterBy.minBalance) {
    criteria.score = { $gte: filterBy.minBalance };
  }
  return criteria;
}
