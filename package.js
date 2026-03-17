Package.describe({
  name: 'dupontbertrand:mail-preview',
  version: '1.0.0',
  summary: 'Dev-mode mail preview UI — view captured emails at /__meteor_mail__',
  git: 'https://github.com/dupontbertrand/meteor-mail-preview',
  documentation: 'README.md',
});

Package.onUse(function (api) {
  api.versionsFrom(['2.2', '3.0']);
  api.use('ecmascript', 'server');
  api.use('logging', 'server');
  api.use('email', 'server');
  api.use('webapp', 'server');
  api.mainModule('server.js', 'server');
});
