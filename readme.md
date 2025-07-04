# Shopify Metaobjects Export - Version 3

## Installation

```bash
npm install axios csv-writer dotenv
```

## Configuration

1. Copiez `.env.example` vers `.env` et configurez :
   ```
   SHOPIFY_DOMAIN=your-shop.myshopify.com
   SHOPIFY_ACCESS_TOKEN=shpat_xxx
   SHOPIFY_API_VERSION=2024-04
   ```
2. Ajustez `config.json` selon vos besoins (type, order, objects).
3. Ensure your private/custom app has scopes:
- `read_products`
- `read_metafields`
- `read_metaobjects`
- `read_pages`



## Usage

```bash
node index.js
```

ou

```bash
npm start
```


Le CSV sera généré sous `output/metaobjects.csv`.
