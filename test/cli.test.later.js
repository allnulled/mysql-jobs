const { expect } = require("chai");
const MySQLJobs = require(__dirname + "/../src/index.js");
const exec = require("execute-command-sync");

const baseCommand = "mysql-jobs --user test --password test --database jobs_sample --host '127.0.0.1' --port 3306 ";
const canDeleteTablesInDatabase = baseCommand + " --command delete-tables";
const canCreateTablesInDatabase = baseCommand + " --command create-tables";
const canCreateAJob = baseCommand + " --command create --name 'some job'";
const canFindJobs = baseCommand + " --command find --where-job name 'some name' created_at '>yesterday' ";
const canUpdateJobs = baseCommand + " --command update --where-job name 'some name' --values name 'some other name'";
const canLockJobs = baseCommand + " --command lock --where-job name 'some name'";
const canUnlockJobs = baseCommand + " --command unlock --where-job name 'some name'";
const canStartJobs = baseCommand + " --command start --where-job name 'some name'";
const canStopJobs = baseCommand + " --command stop --where-job name 'some name'";
const canShowStatusOfTheJobs = baseCommand + " --command status";
const canDeleteJobs = baseCommand + " --command delete --where-job name 'some name'";

describe("MySQLJobs CLI", function() {
	
	this.timeout(1000 * 5);

	let jobSystem = undefined;

	it("can delete tables in database", function() {
		try {
			exec(canDeleteTablesInDatabase)
		} catch(error) {
			throw error;
		}
	});

	it("can create tables in database", function() {
		try {
			exec(canCreateTablesInDatabase)
		} catch(error) {
			throw error;
		}
	});

	it("can create a job", function() {
		try {
			exec(canCreateAJob, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can find jobs", function() {
		try {
			exec(canFindJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can update jobs", function() {
		try {
			exec(canUpdateJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can lock jobs", function() {
		try {
			exec(canLockJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can unlock jobs", function() {
		try {
			exec(canUnlockJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can start jobs", function() {
		try {
			exec(canStartJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can stop jobs", function() {
		try {
			exec(canStopJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can show status of the jobs", function() {
		try {
			exec(canShowStatusOfTheJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

	it("can delete jobs", function() {
		try {
			exec(canDeleteJobs, { cwd: __dirname + "/.." });
		} catch(error) {
			throw error;
		}
	});

});