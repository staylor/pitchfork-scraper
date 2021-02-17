import { makeExecutableSchema } from 'graphql-tools';
import { ApolloClient, InMemoryCache } from '@apollo/client';
import { SchemaLink } from '@apollo/client/link/schema';
import makeSchema from './schema';

export default db => {
  const schema = makeExecutableSchema(makeSchema(db));

  const graphqlClient = new ApolloClient({
    ssrMode: true,
    cache: new InMemoryCache(),
    link: new SchemaLink({ schema }),
  });

  return graphqlClient;
};
