import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { InfiniteLoader, Grid } from 'react-virtualized';
import { css, cx } from 'emotion';

/* eslint-disable react/prop-types */

const wrapClass = css`
  height: 200px;
  margin: 20px;
`;

const imageClass = css`
  margin: 0 0 20px;
`;

const textClass = css`
  font-size: 13px;
  line-height: 16px;
`;

const placeholderClass = css`
  background: #ddd;
`;

const withApolloClient = Composed => {
  function WithApolloClient(props) {
    return <ApolloConsumer>{client => <Composed client={client} {...props} />}</ApolloConsumer>;
  }
  return WithApolloClient;
};

const albumQuery = gql`
  query AlbumsQuery($limit: Int, $offset: Int) {
    albums(limit: $limit, offset: $offset) {
      count
      edges {
        node {
          id
          name
          artists {
            id
            name
          }
          image
        }
      }
    }
  }
`;

@withApolloClient
class App extends Component {
  state = {
    count: 5150,
  };

  isRowLoaded = ({ index }) => !!this.state[index];

  loadMoreRows = ({ startIndex, stopIndex }) =>
    this.props.client
      .query({
        query: albumQuery,
        variables: { offset: startIndex, limit: stopIndex - startIndex },
      })
      .then(({ data }) => {
        const indexed = {};
        for (let i = startIndex, j = 0; i < stopIndex; i += 1, j += 1) {
          indexed[i] = data.albums.edges[j].node;
        }
        this.setState({ ...indexed, count: data.albums.count });
      });

  cellRenderer = ({ key, rowIndex, columnIndex, style }) => {
    // console.log('ROW RENDERER', index);
    const album = this.state[rowIndex * 5 + columnIndex];
    if (!album) {
      return (
        <article key={key} style={style}>
          <figure className={cx(wrapClass, placeholderClass)} />
        </article>
      );
    }

    return (
      <article key={key} style={style}>
        <figure className={wrapClass}>
          <img src={album.image} alt="" className={imageClass} />
          <figcaption className={textClass}>
            {album.artists.map(a => a.name).join(', ')} - <em>{album.name}</em>
          </figcaption>
        </figure>
      </article>
    );
  };

  bindSectionRendered = onRowsRendered => ({
    columnStartIndex,
    columnStopIndex,
    rowStartIndex,
    rowStopIndex,
  }) => {
    const startIndex = rowStartIndex * 5 + columnStartIndex;
    const stopIndex = rowStopIndex * 5 + columnStopIndex;

    onRowsRendered({
      startIndex,
      stopIndex,
    });
  };

  infiniteGrid = ({ onRowsRendered, registerChild }) => (
    <Grid
      rowCount={Math.max(this.state.count / 5)}
      rowHeight={240}
      columnCount={5}
      columnWidth={200}
      cellRenderer={this.cellRenderer}
      width={1024}
      height={800}
      onSectionRendered={this.bindSectionRendered(onRowsRendered)}
      ref={registerChild}
    />
  );

  render() {
    return (
      <InfiniteLoader
        isRowLoaded={this.isRowLoaded}
        loadMoreRows={this.loadMoreRows}
        rowCount={this.state.count}
      >
        {this.infiniteGrid}
      </InfiniteLoader>
    );
  }
}

export default App;
