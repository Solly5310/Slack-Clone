
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import {get, post, put} from './services.js'
import {popUpSetUp} from './utils.js'
import {createChannel, updateChannel, openChannel, joinChannel, removeMemberFromChannel} from './channel.js'
console.log(get)

let TOKEN;
let USERID;

const form = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerButton = document.getElementById('registerButton');
const loginButton = document.getElementById('loginButton');
const register = document.getElementById('register')
const popUp = document.getElementById('popUp');
const createChannelButton = document.getElementById('createChannel');

createChannelButton.addEventListener('click', createChannel)

const placeAlert = (infoToPlace) => {
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpBody.insertAdjacentText('afterbegin', infoToPlace);
}

const closePopUp = document.getElementById('closePopUp');
closePopUp.addEventListener('click', () => {
    popUp.style.display = "none";
})



const setUpMainPage = (result) => {
    const mainPage = document.getElementById('mainPage');
    mainPage.style.display = "flex";
    const sideBar = document.getElementById('sideBar');
    const side = document.getElementById('side');
    const banner = document.getElementById('banner');
    const copyright = document.getElementById('copyright');
    const channels = document.getElementById('channels');

    channels.before(banner)
    banner.classList.add("fixed-top")
    channels.after(copyright)
    channels.textContent=''
    result = JSON.parse(result)
    TOKEN = TOKEN || result.token
    USERID = USERID || result.userId
    const response = get('/channel', TOKEN)
    response
        .then((result) => {

            let templateChannel = document.getElementById('templateChannel');

            for (const x of result.channels)
            {
                let channel = templateChannel.cloneNode(true);
                
                
                if(x.members.includes(USERID) || x.private == false){
                    console.log(x)
                    channel.removeAttribute('id')
                    channel.setAttribute('id', x.id)
                    channel.insertAdjacentText('afterbegin', x.name);
                    if (x.private == false){
                        channel.insertAdjacentText('afterbegin', "public ");                      
                    }
                    if (x.private == true ){
                        channel.insertAdjacentText('afterbegin', "private ");                      
                    }
                   if (x.members.includes(USERID))
                   {
                    channels.appendChild(channel);
                    channel.addEventListener('click', openChannel)
                   }
                   else {
                    channels.appendChild(channel);
                    channel.addEventListener('click', joinChannel)
                   }
                }
                
            
            }
        
        
        
        })

}

const login = document.getElementById('login');
form.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('login-email').value
    const password = document.getElementById('login-password').value

    let payload = JSON.stringify({
        "email": email,
        "password": password
      });

    const response = post('/auth/login', payload)
    response
        .then((result) => {
            login.style.display = "none"
            setUpMainPage(result)
            }, (error) => placeAlert("Login Failed, please use a different email/password"))
        .catch((error) => {
            console.log(error)
            placeAlert(error)
        });
})

registerButton.addEventListener('click', (event) => {
    event.preventDefault();
    login.style.display = "none";
    register.style.display = "block";
})

loginButton.addEventListener('click', (event) => {

    register.style.display = "none";
    login.style.display = "block";
})

registerForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const email = document.getElementById('register-email').value
    const name = document.getElementById('register-name').value
    const password = document.getElementById('register-password').value
    const reEnterPassword = document.getElementById('register-reenter-password').value
    if (password != reEnterPassword) {
        placeAlert("Passwords do not match")
        return;
    }

    const payload = JSON.stringify({
        "email": email,
        "name": name,
        "password": password
    })
    const response = post('/auth/register', payload)
    response
        .then((result) => {
            register.style.display = "none";
            login.style.display = "block";
            placeAlert("Registered! Please login to continue")}, (error) => placeAlert("Register Failed, please try again"))
        .catch((error) =>  placeAlert(error.error));

})


export {TOKEN, USERID, setUpMainPage}

