"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_1 = __importDefault(require("mqtt"));
const mongodb_1 = require("mongodb");
class DataManager {
    static initialize() {
        DataManager.connectToDb();
        const options = {
            host: process.env.MQTT_HOST,
            port: process.env.MQTT_PORT,
            protocol: process.env.MQTT_PROTOCOL,
            username: process.env.MQTT_USERNAME,
            password: process.env.MQTT_PASSWORD
        };
        //initialize the MQTT client
        var client = mqtt_1.default.connect(options);
        //setup the callbacks
        client.on('connect', () => {
            console.log('Connected');
        });
        client.on('error', (error) => {
            console.log(error);
        });
        client.on('message', (topic, message) => {
            //Called each time a message is received
            DataManager.saveMessage(topic, message);
        });
        // subscribe to topic or list of topics
        let topic = process.env.MQTT_TOPIC;
        if (!topic) {
            // subscribe to all
            topic = '#';
        }
        client.subscribe(topic);
    }
    static connectToDb() {
        mongodb_1.MongoClient.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.alarc.mongodb.net?retryWrites=true&w=majority`, (err, client) => {
            if (err)
                throw err;
            else {
                DataManager.db = client === null || client === void 0 ? void 0 : client.db("Shared");
                console.log('Connected to MongoDB');
                DataManager.addPending();
            }
        });
    }
    static saveMessage(topic, message) {
        console.log('Received message:', topic, message.toString());
        let decodedMessage;
        try {
            decodedMessage = JSON.parse(message.toString());
        }
        catch (err) {
            console.error(err);
            return;
        }
        if (!DataManager.db) {
            console.error("Not connected to mongo db!!");
            DataManager.pending.push({ topic: topic, message: decodedMessage });
            return;
        }
        DataManager.db.collection(topic).insertOne(decodedMessage, (err, result) => {
            if (err)
                console.error(err);
        });
    }
    static addPending() {
        while (DataManager.pending.length > 0) {
            const item = DataManager.pending[0];
            DataManager.pending.shift();
            DataManager.saveMessage(item.topic, item.message);
        }
    }
}
exports.default = DataManager;
DataManager.pending = [];
