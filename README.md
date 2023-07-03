# CEP-Server
Community-oriented Edge computing Platform (CEP) server

This is the server-side code for my Master's degree thesis project available at https://qspace.library.queensu.ca/bitstream/handle/1974/30378/Moustafa_Abdalla_A_202209_MASc.pdf. 

This repository covers the main logic for the server described in section 3.3.2. This covers the following modules User Authentication and Authorization, Cluster Manager, Community Management Portal, Data Manager, Benchmark Manager, Notification Handler, and Scheduler. However, currently, this part uses a simplistic scheduler since the repository is missing the implementation for the runtime estimation module which was omitted from the thesis.

To start the server you need to provide an external MongoDB, MQTT, and host the server on a domain accessible by all clients.

For the client-side check this repository: https://github.com/abdullaAshraf/CEP-Client.

For the Community-Oriented Resource Allocation (CORA) module alongside the comparisons to other common scheduling techniques covered in Chapter 4. You can use the DemoScheduler by calling ```DemoScheduler.test()``` instead of starting the server normally.

## User Authentication Module API
* Register a new user -> ```GET /user/register``` with the body containing ```name```, ```email```, and ```password```.
* Login an existing user -> ```GET /user/login``` with the body including ```email``` and ```password```.
* Get a key for the cluster -> ```GET /user/key``` with ```auth-token``` returned from login.

## Community Manager Module API
* Add a community -> ```POST /community``` with community ```name``` and ```description``` provided in the body.
* Edit a community -> ```PUT /community/{id}``` with the community updated ```name``` and ```description``` provided in the body.
* List communities -> ```GET /community```, you can pass the query parameter ```owned``` as true to list owned communities only, otherwise the default is false which list all communities the user is a member of.
* List members of a community -> ```GET /community/{id}/member```
* List community standing invitations -> ```GET /community/{id}/invitation```
* List personal standing invitations -> ```GET /community/invitation```
* Inviate new user to the community -> ```POST /community/{id}/invitation```, provide the user ```email``` in the body.
* Respond to an invitation -> ```PUT /community/invitation/{id}``` with the ```response``` provided in the body as ```accept``` or ```reject```.
* Delete a community -> ```DELETE /community/{id}```.
