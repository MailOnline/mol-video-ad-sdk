/* eslint-disable jsx-quotes, react/jsx-sort-props */
import React from 'react';

const Spinner = () =>
  <svg width="38" height="38" viewBox="0 0 38 38">
    <defs>
      <linearGradient x1="8.042%" y1="0%" x2="65.682%" y2="23.865%" id="a">
        <stop stopColor="#eee" stopOpacity="0" offset="0%" />
        <stop stopColor="#eee" stopOpacity=".631" offset="63.146%" />
        <stop stopColor="#eee" offset="100%" />
      </linearGradient>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g transform="translate(1 1)">
        <path d="M36 18c0-9.94-8.06-18-18-18" stroke="url(#a)" strokeWidth="2">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="0.9s"
            repeatCount="indefinite" />
        </path>
        <circle fill="#eee" cx="36" cy="18" r="1">
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 18 18"
            to="360 18 18"
            dur="0.9s"
            repeatCount="indefinite" />
        </circle>
      </g>
    </g>
  </svg>;

export default Spinner;
