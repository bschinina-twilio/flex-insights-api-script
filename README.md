# Flex Insights API Script

This is a simple Twilio Serverless Function that gets CSV report data from Twilio Flex Insights.

## Flex Insights API

For more details on how this script works, read through the formal Twilio documentation for [exporting data from the Flex Insights API](https://www.twilio.com/docs/flex/developer/insights/api/export-data). 

This goes over the requirements in more detail, including:
- Prerequisites
- How [authentication](https://www.twilio.com/docs/flex/developer/insights/api/authentication) works
- How to get the needed identifiers

## Twilio Serverless Function

This script is intended to be hosted on a [Twilio Serverless Function](https://www.twilio.com/docs/serverless/functions-assets/functions). 

### Function Visibility

This Function should be set to "Public". We are validating header authorization in the Function code directly.


### Environment Variables

The following [environment variable](https://www.twilio.com/docs/serverless/functions-assets/functions/variables) needs to be configured on your Function Service.

| Variable | Example Identifier |
| ----- | ---- |
| `ANALYTICS_WORKSPACE` | qx8vgewnj2hyemje8f6bkrkbyqk8psrf (example) |

To find your specific *Workspace ID*, follow the instructions [here](https://www.twilio.com/docs/flex/developer/insights/api/export-data#export-the-raw-report:~:text=Workspace%20ID%3A%20Log,workspace%20ID%20qx8vgewnj2hyemje8f6bkrkbyqk8psrf.) for "Workspace ID".


### Request Headers

This Function requires credentials to be supplied in the form of Basic Authorization. In the headers of the request made to the Function, include your username and password credentials which have been granted access the Flex Insights API.

| Variable | Example Identifier |
| ----- | ---- |
| `username` | example_user@your_domain.com |
| `password` | *password set up through Twilio invitation* |

**NOTE: If you do not have Flex Insights API credentials, contact Twilio Support to acquire the necessary credentials.**


### Request Variables

In your POST request to this Function, the *Report ID* must be specified.
| Variable | Example Identifier |
| ----- | ---- |
| `reportId` | 643040 (example) |

To find your specific *Report ID*, follow the instructions [here](https://www.twilio.com/docs/flex/developer/insights/api/export-data#export-the-raw-report:~:text=Object%20ID%3A,ID%20is%20643040.) for "Object ID".


## Considerations

In the `downloadReportCsv` function, we are [retrying the request to get the CSV twice](https://github.com/bschinina-twilio/flex-insights-api-script/blob/dc2d93c5c6ac686388a40bc0e977ab4856385b54/function-get-report.js#L195).

This may be extended to try several more times if desired.


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.

