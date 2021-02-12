import React from 'react';
import path from 'path';
import express from 'express';
import morgan from 'morgan';
import compression from 'compression';
import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import { preloadDynamicImports, DynamicImports, getBundles } from 'kyt-runtime/server';
import { extractCritical } from 'pretty-lights/server';
import { ApolloServer } from 'apollo-server-express';
import sqlite from 'sqlite';
import { ApolloProvider, getDataFromTree } from 'react-apollo';
import App from 'components/App';
import makeSchema from './schema';
import apolloClient from './apollo';
import template from './template';

let db;

(async () => {
  const dbFile = path.resolve(`${__dirname}/../../database.sqlite`);
  db = await sqlite.open(dbFile, { cached: true });

  const app = express();
  app.disable('x-powered-by');
  app.use(compression());
  app.use(morgan('combined'));

  const publicDir = path.join(process.cwd(), KYT.PUBLIC_DIR);
  app.use(express.static(publicDir));

  const server = new ApolloServer(makeSchema(db));

  server.applyMiddleware({ app });

  app.get('*', async (req, res) => {
    const staticContext = {};
    const modules = [];
    const client = apolloClient(db);
    const tree = (
      <DynamicImports report={moduleName => modules.push(moduleName)}>
        <ApolloProvider client={client}>
          <StaticRouter location={req.url} context={staticContext}>
            <App />
          </StaticRouter>
        </ApolloProvider>
      </DynamicImports>
    );

    await getDataFromTree(tree);

    const { ids, css, html } = extractCritical(renderToString(tree));
    const initialState = client.extract();
    res.send(template({ ids, css, html, bundles: getBundles({ modules }), initialState }));
  });

  app.listen(parseInt(KYT.SERVER_PORT, 10));
})();
