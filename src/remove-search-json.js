'use strict';

const fs = require('fs-extra');
const path = require('path');

function removeSearchJsonFileFromProject(argv, config) {
  if (config &&
      config.appSettings &&
      config.appSettings.stache &&
      config.appSettings.stache.searchConfig &&
      config.appSettings.stache.searchConfig.allowSiteToBeSearched) {
    try {
      let filePath = path.join(process.cwd(), 'src', 'stache', 'search', 'search.json');
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        fs.rmdirSync(filePath.slice(0, -11));
      }
    } catch (error) {
      throw new Error('[ERROR]: Unable to remove stache search directory.');
    }
  }
}

module.exports = removeSearchJsonFileFromProject;
