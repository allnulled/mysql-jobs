# mysql-jobs

Schedule tasks through MySQL and Node.js.

## Why?

To have a standard and easy way to schedule tasks with database persistence.

## Installation

`$ npm i -g mysql-jobs`

## API usage

### Import the package

```js
const MySQLJobs = require("mysql-jobs");
```

### Instantiate a jobs system

```js
const jobs = await MySQLJobs.create({
	debug: true,
	settings: {
		connection: {
			user: "test",
			password: "test",
			database: "test",
			host: "127.0.0.1",
			port: 3306
		}
	}
});
```

### Create jobs tables

```js
await jobs.createTables({});
```

### Create new jobs

```js
await jobs.create({});
```

### Find jobs

```js
await jobs.find({});
```

### Lock jobs

```js
await jobs.lock({});
```

### Unlock jobs

```js
await jobs.unlock({});
```

### Update jobs

```js
await jobs.update({});
```

### Print jobs status

```js
await jobs.status();
```

### Start jobs

```js
await jobs.start({});
```

### Stop jobs

```js
await jobs.stop({});
```

### Delete jobs

```js
await jobs.delete({});
```

### Delete jobs tables

```js
await jobs.deleteTables({});
```



## CLI usage

```sh

```

## API Reference

-----


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






----

## License

This project is licensed under [WTFPL](https://es.wikipedia.org/wiki/WTFPL), so *do What The Fuck you want with it*.

## Issues and suggestions

Please, address issues and suggestions [here](https://github.com/allnulled/mysql-jobs/issues).