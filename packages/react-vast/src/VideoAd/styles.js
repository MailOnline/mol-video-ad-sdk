/* eslint-disable sort-keys */
const overlay = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%'
};

const styles = {
  container: {
    position: 'relative'
  },
  overlay: {
    ...overlay,
    zIndex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center'
  },
  ad: {
    ...overlay,
    zIndex: 2
  }
};
/* eslint-enable sort-keys */

export default styles;
