import mqtt from 'mqtt';
import {MongoClient, Db} from 'mongodb';

export default class DataManager {
    static db: Db | undefined;
    static pending: any[] = [];

    static initialize() {
        DataManager.connectToDb();

        const options = {
            host: process.env.MQTT_HOST,
            port: process.env.MQTT_PORT,
            protocol: process.env.MQTT_PROTOCOL,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD
        }
        
        //initialize the MQTT client
        var client = mqtt.connect(options);
            
        //setup the callbacks
        client.on('connect', () => {
            console.log('Connected');
        });

        client.on('error', (error: any) => {
            console.log(error);
        });

        client.on('message', (topic: string, message: any) => {
            //Called each time a message is received
            DataManager.saveMessage(topic, message);
        });

        // subscribe to topic
        let topic = process.env.MQTT_TOPIC;
        if(!topic) {
            topic = 'EdgeXEvents';
        }
        client.subscribe(topic);
    }

    static connectToDb() {
        MongoClient.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.alarc.mongodb.net?retryWrites=true&w=majority`, (err, client) => {
        if (err) 
            throw err
        else
        {
            DataManager.db = client?.db("Shared");
            console.log('Connected to MongoDB');
        }
        });
    }

    static saveMessage(topic: string, message: any) {
        console.log('Received message:', topic, message.toString());
        let decodedMessage;
        try{
            decodedMessage = JSON.parse(message.toString());
        } catch (err) {
            console.error(err);
            return;
        }
        if(!DataManager.db) {
            console.error("Not connected to mongo db!!");
            DataManager.pending.push({topic: topic, message: decodedMessage});
            return;
        }
        DataManager.db.collection(topic).insertOne(decodedMessage, (err: any, result: any) => {
            if (err)
                console.error(err); 
        });
        DataManager.addPending();
    }

    static addPending() {
        while(DataManager.pending.length > 0) {
            const item = DataManager.pending[0];
            DataManager.pending.shift();
            DataManager.saveMessage(item.topic, item.message);
        }
    }
}
