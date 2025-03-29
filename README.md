## Introduction
Thank you for this opportunity.

Please refer to the Swagger API Docs on /api-docs endpoint for the API Endpoints. Its payload and responses.

Please follow the below steps to clone this repo and get it running :
1. Instal Docker Desktop from [here](https://www.docker.com/products/docker-desktop/)
2. To check if Docker is installed, run: ```docker --version```
3. Clone my repo.
4. Run the command ```docker-compose up -d --build```
5. My application shall be up and running on port ```localhost:1055```

To view the main API :
## Description 
Tech Stack Used : NodeJs , ExpressJs , MySQL , Redis, BullMQ.

Simple ER Digram to illustrate my table structure : 

![ER Digram](./Diagrams/ER-Diagram.svg)
Some features : 
* Added middleware to protect our routes. There are two types of token. The first one is generated post successfull login via Google. The second one is generated post successull API Call for ```/auth/api-key``` endpoint.
* This was done purely with authentication and edge cases in mind. This also helped me with the revoking logic.
* Both tokens are essentially JWTs.
* While I have used Redis wherever possible, I have a strong belief of using Redis as a caching layer and not as a promary source of data.Therefore, all the data is priamrily stored in SQL.
* I have made use of BullMQ for handling the logging part. I could have used RabbitMq / Kafka but here are my reasons for using BullMQ on top of redis.
    * RabbitMq could have added another layer of complexity.
    * BullMQ supported pretty much all of the features I wanted from a Pub/Sub Model.
    * I observed very fast repsonse times for the /collect endpoint. This was very crucial as that endpoint shall be hit the most amount of times from a lot of clients. Response times were below 15ms. Since I dont want premanent storage of messages in redis, processing and discarding wont fill up redis.
    * The whole point of introducing BullMQ is to reduce the load on DB as much as possible. Therefore, I am  initiating the processing of logs only after a certain threshold is hit OR a timeout occurs.
* Added validation Schema for all the endpoints where I am expecting input from the user.
* I have created helper functions wherever I deemed fit. As always there is still some scope of improving it further.
* I have written test cases for a couple of helper functions. However the whole codebase is not covered with testcases due to shortage of time. Nevertheless , I have tried testing it with edge cases as much as possible. Most of the edge cases arise due to faulty input from the user and my validation schema is taking care of it in the most strictest way.
* There are three types of middlwares : 
    * Validating the user token.
    * Validating the analytics token.
    * Validating the payload sent by user.
* I have developed the pub/sub model in conjunction with redis list. This has made the ```collect``` endpoint as lightweight and ultra low response time as possible.The call flow shall describe it further.
