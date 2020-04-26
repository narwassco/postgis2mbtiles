const { Pool } = require('pg')
const fs = require('fs');

module.exports = class postgis2geojson{
    constructor(config){
        this.config = config;
        this.pool = new Pool(config.db);
    }

    async run(){
        const client = await this.pool.connect();
        let res;
        try{
            await this.dump(client)
            .then(data=>{
                res = data;
            }).catch(err=>{
                console.log(err);
            });
        }finally{
            client.release();
        }
        return res;
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
                // res.rows[0].json.features.forEach(feature=>{
                //     writeStream.write(JSON.stringify(feature) + "\n");
                // })
                const json = JSON.stringify(res.rows[0].json);
                writeStream.write(json);
                resolve(layer.geojsonFileName);
            }).catch(err=>{
                reject(err);
            })
        });
    }

    dump(client){
        const layers = this.config.layers;
        let promises = [];
        layers.forEach(layer=>{
            promises.push(this.createGeojson(client, layer));
        })
        return Promise.all(promises);
    }
}