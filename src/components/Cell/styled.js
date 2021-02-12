import { css } from 'pretty-lights';

export const wrapClass = css`
  height: 200px;
  margin: 5px 5px 5px 0;
  position: relative;
`;

export const imageWrapClass = css`
  background: #ddd;
  height: 160px;
  margin: 0 0 12px;
  width: 160px;
`;

export const imageClass = css`
  display: block;
  opacity: 0;
  transition: opacity 600ms;
`;

export const loadedClass = css`
  opacity: 1;
`;

export const textClass = css`
  display: block;
  font-size: 12px;
  height: 32px;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const linkClass = css`
  color: #333;
  text-decoration: none;
`;

export const placeholderClass = css`
  background: #ddd;
`;

export const scoreClass = css`
  background: #000;
  border-radius: 50%;
  color: white;
  display: block;
  font-size: 13px;
  height: 28px;
  right: 8px;
  line-height: 28px;
  padding: 2px;
  position: absolute;
  text-align: center;
  top: 8px;
  width: 28px;
`;
