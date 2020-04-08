
#### `const MySQLJobs = require("mysql-jobs")`



**Type**:  Class


**Description**:  Class that contains the whole API of the package.




-----

#### `const jobs = MySQLJobs.create(options:Object)`



**Type**:  Static method


**Parameter**: 


  - `options:Object`. Optional. Properties and methods to override of the class instance.


**Returns**:  `jobs:Object`. A fresh instance of MySQLJobs, already configured and loaded.


**Description**:  This methods calls the constructor under the hood. It:

   - Sets up its own variables
   - Turns on debug and trace environmental variables (`process.env.DEBUG`)
   - Initializes templates. Note that this operation reads files synchronously. This makes this operation not adecuate for critically-performant environments.
   - Initializes database connection. This operation is not asynchronous, though, and it does not make the connection stablished or ensured at all. This will happen on the first query.




-----

#### `jobs.start(whereJobs:Object|Array)`



**Type**:  Method.


**Parameter**: 


  - `whereJobs:Object|Array`. Optional. SQL `where` conditions to know which jobs to start.


**Returns**:  `data:Promise`. A promise with the data returned by the jobs' dispatchers.


**Description**:  Dispatches all the selected jobs, or as much as the allowed of them depending on `this.activeJobs` and `this.settings.maxActiveJobs`




-----

#### `jobs.stop(whereJobs:Object|Array)`



**Type**:  Method.


**Parameter**: 


  - `whereJobs:Object|Array`. Optional. SQL `where` conditions to know which jobs to stop.


**Returns**:  `data:Promise`.


**Description**:  Aborts all the selected jobs, if they are active, and returns a small report.




-----

#### `jobs.status()`



**Type**:  Method.


**Returns**:  `undefined`.


**Description**:  Prints the status of all the jobs.




-----

#### `jobs.end()`



**Type**:  Method.


**Returns**:  `undefined`.


**Description**:  Closes the database connection created on the constructor. If you do not call this method, the process will hang.




-----

#### `jobs.createTables()`



**Type**:  Method


**Return**:  `Promise`


**Description**:  Creates the database tables, if they do not exist.




-----

#### `jobs.create(values:Object)`



**Type**:  Method


**Parameter**: 


  - `values:Object`. Required. Values of the new job in database.


**Return**:  `Promise`


**Description**:  Creates a new job in the database.




-----

#### `jobs.deleteTables()`



**Type**:  Method


**Return**:  `Promise`


**Description**:  Deletes the database tables, if they exist.




-----

#### `jobs.delete(whereJob:Object|Array)`



**Type**:  Method


**Parameter**: 


  - `whereJob:Object|Array`. Required. Conditions that need to be met to delete the job in the database.


**Return**:  `Promise`


**Description**:  Deletes all jobs that acomplish certain condition/s.




-----

#### `jobs.update(whereJob:Object|Array)`



**Type**:  Method


**Parameter**: 


  - `whereJob:Object|Array`. Required. Conditions that need to be met to unlock some job/s of the database.


  - `values:Object`. Required. Values to be set to the jobs found by the `whereJob` conditions.


**Return**:  `Promise`


**Description**:  Sets any value of the database to any job that mets the passed conditions.




-----

#### `jobs.find(whereJob:Object|Array)`



**Type**:  Method


**Parameter**: 


  - `whereJob:Object|Array`. Required. Conditions that need to be met to list the job of the database as 'found'.


**Return**:  `Promise`


**Description**:  Returns jobs that accomplish some condition/s.




-----

#### `jobs.unlock(whereJob:Object|Array)`



**Type**:  Method


**Parameter**: 


  - `whereJob:Object|Array`. Required. Conditions that need to be met to unlock some job/s of the database.


**Return**:  `Promise`


**Description**:  Sets the flag of `is_locked` to `0` in the database.




-----

#### `jobs.lock(whereJob:Object|Array)`



**Type**:  Method


**Parameter**: 


  - `whereJob:Object|Array`. Required. Conditions that need to be met to lock some job/s of the database.


**Return**:  `Promise`


**Description**:  Sets the flag of `is_locked` to `1` in the database.



