const { executeHttpRequest } = require('@sap-cloud-sdk/http-client')
const axios = require('axios')

module.exports = async (srv) => {
    srv.on('helloWorldClientPlain', async () => {
        // get all the necessary destination service parameters from the service binding in the VCAP_SERVICES env variable
        const vcapServices = JSON.parse(process.env.VCAP_SERVICES)
        const destinationServiceUrl = vcapServices.destination[0].credentials.uri + '/destination-configuration/v1/destinations/'
        const destinationServiceClientId = vcapServices.destination[0].credentials.clientid
        const destinationServiceClientSecret = vcapServices.destination[0].credentials.clientsecret
        const destinationServiceTokenUrl = vcapServices.destination[0].credentials.url + '/oauth/token?grant_type=client_credentials'

        // before we can fetch the destination from the destination service, we need to retrieve an auth token
        const token = await axios.post(destinationServiceTokenUrl, null, {
            headers: {
                authorization: 'Basic ' + Buffer.from(`${destinationServiceClientId}:${destinationServiceClientSecret}`).toString('base64'),
            },
        })
        const destinationServiceToken = token.data.access_token

        // with this token, we can now request the "Server" destination from the destination service
        const headers = {
            authorization: 'Bearer ' + destinationServiceToken,
        }
        const destinationResult = await axios.get(destinationServiceUrl + 'Server', {
            headers,
        })
        const destination = destinationResult.data

        // now, we use the retrieved the destination information to send a HTTP request to the token service endpoint;
        // to authenticate, we take the Client ID attribute and the Client Secret attribute from the destination,
        // encode ClientId:ClientSecret to Base64 and send the resulting string prefixed with "Basic " as Authorization
        // header of the request;
        // as a response, we receive a JWT token that we can then use to authenticate against the server
        // alternatively, the JWT token could directly be fetched from destination.authTokens[0].value
        const jwtTokenResponse = await axios.get(destination.destinationConfiguration.tokenServiceURL + '?grant_type=client_credentials', {
            headers: {
                Authorization:
                    'Basic ' +
                    btoa(destination.destinationConfiguration.clientId + ':' + destination.destinationConfiguration.clientSecret),
            },
        })
        const jwtToken = jwtTokenResponse.data.access_token

        // here we call the server instance with the bearer token we received from the token service endpoint
        const destinationResponse = await axios.get(destination.destinationConfiguration.URL, {
            headers: {
                Authorization: 'Bearer ' + jwtToken,
            },
        })
        return destinationResponse.data
    })
    srv.on('helloWorldClientCloudSDK', async () => {
        return executeHttpRequest({ destinationName: 'Server' }).then((response) => response.data)
    })
}
