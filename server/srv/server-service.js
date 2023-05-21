module.exports = async (srv) => {
  srv.on("helloWorldServer", async () => {
    return "Hello World from Server";
  });
};
