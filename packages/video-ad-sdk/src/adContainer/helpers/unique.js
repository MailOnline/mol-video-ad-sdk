/**
 * unique will create a unique string everytime is called, sequentially and namespaced
 *
 * @param {string} namespace
 */
const unique = (namespace) => {
  let count = -1;

  return function () {
    return namespace + '_' + ++count;
  };
};

export default unique;
