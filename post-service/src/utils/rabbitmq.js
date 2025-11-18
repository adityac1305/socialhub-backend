/*

CONNECTION:
The main TCP connection between your microservice and RabbitMQ.
Each microservice will open its own connection to RabbitMQ.

CHANNEL:
A lightweight, virtual connection inside the main connection.
You can have multiple channels using the same connection, and each channel can publish or consume messages independently.

EXCHANGE:
An exchange is a router.
It does NOT store messages.
It only decides where to send a published message.

Exchange Types:
+--------------+---------------------------------------+
| Exchange Type| Routing Logic                         |
+--------------+---------------------------------------+
| direct       | exact match routing key               |
| topic        | wildcard-based routing                |
| fanout       | broadcast to all queues               |
| headers      | routing based on message headers      |
+--------------+---------------------------------------+


QUEUE:
A queue is a message storage box.
It holds messages until a consumer receives them.
Messages go INTO a queue
Consumers read FROM a queue
Queues store data safely until fetched


BINDING:
A rule that connects Exchange → Queue

*/

const amqp = require('amqplib');
const logger = require('./logger');

// Declare variable  connection for RabbitMQ network connection object
let connection = null;

// Declare varibable channel a lightweight communication path inside the RabbitMQ connection.
let channel = null;

// Declare variable EXCHANGE_NAME, Exchanges receive messages and route them to queues.
const EXCHANGE_NAME = 'facebook_events';

async function connectToRabbitMQ(){
    try{
        
        // Connect to RabbitMQ
        connection = await amqp.connect(process.env.RABBITMQ_URL);
        
        // Create a channel on the connection. Channels are how you actually publish and consume messages.
        channel = await connection.createChannel();

        // 'topic' is the exchange type: it routes messages based on a pattern
        // { durable: false } means this exchange will not survive a RabbitMQ server restart (it’s not persisted).
        // For production you often use durable: true.
        await channel.assertExchange(EXCHANGE_NAME, 'topic', {durable: false});
        
        logger.info('Connected to RabbitMQ server successfully');
        
        // Return the channel object so other parts of your code can publish or consume messages using this channel.
        return channel;
    
    }catch(error){
        
        logger.error('Error connecting to RabbitMQ', error);
        throw error;

    }
};



async function publishEvent(routingKey, message){
    
    // Checks if the channel has already been created
    if(!channel){
        await connectToRabbitMQ();
    }

    // channel.publish() sends the message to RabbitMQ
    // Message goes into Exchange named as facebook_events
    // As we have used the Exchange type 'topic'
    // A topic exchange routes messages based on pattern-matching of routing keys.
    // The routing key is a label that describes the event type, and the publisher sends it to the exchange so RabbitMQ can route the message to the appropriate queues.
    // Examples of routing keys: 'post.created', 'post.updated', 'post.deleted'
    // RabbitMQ only accepts binary data. So we must convert the JSON string message into Binary buffer data. 
    channel.publish(EXCHANGE_NAME, routingKey, Buffer.from(JSON.stringify(message)));

    logger.info(`Event published to exchange ${EXCHANGE_NAME} with routing key ${routingKey}`);
}


module.exports = {connectToRabbitMQ, publishEvent};