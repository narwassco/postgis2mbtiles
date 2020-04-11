const { Pool } = require('pg')
const fs = require('fs');

module.exports = class postgis2geojson{
    constructor(config){
        this.config = config;
        this.pool = new Pool(config.db);
    }

    async run(){
        const client = await this.pool.connect();
        try{
            await this.dump(client);
        }finally{
            client.release();
        }
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
            stream.then(async res=>{
                const json = JSON.stringify(res.rows[0].json, null, 4);
                await writeStream.write(json);
                resolve(layer.geojsonFileName);
            }).catch(err=>{
                reject(err);
            })
        });
    }

    async dump(client){
        const layers = this.config.layers;
        let promises = [];
        layers.forEach(layer=>{
            promises.push(this.createGeojson(client, layer));
        })
        await Promise.all(promises).then(data=>{
            if (data && data.length > 0){
                console.log(data);
            }
        }).catch(err=>{
            console.log(err);
        });
    }
}