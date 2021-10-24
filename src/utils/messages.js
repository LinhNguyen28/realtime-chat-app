const generateMessage = (username, text) => ({
    username,
    text,
    createdAt: new Date().getTime()
})

const generateLocationMsg = (username, url) => ({
    username,
    url,
    createdAt: new Date().getTime()
})

module.exports = {
    generateMessage,
    generateLocationMsg
}