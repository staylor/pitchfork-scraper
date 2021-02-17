import React from 'react';
import { gql, useQuery } from '@apollo/client';
import Grid, { transformProps } from 'components/Grid';

const homeQuery = gql`
  query AlbumsQuery($limit: Int, $offset: Int, $score: Int) {
    albums(limit: $limit, offset: $offset, score: $score) {
      ...Grid_grid
    }
  }
  ${Grid.fragments.grid}
`;

function Home() {
  const props = useQuery(homeQuery, {
    variables: {
      score: 0,
      offset: 0,
      limit: 48,
    },
  });
  return React.createElement(Grid, transformProps(props));
}

export default Home;
