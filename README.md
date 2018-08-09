# Video Ad SDK - Mono repo
### All the code you'll ever need to run preroll video ads in the browser

To run video ads in the browser there are many alternatives. The most famous one is probably Google's [IMA SDK](https://developers.google.com/interactive-media-ads/docs/sdks/html5/) for HTML5. There are two main cons with that SDK. It only works through DoubleClick and it is a black box very hard to debug and to maintain. This SDK tries to offer an alternative to play video ads that can work with any player in the world and any ad server that supports the VAST specification. And since it is open source you can read the code and debug if you need to.

## Projects include:
* [vast-xml2js](https://github.com/MailOnline/mol-video-ad-sdk/tree/next-release/packages/vast-xml2js): A wrapper on top of [DOMParser](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser) to be able to parse XML files in the browser and in node if needed. For node we use [xmldom](https://www.npmjs.com/package/xmldom)
* [video-ad-sdk](https://github.com/MailOnline/mol-video-ad-sdk/tree/next-release/packages/video-ad-sdk): SDK to load and play [VAST](https://www.iab.com/guidelines/digital-video-ad-serving-template-vast-4-0/)/[VPAID](https://www.iab.com/guidelines/digital-video-player-ad-interface-definitions-vpaid-compliance/) video ads.
* [videojs-vast-vpaid](https://github.com/MailOnline/mol-video-ad-sdk/tree/next-release/packages/videojs-vast-vpaid): [video.js](https://videojs.com/) plugin that loads video-ads using [@mailonline/video-ad-sdk](ps://github.com/MailOnline/mol-video-ad-sdk/tree/next-release/packages/video-ad-sdk).
* [react-vast-vpaid](https://github.com/MailOnline/mol-video-ad-sdk/tree/next-release/packages/react-vast-vpaid): [React](https://reactjs.org/) component that loads video-ads using [@mailonline/video-ad-sdk](https://github.com/MailOnline/mol-video-ad-sdk/tree/next-release/packages/video-ad-sdk).

## Documentation
Currently we only have the API which you can check [here](https://mailonline.github.io/mol-video-ad-sdk/index.html).

## Compiling and Testing
We use [nvm](https://github.com/creationix/nvm) to decide which of node to use and [Yarn workspaces](https://yarnpkg.com/lang/en/docs/workspaces/) together with [lerna](https://github.com/lerna/lerna) to manage the mono repo.

So after you clone the repo you just need to run
```
$ nvm use
```
to install the supported node version, then run [`yarn`](https://yarnpkg.com/lang/en/docs/cli/#toc-default-command)'s default command
```
$ yarn
```
to install and build the packages and finally you can run
```
$ yarn test
```
to run the tests.

## Discussion

Please open an issue if you have any questions or concerns.

## License
[MIT License](https://opensource.org/licenses/MIT)