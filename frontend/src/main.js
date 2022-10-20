
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
import {get, post, put} from './services.js'
import {popUpSetUp, closePopUp, placeAlert} from './utils.js'
import {createChannel, updateChannel, openChannel, joinChannel, removeMemberFromChannel, renderProfile} from './channel.js'
//Global Variables to work the application
let check = false
let TOKEN;
let USERID;
let resizeSwitch = false

//Initial html elements that are needed on application intiation
const form = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerButton = document.getElementById('registerButton');
const loginButton = document.getElementById('loginButton');
const register = document.getElementById('register')
const popUp = document.getElementById('popUp');
const createChannelButton = document.getElementById('createChannel');

createChannelButton.addEventListener('click', createChannel)

// Allows the side bar to change based on a certain width amount (lower than 600px)
const changeSideBarViewDynamically = () => {
    const container = document.getElementById('profileBar');
    let channelButton
    if (!check){ 
        channelButton = document.createElement('button');
        channelButton.setAttribute('id', 'channelButton')
        check = true
    } else {
        channelButton = document.getElementById('channelButton')
    }       
    channelButton.setAttribute('class', 'btn side-btn btn-primary');
    container.appendChild(channelButton);
    channelButton.textContent = "Channel List"
    sideBar.style.display = "none"
    channelButton.addEventListener('click',(e)=>{
        if (sideBar.style.display === "none") {
            
            sideBar.style.display = "block";
            sideBar.style.width="100%"
            console.log(e.target)
            e.target.value = ""
            e.target.textContext = "Get to the choppa!"
        } else {
            sideBar.style.display = "none";
        }
    })
    resizeSwitch = true
}

// function that initiates when the user logs in correctly
const setUpMainPage = (result) => {
    const mainPage = document.getElementById('mainPage');
    mainPage.style.display = "flex";
    const sideBar = document.getElementById('sideBar');
    const side = document.getElementById('side');
    const banner = document.getElementById('banner');
    const copyright = document.getElementById('copyright');
    const channels = document.getElementById('channels');
    // function to toggle the side bar on/off when the window is resized
    window.addEventListener("resize", function() {
        if (window.matchMedia("(max-width: 600px)").matches && !resizeSwitch) {
            changeSideBarViewDynamically()
        } 
        else if (window.matchMedia("(min-width: 600px)").matches && resizeSwitch) {
            resizeSwitch =false
            sideBar.style.display = "block";

        }
      })
    console.log(window.innerWidth)
    console.log(check)
    console.log(window.innerWidth < 600)
    if (window.innerWidth < 600) {

        changeSideBarViewDynamically()
    }
    channels.before(banner)
    banner.classList.add("fixed-top")
    channels.after(copyright)
    channels.textContent=''
    result = JSON.parse(result)
    TOKEN = TOKEN || result.token
    USERID = USERID || result.userId
    //We then load channel information
    // if the user is part of a channel then we load the channel as the first default iniation
    const response = get('/channel', TOKEN)
    response
        .then((result) => {

            let templateChannel = document.getElementById('templateChannel');
            let count = 0
            for (const x of result.channels) {
                let channel = templateChannel.cloneNode(true);
                
                
                if(x.members.includes(USERID) || x.private == false) {
                    
                    channel.removeAttribute('id')
                    channel.setAttribute('id', x.id)
                    channel.insertAdjacentText('afterbegin', x.name);
                    if (x.private == true ){
                        channel.insertAdjacentText('afterbegin', "🔒");                      
                    }
                   if (x.members.includes(USERID)) {
                        if (count == 0)
                        {
                        openChannel(x.id)
                        count++
                        }
                    channels.appendChild(channel);
                    channel.addEventListener('click', openChannel)
                   }
                   else {
                    channels.appendChild(channel);
                    channel.addEventListener('click', joinChannel)
                    if (count == 0)  {
                        joinChannel(x.id)
                        count++
                    }
                   }
                }
                
            
            }
       
        //We find the profile image for a user
        get(`/user/${USERID}`, TOKEN)
            .then((result) => {
                const profileImage = document.getElementById('profileImage');
                result.image? profileImage.setAttribute('src', result.image) : null
                profileImage.addEventListener('click', renderProfile)
            })
        })
}

//login button event listener
loginButton.addEventListener('click', (event) => {
    register.style.display = "none";
    login.style.display = "block";
})


// login screen first rendered on page load
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

// register button event listener
registerButton.addEventListener('click', (event) => {
    event.preventDefault();
    login.style.display = "none";
    register.style.display = "block";
})

// register screen rendered when register button is clicked
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

