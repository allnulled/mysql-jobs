const { expect } = require("chai");
const MySQLJobs = require(__dirname + "/../src/index.js");
const exec = require("execute-command-sync");
const utils = require("@allnulled/sql-utils");

describe("MySQLJobs API", function() {
	
	this.timeout(1000 * 5);

	let jobSystem = MySQLJobs.create({
		// trace: true,
		settings: {
			connection: {
				database: "jobs_sample",
				user: "test",
				password: "test",
				host: "127.0.0.1",
				port: 3306
			}
		}
	});

	it("can be instantiated", function(done) {
		expect(typeof jobSystem).to.not.equal("undefined");
		expect(typeof jobSystem.createTables).to.equal("function");
		expect(typeof jobSystem.deleteTables).to.equal("function");
		expect(typeof jobSystem.find).to.equal("function");
		expect(typeof jobSystem.create).to.equal("function");
		expect(typeof jobSystem.update).to.equal("function");
		expect(typeof jobSystem.delete).to.equal("function");
		done();
	});

	it("can delete tables in database", async function() {
		try {
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can create tables in database", async function() {
		try {
			await jobSystem.createTables();
		} catch(error) {
			throw error;
		}
	});

	it("can create a job", async function() {
		try {
			await jobSystem.createTables();
			const { data } = await jobSystem.create({ name: "my custom job", dispatcher: "node@dev/hello.js" });
			expect(data.affectedRows).to.equal(1);
			const { data: jobs } = await jobSystem.find({});
			expect(jobs.length).to.equal(1);
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can find jobs", async function() {
		try {
			await jobSystem.createTables();
			const { data: created } = await jobSystem.create({ name: "my custom job", dispatcher: "node@dev/hello.js" });
			const { data } = await jobSystem.find({});
			const { data: data2 } = await jobSystem.find({ name: "unexistent" });
			const { data: data3 } = await jobSystem.find({ name: "my custom job" });
			expect(data.length).to.equal(1);
			expect(data2.length).to.equal(0);
			expect(data3.length).to.equal(1);
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can update jobs", async function() {
		try {
			await jobSystem.createTables();
			const { data: created } = await jobSystem.create({ name: "my custom job", dispatcher: "node@dev/hello.js" });
			const { data } = await jobSystem.update({ name: "my custom job" }, { name: "my custom job renamed" });
			const { data: jobs1 } = await jobSystem.find({ name: "my custom job" });
			const { data: jobs2 } = await jobSystem.find({ name: "my custom job renamed" });
			expect(data.affectedRows).to.equal(1);
			expect(jobs1.length).to.equal(0);
			expect(jobs2.length).to.equal(1);
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can lock jobs", async function() {
		try {
			await jobSystem.createTables();
			const { data } = await jobSystem.create({ name: "my custom job", dispatcher: "node@dev/hello.js" });
			const { data: lock1 } = await jobSystem.lock({ name: "my custom job" });
			const { data: lock2 } = await jobSystem.lock({ name: "my custom job" });
			const { data: find1 } = await jobSystem.find({ is_locked: 1 });
			expect(lock1.affectedRows).to.equal(1);
			expect(lock2.affectedRows).to.equal(0);
			expect(find1.length).to.equal(1);
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can unlock jobs", async function() {
		try {
			await jobSystem.createTables();
			const { data } = await jobSystem.create({ name: "my custom job", dispatcher: "node@dev/hello.js" });
			const { data: lock1 } = await jobSystem.lock({ name: "my custom job" });
			const { data: unlock1 } = await jobSystem.unlock({ name: "my custom job" });
			const { data: unlock2 } = await jobSystem.unlock({ name: "my custom job" });
			const { data: find1 } = await jobSystem.find({ is_locked: 0 });
			expect(unlock1.affectedRows).to.equal(1);
			expect(unlock2.affectedRows).to.equal(0);
			expect(find1.length).to.equal(1);
			// @TODO
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can start jobs", async function() {
		try {
			await jobSystem.createTables();
			const { data, jobs } = await jobSystem.start({ name: "x" });
			expect(data.length).to.equal(0);
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can stop jobs", async function() {
		try {
			await jobSystem.createTables();
			const stopAnswer = await jobSystem.stop({});
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can show status of the jobs", async function() {
		try {
			await jobSystem.createTables();
			const statusAnswer = await jobSystem.status();
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can delete jobs", async function() {
		try {
			await jobSystem.createTables();
			await jobSystem.create({ name: "custom job" });
			const { data: delete1 } = await jobSystem.delete({ name: "custom job" });
			expect(delete1.affectedRows).to.equal(1);
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can start node jobs", async function() {
		try {
			await jobSystem.createTables();
			await jobSystem.create({ name: "node job 1", dispatcher: "node@test/dev/write-hello.js" });
			const { data, jobs } = await jobSystem.start({ name: "node job 1" });
			
			await jobSystem.deleteTables();
		} catch(error) {
			throw error;
		}
	});

	it("can start cmd jobs", function() {

	});

});