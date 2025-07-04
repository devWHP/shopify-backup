# Shopify Metaobjects Export - Version 3

Ce script permet de sauvegarder dans un fichier CSV exploitable par l'app Matrixify les metaobjets dont les noms et les definitions sont paramétrés dans un fichier config.

Il necessite :
- une boutique Shopify Plus
- une app configurée dont vous connaissez le token
- node JS v14+ sur votre machine

## Installation

- créez le repertoire de votre projet et déposez y les fichiers du dépôt selon votre méthode préférée puis switchez sur ce répertoire

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
