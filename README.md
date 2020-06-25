# postgis2geojson
![GitHub](https://img.shields.io/github/license/narwassco/postgis2geojson)
![Docker Cloud Automated build](https://img.shields.io/docker/cloud/automated/narwassco/postgis2geojson)
![Docker Image Size (latest by date)](https://img.shields.io/docker/image-size/narwassco/postgis2geojson)
[![Gitter](https://badges.gitter.im/narwassco/community.svg)](https://gitter.im/narwassco/community?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

A module extracting the data from PostGIS to Geojson.

I created this module because I wanted to extract PostGIS data as GeoJSON format in order to use it for Mapbox Vector Tile.

After using this module to extract your data, you can upload GeoJSON data to [Mapbox Studio](https://studio.mapbox.com) as a Tileset.

Then, you can create style file for your vector tile and enjoy it!

## Preparation
This module uses [`tippecanoe`](https://github.com/mapbox/tippecanoe) to convert geojson files to mbtiles. Please make sure to install it before running.

for MacOS
```
$ brew install tippecanoe
```

for Ubuntu
```
$ git clone https://github.com/mapbox/tippecanoe.git
$ cd tippecanoe
$ make -j
$ make install
```


## Installation

```sh
$ npm install JinIgarashi/postgis2geojson
```

or

```sh
$ git clone https://github.com/JinIgarashi/postgis2geojson.git
$ cd postgis2geojson
$ npm install
```

## Example

```
$ npm run example
```

## Usage
See also [example.js](./example/example.js)
```js
const postgis2geojson = require('postgis2geojson');
const config = require('./config');

const pg2json = new postgis2geojson(config);
pg2json.run().then(res=>{
        console.log(res);
}).catch(err=>{
    console.log(err);
})
```
This module will return MBTiles file paths which are exported in your directory.


## Configuration

### Dababase Connection
Please put your PostGIS database settings as follow under `config.js`.
```js
db: {
    user:'postgres',
    password:'Your password',
    host:'localhost',
    post:5432,
    database:'narwassco',
},
```

### mbtiles's Setting
```js
mbtiles: __dirname + '/narok.mbtiles',
```

### Layers' Setting
```js
layers: [
    //Put your layer definition here.
    ]
```

Each layer definition should include the following information.
The below is just an example of Pipeline Layer.
```js
    name: 'pipeline', //Layer Name
    geojsonFileName: __dirname + '/pipeline.geojson', //Temporary working file path
    //The following SQL is the most important one which is able to extract PostGIS data as GeoJSON format.
    select: `
    SELECT row_to_json(featurecollection) AS json FROM (
        SELECT
            'FeatureCollection' AS type,
            array_to_json(array_agg(feature)) AS features
        FROM (
            SELECT
            'Feature' AS type,
            ST_AsGeoJSON(ST_TRANSFORM(ST_MakeValid(x.geom),4326))::json AS geometry,
            row_to_json((
                SELECT p FROM (
                SELECT
                    x.pipeid as fid,
                    a.name as pipetype,
                    x.pipesize,
                    b.name as material,
                    x.constructiondate,
                    x.insertdate,
                    x.updatedate,
                    x.isjica
                ) AS p
            )) AS properties
            FROM pipenet x
            INNER JOIN pipetype a
            ON x.pipetypeid = a.pipetypeid
            INNER JOIN material b
            ON x.materialid = b.materialid
            WHERE NOT ST_IsEmpty(x.geom)
        ) AS feature
        ) AS featurecollection
    `
},
```

## Using Docker on Windows

### Installation of Docker for Windows
See [here](https://docs.docker.com/docker-for-windows) how to install docker for windows.

Please also do [`file sharing`](https://docs.docker.com/docker-for-windows/#resources) setting on preferences of Docker for Windows. 

You must share the directory where you want to save `mbtiles` by the tool.

### Running `postgis2geojson` tool on Docker
Before running `Docker`, please configure database setting on `config.js` file.

Using `docker-compose` is easier.
```sh
docker-compose up
```

or

There is another option using `docker build` and `docker run` as follows.

Please replace your favorite directory on host computer at `{host_directory}` before running it.
```sh
docker build -t narwassco/postgis2geojson .
docker container rm postgis2geojson
docker run --name postgis2geojson -v {host_directory}:/tmp/data -it narwassco/postgis2geojson /bin/bash
```

`narok.mbtiles` will be created under `data` directory.

```
copyright (c) 2020 Jin IGARASHI
```