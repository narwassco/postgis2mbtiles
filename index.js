const { Pool } = require('pg')
const fs = require('fs');
const execSync = require('child_process').execSync;

module.exports = class postgis2geojson{
    constructor(config){
        this.config = config;
        this.pool = new Pool(config.db);
    }

    run(){
        return new Promise((resolve, reject) =>{
            this.dump().then(data=>{return this.createMbtiles(data, this.config.mbtiles)})
            .then(res=>{
                resolve(res);
            }).catch(err=>{
                reject(err);
            });
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

    createGeojson(client, layer){
        return new Promise((resolve, reject) =>{
            if (!client){
                reject('No pg client.');
            }
            const writeStream = fs.createWriteStream(layer.geojsonFileName);
            writeStream.on('error', err=>{
                reject(err);
            })
            if (!layer.select){
                reject('No SQL of select statement for this layer.');
            }
            const stream = client.query(layer.select);
            stream.then(res=>{
                const json = JSON.stringify(res.rows[0].json);
                writeStream.write(json);
                resolve(layer.geojsonFileName);
            }).catch(err=>{
                reject(err);
            })
        });
    }

    async dump(){
        const client = await this.pool.connect();
        try{
            const layers = this.config.layers;
            let promises = [];
            layers.forEach(layer=>{
                promises.push(this.createGeojson(client, layer));
            })
            return Promise.all(promises);
        }finally{
            client.release();
        }
    }
}