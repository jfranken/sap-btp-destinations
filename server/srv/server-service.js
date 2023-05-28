module.exports = async (srv) => {
    srv.on('helloWorldServer', async (req) => {
        const authHeader = req.headers.authorization
        if (authHeader.indexOf('Basic ') === 0) {
            const username = atob(authHeader.split(' ')[1]).split(':')[0]
            const password = atob(authHeader.split(' ')[1]).split(':')[1]
            if (username === 'myUsername' && password === 'superStrongPassword') {
                return 'Hello World from Server'
            }
        }
        return 'Unauthorized'
    })
}
