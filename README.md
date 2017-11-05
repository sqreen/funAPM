# funAPM

To run this project, you will need to have MongoDB available on your computer then:

* clone this repository
* `npm install` in this repository and in the testApp directory
* start the test application with `node testApp/server.js`

You can then interact with this application with the following curl commands

```
curl -H "Content-Type: application/json" -X POST -d '{"name":"xyz"}' http://localhost:9090/cats
```

```
curl http://localhost:9090/cats
```

```
curl http://localhost:9090/destroyrandom
```

After the server is stopped, a file name `viewer.html` is created to display the results that can be found in `apm_logs.json`

