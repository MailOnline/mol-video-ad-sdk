import path from 'path';
import fs from 'fs';
import xml2js from 'mol-vast-xml2js';
import {getFirstAd} from '../../src/index';

export const wrapperParsedXML = xml2js(fs.readFileSync(path.join(__dirname, 'vast-wrapper.xml'), 'utf8'), {compact: false});
export const inlineParsedXML = xml2js(fs.readFileSync(path.join(__dirname, 'vast-inline.xml'), 'utf8'), {compact: false});
export const podParsedXML = xml2js(fs.readFileSync(path.join(__dirname, 'vast-pod.xml'), 'utf8'), {compact: false});

export const wrapperAd = getFirstAd(wrapperParsedXML);
export const inlineAd = getFirstAd(inlineParsedXML);
