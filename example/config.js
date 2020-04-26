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
                  CASE WHEN x.connno=-1 THEN NULL ELSE LPAD(CAST(x.connno as text), 4, '0') END as connno,
                  x.installationdate,
                  x.serialno,
				          b.name as customer,
                  x.insertdate,
                  x.updatedate,
                  x.isgrantprj
                ) AS p
              )) AS properties
              FROM meter x
              INNER JOIN metertype a
              ON x.metertypeid = a.metertypeid
              LEFT JOIN customer b
              ON x.zonecd = b.zonecd
              AND x.connno = b.connno
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
          name: 'plant',
          geojsonFileName: __dirname + '/plant.geojson',
          select:`
          WITH plant as(
            SELECT
              wtpid as fid,
              name,
              'WTP' as plant_type,
              insertdate,
              updatedate,
              geom
            FROM wtp
            UNION ALL
            SELECT
              intakeid as fid,
              name,
              'INTAKE' as plant_type,
              insertdate,
              updatedate,
              geom
            FROM intake
          )
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
                x.fid,
                x.name,
                x.plant_type,
                x.insertdate,
                x.updatedate
              ) AS p
              )) AS properties
                FROM plant x
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
        },
        {
          name: 'village',
          geojsonFileName: __dirname + '/village.geojson',
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
                  x.villageid as fid,
                  x.name,
                  x.area,
                  x.zone,
                  x.insertdate,
                  x.updatedate
                ) AS p
              )) AS properties
              FROM village x
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        },
        {
          name: 'point_annotation',
          geojsonFileName: __dirname + '/point_annotation.geojson',
          select:`
          WITH annotations AS(
            SELECT 
              tankid as masterid, 
              name,
              'tank' as layer,
              ST_CENTROID(geom) as geom
            FROM tank
            UNION ALL
            SELECT 
              wtpid as masterid, 
              name, 
              'wtp' as layer,
              ST_CENTROID(geom) as geom
            FROM wtp
            UNION ALL
            SELECT 
              intakeid as masterid, 
              name, 
              'intake' as layer,
              ST_CENTROID(geom) as geom
            FROM intake
            UNION ALL
            SELECT 
              villageid as masterid, 
              name, 
              'village' as layer,
              ST_CENTROID(geom) as geom
            FROM village
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
                  x.masterid,
                  x.name,
                  x.layer
                ) AS p
              )) AS properties
              FROM annotations x
              WHERE NOT ST_IsEmpty(x.geom)
            ) AS feature
          ) AS featurecollection
          `
        }
    ],
};