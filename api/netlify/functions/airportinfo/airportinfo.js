const { XMLParser, XMLBuilder, XMLValidator} = require("fast-xml-parser");

const handler = async (event) => {
  try {

    let req = await fetch('https://nasstatus.faa.gov/api/airport-status-information');
    let response = await req.text();

    let parser = new XMLParser();
    let parsed = parser.parse(response);

    let data = {
      updateTime: parsed['AIRPORT_STATUS_INFORMATION']['Update_Time'],
      delays: parsed['AIRPORT_STATUS_INFORMATION']['Delay_type']
    };

    console.log('Data', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ airportinfo:data }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
