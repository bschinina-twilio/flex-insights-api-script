# Flex Insights API Script

This is a simple Twilio Serverless Function that gets report data from Twilio Flex Insights.

## Flex Insights API

For more details on how this script works, read through the formal Twilio documentation for [exporting data from the Flex Insights API](https://www.twilio.com/docs/flex/developer/insights/api/export-data). 

This goes over the requirements in more detail, including:
- Prerequisites
- How [authentication](https://www.twilio.com/docs/flex/developer/insights/api/authentication) works
- How to get the needed identifiers

## Twilio Serverless Function

This script is intended to be hosted on a [Twilio Serverless Function](https://www.twilio.com/docs/serverless/functions-assets/functions). 

### Environment Variables

The following [environment variables](https://www.twilio.com/docs/serverless/functions-assets/functions/variables) need to be configured on your Function Service.

| Variable | Example Identifier |
| ----- | ---- |
| `ANALYTICS_LOGIN_EMAIL` | example_user@your_domain.com |
| `ANALYTICS_LOGIN_PASSWORD` | *password set up through Twilio invitation* |
| `ANALYTICS_WORKSPACE` | qx8vgewnj2hyemje8f6bkrkbyqk8psrf |

To find your specific *Workspace ID*, follow the instructions [here](https://www.twilio.com/docs/flex/developer/insights/api/export-data#export-the-raw-report:~:text=Workspace%20ID%3A%20Log,workspace%20ID%20qx8vgewnj2hyemje8f6bkrkbyqk8psrf.) for "Workspace ID".

### Request Variables

In your POST request to this Function, the *Report ID* must be specified.
| Variable | Example Identifier |
| ----- | ---- |
| `reportId` | 643040 |

To find your specific *Report ID*, follow the instructions [here](https://www.twilio.com/docs/flex/developer/insights/api/export-data#export-the-raw-report:~:text=Object%20ID%3A,ID%20is%20643040.) for "Object ID".

## Considerations

May want to retry more than 2x if we receive a 202


## Disclaimer
This software is to be considered "sample code", a Type B Deliverable, and is delivered "as-is" to the user. Twilio bears no responsibility to support the use or implementation of this software.

