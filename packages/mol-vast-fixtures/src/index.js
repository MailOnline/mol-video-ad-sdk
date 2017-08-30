import path from 'path';
import fs from 'fs';
import xml2js from 'mol-vast-xml2js';
import {getFirstAd} from 'mol-vast-selectors';

export const vastWrapperXML = fs.readFileSync(path.join(__dirname, 'vast-wrapper.xml'), 'utf8');
export const vastInlineXML = fs.readFileSync(path.join(__dirname, 'vast-inline.xml'), 'utf8');
export const vastPodXML = fs.readFileSync(path.join(__dirname, 'vast-pod.xml'), 'utf8');
export const vastNoAdXML = fs.readFileSync(path.join(__dirname, 'vast-empty.xml'), 'utf8');
export const vastWaterfallXML = fs.readFileSync(path.join(__dirname, 'vast-waterfall.xml'), 'utf8');
export const vastWaterfallWithInlineXML = fs.readFileSync(path.join(__dirname, 'vast-waterfall-with-inline.xml'), 'utf8');
export const vastInvalidXML = fs.readFileSync(path.join(__dirname, 'vast-invalid.xml'), 'utf8');

export const wrapperParsedXML = xml2js(vastWrapperXML);
export const inlineParsedXML = xml2js(vastInlineXML);
export const podParsedXML = xml2js(vastPodXML);
export const noAdParsedXML = xml2js(vastNoAdXML);
export const waterfallParsedXML = xml2js(vastWaterfallXML);
export const waterfallWithInlineParsedXML = xml2js(vastWaterfallWithInlineXML);
export const vastInvalidParsedXML = xml2js(vastInvalidXML);

export const wrapperAd = getFirstAd(wrapperParsedXML);
export const inlineAd = getFirstAd(inlineParsedXML);
