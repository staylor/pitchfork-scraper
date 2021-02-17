import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Grid, { transformProps } from 'components/Grid';

/* eslint-disable react/prop-types */

const albumsQuery = gql`
  query AlbumsQuery($limit: Int, $offset: Int, $score: Int) {
    albums(limit: $limit, offset: $offset, score: $score) {
      ...Grid_grid
    }
  }
  ${Grid.fragments.grid}
`;

function Rating({
  match: {
    params: { score },
  },
}) {
  const props = useQuery(albumsQuery, {
    variables: {
      score: parseInt(score, 10),
      offset: 0,
      limit: 48,
    },
  });
  return React.createElement(Grid, transformProps(props));
}

export default Rating;
