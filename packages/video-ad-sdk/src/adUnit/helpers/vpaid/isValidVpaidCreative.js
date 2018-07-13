import vpaidMethods from './vpaidMethods';

const isValidVpaidCreative = (creative) => vpaidMethods.every((method) => typeof creative[method] === 'function');

export default isValidVpaidCreative;
