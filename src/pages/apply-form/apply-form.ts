import {Component} from '@angular/core';
import {IonicPage, NavController, NavParams} from 'ionic-angular';
import {Api, Uri} from "../../providers/api/api";
import {CompanyServer} from "../../models/company-server";
import {AuthProvider} from "../../providers/auth/auth";

/**
 * Generated class for the ApplyFormPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-apply-form',
  templateUrl: 'apply-form.html',
})
export class ApplyFormPage {

  companies = [];
  filterList = [];

  account:any={
    companyName:null,
    applyUser:null,
    stationId:null,
    applyDept:null,
    applyRemark:null,
  }

  keyword:string ='';

  stations =[];
  departments =[];


  showAutoComplete:boolean = false;

  companyServer:CompanyServer;

  constructor(public api:Api, public auth:AuthProvider,
              public navCtrl: NavController, public navParams: NavParams) {
    this.api.queryGateWay("company/getCompanies.action").then((result)=>{
      this.companies =[].concat(result);
    });
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ApplyFormPage');
  }

  onKeywortFocus() {
    this.showAutoComplete = true;
  }

  onKeywordChange(event: any) {
    const keyword = event.target.value;
    this.filterList = this.filter(keyword);
  }

  private filter(k: any) {
   if(!k||k.length===0){
     return [];
   }

   const keyword = k.replace(/\s*/g,'');
   let result = this.companies.filter((item)=>{
     return item['companyName'].toLowerCase().startsWith(keyword.toLowerCase())||
       item['companyNo'].toLowerCase().startsWith(keyword.toLowerCase());
   });

   if(result && result.length>5){
     result.splice(0,5);
   }

   return result;
  }


  /**
   * 选择经销商
   * @param company
   */
  choiceCompany(company) {
    if(company){
      this.account.companyName = company.companyName;
      this.showAutoComplete = false;
      this.keyword = this.account.companyName;
      this.queryServer();
    }
  }

  private queryServer() {
    return this.api.queryGateWay('company/getCompany.action',{companyName:this.account.companyName})
      .then((response:any)=>{
        this.companyServer = response as CompanyServer;
        this.api.setCompany(this.companyServer);

        //查找部门
        this.api.get(Uri.Base.Stations).then((response:any)=>{
          this.stations = response.data;
        }).catch(this.api.defaultCatchHandler);

        this.api.get(Uri.Base.Departments).then((response:any)=>{
          this.departments = response.data.filter((item)=>{
            return item&&item['unit_type']&&item['unit_type'].toString()==='1';
          });
        }).catch(this.api.defaultCatchHandler);

      }).catch(this.api.defaultCatchHandler);
  }


  /**
   * 完成
   */
  submit(){
    this.api.applyAuth(this.account).then((response)=>{
      this.auth.addCompanyServer(this.companyServer).then(()=>{
        this.auth.setCurrentCompanyServer(this.companyServer).then(()=>{
          this.api.setCompany(this.companyServer);
          this.navCtrl.push('LoginPage');
        });
      });
    }).catch(this.api.defaultCatchHandler);
  }


}
