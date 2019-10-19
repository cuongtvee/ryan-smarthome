module.exports = {
  'pwa': {
    'name': 'Ambianic UI',
    'themeColor': '#179aff',
    'msTileColor': '#179aff',
    'appleMobileWebAppCapable': 'yes',
    'workboxPluginMode': 'GenerateSW',
    'workboxOptions': {
      'runtimeCaching': [
        {
          'urlPattern': new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
          'handler': 'CacheFirst',
          'options': {
            'cacheName': 'google-fonts',
            'expiration': {
              'maxEntries': 30
            },
            'cacheableResponse': {
              'statuses': [
                0,
                200
              ]
            }
          }
        }
      ]
    }
  },
  'transpileDependencies': [
    'vuetify'
  ]
}
