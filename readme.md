# Shopify Metaobjects Export - Version 3

## Installation

```bash
npm install axios csv-writer dotenv
```

## Configuration

1. Copy `.env.example` to `.env` and configure :
   ```
   SHOPIFY_DOMAIN=your-shop.myshopify.com
   SHOPIFY_ACCESS_TOKEN=shpat_xxx
   SHOPIFY_API_VERSION=2024-04
   ```
2. Adjust `config.json` as you need (type, order, objects).
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


The output of the CSV will be generated under `output/metaobjects.csv`.
