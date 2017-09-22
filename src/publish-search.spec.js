'use strict';

const mock = require('mock-require');
const fs = require('fs-extra');

describe('Publish Search', () => {
  let publishSearch;
  const config = {
    appSettings: {
      stache: {
        searchConfig: {
          allowSiteToBeSearched: false
        }
      }
    }
  };

  beforeEach(() => {  
    mock('./error-handler', function(error) {
      console.log(error);
    });

    mock('fs-extra', {
      existsSync: function (filePath) {
        console.log(`${filePath} exists!`);
        return true;
      },
      readJsonSync: function (filePath) {
        console.log(`${filePath} found!`);
        return {
          test: "Some Example JSON"
        };
      }
    });

    mock('request', function (options, callback) {
      console.log(options.headers.Authorization);
      console.log(options.body);
      console.log(options.uri);
      callback(null, {statusCode: 200});
    });

    mock('path', {
      join: function () {
        console.log('We have a path!');
        return './src/stache/search.json';
      }
    });

    process.env.searchEndpoint = "https://localhost:5000/publisher";
    process.env.token = "thisisatoken";
    publishSearch = mock.reRequire('./publish-search');
    config.appSettings.stache.searchConfig.allowSiteToBeSearched = true;
  });

  it('should do nothing if search is false', () => {
    config.appSettings.stache.searchConfig.allowSiteToBeSearched = false;
    spyOn(fs, 'existsSync');
    publishSearch([], config);
    expect(fs.existsSync).not.toHaveBeenCalled();
  });

  it('should exit if search is undefined', () => {
    config.appSettings.stache.searchConfig.allowSiteToBeSearched = false;
    spyOn(fs, 'existsSync');
    publishSearch([], undefined);
    publishSearch([], {});
    publishSearch([], {
      appSettings: {}
    });
    publishSearch([], {
      appSettings: {
        stache: {}
      }
    });
    publishSearch([], {
      appSettings: {
        stache: {
          searchConfig: {}
        }
      }
    });
    expect(fs.existsSync).not.toHaveBeenCalled();
  });

  it('should error if no search json file is found', () => {
    mock('fs-extra', {
      existsSync: function () {
        console.log('Does not exist!');
        return false;
      }
    });
    publishSearch = mock.reRequire('./publish-search');
    spyOn(console, 'log');
    publishSearch([], config);
    expect(console.log).toHaveBeenCalledWith(new Error('[ERROR]: Search json file does not exist!'));
    expect(console.log).toHaveBeenCalledWith('Does not exist!');
  });

  it('should error if an endpoint is not provided', () => {
    delete process.env.searchEndpoint;
    publishSearch = mock.reRequire('./publish-search');
    spyOn(console, 'log');
    publishSearch([], config);
    expect(console.log).toHaveBeenCalledWith(new Error('[ERROR]: An endpoint is required to publish stache search data!'));
  });

  it('should error if a token is not provided', () => {
    delete process.env.token;
    publishSearch = mock.reRequire('./publish-search');
    spyOn(console, 'log');
    publishSearch([], config);

    expect(console.log).toHaveBeenCalledWith(new Error('[ERROR]: A token is required to publish stache search data!'));
  });

  it('should post the json file to the database', () => {
    spyOn(console, 'log');
    publishSearch([], config);
    expect(console.log).toHaveBeenCalledWith(process.env.searchEndpoint);
    expect(console.log).toHaveBeenCalledWith(`Bearer ${process.env.token}`);
    expect(console.log).toHaveBeenCalledWith(JSON.stringify({ test: "Some Example JSON" }));
    expect(console.log).toHaveBeenCalledWith('200: Search data successfully posted!');
  });

  it('should throw an error if file post unsuccessful', () => {
    mock('request', function (options, callback) {
      callback({message: 'ERROR!'});
    });
    publishSearch = mock.reRequire('./publish-search');
    spyOn(console, 'log');
    publishSearch([], config);
    expect(console.log).toHaveBeenCalledWith(new Error('[ERROR]: Unable to post search data! ERROR!'));
  });

  it('should throw an error if unable to read search json file', () => {
    mock('fs-extra', {
      existsSync: function (filePath) {
        console.log(`${filePath} exists!`);
        return true;
      },
      readJsonSync: function () {
        throw new Error('It is broken!');
      }
    });
    publishSearch = mock.reRequire('./publish-search');
    spyOn(console, 'log');
    publishSearch([], config);
    expect(console.log).toHaveBeenCalledWith(new Error('[ERROR]: Unable to read search file at ./src/stache/search.json! It is broken!'));
  });

});
