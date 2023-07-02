# CEP-Server
Community-oriented Edge computing Platform (CEP) server

This is the server-side code for my Master's degree thesis project available at https://qspace.library.queensu.ca/bitstream/handle/1974/30378/Moustafa_Abdalla_A_202209_MASc.pdf. 

This repository covers the main logic for the server described in section 3.3.2. This covers the following modules User Authentication and Authorization, Cluster Manager, Community Management Portal, Data Manager, Benchmark Manager, Notification Handler, and Scheduler. However, currently, this part uses a simplistic scheduler since the repository is missing the implementation for the runtime estimation module which was omitted from the thesis.

To start the server you need to provide an external MongoDB, MQTT, and host the server on a domain accessible by all clients.

For the Community-Oriented Resource Allocation (CORA) module alongside the comparisons to other common scheduling techniques covered in Chapter 4. You can use the DemoScheduler by calling ```DemoScheduler.test()``` instead of starting the server normally.
