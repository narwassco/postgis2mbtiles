const postgis2geojson = require('../index');
const config = require('./config');

const example = async() =>{
    pg2json = new postgis2geojson(config);
    await pg2json.run();
};

module.exports = example();