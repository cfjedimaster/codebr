const {convertXML, createAST} = require("simple-xml-to-json");

const handler = async (event) => {
  try {

    let req = await fetch('https://nasstatus.faa.gov/api/airport-status-information');
    let response = await req.text();

    const myJson = (convertXML(response)).AIRPORT_STATUS_INFORMATION.children;
    //console.log(JSON.stringify(myJson, null, '\t'));

    let data = {
      updateTime: myJson[0].Update_Time.content,
      info: []
    };

    let delays = myJson.filter(d => {
      //console.log(d);
      if("Delay_type" in d) return true;
      return false;
      /*
      if(d.Delay_type) return true;
      return false;
      */
      return true;
    });
    console.log(delays[0]);
    console.log('Data', data);

    return {
      statusCode: 200,
      body: JSON.stringify({ airportinfo:myJson }),
      // // more keys you can return:
      // headers: { "headerName": "headerValue", ... },
      // isBase64Encoded: true,
    }
  } catch (error) {
    return { statusCode: 500, body: error.toString() }
  }
}

module.exports = { handler }
