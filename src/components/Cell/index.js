import React from 'react';
import gql from 'graphql-tag';
import { cx } from 'pretty-lights';
import * as styles from './styled';

/* eslint-disable react/prop-types */

const onLoad = ref => () => {
  ref.current.classList.add(styles.loadedClass);
};

const Cell = ({ item, style }) => {
  if (!item) {
    return (
      <article style={style}>
        <figure className={cx(styles.wrapClass, styles.placeholderClass)} />
      </article>
    );
  }

  const ref = React.createRef();

  return (
    <article style={style}>
      <figure className={styles.wrapClass}>
        <div className={styles.imageWrapClass}>
          <img
            ref={ref}
            src={item.image}
            alt=""
            className={styles.imageClass}
            onLoad={onLoad(ref)}
          />
        </div>
        {item.score && <span className={styles.scoreClass}>{item.score.toFixed(1)}</span>}
        <figcaption className={styles.textClass}>
          <a href={item.url} className={styles.linkClass}>
            {item.artists.map(a => a.name).join(', ')} - <em>{item.name}</em>
          </a>
        </figcaption>
      </figure>
    </article>
  );
};

Cell.fragments = {
  item: gql`
    fragment Cell_item on Album {
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
  `,
};

export default Cell;
