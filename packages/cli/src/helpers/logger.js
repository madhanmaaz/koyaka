const pc = require("picocolors");

const logger = {
    info: (message) => console.log(pc.cyan("i"), message),
    success: (message) => console.log(pc.green("✔"), message),
    warn: (message) => console.log(pc.yellow("!"), message),
    error: (message) => console.error(pc.red("✖"), message),
    dim: (message) => console.log(pc.dim(message)),
};

module.exports = { logger };
