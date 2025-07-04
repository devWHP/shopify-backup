#!/usr/bin/env node
require('dotenv').config();
const fs   = require('fs');
const path = require('path');
const axios = require('axios');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

// 🔌 Config Shopify & lecture de config.json
const GRAPHQL_URL = `https://${process.env.SHOPIFY_DOMAIN}/admin/api/${process.env.SHOPIFY_API_VERSION}/graphql.json`;
const HEADERS     = {
  'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN,
  'Content-Type': 'application/json'
};
const config = JSON.parse(fs.readFileSync(path.join(__dirname, 'config.json'), 'utf-8'));

// 📑 Fonction utilitaire GraphQL
async function graphqlQuery(query) {
  const res = await axios.post(GRAPHQL_URL, { query }, { headers: HEADERS });
  if (res.data.errors) throw new Error(JSON.stringify(res.data.errors));
  return res.data.data;
}

// 📑 Fetch paginé de tous les métaobjets d’un type
async function fetchAllMetaobjectsOfType(type) {
  let hasNextPage = true, endCursor = null;
  const results = [];
  while (hasNextPage) {
    const data = await graphqlQuery(`
      query {
        metaobjects(first: 250, type: "${type}"${endCursor ? `, after: "${endCursor}"` : ''}) {
          pageInfo { hasNextPage, endCursor }
          edges { node { id handle updatedAt fields { key value } } }
        }
      }
    `);
    const conn = data.metaobjects;
    conn.edges.forEach(e => results.push(e.node));
    hasNextPage = conn.pageInfo.hasNextPage;
    endCursor   = conn.pageInfo.endCursor;
  }
  return results;
}

// 📑 Fetch d’un métaobjet unique
async function fetchMetaobjectById(gid) {
  if (!gid) return null;
  const data = await graphqlQuery(`
    query {
      metaobject(id: "${gid}") { id handle updatedAt fields { key value } }
    }
  `);
  return data.metaobject;
}

// 📑 Fetch handles de Page avec capture d’erreur de scope
async function fetchPageHandleByGid(gid) {
  if (!gid) return '';
  try {
    const data = await graphqlQuery(`
      query { page(id: "${gid}") { handle } }
    `);
    return data.page?.handle || '';
  } catch (err) {
    console.warn(`⚠️ Accès interdit à la page ${gid} (${err.message}), valeur vide utilisée`);
    return '';
  }
}

// 📑 Fetch handles de Product avec capture d’erreur de scope
async function fetchProductHandleByGid(gid) {
  if (!gid) return '';
  try {
    const data = await graphqlQuery(`
      query { product(id: "${gid}") { handle } }
    `);
    return data.product?.handle || '';
  } catch (err) {
    console.warn(`⚠️ Accès interdit au produit ${gid} (${err.message}), valeur vide utilisée`);
    return '';
  }
}

// 📑 Fetch handles de métaobjets listés
async function fetchHandles(gids) {
  const objs = await Promise.all(
    gids.filter(Boolean)
        .map(gid => fetchMetaobjectById(gid).catch(() => null))
  );
  return objs.filter(Boolean).map(o => o.handle);
}

// 🗃️ Export CSV selon config
async function exportCSV() {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir);

  // Utilise config.file pour nommer le fichier
  const filename = `${config.file.name}.${config.file.extension}`;
  const writer = createCsvWriter({
    path: path.join(outputDir, filename),
    header: [
      { id:'ID',               title:'ID' },
      { id:'Handle',           title:'Handle' },
      { id:'Command',          title:'Command' },
      { id:'Display Name',     title:'Display Name' },
      { id:'Status',           title:'Status' },
      { id:'Updated At',       title:'Updated At' },
      { id:'Definition: Handle', title:'Definition: Handle' },
      { id:'Definition: Name',   title:'Definition: Name' },
      { id:'Top Row',          title:'Top Row' },
      { id:'Row #',            title:'Row #' },
      { id:'Field',            title:'Field' },
      { id:'Value',            title:'Value' }
    ],
    fieldDelimiter: `${config.file.delimiter}`
  });

  let globalRowIndex = 1;
  const rows = [];

  for (const objName of config.order) {
    const objConfig = config.objects.find(o => o.name === objName);
    if (!objConfig) continue;

    const metas = await fetchAllMetaobjectsOfType(objConfig.type);
    for (const mo of metas) {
      // Ici, on retire le prefixe Shopify et garde la dernière partie numérique
      const numericId = mo.id.split('/').pop();

      const fieldsMap = mo.fields.reduce((a,f)=>(a[f.key]=f.value,a), {});
      const display   = fieldsMap.label || fieldsMap.name || '';
      const updated   = mo.updatedAt || new Date().toISOString();

      let localRowIndex = 1;
      for (const [key, desc] of Object.entries(objConfig.fields)) {
        if (!(key in fieldsMap)) continue;
        let val = fieldsMap[key];

        if (desc.type === 'PAGE_REFERENCE') {
          val = await fetchPageHandleByGid(val);
        } else if (desc.type === 'PRODUCT_REFERENCE') {
          val = await fetchProductHandleByGid(val);
        } else if (desc.type === 'LIST.METAOBJECT_REFERENCE') {
          // On parse la liste de GID
          const arr = JSON.parse(val || '[]');
          // On récupère chaque métaobjet et son handle
          const handles = await Promise.all(
            arr.map(gid =>
              fetchMetaobjectById(gid)
                .then(o => o.handle)
                .catch(() => '')
            )
          );
          // On applique le préfixe du type (ex: 'grouplevel' ou 'groupitem')
          const prefix = desc.metaobject_type.toLowerCase();
          const joinedHandles = handles
            .filter(Boolean)
            .map(h => `${prefix}.${h}`)
            .join(', ');
          val = joinedHandles;
        }

        rows.push({
          ID: numericId,
          Handle: mo.handle,
          Command: 'MERGE',
          'Display Name': display,
          Status: 'Active',
          'Updated At': updated,
          'Definition: Handle': objConfig.name.toLowerCase(),
          'Definition: Name': objConfig.name,
          'Top Row': localRowIndex === 1 ? 'VRAI' : '',
          'Row #': globalRowIndex,
          Field: key,
          Value: val
        });

        localRowIndex++;
        globalRowIndex++;
      }
    }
  }

  await writer.writeRecords(rows);
  console.log(`✅ Export terminé : ${rows.length} lignes dans output/${filename}`);
}

// 🔄 Point d’entrée
;(async () => {
  if (config.type === 'export' && config.use === 'metaobjects') {
    await exportCSV();
  } else if (config.type === 'import') {
    console.error('Mode import non implémenté');
  } else {
    console.error(`Configuration non supportée (type=${config.type}, use=${config.use})`);
  }
})();
