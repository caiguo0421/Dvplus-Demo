import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import {Platform} from "ionic-angular";
// import {NativeStorage} from "@ionic-native/native-storage";


let db;
export let StorageType = 'Unknown';

/*
  Generated class for the StorageProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class StorageProvider {
  constructor(private platform: Platform) {
    this.platform.ready().then(this.initDb);
  }

  initDb(){
    if(StorageType === 'Unknown'){
      if(window['NativeStorage']){
        db = window['NativeStorage'];
        StorageType = 'NativeStorage';
      }else if(window['sqlitePlugin']) {
        db = window['sqlitePlugin'].openDatabase({name: 'storage_default.db', location:'default'});
        StorageType = 'Cordova SQLite';
      }else if(window['openDatabase']){
        db = window['openDatabase']('storage_default.db', '1.0', 'storageDefault', 5 * 1024 * 1024);
        StorageType = 'Browser SQLite';
      }else{
        db = null;
        StorageType = 'LocalStorage';
      }

      if(db && StorageType !== 'NativeStorage') {
        db.transaction((tx) => {
          tx.executeSql('CREATE TABLE IF NOT EXISTS storage_default(key TEXT, value TEXT, PRIMARY KEY(key))', []);
        });
      }
    }
  }

  setItem(key, value) {
    if (typeof (value) === 'undefined') {
      throw new Error('Set undefined to Storage');
    }
    return new Promise<any>((resolve, rejected) => {
      if(db) {
        if(StorageType === 'NativeStorage'){
          db.setItem(key, JSON.stringify(value), ()=>{resolve(value);}, ()=>{rejected();});
        }else {
          db.transaction((tx) => {
            tx.executeSql('INSERT OR REPLACE INTO storage_default (key, value) values (?, ?)', [key, JSON.stringify(value)], () => {
              resolve(value);
            });
          });
        }
      }else{
        window.localStorage.setItem(key, JSON.stringify(value));
        resolve(value);
      }
    });
  }

  getItem(key) {
    return new Promise((resolve, rejected) => {
      if(db) {
        if(StorageType === 'NativeStorage'){
          db.getItem(key, (value)=>{
            if(value) {
              resolve(JSON.parse(value));
            }else{
              rejected(null);
            }
          }, ()=>{rejected(null);});
        }else{
          db.transaction((tx) => {
            tx.executeSql('SELECT value FROM storage_default WHERE key = ?', [key], (res, result) => {
              const rows = res.rows || result.rows;
              if (!rows) {
                rejected(null);
              } else if (rows.length === 0) {
                rejected(null);
              } else {
                const json = rows.item(0).value;
                if (json) {
                  resolve(JSON.parse(json));
                } else {
                  rejected(null);
                }
              }
            });
          });
        }
      }else{
        const json = window.localStorage.getItem(key);
        if (json) {
          resolve(JSON.parse(json));
        } else {
          rejected(null);
        }
      }
    });
  }

  remove(key) {
    return new Promise((resolve, rejected) => {
      if(db) {
        if(StorageType === 'NativeStorage'){
          db.remove(key, ()=>{resolve();}, ()=>{rejected();});
        }else{
          db.transaction((tx) => {
            tx.executeSql('DELETE FROM storage_default WHERE key = ?', [key], () => {
              resolve(key);
            });
          });
        }
      }else{
        window.localStorage.removeItem(key);
        resolve(key);
      }
    });
  }

  get(key){
    return this.getItem(key);
  }

  set(key, value){
    return this.setItem(key, value);
  }


  clear() {
    if(db) {
      if(StorageType === 'NativeStorage'){
        db.clear(()=>{}, ()=>{});
      }else {
        db.transaction((tx) => {
          tx.executeSql('DELETE FROM storage_default', []);
        });
      }
    }else{
      window.localStorage.clear();
    }
  }
}
