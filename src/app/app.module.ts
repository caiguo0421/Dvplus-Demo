import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';

import {MyApp} from './app.component';
import {Api} from "../providers/api/api";
import {StorageProvider} from "../providers/storage/storage";
import {AuthProvider} from "../providers/auth/auth";
import {HttpClientModule} from "@angular/common/http";
import {Device} from "@ionic-native/device";

@NgModule({
  declarations: [
    MyApp
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp
  ],
  providers: [
    Api,
    Device,
    StorageProvider,
    AuthProvider,
    StatusBar,
    SplashScreen,
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
}
