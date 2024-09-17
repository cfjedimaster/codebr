import mqtt from "mqtt";

export default async (req, context) => {

  let HOST = process.env.MQTT_SERVER;
  let USER = process.env.MQTT_USERNAME;
  let PASSWORD = process.env.MQTT_PASSWORD;
  let TOPIC = '/netlify/updates';

  let client = await mqtt.connectAsync(HOST, {
    username: USER,
    password: PASSWORD,
    protocolId: 'MQIsdp', // important
    protocolVersion: 3, // important
  });
  
  await client.publishAsync(TOPIC, '!Boop!');
  console.log('Published');

  return;
};

export const config = {
  path: "/api/boop"
};