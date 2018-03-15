export const acceptInvitationLinear = 'acceptInvitationLinear';
export const complete = 'complete';
export const clickThrough = 'clickThrough';
export const error = 'error';
export const firstQuartile = 'firstQuartile';
export const impression = 'impression';
export const midpoint = 'midpoint';
export const mute = 'mute';
export const otherAdInteraction = 'otherAdInteraction';
export const pause = 'pause';
export const playerCollapse = 'playerCollapse';
export const exitFullscreen = 'exitFullscreen';
export const playerExpand = 'playerExpand';
export const fullscreen = 'fullscreen';
export const progress = 'progress';
export const resume = 'resume';
export const rewind = 'rewind';
export const skip = 'skip';
export const start = 'start';
export const thirdQuartile = 'thirdQuartile';
export const timeSpentViewing = 'timeSpentViewing';
export const unmute = 'unmute';
export const iconClick = 'iconClick';
export const iconView = 'iconView';

/**
 * List of event names that may be fired while trying to play a linear Ad.
 * @global
 * @typedef {Object} LinearEvents
 * @property {string} error - there was an error with the linear creative.
 * @property {string} mute - the user activated the mute control and muted the creative.
 * @property {string} unmute - the user activated the mute control and unmuted the creative.
 * @property {string} pause - the user clicked the pause control and stopped the creative.
 * @property {string} resume - the user activated the resume control after the creative had been stopped or paused.
 * @property {string} rewind - the user activated the rewind control to access a previous point in the creative timeline.
 * @property {string} skip - the user activated a skip control to skip the creative.
 * @property {string} playerExpand - the user activated a control to extend the player to a larger size. This event replaces the fullscreen event per the 2014 Digital Video In-Stream Ad Metric Definitions.
 * @property {string} fullscreen - the user activated a control to extend the player to a larger size. Only for VAST 3.
 * @property {string} playerCollapse - the user activated a control to reduce player to a smaller size. This event replaces the exitFullscreen event per the 2014 Digital Video In-Stream Ad Metric Definitions.
 * @property {string} exitFullscreen - the user activated a control to reduce player to a smaller size. Only for VAST 3.
 * @property {string} start - this event is used to indicate that an individual creative within the ad was loaded and playback began. As with creativeView, this event is another way of tracking creative playback.
 * @property {string} firstQuartile - the creative played continuously for at least 25% of the total duration at normal speed.
 * @property {string} midpoint - the creative played continuously for at least 50% of the total duration at normal speed.
 * @property {string} thirdQuartile - the creative played continuously for at least 75% of the duration at normal speed.
 * @property {string} complete - the creative was played to the end at normal speed so that 100% of the creative was played.
 * @property {string} acceptInvitationLinear - the user activated a control that launched an additional portion of the linear creative.
 * @property {string} timeSpentViewing - amount of video viewed at normal speed in seconds or other appropriate time-based units. If a rewind event occurs during play, time spent viewing may be calculated on total amount of video viewed at normal speed, which may include additional amounts of video viewed after rewinding. The offset attribute for the <Tracking> element under Linear ads may be used to track when time spent viewing meets the threshold. Otherwise, a macro may be provided so that the player may return a time value. VAST does not provide a standard macro for this value, so the involved parties must establish these parameters if this metric is to be used.
 * @property {string} otherAdInteraction - an optional metric that can capture all other user interactions under one metric such a s hover-overs, or custom clicks. It should NOT replace clickthrough events or other existing events like mute, unmute, pause, etc.
 * @property {string} progress - the creative played for a duration at normal speed that is equal to or greater than the value provided in an additional offset attribute for the <Tracking> element under Linear ads. Values can be time in the format HH:MM:SS or HH:MM:SS.mmm or a percentage value in the format n%.
 * @property {string} iconClick - the user clicked the creative icon.
 * @property {string} iconView - the user viewed the creative icon.
 * @property {string} impression - there was an impression of the linear creative.
 * @property {string} clickThrough - fired when a viewer clicks the ad
 */
const linearEvents = {
  acceptInvitationLinear,
  clickThrough,
  complete,
  error,

  // TODO: SHOULD BE USED TOGETHER WITH playerCollapse
  exitFullscreen,
  firstQuartile,
  fullscreen,
  iconClick,
  iconView,
  impression,
  midpoint,
  mute,
  otherAdInteraction,
  pause,
  playerCollapse,
  playerExpand,
  progress,
  resume,
  rewind,
  skip,
  start,
  thirdQuartile,
  timeSpentViewing,
  unmute
};

export default linearEvents;
