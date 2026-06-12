export default defineAppConfig({
  pages: [
    'pages/square/index',
    'pages/match/index',
    'pages/calendar/index',
    'pages/message/index',
    'pages/profile/index',
    'pages/project-detail/index',
    'pages/user-detail/index',
    'pages/publish/index',
    'pages/meet/index',
    'pages/review/index'
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#FFFFFF',
    navigationBarTitleText: '校园创业搭子',
    navigationBarTextStyle: 'black'
  },
  tabBar: {
    color: '#94A3B8',
    selectedColor: '#5B86E5',
    backgroundColor: '#FFFFFF',
    borderStyle: 'white',
    list: [
      {
        pagePath: 'pages/square/index',
        text: '项目广场'
      },
      {
        pagePath: 'pages/match/index',
        text: '搭子匹配'
      },
      {
        pagePath: 'pages/calendar/index',
        text: '资源日历'
      },
      {
        pagePath: 'pages/message/index',
        text: '消息'
      },
      {
        pagePath: 'pages/profile/index',
        text: '我的'
      }
    ]
  }
})
