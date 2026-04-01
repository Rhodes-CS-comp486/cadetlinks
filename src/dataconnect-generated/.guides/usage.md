# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { listAllBooks, createJournalEntryForCurrentUser, getCurrentUserProfile, updateTaskStatus } from '@dataconnect/generated';


// Operation ListAllBooks: 
const { data } = await ListAllBooks(dataConnect);

// Operation CreateJournalEntryForCurrentUser:  For variables, look at type CreateJournalEntryForCurrentUserVars in ../index.d.ts
const { data } = await CreateJournalEntryForCurrentUser(dataConnect, createJournalEntryForCurrentUserVars);

// Operation GetCurrentUserProfile: 
const { data } = await GetCurrentUserProfile(dataConnect);

// Operation UpdateTaskStatus:  For variables, look at type UpdateTaskStatusVars in ../index.d.ts
const { data } = await UpdateTaskStatus(dataConnect, updateTaskStatusVars);


```