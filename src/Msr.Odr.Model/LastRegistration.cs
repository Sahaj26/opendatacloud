using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using Msr.Odr.Model.UserData;

namespace Msr.Odr.Model
{
    public class LastRegistration
    {
        [JsonProperty(PropertyName = "id")]
        public string Id { get; set; }

        [JsonProperty(PropertyName = "registrationId")]
        public string RegistrationId { get; set; }

        [JsonProperty(PropertyName = "forDataset")]
        public string ForDataset { get; set; }

        [JsonProperty(PropertyName = "userId")]
        public string UserId { get; set; }

        [JsonProperty(PropertyName = "datasetId")]
        public string DatasetId { get; set; }
        //datasetId = "ri00bbb6-aaa7-4f78-a0bf-1d0f6759e674"

        [JsonProperty("dataType")]
        [JsonConverter(typeof(StringEnumConverter))]
        public UserDataTypes DataType
        {
            get;
            private set;
        } = UserDataTypes.LastRegistration;
    }
}
