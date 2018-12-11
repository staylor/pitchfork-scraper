import React, { Component } from 'react';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { FixedSizeGrid as Grid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import Cell from 'components/Cell';

/* eslint-disable react/prop-types */

const COLUMN_WIDTH = 180;
const ROW_HEIGHT = 220;

@graphql(
  gql`
    query AlbumsQuery($limit: Int, $offset: Int) {
      albums(limit: $limit, offset: $offset) {
        count
        edges {
          node {
            ...Cell_item
          }
        }
      }
    }
    ${Cell.fragments.item}
  `,
  {
    options: {
      variables: {
        offset: 0,
        limit: 48,
      },
    },
    props: ({
      data: {
        albums,
        loading,
        refetch,
        variables: { offset, limit },
      },
    }) => {
      const indexed = {};
      const lastIndex = Math.min(offset + limit, offset + albums.edges.length);
      for (let i = offset, j = 0; i < lastIndex; i += 1, j += 1) {
        indexed[i] = albums.edges[j].node;
      }

      return {
        count: albums.count,
        items: indexed,
        refetch,
        loading,
      };
    },
  }
)
class App extends Component {
  state = {
    columns: 0,
    width: 0,
    height: 0,
    count: 5150,
    items: {},
  };

  requestCache = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.loading || !nextProps.items) {
      return null;
    }

    return {
      count: nextProps.count,
      items: {
        ...prevState.items,
        ...nextProps.items,
      },
    };
  }

  isItemLoaded = ({ index }) => !!this.state.items[index];

  loadMoreItems = (visibleStartIndex, visibleStopIndex) => {
    if (this.props.loading) {
      return;
    }

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

    this.props
      .refetch({ offset: visibleStartIndex, limit: visibleStopIndex - visibleStartIndex })
      .then(() => {
        this.requestCache[key] = key;
      });
  };

  onItemsRendered = infiniteOnItemsRendered => ({
    visibleColumnStartIndex,
    visibleColumnStopIndex,
    visibleRowStartIndex,
    visibleRowStopIndex,
  }) => {
    const visibleStartIndex = visibleRowStartIndex * this.state.columns + visibleColumnStartIndex;
    const visibleStopIndex = visibleRowStopIndex * this.state.columns + visibleColumnStopIndex;

    infiniteOnItemsRendered({
      visibleStartIndex,
      visibleStopIndex,
    });
  };

  renderCell = ({ rowIndex, columnIndex, style }) => {
    const item = this.state.items[rowIndex * this.state.columns + columnIndex];
    return <Cell {...{ item, style }} />;
  };

  recalcSize = () => {
    const width = (document.documentElement.clientWidth || document.body.clientWidth) - 20;
    const height = window.innerHeight;
    const columns = Math.floor(width / COLUMN_WIDTH);

    this.setState({
      width,
      height,
      columns,
    });
  };

  componentDidMount() {
    this.recalcSize();

    window.addEventListener('resize', this.recalcSize);
  }

  render() {
    if (this.state.columns === 0) {
      return null;
    }

    return (
      <InfiniteLoader
        isItemLoaded={this.isItemLoaded}
        loadMoreItems={this.loadMoreItems}
        itemCount={this.state.count}
      >
        {({ onItemsRendered, ref }) => (
          <Grid
            onItemsRendered={this.onItemsRendered(onItemsRendered)}
            columnCount={this.state.columns}
            columnWidth={COLUMN_WIDTH}
            height={this.state.height}
            rowCount={Math.max(this.state.count / this.state.columns)}
            rowHeight={ROW_HEIGHT}
            width={this.state.width}
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
