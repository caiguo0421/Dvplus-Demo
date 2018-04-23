import {Injectable} from "@angular/core";
import {AuthProvider} from "../auth/auth";
import {User} from "../../models/User";
import {CompanyServer} from "../../models/company-server";
import {HttpClient, HttpHeaders, HttpParams} from "@angular/common/http";
import {Device} from '@ionic-native/device';
import {DeviceUUID} from 'device-uuid';
import {Config} from "../../const/config";
import {App, ToastController} from "ionic-angular";
import {ApplyInfo} from "../../models/apply-info";


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

  constructor(public http: HttpClient, private device: Device,
              private auth: AuthProvider, private app: App, public toastCtrl: ToastController) {

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
      }).catch(() => {
        reject(SYSTEM_REJECT.NEED_LOGIN);
      });
    });
  }

  setCompany(companyServer: CompanyServer) {
    this.companyServer = companyServer;
    this.url = companyServer.serverUrl;

  }

  /**
   * Http的get方法
   * @param {string} endpoint
   * @param params
   * @param reqOpt
   */
  get(endpoint: string, params?: any, reqOpt?: any) {
    const originArgs = arguments;
    if (!this.url) {
      return this.init().then(() => {
        return this.get.apply(this, originArgs);
      });
    }

    if (!reqOpt) {
      reqOpt = {
        params: new HttpParams().set('OS', OS)
      };
    }

    if (params) {
      reqOpt.params = (new HttpParams().set('OS', OS));

      for (let k of params) {
        if (params[k] instanceof Array) {
          params[k].forEach((item) => {
            reqOpt.params = reqOpt.params.append(k, item);
          });
        } else {
          reqOpt.params = reqOpt.params.set(k, params[k]);
        }
      }
    }
    reqOpt.headers = this.buildHeaders();
    reqOpt.withCredentials = true;

    // Console.log("请求Url:${this.url}/${endpoint},参数：${reqOpt}");
    // console.log("123");

    return this.http.get(this.url + '/' + endpoint, reqOpt).toPromise().then((response: any) => {
      if (response && response.ret) {
        const message = response.msg || '连接服务器出现问题，请稍后再试';
        return Promise.reject(message);
      } else {
        return response;
      }
    });

  }

  private buildHeaders() {
    return new HttpHeaders(this.buildHeadsObj());
  }

  private buildHeadsObj() {
    const data = Object.assign({
      'Content-type': 'application/x-www-form-urlencoded',
      'jpushId': this.getJPushId(),
      'token': this.getToken(),
    }, this.user, {OS});

    return data;
  }

  private getJPushId() {
    return jpushId;
  }

  private getToken() {
    return this.device.uuid || ('h5-' + (new DeviceUUID().get()));
  }

  /**
   * 查询门户
   * @param {string} endPoint
   * @param params
   * @param reqOpts
   * @returns {Promise<>}
   */
  queryGateWay(endPoint: string, params?: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {
        params: new HttpParams()
      };
    }

    if (params) {
      reqOpts.params = new HttpParams();
      for (let k in params) {
        reqOpts.params = reqOpts.params.set(k, params[k]);
      }
    }

    return this.http.get(Config.get('gateway_base_url') + '/' + endPoint, reqOpts).toPromise().then((response: any) => {
      if (response && response.ret) {
        const message = response.msg || '连接服务器出现问题，请稍后再试'
        return Promise.reject(message);
      } else {
        return response;
      }
    });
  }

  defaultCatchHandler = (message) => {
    console.error(message);
    if (message === SYSTEM_REJECT.NEED_LOGIN) {
      this.app.getRootNav().setPages(['LoginPage']);
    } else {
      if (message && message.name == 'HttpErrorResponse') {
        if (message.error && message.error.text) {
          message = message.error.text;
        } else {
          message = '连接服务器出现问题，请稍后再试';
        }

      }
    }

    // if (typeof(this.toastCtrl) == "undefined") {
    //   return;
    // }
    this.toastCtrl.create({
      message: (message && message.message) || message || '连接服务器出现问题，请稍后再试',
      duration: 3000,
      position: 'top'
    }).present();
  }

  public applyAuth(applyInfo: ApplyInfo) {
    const applyPath = Uri.Auth.Apply;
    const params = Object.assign({}, applyInfo);
    params['mobileKey'] = this.getToken();
    return this.post(applyPath, {
      CertificationData: JSON.stringify(params), OS,
    });
  }


  post(endpoint: string, body: any, reqOpts?: any) {
    if (!reqOpts) {
      reqOpts = {};
    }
    if(!reqOpts.headers) {
      reqOpts.headers = this.buildHeaders();
    }
    reqOpts.withCredentials = true;

    return this.http.post(this.url + '/' + endpoint, this.buildParams({...body, OS}), reqOpts).toPromise().then((response: any)=>{
      if(response && response.ret){
        const message = response.msg || '连接服务器出现问题，请稍后再试';
        return Promise.reject(message);
      }else{
        return response;
      }
    });
  }


  private buildParams(params) {
    if (!params) {
      return '';
    }
    const args = Object.assign({}, params);
    const ret = [];
    for (const i in args) {
      if (args[i] instanceof Array) {
        for (let k = 0; k < args[i].length; k++) {
          ret.push(`${encodeURIComponent(i)}=${encodeURIComponent(args[i][k])}`);
        }
      } else {
        ret.push(`${encodeURIComponent(i)}=${encodeURIComponent(args[i])}`);
      }
    }
    return ret.join('&');
    // return urlEncode(args);
  }

}


export const Uri = {
  OA: {
    RegisterJPushId: '/Oa/register.action',
    RemoveNotification: '/Oa/know.action'
  },
  Base: {
    Stations: '/Base/getSysStations.action',
    SysBaseData: '/Base/getSysBaseDatas.action',
    Departments: '/Base/getDepartments.action',
  },
  User: {
    Login: '/User/User_login.action',
    UploadToken: '/UserInfo/UserInfo_getUploadImageToken.action',
    QueryDepartments: '/User/User_queryUserDepartment.action',
    UpdateAvatar: '/UserInfo/UserInfo_updateAvatar.action'
  },
  Auth: {
    Apply: '/Mobile/Mobile_addMobileAttestationAction.action',
  },
  StockBrowse: {
    Vehicle: {
      Condition: '/StockBrowse/VehicleStock_getVehicleCondition.action',
      Query: '/StockBrowse/VehicleStock_getVehicleStockV2.action',
      QueryOnWay: '/StockBrowse/VehicleStock_getVehicleOnWay.action',
      ConversionDetail: '/StockBrowse/VehicleStock_getVehicleConversionDetail.action',
      Summary: '/StockBrowse/VehicleStock_getListCountOfVehicle.action',
      SummaryOnWay: '/StockBrowse/VehicleStock_getListCountOfOnWayVehicle.action'
    },
    Part: {
      WareHouse: '/StockBrowse/PartStock_getInitData.action',
      Query: '/StockBrowse/PartStock_getPartStockV2.action',
      History: '/StockBrowse/PartStock_getPartStockHistory.action',
      Summary: '/StockBrowse/PartStock_getListCountOfPart.action'
    },
  },
  Office: {
    Approval: {
      Condition: '/Offices/Approval_getInitData.action',
      Approving: '/Offices/Approval_getPendingMatters.action',
      Approved: '/Offices/Approval_getApprovedDocumentByCriteria.action',
      MyApproving: '/Offices/Approval_getMyApprovingDocument.action',
      MyApproved: '/Offices/Approval_getMyApprovedDocument.action',
      Detail: '/Offices/Approval_getDocumentDetail.action',
      History: '/Offices/Approval_getDocumentHistory.action',
      Approve: '/Offices/Approval_approveDocument.action',
      Attachment: '/Offices/Approval_getAttachment.action',
    },
    Report: {
      Sales: {
        SalesAndGoal: '/Report/Sales_getSalesAndGoal.action',
        CustomerValue: '/Report/Sales_getCustomerValue.action',
        BusinessPermeate: '/Report/Sales_getBusinessPermeate.action',
        DeliveryLog: '/Report/Sales_getDeliveryLog.action',
        DeliveryLogSummary: '/Report/Sales_getDeliveryLogTotal.action',
        SalesTrend: '/Report/Sales_getSalesTrend.action',
        DashboardCount: '/Report/Sales_getDashboardCount.action'
      },
      Part: {
        StockOutReport: '/Report/Fittings_getStockOutReport.action',
        StockInReport: '/Report/Fittings_getStockInReport.action',
        FixedReport: '/Report/Fittings_getFixedReport.action',
        ProductionValueTrade: '/Report/Fittings_getProductionValueTrade.action',
      }
    }
  },
  Contact: {
    Query: '/User/User_getContacts.action',
    Get: '/User/User_getContact.action',
  },
  Crm: {
    Init: '/Customer/Customer_getSysInitData.action',
    MyCustomers: '/Customer/Customer_getMyCustomers.action',
    Customers: '/Customer/Customer_getCustomers.action',
    Customer: '/Customer/Customer_getCustomer.action',
    AddCustomerBase: '/Customer/Customer_addCustomerBase.action',
    UpdateCustomerBase: '/Customer/Customer_updateCustomerBase.action',
    VehicleOverview: '/Customer/Customer_getVehicleOverview.action',
    AddVehicleOverview: '/Customer/Customer_addVehicleOverview.action',
    UpdateVehicleOverview: '/Customer/Customer_updateVehicleOverview.action',
    RemoveVehicleOverview: '/Customer/Customer_removeVehicleOverview.action',

    RelatedObjectsStore: '/Customer/Customer_getRelatedObjects.action',

    Organizational: '/Customer/Customer_getOrganizational.action',
    AddOrganizational: '/Customer/Customer_addOrganizational.action',
    UpdateOrganizational: '/Customer/Customer_updateOrganizational.action',

    VehicleArchives: '/Customer/Customer_getVehicleArchives.action',
    AddVehicleArchives: '/Customer/Customer_addVehicleArchives.action',
    UpdateVehicleArchives: '/Customer/Customer_updateVehicleArchives.action',


    Consumption: '/Customer/Customer_getConsumption.action',
    Clues: '/Customer/Customer_getSaleClues.action',
    AddClue: '/Customer/Customer_addPreSalleClue.action',
    UpdateClue: '/Customer/Customer_updatePreSalleClue.action',
    UpdateClueResult: '/Customer/Customer_updatePreSalleClueResult.action',
    RemoveClue: '/Customer/Customer_removeSaleClue.action',
    Clue: '/Customer/Customer_getPreSalleClue.action',
    ClueBackVisitList: '/Customer/Customer_getBackVisitList.action',
    Visits: '/Customer/Customer_getVisits.action',
    Visit: '/Customer/Customer_getVisit.action',
    AddVisit: '/Customer/Customer_addVisit.action',
    UpdateVisit: '/Customer/Customer_updateVisit.action',
    Callbacks: '/Customer/Customer_getCallbacks.action',
    CallbackDetail: '/Customer/Customer_getCallbackDetail.action',
    UploadToken: '/Customer/Customer_getUploadToken.action',
    VehicleStore: '/Customer/Customer_getVehicleStore.action',

    AddClueBack: '/Customer/Customer_addClueBack.action',
    ClueBackDetail: '/Customer/Customer_getClueBack.action',
    UpdateClueBack: '/Customer/Customer_updateClueBack.action',
    CheckClueBack: '/Customer/Customer_checkClueBack.action',
    ClueBacks: '/Customer/Customer_getClueBacks.action',

    Callback: '/Customer/Customer_getCallback.action',
    UpdateCallback: '/Customer/Customer_updateCallback.action',
    AddCallback: '/Customer/Customer_addCallback.action',

    BaseData: '/Customer/Customer_getBaseDataOfEditCustomer.action',

    MyCalendar: '/Customer/Customer_getMyCalendar.action',
    MyCalendarCount: '/Customer/Customer_getMyCalendarCount.action',
    GiveUpCustomer: '/Customer/Customer_giveUpCustomer.action',
    GetPublicCustomers: '/Customer/Customer_getPublicCustomers.action',

    ApplyPublicCustomer: '/Customer/Customer_applyPublicCustomer.action',
    SetCustomerMaintenance: '/Customer/Customer_setCustomerMaintenance.action',

    CheckCustomerRepeat: '/Customer/Customer_checkCustomerRepeat.action',
    GetCustomerRepeat: '/Customer/Customer_getCustomerRepeat.action',

    SaleClueBackByCustomer: '/Customer/Customer_getSaleClueBackByCustomer.action',
    SaleClueBackByCule: '/Customer/Customer_getSaleClueBackByCule.action',

    CustomerMap: '/Customer/Customer_getCustomerMap.action'
  },
  Finance: {
    MoneyQuery: {
      AccountAll: '/StockBrowse/Funds_getFundsAccounts.action',
      InDetail: '/StockBrowse/Funds_getFinanceDocumentEntries.action',
      CapitalAccount: '/StockBrowse/Funds_getTotalCountOfFundsAccounts.action',
      DetailAll: '/StockBrowse/Funds_getTotalCountOfFinance.action',
    },
    ReceivableQuery: {},
  },
};
