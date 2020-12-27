# Proposals

Proposals represent one or more applications for beamtime and are usually allocated to a single institution or enterprise. Some facilities issue new proposal numbers every couple of years.

Usually of the form `mx12345`, `em56789`

The following columns are required in `Proposal`:

Column | Type | Description
--- | --- | ---
title | str | The proposal title
personid | int | Each proposal requires a Person to be associated
proposalcode | str | A proposal code, usually for grouping proposals. Common standards include `mx` for mx crystallography, `in` for industry, `cm` for commissioning, `sw` for industrial service work
proposalnumber | int | A unique number for the proposal
externalid | binary | A id from an external system if the data is being replicated for example from a User Office system
state | enum | The state of the proposal, by default `Open`, can be `Closed` to disable creating shipments.

# Sessions (Visits)

Sessions represent beamtime scheduled on an instrument. A full visit name is comprised of the proposal plus the `visit_number` for example: `mx12345-1`, `em56789-34`

The following columns are required in `BLSession`:

Column | Type | Description
--- | --- | ---
proposalid | int |  proposalid from Proposal table
startdate| datetime | Start date and time of allocation beamtime
enddata| datetime | End date and time of allocation beamtime
beamlinename | str | The awarded instrument (\w-\d+) 
visit_number | int | A unique generally incrementing number for the session
scheduled | int | Bool 1, 0. 1 indicating the session has a defined time span. 0 indicates this is a long running proposal and will not pollute the landing page and various statistics
externalid | binary | A id from an external system if the data is being replicated for example from a User Office system
archived | int | Bool 1, 0 representing if the session is archived or not (whether the data is still available on disk). Once archived various features are disabled, including reprocessing

# Person

A Person entry is required for each user that wishes to login. For a Person entry to be usable the following should be populated into `Person`:

Column | Type | Description
--- | --- | ---
login | str | The unix login
givenname | str | First name
familyname | str | Last Name
externalid | binary | A id from an external system if the data is being replicated for example from a User Office system

# Session has Person

`Session_has_Person` links a `Person` to a scheduled `BLSession` session. This allows the user to view the data, and lets staff know who is registered on the visit. The following columns should be populated:

Column | Type | Description
--- | --- | ---
sessionid | int | A sessionid from `BLSession`
proposalid | int | A proposalid from `Proposal`
role | enum | A designation for this user on the visit, i.e. `Local Contact`, `Staff`, `Team Leader`, `Co-Investigator`, `Principal Investigator`
remote | int | Bool 1, 0 indicating whether the user is coming to site

# User Groups and Permissions

UserGroups and Permissions allow for fine grained access to be defined.

`UserGroup` simply defines a name for the group. `Permission` defines a name for the permission. Users are added to groups with `UserGroup_has_Person` and `Permission` to groups with `UserGroup_has_Permission`.

Permissions can be defined for different interface types: `super_admin`, `mx_admin`, `gen_admin`, ..., etc

# Authorisation

For normal users data can only be accessed for a particular session if the user is registered via `Session_has_Person`. Although this restricts access to the actual data collections, a user on regsitered on a visit can view all of the Shipments, Proteins, and Samples for the Proposal.
