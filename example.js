// Creating socket
const io = require('socket.io-client');

const xorBaseUrl = 'https://change.me';
const xorSocket = io(`${xorBaseUrl}/analyst`, { forceNew: true });

// Define variables:
const netconfigId = 'demo';
let ucid;

// Create new computation id
xorSocket.emit('createAndJoinNewUcid', { netconfigId }, (ans) => {
  console.log(ans);
  ({ ucid } = ans.ucid);
});

// Load compute params from json file/re/
const fs = require('fs');
const json = JSON.parse(fs.readFileSync('./params/radar.json'));

// Create completion listeners for the different phases:
xorSocket.on('compilePhaseCompleted', ans => console.log(`compile: ${ans.timings}ms`));
xorSocket.on('offlinePhaseCompleted', ans => console.log(`offline: ${ans.timings}ms`));
xorSocket.on('preprocessingPhaseCompleted', ans => console.log(`preprocessing: ${ans.timings}ms`));
xorSocket.on('onlinePhaseCompleted', ans => console.log(`online: ${ans.timings}ms`));
xorSocket.on('postprocessingPhaseCompleted', ans => console.log(`postprocessing: ${ans.timings}ms`));

// List all datasets
xorSocket.emit('listPrivateDatasets', {}, ans => console.log(ans));

// List headers for a particular dataset
xorSocket.emit('listHeaders', { ownerId: 0, name: 'radar_a' }, console.log);

// Once computation is validated start process
xorSocket.on('newComputationCreated', (ans) => {
  console.log(ans)
  if(!ans.error) xorSocket.emit('initiateCompilePhase', { ucid });
  else xorSocket.close();
});

// Result completion handler
xorSocket.on('resultPhaseCompleted', (ans) => {
  console.log(ans);
  // Result file can be downloaded under:
  // https://${xorBaseUrl}/result/${ucid}
  xorSocket.close();
});

// Start actual computation
xorSocket.emit('createNewComputation', json);
