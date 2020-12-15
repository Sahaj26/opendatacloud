// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, Subject } from 'rxjs';
import { catchError, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { AuthService, DatasetSchemaService, DatasetService, OdrService } from '../../shared/services';
import { ResolveIpService } from '../../shared/services/resolve-ip.service';
import { ReverseGeocodingService } from '../../shared/services/reverse-geocoding.service';
import { Dataset } from '../../shared/types/dataset.type';
import { RegistrationInfo } from '../../shared/types/registration-info.type';

interface DatasetLicenseUserDetails {
    dataset: Dataset;
    acceptedLicense: boolean;
    isAuthenticated: boolean;
}

@Component({
    selector: 'app-dataset-loader',
    templateUrl: './dataset-loader.component.html',
})
export class DatasetLoaderComponent implements OnDestroy,OnInit {

    public isLoading = true;
    public notFound = false;
    public datasetDetails: Observable<DatasetLicenseUserDetails>;
    isRegistered:boolean=false;
    datasetId:string;
    oldInfo:RegistrationInfo;
    ip: string="";
    city: string="";
    state: string="";
    country: string="";

    private refreshSubject: Subject<boolean> = new BehaviorSubject(true);

    constructor(
        private route: ActivatedRoute,
        private authService: AuthService,
        private datasetService: DatasetService,
        private datasetSchemaService: DatasetSchemaService,
        private odrService: OdrService,
        private resolveIp: ResolveIpService,
        private revGeoCoding: ReverseGeocodingService) {

        const refreshStream = this.refreshSubject.asObservable();

        const datasetIdStream = this.route.params
            .pipe(
                map((params: Params) => params['id'])
            );

        const authenticatedStream = this.authService
            .getAuthenticationStatus();

        const licenseAcceptedStream =
            combineLatest(datasetIdStream, authenticatedStream, refreshStream)
                .pipe(
                    mergeMap(([datasetId, isAuthenticated]) => {
                        return isAuthenticated ?
                            this.odrService.getDatasetLicenseStatus(datasetId).pipe(map(b => !!b)) :
                            of(false);
                    })
                );

        const datasetStream = datasetIdStream
            .pipe(
                tap(() => {
                    this.isLoading = true;
                    this.notFound = false;
                }),
                switchMap((datasetId) => this.datasetService.getDetailDataset(datasetId)),
                catchError((err) => {
                    if (err instanceof HttpErrorResponse && err.status === 404) {
                        this.notFound = true;
                    } else {
                        console.error(err);
                    }
                    return of(null);
                }),
                tap((dataset) => {
                    this.isLoading = false;
                    this.datasetSchemaService.setSchemaMetaData(dataset);
                })
            );

        this.datasetDetails =
            combineLatest(authenticatedStream, licenseAcceptedStream, datasetStream)
                .pipe(
                    map(([isAuthenticated, acceptedLicense, dataset]: [boolean, boolean, Dataset]) =>
                        dataset ? { isAuthenticated, acceptedLicense, dataset } : null)
                );
        // .do((x) => {
        //     console.log(JSON.stringify(x, null, 2));
        // });
    }

    ngOnInit(): void{
        this.route.params
            .pipe(
                map((params: Params) => params['id'])
            )
            .subscribe((data:any)=>{
                this.datasetId=data;
            });
        this.odrService.getDatasetLicenseStatus(this.datasetId).subscribe(
            (data:boolean)=>{
                this.isRegistered=data;
            });
        this.fetchIp();
        this.getLoc();
        this.odrService.getFilledDetails().subscribe(
            (data:any)=>{
                this.oldInfo=data;
            }
        );
    }

    fetchIp():void{
        this.resolveIp.getIp().subscribe((data:any)=>{
            this.ip=data;
        });
    }

    getLoc():void {
        if(navigator.geolocation){
          navigator.geolocation.getCurrentPosition(position =>
            {
              this.revGeoCoding.get(position.coords.latitude,position.coords.longitude).subscribe((data:any)=>{
                this.city=data["city"];
                if(!(this.getLength(data["city"])==0)) { this.city+=", "; }
                this.city+=data["locality"];
                this.state=data["principalSubdivision"];
                this.country=data["countryName"];
              });
            }
          );
        }
    }

    private getLength(string:String): number{
        return string.length;
    }

    ngOnDestroy(): void {
      this.datasetSchemaService.removeSchemaMetaData();
    }

    // Save the fact that the user accepted the license for the current dataset.
    userDidAcceptLicense = ({ datasetId, reason }: { datasetId: string, reason: string }): void => {
        this.odrService
            .setDatasetAcceptLicense(datasetId, { reason })
            .pipe(
                tap(() => {
                    this.refreshSubject.next(true);
                })
            )
            .subscribe();
    }
}
