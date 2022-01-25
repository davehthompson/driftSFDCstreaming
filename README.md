# driftSFDCstreaming
Node app that listens for specific events in SFDC, queries Drift, and if applicable manipulate/change data in Drift to mirror SFDC

# Drift Salesforce (SFDC) Streaming API App

Server side application written in Node that listens for specific events in SFDC, queries Drift, and if applicable manipulate/change data in Drift to mirror SFDC. 

### Prerequisites

This project leverages core libraries/dependencies that are listed below:



* dotenv (https://www.npmjs.com/package/dotenv)
* express (https://www.npmjs.com/package/express)
* jsforce (https://www.npmjs.com/package/jsforce)
* node (https://nodejs.org/en/)
* npm (https://www.npmjs.com/package/npm)
* superagent (https://www.npmjs.com/package/superagent)


### Installing

Install Node.js first (npm should be included) locally or in the cloud depending on where you are developing. Then simply clone/download the repo locally and install the relevant dependences listed. For a one line command to install the dependencies see below:

```
npm i dotenv express jsforce superagent
```

Once installed navigate to the root directoy where the files resides and run the following command in the IDE of your choice 
```
node index.js
```
## Considerations

