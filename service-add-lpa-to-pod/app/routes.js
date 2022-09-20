const express = require('express')
const router = express.Router()

require('./routes/hack-day.js')(router);

module.exports = router
