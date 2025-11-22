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


async function consumeEvent(routingKey, callback){
    try{

        // Checks if the channel has already been created
        if(!channel){
            await connectToRabbitMQ();
        }

        // channel.assertQueue() creates a queue to recieve messages
        // We are passing an empty string as the queue name, which means RabbitMQ will generate a random name for the queue
        // { exclusive: true } means this queue will only be accessible by the channel that creates it
        const q = await channel.assertQueue('', { exclusive: true });


        // Binds the queue to the exchange with the routing key.
        // This will send messages published to the exchange with the routing key to this queue.
        await channel.bindQueue(q.queue, EXCHANGE_NAME, routingKey);


        // channel.consume() tells RabbitMQ to start delivering messages from the queue
        // Every time a message arrives on the queue, the callback function (message)=>{...} will be called
        // message is the object RabbitMQ sends which contains the message content, headers, etc.
        // message.content is buffer data, so we must convert it to JSON string.
        // callback is a function that will be called when a message arrives to consume the event, it lets us decide on what to do with the event.
        // channel.ack() tells RabbitMQ that the message has been processed successfully [acknowledgement]
        channel.consume(q.queue, (message) => {
            if(message!==null){
                const content = JSON.parse(message.content.toString());
                callback(content);
                channel.ack(message);
            }

        });

        logger.info(`Subscribed to event: ${routingKey}`);

    }catch(error){
        logger.error('Error consuming events', error);
        throw error;
    }
}



module.exports = {connectToRabbitMQ, consumeEvent};