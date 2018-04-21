import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {CompanyServer} from "../../models/company-server";
import {AuthProvider} from "../../providers/auth/auth";

/**
 * Generated class for the ApplyListPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-apply-list',
  templateUrl: 'apply-list.html',
})
export class ApplyListPage {

  companies:Array<CompanyServer> = [];

  constructor(public navCtrl: NavController, public navParams: NavParams, public auth:AuthProvider) {
    this.refreshCompannies();
  }


  private refreshCompannies() {
    this.auth.getAllCompanyServer().then((list: any)=>{
      if(list && list.length > 0) {
        this.companies = [].concat(list);
        // this.cdRef.detectChanges();
      }else{
        this.companies = [];
        this.goAddForm();
        // his.cdRef.detectChanges();
        // this.goAddForm();
      }
    }).catch( ()=>{
      this.goAddForm();
      // this.cdRef.detectChanges();
      // this.goAddForm();
    });
  }

  private goAddForm() {

  }

  removeCompanyServer(company: CompanyServer) {

  }

  goLogin(company: CompanyServer) {

  }
}
