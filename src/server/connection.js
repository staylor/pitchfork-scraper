import SQL from 'sql-template-strings';

function base64(i) {
  return Buffer.from(i, 'utf8').toString('base64');
}

function unbase64(i) {
  return Buffer.from(i, 'base64').toString('utf8');
}

const PREFIX = 'arrayconnection:';

export function cursorToOffset(cursor) {
  return parseInt(unbase64(cursor).substring(PREFIX.length), 10);
}

export function offsetToCursor(offset) {
  return base64(PREFIX + offset);
}

export async function parseConnection(db, connectionArgs) {
  const { offset = 0, limit = 10 } = connectionArgs;
  const { count } = await db.get(SQL`SELECT COUNT(album_id) as count FROM albums`);
  const items = await db.all(SQL`SELECT * FROM albums LIMIT ${limit} OFFSET ${offset}`);

  const startOffset = Math.max(offset - 1, offset, -1) + 1;
  const endOffset = startOffset + limit;

  const edges = items.map((value, index) => ({
    cursor: offsetToCursor(startOffset + index),
    node: value,
  }));

  const firstEdge = edges[0];
  const lastEdge = edges[edges.length - 1];
  const lowerBound = offset + 1;
  const upperBound = count;

  return {
    count,
    edges,
    pageInfo: {
      startCursor: firstEdge ? firstEdge.cursor : null,
      endCursor: lastEdge ? lastEdge.cursor : null,
      hasPreviousPage: startOffset > lowerBound,
      hasNextPage: endOffset < upperBound,
    },
  };
}
