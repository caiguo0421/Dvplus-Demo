import {Injectable} from "@angular/core";
import {AuthProvider} from "../auth/auth";
import {User} from "../../models/User";
import {CompanyServer} from "../../models/company-server";


const OS = 'H5';
let jpushId = '';
export const SYSTEM_REJECT = {
  NEED_LOGIN: 'SYSTEM:API:NEED_LOGIN'
};


@Injectable()
export class Api {
  url: string = '';
  companyServer: CompanyServer = null;
  user: User = null;

  constructor(private auth: AuthProvider) {

  }

  /**
   *初始化
   */
  init() {
    return new Promise((resolve, reject) => {
      this.auth.getCurrentUser().then((user: any) => {
        if (user && user.companyServer) {
          this.user = user;
          this.setCompany(user.companyServer);
          resolve(user);
        } else if (user) {
          this.auth.getCurrentCompanyServer().then((companyServer: any) => {
            if (companyServer) {
              user.companyServer = companyServer;
              this.user = user;
              this.setCompany(companyServer);
              reject(SYSTEM_REJECT.NEED_LOGIN);
            } else {
              reject(SYSTEM_REJECT.NEED_LOGIN);
            }
          })
        } else {
          reject(SYSTEM_REJECT.NEED_LOGIN);
        }
      }).catch(()=>{
        reject(SYSTEM_REJECT.NEED_LOGIN);
      });
    });
  }

  setCompany(companyServer: CompanyServer) {
    this.companyServer = companyServer;
    this.url = companyServer.serverUrl;

  }
}
