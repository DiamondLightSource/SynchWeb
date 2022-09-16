# API Swagger Documentation
Swagger documentation of some resources can be found here:
https://github.com/DiamondLightSource/SynchWeb/blob/master/api/docs/dist/spec.json


# Creating a shipment
Assuming root api installation is https://synchweb/api

Creating a shipment consists of the following steps:
* Create a `Protein` or find an existing one (samples have to be instances of a protein) [[Jump](#user-content-create-a-protein)]
* Create a `Lab Contact` (name, address, contact details for the sender) [[Jump](#user-content-create-a-lab-contact)]
* Create a `Shipment` and `Dewar`s [[Jump](#user-content-create-a-shipment)]
* Create `Container`s within a dewar [[Jump](#user-content-create-a-container)]
* Create `Sample`s within a container [[Jump](#user-content-create-samples)]

Required fields are indicated by *


## Get an authentication token
In order to access any other resources a token must first be obtained

Request URL: https://synchweb/api/authenticate  
Request Method: POST
```json
{
  "login": "username",
  "password": "password"
}
```

Response:
```json
{
  "jwt": "abc.def.ghi"
}
```

The response contains the jwt token that can now be used for any further requests. This must be passed in the request `Authorization` header as follows:
```
Authorization: Bearer abc.def.ghi
```

## Proposals
A list of valid proposals can be retrieved for the logged in user

Request URL: https://synchweb/api/proposal  
Request Method: GET
```json
{
  "total": 1,
  "data": [
    {
      "PROPOSAL": "mx10000",
      "TITLE": "Test proposal",
      "VCOUNT": "1",
      "PROPOSALID": "1",
      "STATE": "Open",
      "PROP": "mx10000",
    }
  ]
}
```

A proposal must be passed on all further requests via the `prop` query or body parameter, as all data is related to a specific proposal

## Create a Protein
Request URL: https://synchweb/api/sample/proteins  
Request Method: POST

```json
{
  "NAME": "Protein1",*
  "ACRONYM": "prot1",*
  "MOLECULARMASS": "",
  "SEQUENCE": "",
  "ABUNDANCE": "",
  "prop": "mx10000"
}
```

Response:
```json
{"PROTEINID":372253}
```

## Create a Lab Contact
Lab Contacts are used to define who is sending the shipment and where it should be returned to

### List of Countries

Request URL: https://synchweb/api/shipment/countries?prop=mx10000  
Request Method: GET
```json
[
  {"TITLE": "United Kingdom"},
  {"TITLE": "France"},
  {"TITLE": "Germany"},
  {"TITLE": "United States Of America"}
]
```

### Create the Contact

Request URL: https://synchweb/api/contact  
Request Method: POST

```json
{
  "CARDNAME": "Lab Contact",            *
  "FAMILYNAME": "Last",                 *
  "GIVENNAME": "First",                 *
  "LABNAME": "Lab Name",                *
  "ADDRESS": "Address line",            *
  "CITY": "City",                       *
  "POSTCODE": "12345",                  *
  "COUNTRY": "United States Of America",* (one of above countries)
  "PHONENUMBER": "12345",
  "EMAILADDRESS": "a@b.c",
  "DEFAULTCOURRIERCOMPANY": "",
  "COURIERACCOUNT": "",
  "BILLINGREFERENCE": "",
  "DEWARAVGCUSTOMSVALUE": "",
  "DEWARAVGTRANSPORTVALUE": "",
  "prop": "mx10000"
}
```

Response:
```json
{"LABCONTACTID":5848}
```


## Create a Shipment

### List of Visits

Request URL: https://synchweb/api/proposal/visits?prop=mx10000  
Request Method: GET

```json
{
  "total": 1,
  "data": [
    {
      "VISIT": "mx10000-1",
      "SESSIONID": "1",
      "SCHEDULED": "1",
      "STARTDATE": "00:00 01-10-2019",
      "ENDDATE": "00:00 31-10-2019",
      "BEAMLINENAME": "01-BL",
      "BEAMLINEOPERATOR": "Beamline Scientist",
      "PROPOSAL": "mx10000",
    }
  ]
}
```

### Create the shipment
Dewars can be automatically created along with the shipment by passing `DEWARS` = n

Request URL: https://synchweb/api/shipment/shipments  
Request Method: POST

```json
{
  "SHIPPINGNAME": "Shipment1",  *
  "SENDINGLABCONTACTID": "5848",*
  "RETURNLABCONTACTID": "5848", *
  "DEWARS": "1",
  "FIRSTEXPERIMENTID": "1",       (SESSIONID from list of visits above)
  "SAFETYLEVEL": "Green",
  "COMMENT": "",
  "DELIVERYAGENT_SHIPPINGDATE": "",
  "PHYSICALLOCATION": "",
  "READYBYTIME": "",
  "CLOSETIME": "",
  "DELIVERYAGENT_DELIVERYDATE": "",
  "DELIVERYAGENT_AGENTNAME": "",
  "DELIVERYAGENT_AGENTCODE": "",
  "prop": "mx10000"
}
```

Response:
```json
{"SHIPPINGID":32578}
```

The new `DEWARID`s can be retrieved via:  
Request URL: https://synchweb/api/shipment/dewars/sid/32578?prop=mx10000  
Request Method: GET

```json
{
  "total": 1,
  "data": [
    {
      "DEWARID": "37210",
      "CODE": "Dewar1",
      "SHIPPINGID": "32578",
      "SHIPPINGNAME": "Shipment1",
    }
  ]
}
```

## Create a Container
Containers need to be registered against a `DEWARID`

Request URL: https://synchweb/api/shipment/containers  
Request Method: POST

```json
{
  "DEWARID": "37210",      *
  "CAPACITY": 16,          *
  "CONTAINERTYPE": "Puck", *
  "NAME": "Puck1",         *
  "CONTAINERREGISTRYID": "",
  "AUTOMATED": null,
  "BARCODE": "",
  "EXPERIMENTTYPE": "",
  "STORAGETEMPERATURE": "",
  "COMMENTS": "",
  "SCHEDULEID": "",
  "SCREENID": "",
  "prop": "mx10000"
}
```

Response:
```
{"CONTAINERID":160882}
```

## Create Samples
Samples need to be registered against a `PROTEINID` and a `CONTAINERID` and must have `LOCATION` between 1 and `DEWAR.CAPACITY`

### List of Proteins
A list of valid proteins can be retrieved from:

Request URL: https://synchweb/api/sample/proteins?prop=mx10000
Request Method: GET

```json
{
  "total": 1,
  "data": [
    {
      "PROTEINID": "372253",
      "PROP": "mx10000",
      "NAME": "Protein1",
      "ACRONYM": "prot1",
      "MOLECULARMASS": null,
    }
  ]
}
```


### Create the Samples

Request URL: https://synchweb/api/sample  
Request Method: POST

```json
[
  {
    "prop": "mx10000",    *
    "LOCATION": "1",      *
    "PROTEINID": "372253",*
    "CONTAINERID": 160882,*
    "NAME": "x1",         *
    "CODE": "barcode",
    "COMMENTS": "comment",
    "SPACEGROUP": "",
    "REQUIREDRESOLUTION": "",
    "ANOMALOUSSCATTERER": "",
    "CELL_A": "",
    "CELL_B": "",
    "CELL_C": "",
    "CELL_ALPHA": "",
    "CELL_BETA": "",
    "CELL_GAMMA": "",
    "ABUNDANCE": "",
  },
  {
    "LOCATION": "2",
    "PROTEINID": "372253",
    "NAME": "x2",
    "CODE": "barcode",
    "COMMENTS": "comment",
    "SPACEGROUP": "",
    "REQUIREDRESOLUTION": "",
    "ANOMALOUSSCATTERER": "",
    "CELL_A": "",
    "CELL_B": "",
    "CELL_C": "",
    "CELL_ALPHA": "",
    "CELL_BETA": "",
    "CELL_GAMMA": "",
    "ABUNDANCE": "",
    "CONTAINERID": 160882
  },
  {
    "LOCATION": "3",
    "PROTEINID": "372253",
    "NAME": "x3",
    "CODE": "barcode",
    "COMMENTS": "comment",
    "SPACEGROUP": "",
    "REQUIREDRESOLUTION": "",
    "ANOMALOUSSCATTERER": "",
    "CELL_A": "",
    "CELL_B": "",
    "CELL_C": "",
    "CELL_ALPHA": "",
    "CELL_BETA": "",
    "CELL_GAMMA": "",
    "ABUNDANCE": "",
    "CONTAINERID": 160882
  },
]
```

Response:
```json
[
  {
    "PROTEINID": "372253",
    "CONTAINERID": 160882,
    "LOCATION": "1",
    "CODE": "barcode",
    "NAME": "x1",
    "COMMENTS": "comment",
    "BLSAMPLEID": 2649274
  },
  {
    "PROTEINID": "372253",
    "CONTAINERID": 160882,
    "LOCATION": "2",
    "CODE": "barcode",
    "NAME": "x2",
    "COMMENTS": "comment",
    "BLSAMPLEID": 2649277
  },
  {
    "PROTEINID": "372253",
    "CONTAINERID": 160882,
    "LOCATION": "3",
    "CODE": "barcode",
    "NAME": "x3",
    "COMMENTS": "comment",
    "BLSAMPLEID": 2649280
  },
]
```

# Building the swagger spec

After updating any relevant yaml files the `spec.json` can be rebuilt with:

```bash
node resolve.js
```
