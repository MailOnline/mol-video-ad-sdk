import path from 'path';
import fs from 'fs';
import {parseXml} from '@mailonline/vast-xml2js';
import {getFirstAd} from '../src/vastSelectors';

export const vastWrapperXML = fs.readFileSync(path.join(__dirname, 'vast-wrapper.xml'), 'utf8');
export const vastInlineXML = fs.readFileSync(path.join(__dirname, 'vast-inline.xml'), 'utf8');
export const vastVpaidInlineXML = fs.readFileSync(path.join(__dirname, 'vast-vpaid-inline.xml'), 'utf8');
export const legacyVastVpaidInlineXML = fs.readFileSync(path.join(__dirname, 'legacy-vast-vpaid-inline.xml'), 'utf8');
export const vastPodXML = fs.readFileSync(path.join(__dirname, 'vast-pod.xml'), 'utf8');
export const vastNoAdXML = fs.readFileSync(path.join(__dirname, 'vast-empty.xml'), 'utf8');
export const vastWaterfallXML = fs.readFileSync(path.join(__dirname, 'vast-waterfall.xml'), 'utf8');
export const vastWaterfallWithInlineXML = fs.readFileSync(path.join(__dirname, 'vast-waterfall-with-inline.xml'), 'utf8');
export const vastInvalidXML = fs.readFileSync(path.join(__dirname, 'vast-invalid.xml'), 'utf8');
export const hybridInlineXML = fs.readFileSync(path.join(__dirname, 'vast-hybrid-inline.xml'), 'utf8');

export const wrapperParsedXML = parseXml(vastWrapperXML);
export const inlineParsedXML = parseXml(vastInlineXML);
export const vpaidInlineParsedXML = parseXml(vastVpaidInlineXML);
export const legacyVpaidInlineParsedXML = parseXml(legacyVastVpaidInlineXML);
export const podParsedXML = parseXml(vastPodXML);
export const noAdParsedXML = parseXml(vastNoAdXML);
export const waterfallParsedXML = parseXml(vastWaterfallXML);
export const waterfallWithInlineParsedXML = parseXml(vastWaterfallWithInlineXML);
export const vastInvalidParsedXML = parseXml(vastInvalidXML);
export const hybridInlineParsedXML = parseXml(hybridInlineXML);

export const wrapperAd = getFirstAd(wrapperParsedXML);
export const inlineAd = getFirstAd(inlineParsedXML);
export const hybridInlineAd = getFirstAd(hybridInlineParsedXML);
export const vpaidInlineAd = getFirstAd(vpaidInlineParsedXML);
export const legacyVpaidInlineAd = getFirstAd(legacyVpaidInlineParsedXML);
