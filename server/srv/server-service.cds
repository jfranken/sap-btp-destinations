service ServerService @(requires: 'authenticated-user') {
    function helloWorldServer() returns String;
}
