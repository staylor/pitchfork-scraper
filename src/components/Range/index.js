import React, { useRef, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import * as styles from './styled';

/* eslint-disable react/prop-types */

function Range({ value, defaultLabel, onChange: onChangeProp }) {
  const history = useHistory();
  const inputRef = useRef(null);
  const onChange = e => {
    onChangeProp();
    const score = parseInt(e.currentTarget.value, 10);
    if (score > 0) {
      history.push(`/rating/${score}`);
    } else {
      history.push('/');
    }
  };

  useEffect(() => {
    inputRef.current.focus();
  }, [value]);

  return (
    <div className={styles.rangeWrapClass}>
      <span className={styles.textClass}>All</span>
      <input
        ref={inputRef}
        type="range"
        min="0"
        max="10"
        defaultValue={value > 0 ? value : 0}
        className={styles.rangeClass}
        onChange={onChange}
      />
      <span className={styles.textClass}>10</span>
      <span className={styles.bulletClass}> &bull; </span>
      <span className={styles.textClass}>
        {value > 0 ? `Rating: ${value.toFixed(1)}` : defaultLabel}
      </span>
    </div>
  );
}

export default Range;
