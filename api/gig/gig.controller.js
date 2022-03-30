const gigService = require('./gig.service')
// const socketService = require('../../services/socket.service')
const logger = require('../../services/logger.service')

async function getGig(req, res) {
    try {
        const gig = await gigService.getById(req.params.id)
        res.send(gig)
    } catch (err) {
        logger.error('Failed to get gig', err)
        res.status(500).send({ err: 'Failed to get gig' })
    }
}

async function getGigs(req, res) {
    try {
        const filterBy = {

            seller: req.query?.seller || '',
            price: req.query?.price || '',
            sortBy: req.query?.sortBy || '',
            level: req.query?.level || false,
        }
        const gigsBeforeFilter = await gigService.query(filterBy)
        let gigs = _filterGigs(gigsBeforeFilter, filterBy)
        res.send(gigs)
    } catch (err) {
        logger.error('Failed to get gigs', err)
        res.status(500).send({ err: 'Failed to get gigs' })
    }
}

function _filterGigs(gigsBeforeFilter, filterBy) {
    var gigs = gigsBeforeFilter
    let filteredGigs = []
    // filter by tittle
    const regex = new RegExp(filterBy.seller, 'i')
    filteredGigs = gigs.filter((gig) => regex.test(gig.owner.username))
  
    //filter by inStock
    if (filterBy.price) {
        // filteredGigs = filteredGigs.filter((gig) => (gig.price> filterBy.price[0] && gig.price<filterBy.price[1]))
        filteredGigs = filteredGigs.filter((gig) => ( filterBy.price >= gig.price))
    }
  
    //filter by labels
    // if (filterBy.labels.length) {
    //   filteredToys = filteredToys.filter((toy) => {
    //     return toy.labels.some((label) => filterBy.labels.includes(label))
    //   })
    // }
  
    //sorting
    if (filterBy.sortBy) {
      if (filterBy.sortBy === 'rate')
      filteredGigs = filteredGigs.sort((g1, g2) => g2.rate - g1.rate);
      else if (filterBy.sortBy === 'Price')
      filteredGigs = filteredGigs.sort((g1, g2) => g1.price - g2.price);
      else if (filterBy.sortBy === 'Name')
      filteredGigs = filteredGigs.sort((g1, g2) => {
          return tg.title.toLowerCase() > g2.title.toLowerCase() ? 1 : -1;
        });
    }
    if(filterBy.level === 'true'){
        filteredGigs =  filteredGigs.filter((gig)=> gig.level === "level 3 seller") 
    } 
    // if(filterBy.page){
    //     startIdx = filterBy.page * PAGE_SIZE
    //     cars = cars.slice(startIdx, startIdx + PAGE_SIZE)
    // }
  
    return filteredGigs
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

async function updateGig(req, res) {
    try {
        const gig = req.body
        const savedGig = await gigService.update(gig)
        res.send(savedGig)
    } catch (err) {
        logger.error('Failed to update gig', err)
        res.status(500).send({ err: 'Failed to update gig' })
    }
}
async function add(req, res) {
    try {
        const gig = req.body
        const addedGig = await gigService.add(gig)
        res.json(addedGig)
    } catch (err) {
        logger.error('Failed to add gig', err)
        res.status(500).send({ err: 'Failed to add gig' })
    }


}

module.exports = {
    getGig,
    getGigs,
    deleteGig,
    updateGig,
    add,
}