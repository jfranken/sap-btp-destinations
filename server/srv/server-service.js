module.exports = async (srv) => {
    srv.on('helloWorldServer', async (req) => {
        return 'Hello World from Server'
    })
}
