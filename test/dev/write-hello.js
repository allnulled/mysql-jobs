module.exports = () => {
	require("fs").writeFileSync(__dirname + "/text.txt", "hello", "utf8");
}