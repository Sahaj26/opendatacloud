// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Payload for dataset registration
 */
export class RegistrationInfo {

    public firstName: string;
    public lastName: string;
    public schoolOrg: string;
    public organizationType: string;
    public department: string;
    public roleTitle: string;
    public emailAddress: string;
    public phoneNumber: string;
    public physicalAddress: string;
    public addressLine2: string;
    public city: string;
    public state: string;
    public zip: string;
    public country: string;
    public agreementOfTerms: boolean;
    public ip: string;
}
