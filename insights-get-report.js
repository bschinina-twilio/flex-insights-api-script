/*

Required Environment Variables:
ANALYTICS_LOGIN_EMAIL
ANALYTICS_LOGIN_PASSWORD
ANALYTICS_WORKSPACE

POST request must include reportId. Example JSON:
{
	"reportId":"111111"
}

*/


exports.handler = async function (context, event, callback) {
	const axios = require('axios');

	let tmpToken,
		reportResponse,
		userLogin,
		reportCSV

	let { reportId } = event

	// set up user login info
	const data = JSON.stringify({
		postUserLogin: {
			login: context.ANALYTICS_LOGIN_EMAIL,
			password: context.ANALYTICS_LOGIN_PASSWORD,
			remember: 0,
			verify_level: 2
		}
	});

	//format request for flex insights api "login"
	const config = {
		method: 'post',
		url: 'https://analytics.ytica.com/gdc/account/login',
		headers: {
			'Content-Type': 'application/json'
		},
		data: data
	};

	// API REQUEST: execute login request
	try {
		userLogin = await axios(config);
		console.log("got user login");
	}
	catch (e) {
		console.log(`error logging in: ${e}`);
		return callback(null, e);
	}

	// if we have the right login info
	if (userLogin.data && userLogin.data.userLogin && userLogin.data.userLogin.token) {
		//format request for temp token
		const tokenconfig = {
			method: 'get',
			url: 'https://analytics.ytica.com/gdc/account/token',
			headers: {
				'X-GDC-AuthSST': `${userLogin.data.userLogin.token}`,
				'Content-Type': 'application/json'
			}
		};

		//API REQUEST: get temp token
		try {
			tmpToken = await axios(tokenconfig);
			console.log("got temp token");
		}
		catch (e) {
			console.log(`error getting temp token: ${e}`);
			return callback(null, e);
		}

		// if we have the temp token
		if (tmpToken.data && tmpToken.data.userToken && tmpToken.data.userToken.token) {

			//set up config for report
			const data = JSON.stringify({
				report_req: {
					report: `/gdc/md/${context.ANALYTICS_WORKSPACE}/obj/${reportId}`
				}
			});

			//format report request
			const getReportUrlConfig = {
				method: 'post',
				url: `https://analytics.ytica.com/gdc/app/projects/${context.ANALYTICS_WORKSPACE}/execute/raw`,
				headers: {
					Cookie: `GDCAuthTT=${tmpToken.data.userToken.token}`,
					'Content-Type': 'application/json'
				},
				data: data
			};

			//API REQUEST: get report object
			try {
				reportResponse = await axios(getReportUrlConfig);
				console.log("got report");
			}
			catch (e) {
				console.log(`error getting report object: ${e}`);
				return callback(null, e);
			}

			//if we have the report object
			if (reportResponse && reportResponse.data && reportResponse.data.uri) {
				//format request for csv download
				var downloadConfig = {
					method: 'get',
					url: `https://analytics.ytica.com${reportResponse.data.uri}`,
					headers: {
						Cookie: `GDCAuthTT=${tmpToken.data.userToken.token}`
					}
				};

				//API REQUEST: get csv download
				try {
					reportCSV = await axios(downloadConfig);

					// if we get a 202, try again 
					// see docs for more details about this nuance: https://www.twilio.com/docs/flex/developer/insights/api/export-data#download-the-report
					if (reportCSV.status === 202) {
						console.log("csv download was not ready. trying again.")
						reportCSV = await axios(downloadConfig)

						// if we got another 202, try again
						if (reportCSV.status === 202) {
							console.log("csv download was not ready. trying again.")
							reportCSV = await axios(downloadConfig)

							// if it wasn't successful by now, stop trying (this can be modified to try a few more times before giving up)
							if (reportCSV.status != 200) {
								console.log(`unable to fetch ${reportId}. try again later.`)
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
				}
				catch (e) {
					console.log(`error getting report csv download: ${e}`);
					return callback(null, e);
				}

				// if we have the csv download
				if (reportCSV && typeof reportCSV.data === "string") {
					//we have report and it is full
					console.log(`report data: ${reportCSV.data}`);

					return callback(null, { data: reportCSV.data });

				} else {
					//we got the report, but it is empty
					console.log("reports data is empty", reportCSV, typeof reportCSV)
					return callback(null, { message: "no data to process" })

				}
			}
			else {
				console.log(`error report response: ${e}`);
				return callback(null, e);
			}
		}
		else {
			console.log(`error temp token: ${e}`);
			return callback(null, e);
		}

	}
	else {
		console.log(`error login data not right: ${e}`);
		return callback(null, e);
	}
}
