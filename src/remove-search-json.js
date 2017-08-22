// remove search json blob after publication

const fs = require('fs');
const path = require('path');

function removeSearchJsonFileFromProject(argv, config) {
    if (config.appSettings.search) {
        try {
            let filePath = path.join(process.cwd(), 'src', 'stache', 'search', 'search.json');
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                fs.rmdirSync(filePath.slice(0, -11));
            }
        } catch (error) {
            console.log(error);
            throw new Error('[ERROR]: Unable to remove stache search directory.');
        }
    }
}

module.exports = removeSearchJsonFileFromProject;