
#### const MySQLJobs = require("mysql-jobs");



**Type**:  Class


**Description**:  Class that contains the whole API of the package.




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



