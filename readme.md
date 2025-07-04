# Shopify Metaobjects Export - Version 3 (Matrixify format)

This script saves metaobjects whose names and definitions are configured in a configuration file to a CSV file that can be used by the Matrixify app.

It requires:
- a Shopify Plus store
- a configured app whose token you know
- Node JS v14+ on your machine

## Installation

- create your project directory and drop the repository files there using your preferred method, then switch to this directory

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
