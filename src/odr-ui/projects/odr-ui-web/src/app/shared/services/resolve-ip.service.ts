import { Injectable } from '@angular/core';
import { OdrService } from './odr.service';

@Injectable({
  providedIn: 'root'
})
export class ResolveIpService {

  constructor(private odrService:OdrService) { }
  public getIp():any{
    // http://api.ipify.org/?format=json
    // https://jsonip.com
    // https://ipinfo.io/json
    // let data=this.httpClient.get("https://api.ipify.org/?format=json");
    let data = this.odrService.getClientIP();
    return data;
  }
}