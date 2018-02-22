// eslint-disable-next-line import/no-unassigned-import
import 'raf-polyfill';
import {configure} from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

configure({adapter: new Adapter()});

const noop = () => {};

// JSDOM throws a 'Not implemented' error if you call this methods
HTMLMediaElement.prototype.play = noop;
HTMLMediaElement.prototype.pause = noop;
