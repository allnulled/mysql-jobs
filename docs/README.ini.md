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
