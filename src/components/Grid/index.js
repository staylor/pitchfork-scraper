import React, { Component } from 'react';
import { FixedSizeGrid } from 'react-window';
import InfiniteLoader from 'react-window-infinite-loader';
import gql from 'graphql-tag';
import Cell from 'components/Cell';

const COLUMN_WIDTH = 180;
const ROW_HEIGHT = 220;

export const transformProps = ({
  data: {
    albums,
    loading,
    refetch,
    variables: { offset, limit, score },
  },
}) => {
  let count = 0;

  const indexed = {};

  if (albums) {
    // eslint-disable-next-line prefer-destructuring
    count = albums.count;
    const lastIndex = Math.min(offset + limit, offset + albums.edges.length);
    for (let i = offset, j = 0; i < lastIndex; i += 1, j += 1) {
      indexed[i] = albums.edges[j].node;
    }
  }

  return {
    count,
    items: {
      ...indexed,
    },
    refetch,
    loading,
    score,
  };
};

class Grid extends Component {
  state = {
    columns: 0,
    width: 0,
    height: 0,
    items: {},
    count: 5150,
  };

  requestCache = {};

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.loading || !nextProps.items) {
      return null;
    }

    let items;

    if (nextProps.score !== prevState.score) {
      items = {
        ...nextProps.items,
      };
    } else {
      items = {
        ...prevState.items,
        ...nextProps.items,
      };
    }

    return {
      score: nextProps.score,
      count: nextProps.count,
      items,
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
    const width = (document.documentElement.clientWidth || document.body.clientWidth) - 10;
    const height = window.innerHeight - 80;
    const columns = Math.floor((width - 40) / COLUMN_WIDTH);

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
          <FixedSizeGrid
            onItemsRendered={this.onItemsRendered(onItemsRendered)}
            columnCount={this.state.columns}
            columnWidth={COLUMN_WIDTH}
            height={this.state.height}
            rowCount={Math.ceil(this.state.count / this.state.columns)}
            rowHeight={ROW_HEIGHT}
            width={this.state.width}
            ref={ref}
          >
            {this.renderCell}
          </FixedSizeGrid>
        )}
      </InfiniteLoader>
    );
  }
}

Grid.fragments = {
  grid: gql`
    fragment Grid_grid on AlbumConnection {
      count
      edges {
        node {
          ...Cell_item
        }
      }
    }
    ${Cell.fragments.item}
  `,
};

export default Grid;
