import React, { Component } from 'react';
import { ApolloConsumer } from 'react-apollo';
import gql from 'graphql-tag';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import { cx } from 'emotion';
import * as styles from './styled';

/* eslint-disable react/prop-types */

const COLUMN_SIZE = 5;

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
          score
          url
        }
      }
    }
  }
`;

const Cell = React.memo(({ item: album, style }) => {
  if (!album) {
    return (
      <article style={style}>
        <figure className={cx(styles.wrapClass, styles.placeholderClass)} />
      </article>
    );
  }

  return (
    <article style={style}>
      <figure className={styles.wrapClass}>
        <img src={album.image} alt="" className={styles.imageClass} />
        {album.score && <span className={styles.scoreClass}>{album.score.toFixed(1)}</span>}
        <figcaption className={styles.textClass}>
          <a href={album.url} className={styles.linkClass}>
            {album.artists.map(a => a.name).join(', ')} - <em>{album.name}</em>
          </a>
        </figcaption>
      </figure>
    </article>
  );
});

@withApolloClient
class App extends Component {
  state = {
    count: 5150,
    items: {},
  };

  requestCache = {};

  isItemLoaded = ({ index }) => !!this.state.items[index];

  loadMoreItems = (visibleStartIndex, visibleStopIndex) => {
    const key = [visibleStartIndex, visibleStopIndex].join(':');
    if (this.requestCache[key]) {
      return;
    }

    let itemsRetrieved = true;
    for (let i = visibleStartIndex; i < visibleStopIndex; i += 1) {
      if (!this.state.items[i]) {
        itemsRetrieved = false;
        break;
      }
    }

    if (itemsRetrieved) {
      this.requestCache[key] = key;
      return;
    }

    this.props.client
      .query({
        query: albumQuery,
        variables: { offset: visibleStartIndex, limit: visibleStopIndex - visibleStartIndex },
      })
      .then(({ data }) => {
        const indexed = {};
        const lastIndex = Math.min(visibleStopIndex, visibleStartIndex + data.albums.edges.length);
        for (let i = visibleStartIndex, j = 0; i < lastIndex; i += 1, j += 1) {
          indexed[i] = data.albums.edges[j].node;
        }
        this.setState(
          ({ items }) => ({
            count: data.albums.count,
            items: {
              ...items,
              ...indexed,
            },
          }),
          () => {
            this.requestCache[key] = key;
          }
        );
      });
  };

  onItemsRendered = onItemsRendered => ({
    visibleColumnStartIndex,
    visibleColumnStopIndex,
    visibleRowStartIndex,
    visibleRowStopIndex,
  }) => {
    const visibleStartIndex = visibleRowStartIndex * COLUMN_SIZE + visibleColumnStartIndex;
    const visibleStopIndex = visibleRowStopIndex * COLUMN_SIZE + visibleColumnStopIndex;

    onItemsRendered({
      visibleStartIndex,
      visibleStopIndex,
    });
  };

  renderCell = ({ rowIndex, columnIndex, style }) => {
    const item = this.state.items[rowIndex * COLUMN_SIZE + columnIndex];
    return <Cell {...{ item, style }} />;
  };

  render() {
    return (
      <InfiniteLoader
        isItemLoaded={this.isItemLoaded}
        loadMoreItems={this.loadMoreItems}
        itemCount={this.state.count + 1}
      >
        {({ onItemsRendered, ref }) => (
          <Grid
            onItemsRendered={this.onItemsRendered(onItemsRendered)}
            columnCount={COLUMN_SIZE}
            columnWidth={180}
            height={800}
            rowCount={Math.max(this.state.count / COLUMN_SIZE)}
            rowHeight={220}
            width={1024}
            ref={ref}
          >
            {this.renderCell}
          </Grid>
        )}
      </InfiniteLoader>
    );
  }
}

export default App;
