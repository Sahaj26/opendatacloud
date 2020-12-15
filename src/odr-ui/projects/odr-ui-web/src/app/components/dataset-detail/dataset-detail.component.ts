// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Dataset, DatasetDownloadDialogConfig, LicenseDialogConfig, FileEntry } from '../../shared/types';
import { Router } from '@angular/router';
import { License } from 'odr-ui-shared';
import { OdrService } from '../../shared/services/odr.service';
import { CreateDeployment } from '../../shared/types/create-deployment.type';
import { LicenseDialogComponent } from './license-dialog.component';
import { DatasetDownloadDialogComponent } from './dataset-download-dialog.component';
import { Subscription, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { AuthService } from '../../shared/services';
import { ExportActionType } from '../../shared/types/export-action-type.enum';
import { ModalDialogService } from 'odr-ui-shared';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RegistrationInfo } from '../../shared/types/registration-info.type';

interface OnUserAcceptedLicenseArgs {
    datasetId: string;
    reason: string;
}

@Component({
    selector: 'app-dataset-detail',
    styleUrls: ['./dataset-detail.component.scss'],
    templateUrl: './dataset-detail.component.html'
})
export class DatasetDetailComponent implements OnInit, OnDestroy {

    @Input() isAuthenticated: boolean;
    @Input() acceptedLicense: boolean;
    @Input() dataset: Dataset;
    @Input() ip: string;
    @Input() city: string;
    @Input() state: string;
    @Input() country: string;
    @Input() oldRegistrationInfo: RegistrationInfo;
    @Output() onUserAcceptedLicense: EventEmitter<OnUserAcceptedLicenseArgs> = new EventEmitter();
    @ViewChild('downloadLink', {static: false}) private downloadLink: ElementRef;

    public get datasetId(): string { return this.dataset.id; }

    public get isCompressedAvailable(): boolean { return this.dataset.isCompressedAvailable; }

    datasetDownloadUrl = '';
    datasetFileDownloadUrl = '';
    zipDownloadUrl = '';
    gzipDownloadUrl = '';
    currentDownloadUrl = '';
    currentFileId = '';
    licenseSubscription: Subscription;
    license: License;
    ExportActionType = ExportActionType;
    currentAction: ExportActionType = ExportActionType.None;
    deployParams: any = null;
    showRegistrationForm: boolean=false;
    showAgreementForm:boolean=false;
    registrationForm:FormGroup;
    orgTypes:string[]=["Academic/University","Government","Healthcare","For-profit Industry","Non-profit","Other"];
    nullValue: string="default";
    registrationInfo: RegistrationInfo;

    constructor(
        private router: Router,
        private odrService: OdrService,
        private modal: ModalDialogService,
        private authService: AuthService
    ) {
    }

    public ngOnInit() {
        this.license = {
            name: this.dataset.licenseName,
            id: this.dataset.licenseId,
            contentUri: this.dataset.licenseContentUri
        };

        setTimeout(() => {
            this.licenseSubscription = this.odrService.getLicenseById(this.dataset.licenseId)
                .pipe(
                    tap(license => {
                        this.license = license;
                    })
                )
                .subscribe();
        }, 0);

        if(this.oldRegistrationInfo==null){
            this.oldRegistrationInfo=new RegistrationInfo();
        }
        else{
            this.city=this.oldRegistrationInfo.city;
            this.state=this.oldRegistrationInfo.state;
            this.country=this.oldRegistrationInfo.country;
        }

        this.registrationForm=new FormGroup({
            firstName: new FormControl(this.oldRegistrationInfo.firstName,Validators.required),
            lastName: new FormControl(this.oldRegistrationInfo.lastName,Validators.required),
            schoolOrg: new FormControl(this.oldRegistrationInfo.schoolOrg,Validators.required),
            organizationType: new FormControl(this.oldRegistrationInfo.organizationType,Validators.required),
            department: new FormControl(this.oldRegistrationInfo.department,Validators.required),
            roleTitle: new FormControl(this.oldRegistrationInfo.roleTitle,Validators.required),
            emailAddress: new FormControl(this.oldRegistrationInfo.emailAddress,[Validators.required,Validators.email]),
            phoneNumber: new FormControl(this.oldRegistrationInfo.phoneNumber,Validators.required),
            physicalAddress: new FormControl(this.oldRegistrationInfo.physicalAddress,Validators.required),
            addressLine2: new FormControl(this.oldRegistrationInfo.addressLine2,Validators.required),
            city: new FormControl(this.city,Validators.required),
            state: new FormControl(this.state,Validators.required),
            zip: new FormControl(this.oldRegistrationInfo.zip,Validators.required),
            country: new FormControl(this.country,Validators.required),
            agreementOfTerms: new FormControl(true,Validators.requiredTrue),
            ip: new FormControl(this.ip)
        });

    }

    public ngOnDestroy() {
        this.licenseSubscription.unsubscribe();
    }

    public openIssue(): void {
        this.router.navigate(['/issue', this.dataset.id]);
    }

    public userDidAcceptLicense({ reason }: { reason: string }) {
        this.onUserAcceptedLicense.emit({
            datasetId: this.dataset.id,
            reason
        });

        this.processAction();
    }

    public onShowDownloadDialog() {
        this.currentAction = ExportActionType.DownloadDataset;
        this.datasetDownloadUrl = '';

        if (this.validateExportAndContinue()) {
            this.showDownloadDialog();
        }
    }

    public onDownloadZipFile() {
        this.currentAction = ExportActionType.DownloadZip;
        this.zipDownloadUrl = '';

        if (this.validateExportAndContinue()) {
            this.downloadZipFile();
        }
    }

    public onDownloadGzipFile() {
        this.currentAction = ExportActionType.DownloadGzip;
        this.gzipDownloadUrl = '';

        if (this.validateExportAndContinue()) {
            this.downloadGzipFile();
        }
    }

    public onDeployDataset(params) {
        this.deployParams = params;
        this.currentAction = ExportActionType.Deploy;

        if (this.validateExportAndContinue()) {
            this.deployDataset();
        }
    }

    public onDownloadFile(file) {
        this.currentAction = ExportActionType.DownloadFile;
        this.currentFileId = file && file.id;

        if (this.validateExportAndContinue()) {
            this.downloadFile();
        }
    }

    public openLicense(): void {
        const config = new LicenseDialogConfig();
        config.license = this.license;
        config.isAuthenticated = this.isAuthenticated;
        config.acceptedLicense = this.acceptedLicense;

        this.modal.create({
          title: '',
          component: LicenseDialogComponent,
          params: {
            config
          },
          onClose: ({ userAccept, userReason }) => {
            if (userAccept) {
                this.userDidAcceptLicense({
                    reason: userReason
                });
            }
          }
        });

        // const modal = this.modalService.create({
        //     nzTitle: '',
        //     nzContent: LicenseDialogComponent,
        //     nzComponentParams: {
        //         config: config
        //     },
        //     nzFooter: null
        // });

        // // Return a result when closed
        // modal.afterClose.subscribe(({ userAccept, userReason }) => {
        //     if (userAccept) {
        //         this.userDidAcceptLicense({
        //             reason: userReason
        //         });
        //     }
        // });
    }

    private processAction() {
        switch (this.currentAction) {
            case ExportActionType.DownloadFile:
                this.downloadFile();
                break;
            case ExportActionType.DownloadZip:
                this.downloadZipFile();
                break;
            case ExportActionType.DownloadGzip:
                this.downloadGzipFile();
                break;
            case ExportActionType.DownloadDataset:
                this.showDownloadDialog();
                break;
            case ExportActionType.Deploy:
                this.deployDataset();
                break;
            default:
                // do nothing
                break;
        }

        this.currentAction = ExportActionType.None;
    }

    private validateExportAndContinue() {
        if (!this.isAuthenticated) {
            this.authService.navigateToLogin();
            return false;
        }

        if (!this.acceptedLicense) {
            // this.openLicense();
            this.showRegistrationForm=true;
            return false;
        }

        return true;
    }

    public closeRegistrationForm():void{
        this.showRegistrationForm=false;
    }

    public showAgreement():void{
        this.showAgreementForm=true;
    }

    public closeAgreementForm():void{
        this.showAgreementForm=false;
    }

    public onRegistrationSubmit():void{
        this.registrationInfo = new RegistrationInfo();
        this.registrationInfo.firstName=this.registrationForm.value["firstName"];
        this.registrationInfo.lastName=this.registrationForm.value["lastName"];
        this.registrationInfo.schoolOrg=this.registrationForm.value["schoolOrg"];
        this.registrationInfo.organizationType=this.registrationForm.value["organizationType"];
        this.registrationInfo.department=this.registrationForm.value["department"];
        this.registrationInfo.roleTitle=this.registrationForm.value["roleTitle"];
        this.registrationInfo.emailAddress=this.registrationForm.value["emailAddress"];
        this.registrationInfo.phoneNumber=this.registrationForm.value["phoneNumber"];
        this.registrationInfo.physicalAddress=this.registrationForm.value["physicalAddress"];
        this.registrationInfo.addressLine2=this.registrationForm.value["addressLine2"];
        this.registrationInfo.city=this.registrationForm.value["city"];
        this.registrationInfo.state=this.registrationForm.value["state"];
        this.registrationInfo.zip=this.registrationForm.value["zip"];
        this.registrationInfo.country=this.registrationForm.value["country"];
        this.registrationInfo.agreementOfTerms=this.registrationForm.value["agreementOfTerms"];
        this.registrationInfo.ip=this.registrationForm.value["ip"];
        this.odrService.setDatasetRegistrationDetails(this.dataset.id,this.registrationInfo).subscribe(
            (data:any)=>{
                if(data!=null){
                    this.acceptedLicense=true;
                    this.showAgreementForm=false;
                    this.showRegistrationForm=false;
                }
            }
        );
        this.processAction();
    }

    private deployDataset() {
        const deploymentId = this.deployParams && this.deployParams.deploymentId;
        const datasetId = this.deployParams && this.deployParams.datasetId;
        const payload: CreateDeployment = { datasetId, deploymentId };
        const importWindow = window.open('about:blank', '_blank');

        this.odrService
            .createDeployment(payload)
            .pipe(
                tap((deploymentUrl) => {
                    this.currentAction = ExportActionType.None;
                    importWindow.location.href = deploymentUrl;
                })
            )
            .subscribe({
                error(err) {
                    console.error(err);
                }
            });
    }

    private openDownloadDialog(url: string): void {
        const config = new DatasetDownloadDialogConfig();
        config.dataset = this.dataset;
        config.datasetUrl = url;

        this.modal.create({
          title: '',
          component: DatasetDownloadDialogComponent,
          params: {
            config
          }
        });

        // const modal = this.modalService.create({
        //     nzTitle: '',
        //     nzContent: DatasetDownloadDialogComponent,
        //     nzComponentParams: {
        //         config: config
        //     },
        //     nzFooter: null
        // });

        // Return a result when closed
        // modal.afterClose.subscribe(result => console.log('[afterClose] The result is:', result));
    }

    private startDownload(fileUrl: string): void {
        const link = this.downloadLink.nativeElement;
        link.href = fileUrl;
        link.click();
    }

    private downloadFile(): void {
        this.datasetFileDownloadUrl = '';
        this.currentDownloadUrl = '';
        this.odrService
            .getDatasetFileDownloadUrl(this.datasetId, this.currentFileId)
            .pipe(
                tap((result: string) => {
                    this.datasetFileDownloadUrl = result;
                    this.currentAction = ExportActionType.None;
                    this.startDownload(this.datasetFileDownloadUrl);
                    this.currentFileId = null;
                }),
                catchError(error => {
                    this.currentDownloadUrl = error.statusText;
                    return of(error);
                })
            )
            .subscribe();
    }

    private downloadZipFile() {
        this.odrService
            .getZipFileDownloadUrl(this.datasetId)
            .pipe(
                tap((result: string) => {
                    this.zipDownloadUrl = result;
                    this.currentAction = ExportActionType.None;
                    this.startDownload(this.zipDownloadUrl);
                }),
                catchError(error => {
                    return of(error);
                })
            )
            .subscribe();
    }

    private downloadGzipFile() {
        this.odrService
            .getGzipFileDownloadUrl(this.datasetId)
            .pipe(
                tap((result: string) => {
                    this.gzipDownloadUrl = result;
                    this.currentAction = ExportActionType.None;
                    this.startDownload(this.gzipDownloadUrl);
                }),
                catchError(error => {
                    return of(error);
                })
            )
            .subscribe();
    }

    private showDownloadDialog() {
        this.odrService
            .getDatasetDownloadUrl(this.datasetId)
            .pipe(
                tap((result: string) => {
                    this.datasetDownloadUrl = result;
                    this.currentDownloadUrl = this.datasetDownloadUrl;
                    this.currentAction = ExportActionType.None;
                    this.openDownloadDialog(this.datasetDownloadUrl);
                })
            )
            .subscribe();
    }
}
