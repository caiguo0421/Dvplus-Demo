import {Injectable} from "@angular/core";
import {StorageProvider} from "../storage/storage";
import {User} from "../../models/User";
import {Config} from "../../const/config";
import {CompanyServer} from "../../models/company-server";

const COMPANIES_KEY = 'Company:companies';
const CURRENT_COMPANY_KEY = 'Auth:currentCompany';
const LOGIN_USER = 'Api:LoginUser';
const CONTACT_STORAGE_KEY = '__SYS_CONTACTS_LIST_CACHE__';

@Injectable()
export class AuthProvider {


  constructor(public storage: StorageProvider,) {

  }

  getCurrentUser() {
    return this.storage.get(LOGIN_USER).then((user) => {
      if (user && user["password"]) {
        return Promise.resolve(user);
      } else {

        return Promise.reject(null);
      }
    }).catch(() => Promise.reject(null));
  }




  /**
   * 获得公司列表（门户）
   */
  getAllCompanyServer() {
    // if(Config.get('debug')){
    //   return this.storage.getItem(COMPANY_KEY).then((list:any)=>{
    //     if(list && list.length>0){
    //       list = list.concat(Config.get('debugServer')).contract(Config.get('localServer'));
    //     }else{
    //       list = [Config.get('debugServer'),Config.get('localServer')];
    //     }
    //     return list;
    //   }).catch(()=>{
    //    return [Config.get('debugServer'),Config.get('localServer')];
    //   });
    //
    // }else{
    //   return this.storage.getItem(COMPANY_KEY);
    // }

    return this.storage.getItem(COMPANIES_KEY);
  }

  /**
   * 设置CompanyServer
   * @param {CompanyServer} company
   */
  setCurrentCompany(company: CompanyServer) {
    return this.storage.setItem(CURRENT_COMPANY_KEY,company);
  }

  addCompanyServer(authInfo: CompanyServer){
    return this.storage.getItem(COMPANIES_KEY).then((list:any)=>{
      let i;
      for(i=0;i<list.length;i++){
        if(list[i].companyNo === authInfo.companyNo){
          list[i].serverUrl = authInfo.serverUrl;
          list[i].companyName = authInfo.companyName;
          break;
        }
      }
      if(i === list.length){
        list.push(authInfo);
      }
      return this.storage.setItem(COMPANIES_KEY, list)
    }, (error)=>{
      const companies = [authInfo];
      return this.storage.setItem(COMPANIES_KEY, companies);
    });
  }

  removeCompanyServer(authInfo: CompanyServer){
    return this.storage.getItem(COMPANIES_KEY).then((list:any)=>{
      let i;
      for(i=0;i<list.length;i++){
        if(list[i].companyNo === authInfo.companyNo){
          list.splice(i, 1);
          return this.storage.setItem(COMPANIES_KEY, list);
        }
      }
    }, (error)=>{
      const companies = [];
      return this.storage.setItem(COMPANIES_KEY, companies);
    });
  }

  setCurrentCompanyServer(authInfo: CompanyServer){
    return this.storage.setItem(CURRENT_COMPANY_KEY, authInfo);
  }

  getCurrentCompanyServer(){
    return this.storage.getItem(CURRENT_COMPANY_KEY).catch(()=>Promise.resolve(null));;
  }

  setCurrentUser(userInfo: User){
    return this.storage.setItem(LOGIN_USER, userInfo);
  }



  removeCurrentUser(){
    this.storage.remove(CONTACT_STORAGE_KEY);
    return this.storage.remove(LOGIN_USER);
  }
}
