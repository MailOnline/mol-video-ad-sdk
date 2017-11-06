/* eslint-disable filenames/match-exported, import/no-unassigned-import */
import 'whatwg-fetch';

export default async (endpoint, options = {}) => {
  const defaults = {
    credentials: 'include'
  };
  const fetchOptions = Object.assign({}, defaults, options);
  const response = await window.fetch(endpoint, fetchOptions);

  if (!options.doNotThrow && response.status >= 400) {
    const error = new Error(response.statusText);

    error.response = response;
    throw error;
  }

  return response;
};
