import {Injectable} from "@angular/core";
import {StorageProvider} from "../storage/storage";
import {User} from "../../models/User";
import {Config} from "../../const/config";

const LOGIN_USER = 'Api:LoginUser';

const CURRENT_COMPANY_KEY = 'Auth:currentCompany';

const COMPANY_KEY = "Company:companies";

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


  getCurrentCompanyServer() {
    return this.storage.getItem(CURRENT_COMPANY_KEY).catch(() => Promise.reject(null));
  }

  /**
   * 获得公司列表（门户）
   */
  getAllCompanyServer() {
    if(Config.get('debug')){
      return this.storage.getItem(COMPANY_KEY).then((list:any)=>{
        if(list && list.length>0){
          list = list.concat(Config.get('debugServer')).contract(Config.get('localServer'));
        }else{
          list = [Config.get('debugServer'),Config.get('localServer')];
        }
        return list;
      }).catch(()=>{
       return [Config.get('debugServer'),Config.get('localServer')];
      });

    }else{
      return this.storage.getItem(COMPANY_KEY);
    }
  }
}
