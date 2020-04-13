const postgis2geojson = require('../index');
const config = require('./config');

const example = async() =>{
    const pg2json = new postgis2geojson(config);
    const result = await pg2json.run();
    console.log(result);
};

module.exports = example();