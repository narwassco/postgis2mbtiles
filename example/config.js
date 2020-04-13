module.exports = {
    db: {
        user:'postgres',
        password:'Your password',
        host:'localhost',
        post:5432,
        database:'narwassco',
    },
    layers : [
        {
            name: 'pipeline',
            geojsonFileName: __dirname + '/pipeline.geojson',
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
        {
          name: 'meter',
          geojsonFileName: __dirname + '/meter.geojson',
          select:`
          SELECT row_to_json(featurecollection) AS json FROM (
            SELECT
              'FeatureCollection' AS type,
              array_to_json(array_agg(feature)) AS features
            FROM (
              SELECT
              'Feature' AS type,
              ST_AsGeoJSON(ST_TRANSFORM(x.geom,4326))::json AS geometry,
              row_to_json((
                SELECT p FROM (
                SELECT
                  x.meterid as fid,
                  a.name as metertype,
                  x.pipesize,
                  x.zonecd,
                  x.connno,
                  x.installationdate,
                  x.serialno,
                  x.insertdate,
                  x.updatedate,
                  x.isgrantprj
                ) AS p
              )) AS properties
              FROM meter x
              INNER JOIN metertype a
              ON x.metertypeid = a.metertypeid
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        },
        {
          name: 'valve',
          geojsonFileName: __dirname + '/valve.geojson',
          select:`
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
                  x.valveid as fid,
                  a.name as valvetype,
                  x.pipesize,
                  x.installationdate,
                  x.status,
                  x.insertdate,
                  x.updatedate,
                  x.isjica
                ) AS p
              )) AS properties
              FROM valve x
              INNER JOIN valvetype a
              ON x.valvetypeid = a.valvetypeid
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        },
        {
          name: 'firehydrant',
          geojsonFileName: __dirname + '/firehydrant.geojson',
          select:`
          SELECT row_to_json(featurecollection) AS json FROM (
            SELECT
              'FeatureCollection' AS type,
              array_to_json(array_agg(feature)) AS features
            FROM (
              SELECT
              'Feature' AS type,
              ST_AsGeoJSON(ST_TRANSFORM(x.geom,4326))::json AS geometry,
              row_to_json((
                SELECT p FROM (
                SELECT
                  x.firehydrantid as fid,
                  x.size,
                  x.installationdate,
                  x.insertdate,
                  x.updatedate,
                  x.isjica
                ) AS p
              )) AS properties
              FROM firehydrant x
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        },
        {
          name: 'washout',
          geojsonFileName: __dirname + '/washout.geojson',
          select:`
          SELECT row_to_json(featurecollection) AS json FROM (
            SELECT
              'FeatureCollection' AS type,
              array_to_json(array_agg(feature)) AS features
            FROM (
              SELECT
              'Feature' AS type,
              ST_AsGeoJSON(ST_TRANSFORM(x.geom,4326))::json AS geometry,
              row_to_json((
                SELECT p FROM (
                SELECT
                  x.washoutid as fid,
                  x.size,
                  x.installationdate,
                  x.insertdate,
                  x.updatedate,
                  x.isjica
                ) AS p
              )) AS properties
              FROM washout x
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        },
        {
            name: 'tank',
            geojsonFileName: __dirname + '/tank.geojson',
            select:`
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
                          x.tankid as fid,
                          x.name,
                          x.capacity,
                          x.servicelocation,
                          a.name as material,
                          x.shape,
                          x.constructiondate,
                          x.insertdate,
                          x.updatedate
                      ) AS p
                    )) AS properties
                  FROM tank x
                  INNER JOIN material a
                  ON x.materialid = a.materialid
                  WHERE NOT ST_IsEmpty(x.geom)
                ) AS feature
              ) AS featurecollection
            `
        },
        {
          name: 'wtp',
          geojsonFileName: __dirname + '/wtp.geojson',
          select:`
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
                  x.wtpid as fid,
                  x.name,
                  x.insertdate,
                  x.updatedate
                ) AS p
              )) AS properties
              FROM wtp x
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        },
        {
          name: 'intake',
          geojsonFileName: __dirname + '/intake.geojson',
          select:`
          SELECT row_to_json(featurecollection) AS json FROM (
            SELECT
              'FeatureCollection' AS type,
              array_to_json(array_agg(feature)) AS features
            FROM (
              SELECT
              'Feature' AS type,
              ST_AsGeoJSON(ST_TRANSFORM(x.geom,4326))::json AS geometry,
              row_to_json((
                SELECT p FROM (
                SELECT
                  x.intakeid as fid,
                  x.name,
                  x.insertdate,
                  x.updatedate
                ) AS p
              )) AS properties
              FROM intake x
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        },
        {
          name: 'parcels',
          geojsonFileName: __dirname + '/parcels.geojson',
          select:`
          WITH percels AS(
            SELECT 
              plotid as fid, 
              CASE WHEN parcel_no = '0' THEN NULL ELSE parcel_no END as parcel_no,  
              geom
            FROM planner_plot
            UNION ALL
            SELECT 
              gid as fid, 
              plotno as parcel_no, 
              geom
            FROM basemap_plots
          )
          SELECT row_to_json(featurecollection) AS json FROM (
            SELECT
              'FeatureCollection' AS type,
              array_to_json(array_agg(feature)) AS features
            FROM (
              SELECT
              'Feature' AS type,
              ST_AsGeoJSON(ST_TRANSFORM(x.geom,4326))::json AS geometry,
              row_to_json((
                SELECT p FROM (
                SELECT
                  x.fid,
                  x.parcel_no
                ) AS p
              )) AS properties
              FROM percels x
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        }
    ],
};