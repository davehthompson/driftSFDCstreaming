//import dependencies
const request = require('superagent')
const jsforce = require('jsforce')
require('dotenv').config()

//define user/pass/URL/access
const sfdcUser = process.env.EMAIL
const sfdcPass = process.env.PASSWORD
const driftToken = process.env.DRIFTTOKEN
const sfdcUrl = `https://login.salesforce.com/`
const driftQueryUrl = `https://driftapi.com/contacts`

//initialize a new connection with SFDC
const streamingAPI = async () => {
  let conn = new jsforce.Connection({
    loginUrl: sfdcUrl
  });
  await conn.login(sfdcUser, sfdcPass, (err, userInfo) => {
    if (err) { return console.error(err) }
    console.log("Access Token: " + conn.accessToken)
    console.log("SFDC Instance URL: " + conn.instanceUrl)
    console.log("User ID: " + userInfo.id)
    console.log("Org ID: " + userInfo.organizationId)
  });

  //subscribe to pushtopic to receive events from SFDC
  conn.streaming.topic("LeadStatusUpdates").subscribe(async (notification) => {
    try {
      //when a notification is received start logic to digest information from SFDC and query Drift
      console.log('Event Type : ' + notification.event.type)
      console.log('Event Created : ' + notification.event.createdDate)
      console.log('ID of Lead : ' + notification.sobject.Id)
      console.log('Email Address of Updated Record in SFDC: ' + notification.sobject.Email)
      console.log(notification.sobject)
      let leadEmail = notification.sobject.Email
      let driftContactID = await queryDriftContact(leadEmail)
      console.log(driftContactID)
      let driftContactUpdate = await updateDriftContact(driftContactID)

    } catch (error) {
      console.error(error)
    }
  })
}

//helper functions

//query Drift Contact API to get a list of ID's associated with an email
const queryDriftContact = (leadEmail) => {
  return request
    .get(driftQueryUrl)
    .set('Content-type', 'application/json')
    .set('Authorization', `Bearer ${driftToken}`)
    .query(`email=${leadEmail}`)
    .then(res => {
      let emailObject = res.body.data
      let idArray = []
      emailObject.forEach(object => {
        idArray.push(object.id)
      })
      if (idArray.length === 0) {
         console.log(`There is no contact within Drift that matched the updated lead's in SFDC`)
      }
      return idArray
    })
    .catch(err => {
      return {
        error: err.message
      }
    })
}

//PATCH request to Drift API's to update contact information from SFDC
const updateDriftContact = async (driftContactID) => {
  console.log(`There are ` + driftContactID.length + ` contacts within Drift that match the email updated in SFDC`)
  for (let id of driftContactID) {
    let status = `Disqualified`
    let apiResponse = await request
      .patch(`${driftQueryUrl}/${id}`)
      .set('Content-type', 'application/json')
      .set('Authorization', `Bearer ${driftToken}`)
      .send({ 'attributes': { '_classification': `${status}` } })
      .then(res => {
        console.log(`Drift Contact with Unique ID ` + res.body.data.id + ` and Email ` + res.body.data.attributes.email + ` has been updated with a lead status of ${status}`)
      })
      .catch(err => {
        return {
          error: err.message
        }
      })
  }
}

//invoke initial function to start app
streamingAPI()