# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

<a name="0.3.0"></a>
# 0.3.0 (2018-08-09)


### Bug Fixes

* 🐜 clickthroug of iframe icon ([e58dc6f](https://github.com/MailOnline/mol-video-ad-sdk/commit/e58dc6f))
* 🐜 finish adUnit before calling on finish ([a39c4f1](https://github.com/MailOnline/mol-video-ad-sdk/commit/a39c4f1))
* 🐜 fix click through ([61801af](https://github.com/MailOnline/mol-video-ad-sdk/commit/61801af))
* 🐜 fix clickthrough handler ([71541d7](https://github.com/MailOnline/mol-video-ad-sdk/commit/71541d7))
* 🐜 fix fullscreen tracking ([4d287e1](https://github.com/MailOnline/mol-video-ad-sdk/commit/4d287e1))
* 🐜 fix icon rendering ([3848ce1](https://github.com/MailOnline/mol-video-ad-sdk/commit/3848ce1))
* 🐜 fix icon rendering once ad finished ([6e6c8a8](https://github.com/MailOnline/mol-video-ad-sdk/commit/6e6c8a8))
* 🐜 fix problem with mixed default and named ([d54585b](https://github.com/MailOnline/mol-video-ad-sdk/commit/d54585b))
* 🐜 fix skip offset logic and skip btn styles ([b056971](https://github.com/MailOnline/mol-video-ad-sdk/commit/b056971))
* 🐜 fix timeout clearing ([65c1872](https://github.com/MailOnline/mol-video-ad-sdk/commit/65c1872)), closes [#57](https://github.com/MailOnline/mol-video-ad-sdk/issues/57)
* 🐜 fix typo ([9c7bdf8](https://github.com/MailOnline/mol-video-ad-sdk/commit/9c7bdf8))
* 🐜 fix typo in IFrame Icon rendering ([6c88f32](https://github.com/MailOnline/mol-video-ad-sdk/commit/6c88f32))
* 🐜 fix video click tracking ([90d747a](https://github.com/MailOnline/mol-video-ad-sdk/commit/90d747a))
* 🐜 rm element validation on videoContainer ([421d9f1](https://github.com/MailOnline/mol-video-ad-sdk/commit/421d9f1))


### Features

* 🎸 add 3 seconds timeout to all creative ([2aa419c](https://github.com/MailOnline/mol-video-ad-sdk/commit/2aa419c))
* 🎸 add element observer methods to sdk pckg ([fe3bfea](https://github.com/MailOnline/mol-video-ad-sdk/commit/fe3bfea))
* 🎸 add icon rendering logic to VpaidAdUnit ([2c72a2e](https://github.com/MailOnline/mol-video-ad-sdk/commit/2c72a2e))
* 🎸 add nonLinear tracking events logic ([ef461f2](https://github.com/MailOnline/mol-video-ad-sdk/commit/ef461f2))
* 🎸 add onError, onAdStart and onRunFinish ([83acde1](https://github.com/MailOnline/mol-video-ad-sdk/commit/83acde1)), closes [#57](https://github.com/MailOnline/mol-video-ad-sdk/issues/57)
* 🎸 add onFinish hook to adUnit ([ff1a9f3](https://github.com/MailOnline/mol-video-ad-sdk/commit/ff1a9f3))
* 🎸 add selector to get interactiveFiles from ([c5fc0e4](https://github.com/MailOnline/mol-video-ad-sdk/commit/c5fc0e4))
* 🎸 add timeout logic to runWaterfall ([e82deea](https://github.com/MailOnline/mol-video-ad-sdk/commit/e82deea))
* 🎸 add timeout logic to vast requests ([b9747c5](https://github.com/MailOnline/mol-video-ad-sdk/commit/b9747c5))
* 🎸 add timout option to run method ([1b8f9dd](https://github.com/MailOnline/mol-video-ad-sdk/commit/1b8f9dd))
* 🎸 add type property to adUnit classes ([9b7e25e](https://github.com/MailOnline/mol-video-ad-sdk/commit/9b7e25e))
* 🎸 add viewability and responsive logic ([bb6b832](https://github.com/MailOnline/mol-video-ad-sdk/commit/bb6b832))
* 🎸 add volume getter/setter to VastAdUnit ([0721702](https://github.com/MailOnline/mol-video-ad-sdk/commit/0721702))
* 🎸 add vpaid clickThrough logic ([520d239](https://github.com/MailOnline/mol-video-ad-sdk/commit/520d239))
* 🎸 add vpaid helpers and selectors ([feae938](https://github.com/MailOnline/mol-video-ad-sdk/commit/feae938))
* 🎸 add VpaidAdUnit scheleton ([d7ab6ff](https://github.com/MailOnline/mol-video-ad-sdk/commit/d7ab6ff))
* 🎸 call creativeAd methods ([399fa50](https://github.com/MailOnline/mol-video-ad-sdk/commit/399fa50))
* 🎸 cancel adUnit if it was timed out ([6ac2684](https://github.com/MailOnline/mol-video-ad-sdk/commit/6ac2684))
* 🎸 change adUnit api to throw if adunit is ([c3b9704](https://github.com/MailOnline/mol-video-ad-sdk/commit/c3b9704))
* 🎸 create VpaidAdUnit for Vpaid ads ([801f56d](https://github.com/MailOnline/mol-video-ad-sdk/commit/801f56d))
* 🎸 do handshake once creative is loaded ([00a029e](https://github.com/MailOnline/mol-video-ad-sdk/commit/00a029e))
* 🎸 export VpaidAdUnit ([88546fc](https://github.com/MailOnline/mol-video-ad-sdk/commit/88546fc))
* 🎸 finish vpaid ad unit start logic ([fb05382](https://github.com/MailOnline/mol-video-ad-sdk/commit/fb05382))
* 🎸 handle vpaid creative events ([2d4d94b](https://github.com/MailOnline/mol-video-ad-sdk/commit/2d4d94b))
* 🎸 load creative on VpaidAdUnit constructor ([eae65ef](https://github.com/MailOnline/mol-video-ad-sdk/commit/eae65ef))
* 🎸 make runWaterfall return cancel function ([21ea572](https://github.com/MailOnline/mol-video-ad-sdk/commit/21ea572)), closes [#57](https://github.com/MailOnline/mol-video-ad-sdk/issues/57)
* 🎸 merge secure and non secure ad containers ([1345a8d](https://github.com/MailOnline/mol-video-ad-sdk/commit/1345a8d))
* 🎸 must be possible to cancel and ad unit ([087ec7c](https://github.com/MailOnline/mol-video-ad-sdk/commit/087ec7c)), closes [#51](https://github.com/MailOnline/mol-video-ad-sdk/issues/51)
* 🎸 prevent manual progress while ad is on ([4b1b711](https://github.com/MailOnline/mol-video-ad-sdk/commit/4b1b711)), closes [#57](https://github.com/MailOnline/mol-video-ad-sdk/issues/57)
* 🎸 remove classes from sdk package index ([8eccf88](https://github.com/MailOnline/mol-video-ad-sdk/commit/8eccf88))
* 🎸 remove onComplete from VastAdUnit ([e42f692](https://github.com/MailOnline/mol-video-ad-sdk/commit/e42f692))
* 🎸 remove onLinearEvent option ([2a16899](https://github.com/MailOnline/mol-video-ad-sdk/commit/2a16899))
* 🎸 update scope of packages ([18846c5](https://github.com/MailOnline/mol-video-ad-sdk/commit/18846c5))
* 🎸 update sdk api and remove unneeded logic ([9f47cc3](https://github.com/MailOnline/mol-video-ad-sdk/commit/9f47cc3))
* 🎸 VpaidAdUnit onFinish/onError logic ([12ca63d](https://github.com/MailOnline/mol-video-ad-sdk/commit/12ca63d))
* rename vast-loader module 2 vast-request ([8f720f9](https://github.com/MailOnline/mol-video-ad-sdk/commit/8f720f9))
