
import { BACKEND_PORT } from './config.js';

const BASEURL = `http://localhost:${BACKEND_PORT}`


const get = (url, token) => {
    console.log("we get here")
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
const post = (url, payload, TOKEN) => {
    var myHeaders = new Headers();


    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

var requestOptions = {
  method: 'POST',
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


const put = (url, payload, TOKEN) => {
    var myHeaders = new Headers();


    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${TOKEN}`);

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

export {get, post, put}