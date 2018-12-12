import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Grid, { transformProps } from 'components/Grid';

/* eslint-disable react/prop-types */

@graphql(
  gql`
    query AlbumsQuery($limit: Int, $offset: Int, $score: Int) {
      albums(limit: $limit, offset: $offset, score: $score) {
        ...Grid_grid
      }
    }
    ${Grid.fragments.grid}
  `,
  {
    options: {
      variables: {
        score: 0,
        offset: 0,
        limit: 48,
      },
    },
    props: transformProps,
  }
)
class Home extends Component {
  render() {
    return <Grid {...this.props} />;
  }
}

export default Home;
