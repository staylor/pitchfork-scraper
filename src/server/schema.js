import { gql } from 'apollo-server-express';
import SQL from 'sql-template-strings';
import { parseConnection } from './connection';

const typeDefs = gql`
  type Artist {
    id: ID!
    name: String!
  }

  type Genre {
    id: ID!
    name: String!
  }

  type Album {
    id: ID!
    name: String!
    artists: [Artist]
    genres: [Genre]
    date: String!
    image: String!
    url: String!
    score: Float
  }

  type AlbumEdge {
    node: Album
    cursor: String
  }

  type AlbumConnection {
    count: Int
    edges: [AlbumEdge]
    pageInfo: PageInfo
  }

  type PageInfo {
    startCursor: String
    endCursor: String
    hasPreviousPage: Boolean
    hasNextPage: Boolean
  }

  type Query {
    albums(offset: Int, limit: Int): AlbumConnection
  }

  schema {
    query: Query
  }
`;

export function base64(i) {
  return Buffer.from(i, 'utf8').toString('base64');
}

export function unbase64(i) {
  return Buffer.from(i, 'base64').toString('utf8');
}

export function toGlobalId(type, id) {
  return base64([type, id].join(':'));
}

const resolvers = db => ({
  Query: {
    async albums(root, args) {
      return parseConnection(db, args);
    },
  },
  Artist: {
    id(artist) {
      return toGlobalId('Artist', artist.artist_id);
    },
  },
  Genre: {
    id(genre) {
      return toGlobalId('Genre', genre.genre_id);
    },
  },
  Album: {
    id(album) {
      return toGlobalId('Album', album.album_id);
    },
    artists(album) {
      return db.all(
        SQL`
          SELECT a.* FROM artists a
          INNER JOIN album_artists aa
          ON a.artist_id = aa.artist_id
          WHERE aa.album_id = ${album.album_id}
        `
      );
    },
    genres(album) {
      return db.all(
        SQL`
          SELECT g.* FROM genres g
          INNER JOIN album_genres ag
          ON g.genre_id = ag.genre_id
          WHERE ag.album_id = ${album.album_id}
        `
      );
    },
  },
});

export default db => ({
  typeDefs,
  resolvers: resolvers(db),
});
