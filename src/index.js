const ejs = require("ejs");
const mysql = require("mysql");
const debug = require("debug");
const SQL = require("sqlstring");
const fs = require("fs");
const path = require("path");
const utils = require("@allnulled/sql-utils");
const noop = () => {};

global.dd = (...args) => {
	console.log(...args);
	console.log("********** program died *************");
	process.exit(0);
}

class Job {

	static get DEFAULT_OPTIONS() {
		return {};
	}

	static create(...args) {
		return new this(...args);
	}

	constructor(jobSystem, options = {}) {
		Object.assign(this, this.constructor.DEFAULT_OPTIONS, options);
	}

}

/**
 * 
 * #### `const MySQLJobs = require("mysql-jobs")`
 * 
 * @type Class
 * @description Class that contains the whole API of the package.
 * 
 */
class JobSystem {

	static get Job() {
		return Job;
	}

	/**
	 * 
	 * -----
	 * 
	 * #### `const jobs = MySQLJobs.create(options:Object)`
	 * 
	 * @type Static method
	 * @parameter
	 * @parameter  - `options:Object`. Optional. Properties and methods to override of the class instance.
	 * @returns `jobs:Object`. A fresh instance of MySQLJobs, already configured and loaded.
	 * @description This methods calls the constructor under the hood. It:
	 * 
	 *    - Sets up its own variables
	 *    - Turns on debug and trace environmental variables (`process.env.DEBUG`)
	 *    - Initializes templates. Note that this operation reads files synchronously. This makes this operation not adecuate for critically-performant environments.
	 *    - Initializes database connection. This operation is not asynchronous, though, and it does not make the connection stablished or ensured at all. This will happen on the first query.
	 * 
	 */
	static create(...args) {
		return new this(...args);
	}

	static get DEFAULT_OPTIONS() {
		return {
			activeJobs: {},
			queries: {},
			settings: {}
		};
	}

	static get DEFAULT_SETTINGS() {
		return {
			connection: {},
			tablename: "pending",
			maxActiveJobs: 10,
		};
	}

	static get DEFAULT_CONNECTION_SETTINGS() {
		return {
			database: "test",
			user: "test",
			password: "test",
			host: "127.0.0.1",
			port: 3306,
			multipleStatements: true
		};
	}

	constructor(options = {}) {
		Object.assign(this, this.constructor.DEFAULT_OPTIONS, options);
		this.settings = Object.assign({}, this.settings, this.constructor.DEFAULT_SETTINGS, options.settings || {});
		this.settings.connection = Object.assign({}, this.constructor.DEFAULT_CONNECTION_SETTINGS, this.settings.connection || {});
		this.$trace = debug("mysql-job:trace");
		this.$debug = debug("mysql-job:debug");
		this.$error = debug("mysql-job:error");
		debug.enable("mysql-job:error" + (this.trace ? ",mysql-job:trace" : "") + ((this.trace || this.debug) ? ",mysql-job:debug" : ""));
		this.$initializeTemplates();
		this.$initializeConnection();
		process.on("exit", () => this.stop());
	}

	$initializeTemplates() {
		this.$trace("$initializeTemplates");
		try {
			fs.readdirSync(__dirname + "/queries").forEach(filename => {
				const method = filename.replace(/\.sql\.ejs$/g, "");
				this.queries[method] = fs.readFileSync(__dirname + "/queries/" + filename).toString();
				this[method] = (...args) => {
					return this.$renderQueryTo(method, ...args);
				}
			});
		} catch (error) {
			this.$error("Error on <$initializeTemplates>:", error);
			throw error;
		}
	}

	$initializeConnection() {
		this.$trace("$initializeConnection");
		if (this.connection) {
			return;
		}
		if (typeof this.settings.connection !== "object") {
			throw new Error("Property <settings.connection> must be an object to <$initializeConnection>");
		}
		try {
			this.connection = mysql.createConnection(this.settings.connection);
		} catch (error) {
			this.$error("Error on <$initializeConnection>:", error);
			throw error;
		}
	}

	async $renderQueryTo(method, ...args) {
		this.$trace("$renderQueryTo");
		try {
			if (!(method in this.queries)) {
				throw new Error("Property <queries." + method + "> is required to <$renderQueryTo>");
			}
			const queryTemplate = this.queries[method];
			let querySource;
			try {
				querySource = this.$render(queryTemplate, {
					args
				});
			} catch (error) {
				this.$error("Error on <$render> for <" + method + ">");
				throw error;
			}
			let output;
			try {
				output = await this.$query(querySource);
			} catch (error) {
				this.$error("Error on <$query> for <" + method + ">");
				throw error;
			}
			return output;
		} catch (error) {
			this.$error("Error on <$renderQueryTo> for <" + method + ">", error);
			throw error;
		}
	}

	$render(templateSource, parameters = {}, templateSettings = {}) {
		this.$trace("$render");
		return ejs.render(templateSource, this.$createTemplateParameters(parameters), templateSettings);
	}

	$createTemplateParameters(parameters = {}) {
		this.$trace("$createTemplateParameters");
		const templateParameters = { ...parameters,
			scope: this,
			process,
			ejs,
			fs,
			SQL,
			utils,
		};
		templateParameters.createTemplateParameters = this.$createTemplateParameters.bind(this);
		templateParameters.parameters = { ...templateParameters,
			parameters: null
		};
		return templateParameters;
	}

	$query(querySource) {
		this.$trace("$query");
		this.$debug("[SQL] " + querySource);
		return new Promise((ok, fail) => {
			this.connection.query(querySource, (error, data, fields) => {
				if (error) {
					return fail(error);
				}
				return ok({
					data,
					fields,
				});
			});
		});
	}

	async $dispatch(job) {
		this.$trace("$dispatch");
		try {
			const {
				data: {
					affectedRows
				}
			} = await this.lock({
				id: job.id
			});
			if (affectedRows !== 1) {
				throw new Error("Job could not be locked");
			}
			const dispatcher = this.$createDispatcher(job);
			this.activeJobs[job.name] = dispatcher;
			return await dispatcher;
		} catch (error) {
			this.$error("Error on <$dispatch>:", error);
			throw error;
		}
	}

	$createDispatcher(job) {
		const [program, parameters = ""] = job.dispatcher.split("@");
		const dispatcher = {};
		dispatcher.promise = new Promise((resolve, reject) => {
			dispatcher.$job = job;
			dispatcher.$resolve = resolve;
			dispatcher.$reject = reject;
			if (program === "node") {
				const mod = require(path.resolve(parameters));
				if (typeof mod !== "function") {
					throw new Error("Error on dispatcher");
				}
				const result = mod(job, this);
				if (result instanceof Promise) {
					result.then(data => {
						resolve(data);
					});
				} else {
					setImmediate(resolve, result);
				}
			} else if (program === "cmd") {
				const args = stringArgv(parameters);
				const command = args.shift();
				const subprocess = require("child_process").spawn(command, args, {
					cwd: process.cwd(),
					detached: true,
					stdio: "inherit"
				});
				subprocess.on("close", code => resolve(code));
			} else {
				throw new Error(`Job ${job.name} (ID: ${job.id}) has unrecognized dispatcher method: ${program}`);
			}
		});
		return dispatcher;
	}

	/**
	 * 
	 * -----
	 * 
	 * #### `jobs.start(whereJobs:Object|Array)`
	 * 
	 * @type Method.
	 * @parameter
	 * @parameter  - `whereJobs:Object|Array`. Optional. SQL `where` conditions to know which jobs to start.
	 * @returns `data:Promise`. A promise with the data returned by the jobs' dispatchers.
	 * @description Dispatches all the selected jobs, or as much as the allowed of them depending on `this.activeJobs` and `this.settings.maxActiveJobs`
	 * 
	 */
	async start(whereJobsP = {}) {
		this.$trace("start");
		try {
			let whereJobs = undefined;
			if (Array.isArray(whereJobsP)) {
				whereJobs = [].concat(whereJobsP);
				whereJobs.push(["is_locked", "=", 0]);
			} else if (typeof whereJobsP === "object") {
				whereJobs = Object.assign({}, whereJobsP, {
					is_locked: 0
				});
			} else {
				throw new Error("Argument 1 must be an array or an object to <start>");
			}
			const {
				data: activableJobs
			} = await this.find(whereJobs, {
				limit: this.settings.maxActiveJobs - Object.keys(this.activeJobs).length
			});
			const jobDispatchers = activableJobs.map(job => this.$dispatch(job));
			this.$debug(`Started ${jobDispatchers.length} jobs`);
			return await Promise.all(jobDispatchers).then(jobsData => {
				return {
					data: jobsData,
					jobs: activableJobs
				};
			});
		} catch (error) {
			this.$error("Error on <start>:", error);
			throw error;
		}
	}

	/**
	 * 
	 * -----
	 * 
	 * #### `jobs.stop(whereJobs:Object|Array)`
	 * 
	 * @type Method.
	 * @parameter
	 * @parameter  - `whereJobs:Object|Array`. Optional. SQL `where` conditions to know which jobs to stop.
	 * @returns `data:Promise`.
	 * @description Aborts all the selected jobs, if they are active, and returns a small report.
	 * 
	 */
	async stop(whereJobsP = {}) {
		this.$trace("stop");
		try {
			let whereJobs = undefined;
			if (Array.isArray(whereJobsP)) {
				whereJobs = [].concat(whereJobsP);
				whereJobs.push(["is_locked", "=", 1]);
			} else if (typeof whereJobsP === "object") {
				whereJobs = Object.assign({}, whereJobsP, {
					is_locked: 1
				});
			} else {
				throw new Error("Argument 1 must be an array or an object to <stop>");
			}
			const {
				data: deactivableJobs
			} = await this.find(whereJobs);
			const jobDispatchers = deactivableJobs.map(job => this.$dispatch(job));
			this.$debug(`Started ${jobDispatchers.length} jobs`);
			return await Promise.all(jobDispatchers).then(jobsData => {
				return {
					data: jobsData,
					jobs: deactivableJobs
				};
			});
		} catch (error) {
			this.$error("Error on <stop>:", error);
			throw error;
		}
	}

	/**
	 * 
	 * -----
	 * 
	 * #### `jobs.status()`
	 * 
	 * @type Method.
	 * @returns `undefined`.
	 * @description Prints the status of all the jobs.
	 * 
	 */
	status() {
		this.$trace("status");
	}

	/**
	 * 
	 * -----
	 * 
	 * #### `jobs.end()`
	 * 
	 * @type Method.
	 * @returns `undefined`.
	 * @description Closes the database connection created on the constructor. If you do not call this method, the process will hang.
	 * 
	 */
	end() {
		try {
			if(this.connection) {
				this.connection.end();
			} else {
				throw new Error("No connection found to <end>");
			}
		} catch(error) {
			this.$error("Error on <end>:", error);
		}
	}

}

module.exports = JobSystem;