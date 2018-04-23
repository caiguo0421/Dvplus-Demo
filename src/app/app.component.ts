import { Component } from '@angular/core';
import {Config, Platform} from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import{FistRunPage,ApplyFormPage,ApplyListPage,LoginPage} from '../pages/pages';
import { HomePage } from '../pages/home/home';
import {StorageProvider} from "../providers/storage/storage";
import {Api} from "../providers/api/api";
import {AuthProvider} from "../providers/auth/auth";


@Component({
  templateUrl: 'app.html'
})

export class MyApp {
  rootPage:any =null; //HomePage;
  initalized:boolean = false;

  constructor(platform: Platform, statusBar: StatusBar,
              private splashScreen: SplashScreen,
              private config:Config,
              private storage:StorageProvider,private api:Api,private auth:AuthProvider) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      // statusBar.styleDefault();
      // splashScreen.hide();
      if(platform.is('ios')){
        statusBar.styleLightContent();
      }else{
        statusBar.styleBlackTranslucent();
      }

      // this.storage.clear();
      this.storage.initDb();//初始化本地数据库

      this.api.init().then(()=>{
        this.rootPage = FistRunPage;
        this.initalized = true;
        this.splashScreen.hide();
      }).catch((message)=>{
        this.auth.getCurrentCompanyServer().then((company)=>{
          if(company){
            this.rootPage = LoginPage;
            this.initalized = true;
            this.splashScreen.hide();
          }else{
            return Promise.reject(null);
          }
        }).catch(()=>{
          //认证公司
          this.auth.getAllCompanyServer().then((list:any)=>{
            if(list && list.length){
              this.rootPage = ApplyListPage;
              this.initalized = true;
              this.splashScreen.hide();
            }else{
              return Promise.reject(null);
            }
          }).catch(()=>{
            this.rootPage = ApplyFormPage;
            this.initalized = true;
            this.splashScreen.hide();
          });
        });
      });
      this.checkUpload();
    });
    this.initTranslate();
  }


  private initTranslate() {

    this.config.set('ios','backButtonText','返回');//返回按钮修改为中文
  }

  private checkUpload() {

  }


}

