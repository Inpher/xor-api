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
xorSocket.emit('listPrivateDatasets', {}, answer => console.log(answer));
```

To receive an event, you need to define a listener:

```js
// listen for offline phase completion and log how long it took
xorSocket.on('offlinePhaseCompleted', answer => console.log(`offline: ${answer.timings}ms`));
```
## Algorithm
When creating a new computation, the algorithm parameters are sent to xor when calling `createNewComputation`. The structure of the `algorithm` object is the following.

```json
{  
   "netconfigId":"local-all",
   "ucid":"4e7e2f65-701b-89a7-274a-b30c27c06fdd",
   "algorithm":{  
      "type": "LINREG",
      "compileParams":{  
         "N":60000,
         "k":9,
         "audit":false
      },
      "sources":{  
         "a":{  
            "stype":"private",
            "name":"radar_0",
            "rows":50000,
            "cols":9,
            "ownerId":0
         },
         "b":{  
            "stype":"private",
            "name":"radar_1",
            "rows":10000,
            "cols":9,
            "ownerId":1
         }
      },
      "input":{  
         "X":"a(1-8);b(1-8)",
         "y":"a(9);b(9)",
         "intercept":true
      }
   }
}
```

| Field | Possible Values | Description |
| --- | --- | --- |
| `algorithm.type` | string | function that shall be run on the data |
| `compileParams.N` | integer | total number of rows (samples) to be used across all datasets |
| `compileParams.k` | integer | total number of columns (features and labels) to be used across all datasets |
| `compileParams.audit` | boolean | an audit archive containing all triplets, shares, network traces will be collected and created during the computation. this feature is not available in a production environment! |
| `sources[id].stype` | private, public, secretshared | type of dataset. `private` means the data resides in the private data folder of the xor machine. `public` means a publicly known value. `secretshared` means a dataset uploaded to the portal and secret shared with the xor machines |
| `sources[id].name` | string | name of the dataset *without* file extension |
| `sources[id].rows` | integer | total number of rows in the dataset |
| `sources[id].cols` | integer | total number of columns in the dataset |
| `sources[id].ownerId` | integer | player id of the xor machine |
| `algorithm.input.X` | string | training data composition |
| `algorithm.input.y` | string | label / dependent variable composition |
| `algorithm.input.model` | string | model composition |
| `algorithm.input.intercept` | boolean | should an intercept be fitted if applicable |

The available algorithms are the following ([more details](https://dev.inpher.io/xor)):

| algorithm.type | Description |
| --- | --- |
| MATRIXCOLUMNSUM | column-wise sum |
| CORRELATION | column-wise correlation |
| MEAN | column-wise mean |
| VARIANCE | column-wise variance |
| LINREG | linear regression |
| LOGREG | logistic regression |
| BATCHLOGREG | (alpha) logistic regression using batch gradient descent for large datasets |
| REGRESSIONPREDICT | dot product between `thetas` and test matrix |
| RSS | residual sum of squares |
| PSI | private set intersection |

The composition of the input (algorithm.input) follows the following syntax:

```r
# counting starts with 1, not with 0

# column selection
a(1-5) # take columns 1 to 5 of dataset a
a(1-5,8,10) # take columns 1 to 5, 8 and 10 from dataset a

# row selection
a[1-100] # take rows 1 to 100 from dataset a

# horizontal stacking
a:b # horizontally stack columns of datasets a and b
a(1-3):b(5) # stack columns 1-3 of dataset a with column 5 of dataset b

# vertical stacking
a;b # vertically stack all rows of datasets a and b
a[1-100];b[200-300] # vertically stack rows 1-100 of dataset a with rows 200-300 from b

# mixed stacking / selection
a[1-10](3,4):b[1-10](1,2);c[1-10](1-4)
```

## Events
### Emit
#### Errors
When an issued command fails, due to bad input or state, the callback will return an error. E.g:

```js
// listPrivateDatasets with bad netconfigId
xorPortalSocket.emit('listPrivateDatasets', {netconfigId: 'bad'}, console.log)
// Outputs: {error: "requested netconfig is not ready"}
```

So typically, error handling can be implemented like this:

```js
xorPortalSocket.emit('listPrivateDatasets', {netconfigId: 'bad'}, (answer) => {
  if (answer && answer.error) {
    console.error(answer.error);
    // handle error
  } else {
    // handle success
  }
});
```

#### Streams
You can also send data streams across web sockets. xor uses the `socket.io-stream` [package](https://www.npmjs.com/package/socket.io-stream) package to accomplish that.

```bash
npm install --save socket.io-stream
```

Example usage:
```js
// require socket.io-stream package
const stream = ss.createStream();
const ss = require('socket.io-stream');

// send a file across a stream, logs answer
ss(xorPortalSocket).emit('preUploadAnalystData', stream, { ucid, 'mydataset' }, console.log);
const blobStream = ss.createBlobReadStream(file);
blobStream.pipe(stream);
```

#### Connection
| Event Name | Query JSON | Callback Answer JSON | Description |
|---|---|---|---|
| createAndJoinNewUcid | `{ netconfigId }` | `{ ucid }` | joins a given netconfig and receives a new computation id `ucid`  |
| joinExistingUcid | `{ ucid }` | `{ state }` | joins an existing `ucid` and retrieves the state for this computation |
| leaveUcid | `{ ucid }` | `{}` | leaves an existing `ucid` |
#### Data Discovery
| Event Name | Query JSON | Callback Answer JSON | Description |
|---|---|---|---|
| listAvailableNetconfigs | `{}` | `{netconfig1, netconfig2, ...}` | lists all available netconfigs. Each `netconfig` object contains a `numplayers` and `netconfigId` field |
| listPrivateDatasets | `{ netconfigId }` | `{answer: [ds1, ds2, ...]}` | lists all available private datasets. Each dataset `ds` object contains an `ownerId` and `name` field |
| listAnalystDatasets | `{ ucid }` | `{answer: [ds1, ds2, ...]}` | lists all available datasets uploaded by the analyst. Each `ds` object is a string containing the name of the dataset |
| listHeaders | `{ netconfigId, name, ownerId }` | `{ name, ownerId, rows, cols, headers}` | retrieves information about a specific dataset. The `headers` field is an array containing the header for each column |
| listAnalystHeaders | `{ ucid, name }` | `{ name, rows, cols, headers }` | retrieves information about a specific dataset uploaded by the analyst. The `headers` field is an array containing the header for each column |
#### Upload Analyst Data
| Event Name | Query JSON | Callback Answer JSON | Description |
|---|---|---|---|
| preUploadAnalystData | `{ ucid, sourcename }`, | `{}` | uploads a dataset to the xor portal through a [stream](#streams) |
#### New Computation
| Event Name | Query JSON | Callback Answer JSON | Description |
|---|---|---|---|
| createNewComputation | `{ netconfigId, ucid, algorithm }` | `{}` | creates and validate new computation based on provided [algorithm](#algorithm)  parameters |
| initiateCompilePhase | `{ ucid }` | `{}` | starts the computation created in `createNewComputation` step |
### On (Listeners)
#### Errors
When a command fails during processing, the xor portal will return an error event that should be catched by the corresponding `on` listener. E.g:

```js
// valid query, but failure will occur while the xor machines or service encounters an error
xorPortalSocket.emit('createNewComputation', query, console.error); // no error logged here!
xorSocket.on('newComputationCreated', (answer) => {
  if (answer && answer.error) {
    // error will be caught on the corresponding completion listener
    console.error(answer.error)
    // handle error
  } else {
    // handle success
  }
});
```

#### Progress Listeners
| Event Name | Answer JSON | Description |
|---|---|---|
| createNewComputationProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| uploadPhaseProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| compilePhaseProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| offlinePhaseProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| preprocessingPhaseProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| onlinePhaseProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| postprocessingPhaseProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| resultPhaseProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
| assembleAuditArchiveProgress | { progress } | returns a progress value between 0 and 1 (0% - 100%) for this stage |
#### Completion Listeners

Each completion listener will receive the `ucid` in order to distinguish multiple parallel computations, as well as `timings` containing timing information in milli seconds.

| Event Name | Answer JSON | Description |
|---|---|---|
| newComputationCreated | `{ ucid, timings }` | event received when `createNewComputation` completed |
| compilePhaseCompleted | `{ ucid, timings }` | event received when circuit compilation completed |
| uploadPhaseCompleted | `{ ucid, timings }` | event received when secret shares upload completed |
| offlinePhaseCompleted | `{ ucid, timings }` | event received when offline phase completed |
| preprocessingPhaseCompleted|  `{ ucid, timings }` | event received when preprocessing completed |
| onlinePhaseCompleted | `{ ucid, timings }` | event received when online phase completed |
| postprocessingPhaseCompleted | `{ ucid, timings }` | event received when post processing completed |
| resultPhaseCompleted | `{ ucid, result, timings }` | event received when results available. `results` contains a preview of the result  |
| auditPhaseCompleted | `{ ucid, timings }` | event received when audit archive available |
#### Connection Listeners
| Event Name | Answer JSON | Description |
|---|---|---|
| xorMachineDisconnected | `{ netconfigId, playerId }` | received when xor machine disconnected |
| xorMachineConnected | `{ netconfigId, playerId }` | received when xor machine connected |
| xorServiceDisconnected | `{ netconfigId }` | received when xor service disconnected |
| xorServiceConnected | `{ netconfigId }` | received when xor service connected |

### Getting the result
A result preview is sent along the `resultPhaseCompleted` event. The full result shall be downloaded through and HTTP request:

```js
const https = require('https');
https.get(`${xorBaseUrl}/result/${ucid}`, (resp) => {
  let data = '';

  // A chunk of data has been received.
  resp.on('data', (chunk) => data += chunk);

  // The whole response has been received. Print out the result.
  resp.on('end', () => {
    // do something with data
  });
}).on("error", console.error);
```

the same can be done with the audit archive
