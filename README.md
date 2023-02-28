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

### Environment Variables

The following [environment variable](https://www.twilio.com/docs/serverless/functions-assets/functions/variables) needs to be configured on your Function Service.

| Variable | Example Identifier |
| ----- | ---- |
| `ANALYTICS_WORKSPACE` | qx8vgewnj2hyemje8f6bkrkbyqk8psrf (example) |

To find your specific *Workspace ID*, follow the instructions [here](https://www.twilio.com/docs/flex/developer/insights/api/export-data#export-the-raw-report:~:text=Workspace%20ID%3A%20Log,workspace%20ID%20qx8vgewnj2hyemje8f6bkrkbyqk8psrf.) for "Workspace ID".

### Request Variables

In your POST request to this Function, the *Report ID* must be specified.
| Variable | Example Identifier |
| ----- | ---- |
| `reportId` | 643040 (example) |
| `username` | example_user@your_domain.com |
| `password` | *password set up through Twilio invitation* |

To find your specific *Report ID*, follow the instructions [here](https://www.twilio.com/docs/flex/developer/insights/api/export-data#export-the-raw-report:~:text=Object%20ID%3A,ID%20is%20643040.) for "Object ID".

A specific `username` (email address) and `password` need to be used to access the Flex Insights API. If you have not worked with Twilio Support to get these credentials, that step will need to be completed first. File a Twilio Support ticket for assistance with this.


## Considerations

May want to retry more than 2x if we receive a 202


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.

