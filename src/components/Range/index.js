import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import * as styles from './styled';

/* eslint-disable react/prop-types */

@withRouter
class Range extends Component {
  state = {};

  onChange = e => {
    const score = parseInt(e.currentTarget.value, 10);
    if (score > 0) {
      this.props.history.push(`/rating/${score}`);
    } else {
      this.props.history.push('/');
    }
  };

  render() {
    return (
      <div className={styles.rangeWrapClass}>
        <input
          type="range"
          min="0"
          max="10"
          defaultValue={this.props.value > 0 ? this.props.value : 0}
          className={styles.rangeClass}
          onChange={this.onChange}
        />{' '}
        {this.props.value > 0 ? `Rating: ${this.props.value}` : this.props.defaultLabel}
      </div>
    );
  }
}

export default Range;
