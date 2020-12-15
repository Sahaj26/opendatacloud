using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Msr.Odr.Model.UserData;

namespace Msr.Odr.Model
{
    public class RegistrationInfo
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "datasetId")]
        public string DatasetId { get; set; }

        [JsonProperty(PropertyName = "ip")]
        public string Ip { get; set; }

        [JsonProperty(PropertyName = "userEmail")]
        public string UserEmail { get; set; }

        [JsonProperty(PropertyName = "firstName")]
        public string FirstName { get; set; }

        [JsonProperty(PropertyName = "lastName")]
        public string LastName { get; set; }

        [JsonProperty(PropertyName = "schoolOrg")]
        public string SchoolOrg { get; set; }

        [JsonProperty(PropertyName = "organizationType")]
        public string OrganizationType { get; set; }

        [JsonProperty(PropertyName = "department")]
        public string Department { get; set; }

        [JsonProperty(PropertyName = "roleTitle")]
        public string RoleTitle { get; set; }

        [JsonProperty(PropertyName = "emailAddress")]
        public string EmailAddress { get; set; }

        [JsonProperty(PropertyName = "phoneNumber")]
        public string PhoneNumber { get; set; }

        [JsonProperty(PropertyName = "physicalAddress")]
        public string PhysicalAddress { get; set; }

        [JsonProperty(PropertyName = "addressLine2")]
        public string AddressLine2 { get; set; }

        [JsonProperty(PropertyName = "city")]
        public string City { get; set; }

        [JsonProperty(PropertyName = "state")]
        public string State { get; set; }

        [JsonProperty(PropertyName = "zip")]
        public string Zip { get; set; }

        [JsonProperty(PropertyName = "country")]
        public string Country { get; set; }

        [JsonProperty(PropertyName = "agreementOfTerms")]
        public bool AgreementOfTerms { get; set; }

        [JsonProperty(PropertyName = "userId")]
        public string UserID { get; set; }

        [JsonProperty(PropertyName = "userName")]
        public string UserName { get; set; }

        [JsonProperty("dataType")]
        [JsonConverter(typeof(StringEnumConverter))]
        public UserDataTypes DataType
        {
            get;
            private set;
        } = UserDataTypes.AcceptedLicense;
    }
}
