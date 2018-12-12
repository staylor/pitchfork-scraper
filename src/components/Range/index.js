import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as styles from './styled';

/* eslint-disable react/prop-types */

@withRouter
class Range extends Component {
  state = {};

  ref = React.createRef();

  onChange = e => {
    this.props.onChange();
    const score = parseInt(e.currentTarget.value, 10);
    if (score > 0) {
      this.props.history.push(`/rating/${score}`);
    } else {
      this.props.history.push('/');
    }
  };

  componentDidUpdate(prevProps) {
    if (this.props.value !== prevProps.value) {
      this.ref.current.focus();
    }
  }

  render() {
    return (
      <div className={styles.rangeWrapClass}>
        <span className={styles.textClass}>All</span>
        <input
          ref={this.ref}
          type="range"
          min="0"
          max="10"
          defaultValue={this.props.value > 0 ? this.props.value : 0}
          className={styles.rangeClass}
          onChange={this.onChange}
        />
        <span className={styles.textClass}>10</span>
        <span className={styles.bulletClass}> &bull; </span>
        <span className={styles.textClass}>
          {this.props.value > 0
            ? `Rating: ${this.props.value.toFixed(1)}`
            : this.props.defaultLabel}
        </span>
      </div>
    );
  }
}

export default Range;
