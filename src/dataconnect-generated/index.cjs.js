const { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');
import { FIREBASE_URL } from '@env';

console.log(FIREBASE_URL);

const connectorConfig = {
  connector: 'example',
  service: 'cadetlinks',
  location: 'us-east4'
};
exports.connectorConfig = connectorConfig;

const listAllBooksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllBooks');
}
listAllBooksRef.operationName = 'ListAllBooks';
exports.listAllBooksRef = listAllBooksRef;

exports.listAllBooks = function listAllBooks(dc) {
  return executeQuery(listAllBooksRef(dc));
};

const createJournalEntryForCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateJournalEntryForCurrentUser', inputVars);
}
createJournalEntryForCurrentUserRef.operationName = 'CreateJournalEntryForCurrentUser';
exports.createJournalEntryForCurrentUserRef = createJournalEntryForCurrentUserRef;

exports.createJournalEntryForCurrentUser = function createJournalEntryForCurrentUser(dcOrVars, vars) {
  return executeMutation(createJournalEntryForCurrentUserRef(dcOrVars, vars));
};

const getCurrentUserProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUserProfile');
}
getCurrentUserProfileRef.operationName = 'GetCurrentUserProfile';
exports.getCurrentUserProfileRef = getCurrentUserProfileRef;

exports.getCurrentUserProfile = function getCurrentUserProfile(dc) {
  return executeQuery(getCurrentUserProfileRef(dc));
};

const updateTaskStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaskStatus', inputVars);
}
updateTaskStatusRef.operationName = 'UpdateTaskStatus';
exports.updateTaskStatusRef = updateTaskStatusRef;

exports.updateTaskStatus = function updateTaskStatus(dcOrVars, vars) {
  return executeMutation(updateTaskStatusRef(dcOrVars, vars));
};
