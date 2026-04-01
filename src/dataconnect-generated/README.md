# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `example`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*ListAllBooks*](#listallbooks)
  - [*GetCurrentUserProfile*](#getcurrentuserprofile)
- [**Mutations**](#mutations)
  - [*CreateJournalEntryForCurrentUser*](#createjournalentryforcurrentuser)
  - [*UpdateTaskStatus*](#updatetaskstatus)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `example`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@dataconnect/generated` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@dataconnect/generated';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## ListAllBooks
You can execute the `ListAllBooks` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
listAllBooks(): QueryPromise<ListAllBooksData, undefined>;

interface ListAllBooksRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllBooksData, undefined>;
}
export const listAllBooksRef: ListAllBooksRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listAllBooks(dc: DataConnect): QueryPromise<ListAllBooksData, undefined>;

interface ListAllBooksRef {
  ...
  (dc: DataConnect): QueryRef<ListAllBooksData, undefined>;
}
export const listAllBooksRef: ListAllBooksRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listAllBooksRef:
```typescript
const name = listAllBooksRef.operationName;
console.log(name);
```

### Variables
The `ListAllBooks` query has no variables.
### Return Type
Recall that executing the `ListAllBooks` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListAllBooksData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface ListAllBooksData {
  books: ({
    id: UUIDString;
    title: string;
    author: string;
    status: string;
  } & Book_Key)[];
}
```
### Using `ListAllBooks`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listAllBooks } from '@dataconnect/generated';


// Call the `listAllBooks()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listAllBooks();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listAllBooks(dataConnect);

console.log(data.books);

// Or, you can use the `Promise` API.
listAllBooks().then((response) => {
  const data = response.data;
  console.log(data.books);
});
```

### Using `ListAllBooks`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listAllBooksRef } from '@dataconnect/generated';


// Call the `listAllBooksRef()` function to get a reference to the query.
const ref = listAllBooksRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listAllBooksRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.books);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.books);
});
```

## GetCurrentUserProfile
You can execute the `GetCurrentUserProfile` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
getCurrentUserProfile(): QueryPromise<GetCurrentUserProfileData, undefined>;

interface GetCurrentUserProfileRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserProfileData, undefined>;
}
export const getCurrentUserProfileRef: GetCurrentUserProfileRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getCurrentUserProfile(dc: DataConnect): QueryPromise<GetCurrentUserProfileData, undefined>;

interface GetCurrentUserProfileRef {
  ...
  (dc: DataConnect): QueryRef<GetCurrentUserProfileData, undefined>;
}
export const getCurrentUserProfileRef: GetCurrentUserProfileRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getCurrentUserProfileRef:
```typescript
const name = getCurrentUserProfileRef.operationName;
console.log(name);
```

### Variables
The `GetCurrentUserProfile` query has no variables.
### Return Type
Recall that executing the `GetCurrentUserProfile` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetCurrentUserProfileData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface GetCurrentUserProfileData {
  user?: {
    id: UUIDString;
    username: string;
    email: string;
    displayName?: string | null;
    profilePictureUrl?: string | null;
    createdAt: TimestampString;
  } & User_Key;
}
```
### Using `GetCurrentUserProfile`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserProfile } from '@dataconnect/generated';


// Call the `getCurrentUserProfile()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getCurrentUserProfile();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getCurrentUserProfile(dataConnect);

console.log(data.user);

// Or, you can use the `Promise` API.
getCurrentUserProfile().then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

### Using `GetCurrentUserProfile`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getCurrentUserProfileRef } from '@dataconnect/generated';


// Call the `getCurrentUserProfileRef()` function to get a reference to the query.
const ref = getCurrentUserProfileRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getCurrentUserProfileRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.user);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.user);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `example` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateJournalEntryForCurrentUser
You can execute the `CreateJournalEntryForCurrentUser` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
createJournalEntryForCurrentUser(vars: CreateJournalEntryForCurrentUserVariables): MutationPromise<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;

interface CreateJournalEntryForCurrentUserRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateJournalEntryForCurrentUserVariables): MutationRef<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;
}
export const createJournalEntryForCurrentUserRef: CreateJournalEntryForCurrentUserRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createJournalEntryForCurrentUser(dc: DataConnect, vars: CreateJournalEntryForCurrentUserVariables): MutationPromise<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;

interface CreateJournalEntryForCurrentUserRef {
  ...
  (dc: DataConnect, vars: CreateJournalEntryForCurrentUserVariables): MutationRef<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;
}
export const createJournalEntryForCurrentUserRef: CreateJournalEntryForCurrentUserRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createJournalEntryForCurrentUserRef:
```typescript
const name = createJournalEntryForCurrentUserRef.operationName;
console.log(name);
```

### Variables
The `CreateJournalEntryForCurrentUser` mutation requires an argument of type `CreateJournalEntryForCurrentUserVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface CreateJournalEntryForCurrentUserVariables {
  title: string;
  content: string;
  entryDate: DateString;
  tags?: string[] | null;
}
```
### Return Type
Recall that executing the `CreateJournalEntryForCurrentUser` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateJournalEntryForCurrentUserData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateJournalEntryForCurrentUserData {
  journalEntry_insert: JournalEntry_Key;
}
```
### Using `CreateJournalEntryForCurrentUser`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createJournalEntryForCurrentUser, CreateJournalEntryForCurrentUserVariables } from '@dataconnect/generated';

// The `CreateJournalEntryForCurrentUser` mutation requires an argument of type `CreateJournalEntryForCurrentUserVariables`:
const createJournalEntryForCurrentUserVars: CreateJournalEntryForCurrentUserVariables = {
  title: ..., 
  content: ..., 
  entryDate: ..., 
  tags: ..., // optional
};

// Call the `createJournalEntryForCurrentUser()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createJournalEntryForCurrentUser(createJournalEntryForCurrentUserVars);
// Variables can be defined inline as well.
const { data } = await createJournalEntryForCurrentUser({ title: ..., content: ..., entryDate: ..., tags: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createJournalEntryForCurrentUser(dataConnect, createJournalEntryForCurrentUserVars);

console.log(data.journalEntry_insert);

// Or, you can use the `Promise` API.
createJournalEntryForCurrentUser(createJournalEntryForCurrentUserVars).then((response) => {
  const data = response.data;
  console.log(data.journalEntry_insert);
});
```

### Using `CreateJournalEntryForCurrentUser`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createJournalEntryForCurrentUserRef, CreateJournalEntryForCurrentUserVariables } from '@dataconnect/generated';

// The `CreateJournalEntryForCurrentUser` mutation requires an argument of type `CreateJournalEntryForCurrentUserVariables`:
const createJournalEntryForCurrentUserVars: CreateJournalEntryForCurrentUserVariables = {
  title: ..., 
  content: ..., 
  entryDate: ..., 
  tags: ..., // optional
};

// Call the `createJournalEntryForCurrentUserRef()` function to get a reference to the mutation.
const ref = createJournalEntryForCurrentUserRef(createJournalEntryForCurrentUserVars);
// Variables can be defined inline as well.
const ref = createJournalEntryForCurrentUserRef({ title: ..., content: ..., entryDate: ..., tags: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createJournalEntryForCurrentUserRef(dataConnect, createJournalEntryForCurrentUserVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.journalEntry_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.journalEntry_insert);
});
```

## UpdateTaskStatus
You can execute the `UpdateTaskStatus` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-generated/index.d.ts](./index.d.ts):
```typescript
updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface UpdateTaskStatusRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

interface UpdateTaskStatusRef {
  ...
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateTaskStatusRef:
```typescript
const name = updateTaskStatusRef.operationName;
console.log(name);
```

### Variables
The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface UpdateTaskStatusVariables {
  id: UUIDString;
  status: string;
}
```
### Return Type
Recall that executing the `UpdateTaskStatus` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateTaskStatusData`, which is defined in [dataconnect-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}
```
### Using `UpdateTaskStatus`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateTaskStatus, UpdateTaskStatusVariables } from '@dataconnect/generated';

// The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`:
const updateTaskStatusVars: UpdateTaskStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTaskStatus()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateTaskStatus(updateTaskStatusVars);
// Variables can be defined inline as well.
const { data } = await updateTaskStatus({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateTaskStatus(dataConnect, updateTaskStatusVars);

console.log(data.task_update);

// Or, you can use the `Promise` API.
updateTaskStatus(updateTaskStatusVars).then((response) => {
  const data = response.data;
  console.log(data.task_update);
});
```

### Using `UpdateTaskStatus`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateTaskStatusRef, UpdateTaskStatusVariables } from '@dataconnect/generated';

// The `UpdateTaskStatus` mutation requires an argument of type `UpdateTaskStatusVariables`:
const updateTaskStatusVars: UpdateTaskStatusVariables = {
  id: ..., 
  status: ..., 
};

// Call the `updateTaskStatusRef()` function to get a reference to the mutation.
const ref = updateTaskStatusRef(updateTaskStatusVars);
// Variables can be defined inline as well.
const ref = updateTaskStatusRef({ id: ..., status: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateTaskStatusRef(dataConnect, updateTaskStatusVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.task_update);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.task_update);
});
```

