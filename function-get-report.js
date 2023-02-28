/*

Required Environment Variables:
ANALYTICS_WORKSPACE

POST request must include reportId. Example JSON:
{
	"reportId":"111111",
	"username":"your_email_address",
	"password":"your_configured_password"
}

Contact Twilio Support if you do not have credentials.

*/

const axios = require('axios');

exports.handler = async function (context, event, callback) {
	const response = new Twilio.Response()

	const workspaceId = context.ANALYTICS_WORKSPACE
	const { reportId, username, password } = event

	const eventCheck = verifyEventProps(event);
	if (!eventCheck.success) {
		console.log('Event property check failed.', eventCheck.errors);
		response.setStatusCode(400);
		response.setBody({ status: 400, errors: eventCheck.errors });
		return callback(null, response);
	}


	try {
		// get sstoken with user credentials 
		let apiAuth = await getSuperSecuredToken(username, password)

		if (apiAuth) {
			// get temporary token with sstoken
			let tmpToken = await getTempToken(apiAuth)

			if (tmpToken) {
				// get report export
				let reportResponse = await getReportExport(tmpToken, workspaceId, reportId)

				if (reportResponse) {
					// get report CSV
					let reportCSV = await downloadReportCsv(tmpToken, reportResponse)

					// check if the CSV has data
					if (reportCSV && typeof reportCSV.data === "string") {

						//we have CSV and it is full
						console.log(`report data: ${reportCSV.data}`);
						return callback(null, { data: reportCSV.data });
					}
					else {
						//we have CSV, but it is empty
						console.log("reports data is empty", reportCSV, typeof reportCSV)
						return callback(null, { message: "no data to process" })

					}
				}
				else {
					let error = `ERROR: failed to get report export for ${reportId}`
					response.setStatusCode(500)
					response.setBody(error)
					return callback(null, response)
				}
			}
			else {
				let error = "ERROR: failed to get temporary token"
				response.setStatusCode(500)
				response.setBody(error)
				return callback(null, response)
			}
		}
		else {
			let error = "ERROR: failed to get api authentication with provided user credentials"
			response.setStatusCode(500)
			response.setBody(error)
			return callback(null, response)
		}
	}
	catch (e) {
		response.setStatusCode(500)
		return callback(null, response)
	}

}

/**
 * Validate mandatory fields are supplied
 */
const verifyEventProps = () => {
	const result = {
		success: false,
		errors: []
	};

	if (!username) result.errors.push("Missing 'username' in request body");
	else if (!password) result.errors.push("Missing 'password' in request body");
	else if (!reportId) result.errors.push("Missing 'reportId' in request body");
	else result.success = true;

	return result;
}

/**
 * Get Super Secured Token from API
 */
const getSuperSecuredToken = async (username, password) => {

	// set up api authentication
	let loginData = JSON.stringify({
		postUserLogin: {
			login: username,
			password: password,
			remember: 0,
			verify_level: 2
		}
	});

	//format request for flex insights api "login"
	const loginConfig = {
		method: 'post',
		url: 'https://analytics.ytica.com/gdc/account/login',
		headers: {
			'Content-Type': 'application/json'
		},
		data: loginData
	};

	// get secure token from the api
	try {
		let apiAuth = await axios(loginConfig);
		console.log("got user login / api auth");

		return apiAuth
	}
	catch (e) {
		console.error(`unable to get secured token with provided credentials: ${e}`)
	}
}

/**
 * Get Temporary Token from API
 */
const getTempToken = async (apiAuth) => {
	let tmpToken

	//format request for temp token
	const tokenConfig = {
		method: 'get',
		url: 'https://analytics.ytica.com/gdc/account/token',
		headers: {
			'X-GDC-AuthSST': `${apiAuth.data.userLogin.token}`,
			'Content-Type': 'application/json'
		}
	};

	try {
		// get the temp token from the api
		tmpToken = await axios(tokenConfig);
		console.log("got temp token");

		return tmpToken.data.userToken.token
	}
	catch (e) {
		console.error(`unable to get temporary token: ${e}`)
	}
}

/**
 * Get Report Object Export
 */
const getReportExport = async (tmpToken, workspace_id, object_id) => {
	let reportResponse

	//set up report data
	let reportData = JSON.stringify({
		report_req: {
			report: `/gdc/md/${workspace_id}/obj/${object_id}`
		}
	});

	//format report request
	const getReportConfig = {
		method: 'post',
		url: `https://analytics.ytica.com/gdc/app/projects/${workspace_id}/execute/raw`,
		headers: {
			Cookie: `GDCAuthTT=${tmpToken}`,
			'Content-Type': 'application/json'
		},
		data: reportData
	};

	try {
		// get report export from the api
		reportResponse = await axios(getReportConfig);
		console.log("got report");

		return reportResponse
	}
	catch (e) {
		console.error(`unable to get report export: ${e}`)
	}
}

/**
 * Get Report CSV data 
 * Includes "retries" for when we receive a 202 from the API
 * To learn more: https://www.twilio.com/docs/flex/developer/insights/api/export-data#download-the-report
 */
const downloadReportCsv = async (tmpToken, reportResponse) => {
	let reportCSV

	//format request for csv download
	let downloadConfig = {
		method: 'get',
		url: `https://analytics.ytica.com${reportResponse.data.uri}`,
		headers: {
			Cookie: `GDCAuthTT=${tmpToken}`
		}
	}

	try {
		// get report csv from the api
		reportCSV = await axios(downloadConfig);

		// if we get a 202, try again 
		if (reportCSV.status === 202) {
			console.log("csv download was not ready. trying again.")
			reportCSV = await axios(downloadConfig)

			// if we got another 202, try again
			if (reportCSV.status === 202) {
				console.log("csv download was not ready. trying again.")
				reportCSV = await axios(downloadConfig)

				// if it wasn't successful by now, stop trying (this can be modified to try a few more times before giving up)
				if (reportCSV.status != 200) {
					console.log(`unable to fetch ${reportId} after 2 tries. try again later.`)
				}
				else {
					console.log("got csv")
				}
			}
			else if (reportCSV.status === 200) {
				console.log("got csv");
			}
			// if we don't get a 200 or a 201, it should error in the catch block
			// this is just in case we get something very much unexpected
			else {
				console.log(`something unexpected happened when downloading CSV data for ${reportId}`)
			}
		}
		else if (reportCSV.status === 200) {
			console.log("got csv");
		}
		else {
			console.log(`something unexpected happened when downloading CSV data for ${reportId}`)
		}

		return reportCSV
	}
	catch (e) {
		console.error(`unable to get report csv download: ${e}`)
	}
}
