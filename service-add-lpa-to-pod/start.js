// Core dependencies
const path = require('path')
const fs = require('fs')

// Check for node_modules before running
const checkFiles = require('./lib/build/check-files').checkFiles
checkFiles()

// Local dependencies
const { buildWatchAndServe } = require('./lib/build/tasks')
const { projectDir } = require('./lib/utils')

function createSessionDataDefaults () {
// Create template session data defaults file if it doesn't exist
  const dataDirectory = path.join(projectDir, '/app/data')
  const sessionDataDefaultsFile = path.join(dataDirectory, '/session-data-defaults.js')
  const sessionDataDefaultsFileExists = fs.existsSync(sessionDataDefaultsFile)

  if (!sessionDataDefaultsFileExists) {
    console.log('Creating session data defaults file')
    if (!fs.existsSync(dataDirectory)) {
      fs.mkdirSync(dataDirectory)
    }

    fs.createReadStream(path.join(__dirname, '/lib/template.session-data-defaults.js'))
      .pipe(fs.createWriteStream(sessionDataDefaultsFile))
  }
}

(async () => {
  createSessionDataDefaults()
  await buildWatchAndServe()
})()
