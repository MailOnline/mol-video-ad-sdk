import {
  get,
  getAll,
  getText,
  getAttributes
} from '@mol/vast-xml2js';
import getLinearCreative from './helpers/getLinearCreative';
import parseTime from './helpers/parseTime';

const formatSize = (size) => {
  const match = `${size}`.match(/\d+/g);

  return parseInt(match[0], 10);
};

const formatPosition = (position) => {
  const isNumberString = /\d+/.test(position);

  if (isNumberString) {
    return formatSize(position);
  }

  return position;
};

const getIconAttributes = (iconElement) => {
  const {
    duration,
    height,
    offset,
    program,
    pxratio,
    width,
    xPosition = 'right',
    yPosition = 'top'
  } = getAttributes(iconElement);

  return {
    duration: duration && parseTime(duration),
    height: height && formatSize(height),
    offset: offset && parseTime(offset),
    program,
    pxratio: pxratio && parseInt(pxratio, 10),
    width: width && formatSize(width),
    xPosition: xPosition && formatPosition(xPosition),
    yPosition: yPosition && formatPosition(yPosition)
  };
};

const getIconResource = (iconElement) => {
  const staticResourceElement = get(iconElement, 'StaticResource');
  const htmlResourceElement = get(iconElement, 'HTMLResource');
  const iFrameResourceElement = get(iconElement, 'IFrameResource');

  if (staticResourceElement) {
    return {staticResource: getText(staticResourceElement)};
  }

  if (htmlResourceElement) {
    return {htmlResource: getText(htmlResourceElement)};
  }

  if (iFrameResourceElement) {
    return {iFrameResource: getText(iFrameResourceElement)};
  }

  return {
    staticResource: getText(iconElement)
  };
};

const getIconViewTracking = (iconElement) => {
  const iconTrackingElements = getAll(iconElement, 'IconViewTracking')
    .map((iconViewTrackingElement) => getText(iconViewTrackingElement));

  if (iconTrackingElements.length === 0) {
    return {};
  }

  return {
    iconViewTracking: iconTrackingElements
  };
};

const getIconClicks = (iconElement) => {
  const iconClicksElement = get(iconElement, 'IconClicks');
  const iconClickThroughElement = iconClicksElement && get(iconClicksElement, 'IconClickThrough');
  const iconClickTrackingElements = iconClicksElement && getAll(iconClicksElement, 'IconClickTracking')
    .map((iconClickTrackingElement) => getText(iconClickTrackingElement));

  return {
    iconClickThrough: iconClickThroughElement && getText(iconClickThroughElement),
    iconClickTracking: iconClickTrackingElements && iconClickTrackingElements.length > 0 ? iconClickTrackingElements : undefined
  };
};

/**
 * VastIcon.
 * For more info please take a look at the [VAST specification]{@link https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/}
 *
 * @global
 * @typedef VastIcon
 * @type Object
 *
 * @property {ParsedOffset} [offset] - The time of delay from when the associated linear creative begins playing to when the icon should be displayed.
 * @property {ParsedOffset} [duration] - The duration the icon should be displayed unless ad is finished playing.
 * @property {number} [height] - Pixel height of the icon.
 * @property {number} [width] - Pixel width of the icon.
 * @property {string} [program] - The program represented in the icon (e.g. "AdChoices").
 * @property {number} [pxratio] - The pixel ratio for which the icon creative is intended.
 *                                The pixel ratio is the ratio of physical pixels on the device to the device-independent pixels.
 *                                An ad intended for display on a device with a pixel ratio that is twice that of a standard 1:1 pixel ratio would use the value "2."
 *                                Default value is "1.".
 * @property {string|number} [xPosition] - The x-coordinate of the top, left corner of the icon asset relative to the ad display area.
 *                                Values of "left" or "right" also accepted and indicate the leftmost or rightmost available position for the icon asset.
 * @property {string|number} [yPosition] - The y-coordinate of the top left corner of the icon asset relative to the ad display area.
 *                                Values of "top" or "bottom" also accepted and indicate the topmost or bottom most available position for the icon asset
 * @property {string} [staticResource] - The URI to a static creative file to be used as the icon.
 * @property {string} [htmlResource] - The URI to a static creative file to be used as the icon.
 * @property {string} [iFrameResource] - The URI to a static creative file to be used as the icon.
 * @property {Array.<string>} [iconViewTracking] - Array of URIs for the tracking resource files to be called when the icon creative is displayed
 * @property {string} [iconClickThrough] - A URI to the industry program page opened when a viewer clicks the icon.
 * @property {Array.<string>} [iconClickTracking] - Array of URIs to the tracking resource files to be called when a click corresponding to the id attribute (if provided) occurs.
 *
 */

const getIcons = (ad) => {
  const linearCreativeElement = ad && getLinearCreative(ad);
  const linearElement = linearCreativeElement && get(linearCreativeElement, 'linear');
  const iconsElement = linearElement && get(linearElement, 'Icons');
  const iconElements = iconsElement && getAll(iconsElement, 'Icon');

  if (iconElements && iconElements.length > 0) {
    return iconElements.map((iconElement) => ({
      ...getIconAttributes(iconElement),
      ...getIconResource(iconElement),
      ...getIconViewTracking(iconElement),
      ...getIconClicks(iconElement)
    }));
  }

  return null;
};

export default getIcons;
