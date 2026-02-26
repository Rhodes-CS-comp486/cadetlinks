import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;




export interface Book_Key {
  id: UUIDString;
  __typename?: 'Book_Key';
}

export interface CreateJournalEntryForCurrentUserData {
  journalEntry_insert: JournalEntry_Key;
}

export interface CreateJournalEntryForCurrentUserVariables {
  title: string;
  content: string;
  entryDate: DateString;
  tags?: string[] | null;
}

export interface FinancialTransaction_Key {
  id: UUIDString;
  __typename?: 'FinancialTransaction_Key';
}

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

export interface JournalEntry_Key {
  id: UUIDString;
  __typename?: 'JournalEntry_Key';
}

export interface ListAllBooksData {
  books: ({
    id: UUIDString;
    title: string;
    author: string;
    status: string;
  } & Book_Key)[];
}

export interface Task_Key {
  id: UUIDString;
  __typename?: 'Task_Key';
}

export interface UpdateTaskStatusData {
  task_update?: Task_Key | null;
}

export interface UpdateTaskStatusVariables {
  id: UUIDString;
  status: string;
}

export interface User_Key {
  id: UUIDString;
  __typename?: 'User_Key';
}

interface ListAllBooksRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<ListAllBooksData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<ListAllBooksData, undefined>;
  operationName: string;
}
export const listAllBooksRef: ListAllBooksRef;

export function listAllBooks(): QueryPromise<ListAllBooksData, undefined>;
export function listAllBooks(dc: DataConnect): QueryPromise<ListAllBooksData, undefined>;

interface CreateJournalEntryForCurrentUserRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateJournalEntryForCurrentUserVariables): MutationRef<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateJournalEntryForCurrentUserVariables): MutationRef<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;
  operationName: string;
}
export const createJournalEntryForCurrentUserRef: CreateJournalEntryForCurrentUserRef;

export function createJournalEntryForCurrentUser(vars: CreateJournalEntryForCurrentUserVariables): MutationPromise<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;
export function createJournalEntryForCurrentUser(dc: DataConnect, vars: CreateJournalEntryForCurrentUserVariables): MutationPromise<CreateJournalEntryForCurrentUserData, CreateJournalEntryForCurrentUserVariables>;

interface GetCurrentUserProfileRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetCurrentUserProfileData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetCurrentUserProfileData, undefined>;
  operationName: string;
}
export const getCurrentUserProfileRef: GetCurrentUserProfileRef;

export function getCurrentUserProfile(): QueryPromise<GetCurrentUserProfileData, undefined>;
export function getCurrentUserProfile(dc: DataConnect): QueryPromise<GetCurrentUserProfileData, undefined>;

interface UpdateTaskStatusRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateTaskStatusVariables): MutationRef<UpdateTaskStatusData, UpdateTaskStatusVariables>;
  operationName: string;
}
export const updateTaskStatusRef: UpdateTaskStatusRef;

export function updateTaskStatus(vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;
export function updateTaskStatus(dc: DataConnect, vars: UpdateTaskStatusVariables): MutationPromise<UpdateTaskStatusData, UpdateTaskStatusVariables>;

