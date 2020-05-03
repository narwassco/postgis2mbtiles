#!/bin/bash

cd /tmp/src/postgis2geojson
npm run example
echo "mbtiles was created. Please upload new mbtiles to mapbox studio."
exit