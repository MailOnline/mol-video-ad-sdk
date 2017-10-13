/* eslint-disable object-property-newline, promise/prefer-await-to-then */
const reflect = (promise) => promise
  .then((value) => ({status: 'resolved', value}))
  .catch((error) => ({error, status: 'rejected'}));

export default reflect;
