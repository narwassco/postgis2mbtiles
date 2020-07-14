const fs = require('fs');
const execSync = require('child_process').execSync;
const {postgis2geojson} = require('@watergis/postgis2geojson');

module.exports = class postgis2mbtiles{
    constructor(config){
        this.config = config;
    }

    run(){
        return new Promise((resolve, reject) =>{
            const pg2json = new postgis2geojson(this.config);
            pg2json.run()
            .then(data=>{return this.createMbtiles(data, this.config.mbtiles)})
            .then(res=>{
                resolve(res);
            }).catch(err=>{
                reject(err);
            })
        });
    }

    createMbtiles(geojson, mbtiles){
        return new Promise((resolve, reject) =>{
            if (fs.existsSync(mbtiles)){
                fs.unlinkSync(mbtiles);
            }
            const cmd = `tippecanoe -rg -z${this.config.maxzoom} -Z${this.config.minzoom} -o ${mbtiles} ${geojson.join(' ')}`;
            execSync(cmd).toString();
            geojson.forEach(f=>{
                fs.unlinkSync(f);
            });
            console.log(`Creating voctor tile was done successfully at ${mbtiles}`)
            resolve(mbtiles);
        });
    }
}