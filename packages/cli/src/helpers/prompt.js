const prompts = require("prompts");

function ask(questions) {
    return prompts(questions, {
        onCancel: () => {
            throw new Error("Cancelled.");
        },
    });
}

module.exports = {
    ask,
};
