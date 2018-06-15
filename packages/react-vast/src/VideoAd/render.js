import React from 'react';
import styles from './styles';

// This render function is shared across both <VideoAd> components, for consistency.
// It requiers that state has the following shape:
//
//     {
//       complete: boolean,
//       error: boolean,
//       loading: boolean
//     }
//
// It also expectes that component has `this.ref` method implemented, for getting ref
// to the ad container <div> element.
//
/* eslint-disable babel/no-invalid-this */
const render = function render () {
  const {
    height,
    renderError,
    renderLoading,
    width
  } = this.props;

  const {
    complete,
    error,
    loading
  } = this.state;

  let overlayElement = null;

  if (complete) {
    return null;
  } else if (error) {
    overlayElement =
      <div key='overlay' style={styles.overlay}>
        {renderError(this.state.error)}
      </div>;
  } else if (loading) {
    overlayElement =
      <div key='overlay' style={styles.overlay}>
        {renderLoading(this.props, this.state)}
      </div>;
  }

  // NOTE: We always have to render `adElement`, because we need to get `ref` to it.
  const adElement =
    <div
      key='ad'
      ref={this.ref}
      style={{
        ...styles.ad,
        visibility: this.state.loading ? 0 : 1
      }}
    />;

  const containerStyles = {
    ...styles.container,
    height,
    width
  };

  return (
    <div style={containerStyles}>
      {overlayElement}
      {adElement}
    </div>
  );
};

export default render;
