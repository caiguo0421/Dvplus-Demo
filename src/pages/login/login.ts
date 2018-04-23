import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {CompanyServer} from "../../models/company-server";
import {User} from "../../models/User";
import {Api, Uri} from "../../providers/api/api";

/**
 * Generated class for the LoginPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

  account: User = {
    userNo: null,
    password: null,
    stationId: null,
    companyServer: null,

  }

  departments: Array<{ label: string, value: string }> = [];

  private companyServer: CompanyServer;

  constructor(public navCtrl: NavController, public navParams: NavParams,
              public api: Api) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad LoginPage');
  }

  /**
   * 返回认证公司界面
   */
  goApplyList() {

  }

  /**
   * 登录
   */
  doLogin() {

  }

  lastQueryId = 0;

  queryDepartment(event?: any) {
    console.log(event);
    let key = event ? event.target.value : this.account.userNo;
    if (!key) {
      return;
    }
    key = key.replace(/\s*/g, '');
    this.lastQueryId += 1;
    const currentId = this.lastQueryId;
    this.api.get(Uri.User.QueryDepartments, {userNo: key}).then((response: any) => {
      console.log("response =" + response);
      const departments = [];
      if (response.ret === 0) {
        if (response.data.major) {
          departments.push({
            label: '${response.data.major.unit_name}(默认)',
            value: response.data.major.station_id
          });

          if (response.data.secondary) {
            for (let i = 0; i < response.data.secondary.length; i++) {
              departments.push({
                label: response.data.secondary[i].unit_name,
                value: response.data.secondary[i].station_id
              });
            }
          }
        }
      }

      if (this.lastQueryId === currentId) {

        this.departments = departments;
        if (
          (this.account.stationId && departments && departments.length > 0)
          || (this.account.stationId && departments && departments.filter((department) => {
            return department.value === this.account.stationId;
          }).length > 0)
        ) {
          this.account.stationId = departments[0].value;
        }
      }

    }).catch((error) => {
      return Promise.resolve(null);
    });


  }
}
