import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http'

@Injectable({
  providedIn: 'root'
})
export class ReverseGeocodingService {

  constructor(private httpClient:HttpClient) { }

  public get(lat:number, long:number){
    return this.httpClient.get("https://api.bigdatacloud.net/data/reverse-geocode-client?latitude="+lat+"&longitude="+long+"&localityLanguage=en")
  }
}
