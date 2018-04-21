export class Config {

  static readonly store = {
    gateway_base_url: 'http://113.57.169.43:8088/DfcvMobile/',
    app_id: 'f34bd897',
    version: {
      target: '3.1.18',
      build: 3118,
    },

    debug: true,

    name: '掌上天友',

    feedback: {
      email: 'tianyou@sf-soft.cn',
      website: 'http://www.sf-soft.cn',
      wechat: 'SZTYSF'
    },

    debugServer: {
      companyName: "优信内部测试",
      companyNo: "UsingnetDeveloper",
      serverUrl: "http://172.17.1.93:8094"
    },

    localServer: {
      companyName: "本地测试",
      companyNo: "LocalhostDeveloper",
      serverUrl: "http://localhost:8094"
    },

    storage: {
      qiniu: {
        avatar: {
          domain: 'dvplus.usingnet.com',
          baseUri: 'http://dvplus.usingnet.com/avatar/',
          ssl: false
        }
      }
    },

    notice: {
      jpush:{
        appKey:'237216da5038dce269898c74',
        masterSecret: 'a68c359c80ab3cb6cf516812'
      }
    },

    location:{
      baidu: {
        web: {
          ak: '96GkHG15QdafG9hHOrnkHlZbbZ8wDFyv',
          script: 'https://api.map.baidu.com/api?v=3.0&ak=96GkHG15QdafG9hHOrnkHlZbbZ8wDFyv&callback=baiduMapInit',
          // script: 'https://api.map.baidu.com/api?ak=96GkHG15QdafG9hHOrnkHlZbbZ8wDFyv&v=1.0&type=lite&callback=baiduMapInit',
          callbackName: 'baiduMapInit'
        },
        plugins: []
      }
    },

    upload:{
      prefix: 'Uploads/'
    },

    download:{
      path: 'Download'
    }
  };

  constructor() {

  }

  static get(key: string){
    if(typeof(this.store[key]) === 'undefined'){
      return null;
    }else{
      return this.store[key];
    }
  }
}
