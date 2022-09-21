// Local dependencies
const server = require('./server.js')
const config = require('./app/config.js')
const utils = require('./lib/utils.js')
const { enabled, issuer } = require("./app/evernym.js");

// Set up configuration variables
var useBrowserSync = config.useBrowserSync.toLowerCase()
var env = (process.env.NODE_ENV || 'development').toLowerCase()

utils.findAvailablePort(server, function(port) {
    console.log('Listening on port ' + port + '   url: http://localhost:' + port)
    if (env === 'production' || useBrowserSync === 'false') {
        server.listen(port)
        if (enabled()) {
            setTimeout(() => issuer(), 10000);
        }
    } else {
        server.listen(port, function() {
            if (enabled()) {
                issuer();
            }
        })
    }
})
