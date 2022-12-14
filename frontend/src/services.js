
import { BACKEND_PORT } from './config.js';

const BASEURL = `http://localhost:${BACKEND_PORT}`


// all requests can be changed based on url, allowing ease of access

// get request to backend
const get = (url, token) => {
    var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json")
    myHeaders.append("Authorization", `Bearer ${token}`);

    var requestOptions = {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
      };

      return new Promise ((resolve, reject) => {
        fetch(`${BASEURL}${url}`, requestOptions)
        .then(response => resolve(response.json())) 
    })
}

// post request to backend
const post = (url, payload, TOKEN) => {
    var myHeaders = new Headers();


    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);
var requestOptions = payload ?  
{
  method: 'POST',
  headers: myHeaders,
  body: payload,
  redirect: 'follow'
}
:
{
  method: 'POST',
  headers: myHeaders,
  redirect: 'follow'
};

return new Promise ((resolve, reject) => {

    fetch(`${BASEURL}${url}`, requestOptions)
  .then((response) => {

    if (response.status == 400 ) {

        reject(response);
    }
    return response.text()})
  .then(result => resolve(result))
  .catch(error =>  reject(console.log(error)))}
  );
}

// put request to backend
const put = (url, payload, TOKEN) => {
    var myHeaders = new Headers();


    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);
    console.log(url, payload, TOKEN)
var requestOptions = {
  method: 'PUT',
  headers: myHeaders,
  body: payload,
  redirect: 'follow'
};

return new Promise ((resolve, reject) => {

    fetch(`${BASEURL}${url}`, requestOptions)
  .then((response) => {

    if (response.status == 400 ) {

        reject(response);
    }
    return response.text()})
  .then(result => resolve(result))
  .catch(error =>  reject(console.log(error)))}
  );
}

// delete request to backend
const del= (url, TOKEN) => {
  var myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

var requestOptions = {
  method: 'DELETE',
  headers: myHeaders,
  redirect: 'follow'
};

return new Promise ((resolve, reject) => {

    fetch(`${BASEURL}${url}`, requestOptions)
  .then((response) => {

    if (response.status == 400 ) {

        reject(response);
    }
    return response.text()})
  .then(result => resolve(result))
  .catch(error =>  reject(console.log(error)))}
  );
}

export {get, post, put, del}