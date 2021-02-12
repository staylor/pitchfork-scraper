import { ApolloClient } from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { SchemaLink } from 'apollo-link-schema';
import { makeExecutableSchema } from 'graphql-tools';
import makeSchema from './schema';

export default db => {
  const schema = makeExecutableSchema(makeSchema(db));

  const graphqlClient = new ApolloClient({
    ssr: true,
    cache: new InMemoryCache(),
    link: new SchemaLink({ schema }),
  });

  return graphqlClient;
};
