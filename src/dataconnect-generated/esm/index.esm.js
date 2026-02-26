import { queryRef, executeQuery, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const connectorConfig = {
  connector: 'example',
  service: 'cadetlinks',
  location: 'us-east4'
};

export const listAllBooksRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListAllBooks');
}
listAllBooksRef.operationName = 'ListAllBooks';

export function listAllBooks(dc) {
  return executeQuery(listAllBooksRef(dc));
}

export const createJournalEntryForCurrentUserRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateJournalEntryForCurrentUser', inputVars);
}
createJournalEntryForCurrentUserRef.operationName = 'CreateJournalEntryForCurrentUser';

export function createJournalEntryForCurrentUser(dcOrVars, vars) {
  return executeMutation(createJournalEntryForCurrentUserRef(dcOrVars, vars));
}

export const getCurrentUserProfileRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetCurrentUserProfile');
}
getCurrentUserProfileRef.operationName = 'GetCurrentUserProfile';

export function getCurrentUserProfile(dc) {
  return executeQuery(getCurrentUserProfileRef(dc));
}

export const updateTaskStatusRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateTaskStatus', inputVars);
}
updateTaskStatusRef.operationName = 'UpdateTaskStatus';

export function updateTaskStatus(dcOrVars, vars) {
  return executeMutation(updateTaskStatusRef(dcOrVars, vars));
}

