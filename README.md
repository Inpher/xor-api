# xor-api
XOR API (alpha) and Examples

# Introduction
The purpose of this document is to show you how to interact programmatically with the xor API.

# Requirements
The API is based on [socket.io's](https://socket.io) implementaion of websockets. To install `socket.io`, run the following command in your project:

```bash
npm i -s socket.io-client
```

once you installed the `socket.io` dependency, add it to your project:

```js
const io = require('socket.io-client');
```

# API
## Initiating a socket
To initiate a socket with `socket.io` you first need to establish a connection with the server:

```js
const xorBaseUrl = 'https://<xor-portal url>';
const xorSocket = io(`${xorBaseUrl}/analyst`, { forceNew: true });
```

## Sending / Receiving events
Now that you have a socket, you can send events:

```js
// list available datasets
xorSocket.emit('listPrivateDatasets', {}, ans => console.log(ans));
```

To receive an event, you need to define a listener:

```js
// listen for offline phase completion and log how long it took
xorSocket.on('offlinePhaseCompleted', ans => console.log(`offline: ${ans.timings}ms`));
```

## Events
### Emit
#### Connection
| Event Name | Query JSON | Callback Answer JSON | Description | 
|---|---|---|---|
| createAndJoinNewUcid | {} | {} | |
| joinExistingUcid | {} | {} | |
| leaveUcid | {} | {} | |
#### Data Discovery
| Event Name | Query JSON | Callback Answer JSON | Description | 
|---|---|---|---|
| listAvailableNetconfigs | {} | {} | |
| listPrivateDatasets | {} | {} | |
| listAnalystDatasets | {} | {} | |
| listHeaders | {} | {} | |
| listAnalystHeaders | {} | {} | |
#### Upload Analyst Data
| Event Name | Query JSON | Callback Answer JSON | Description | 
|---|---|---|---|
| uploadAnalystData | {} | {} | |
| preUploadAnalystData | {} | {} | |
#### New Computation 
| Event Name | Query JSON | Callback Answer JSON | Description | 
|---|---|---|---|
| createNewComputation | {} | {} | |
| initiateCompilePhase | {} | {} | |
| cancelOnlinePhase | {} | {} | |
### On (Listeners)
#### Errors
#### Misc Listeners
| Event Name | Answer JSON | Description | 
|---|---|---|
| newComputationCreated | {} | |
| onlinePhaseQueued | {} | |
| onlinePhaseResumed | {} | |
#### Progress Listeners
| Event Name | Answer JSON | Description | 
|---|---|---|
| createNewComputationProgress | {} | |
| uploadPhaseProgress | {} | |
| compilePhaseProgress | {} | |
| offlinePhaseProgress | {} | |
| preprocessingPhaseProgress | {} | |
| onlinePhaseProgress | {} | |
| postprocessingPhaseProgress | {} | |
| resultPhaseProgress | {} | |
| assembleAuditArchiveProgress | {} | |
#### Completion Listeners
| Event Name | Answer JSON | Description | 
|---|---|---|
| compilePhaseCompleted | {} | |
| uploadPhaseCompleted | {} | |
| offlinePhaseCompleted | {} | |
| preprocessingPhaseCompleted|  {} | |
| onlinePhaseCompleted | {} | |
| postprocessingPhaseCompleted | {} | |
| resultPhaseCompleted | {} | |
| auditPhaseCompleted | {} | |
#### Connection Listeners
| Event Name | Answer JSON | Description | 
|---|---|---|
| xorMachineDisconnected | {} | |
| xorMachineConnected | {} | |
| xorServiceDisconnected | {} | |
| xorServiceConnected | {} | |

# Sample implementation
