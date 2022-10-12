import { BACKEND_PORT } from './config.js';
// A helper you may want to use when uploading new images to the server.
import { fileToDataUrl } from './helpers.js';
const BASEURL = `http://localhost:${BACKEND_PORT}`
let TOKEN;
let USERID;
let CHANNELSELECTED;


const form = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const registerButton = document.getElementById('registerButton');
const loginButton = document.getElementById('loginButton');
const register = document.getElementById('register')
const popUp = document.getElementById('popUp');
const createChannelButton = document.getElementById('createChannel');

const createChannel = (event) => {
    event.preventDefault();
    popUp.style.display = "block";
    const popUpTitle = document.getElementById('popUpTitle')
    popUpTitle.textContent = ''
    popUpTitle.insertAdjacentText('afterbegin', "Create Channel")

    const popUpBodyContent = document.getElementById('popUpBodyContent');
    popUpBodyContent.textContent = ''
    
    const channelFormTemplate = document.getElementById('createChannelFormTemplate');
    const channelForm = channelFormTemplate.cloneNode(true);
    channelForm.removeAttribute('id')
    popUpBodyContent.appendChild(channelForm);
    channelForm.addEventListener('submit', (event) => {
        event.preventDefault()
        const channelName = event.target[0].value
        const channelDescription = event.target[1].value
        const channelState = event.target[2].checked


        const payload = JSON.stringify({
            name: channelName,
            private: channelState,
            description: channelDescription || "N/A"
        })
       
        const response = post('/channel', payload, TOKEN)
        response
            .then((result) => {
                popUp.style.display = "none";
                setUpMainPage(true)
            })
    
    })

}


createChannelButton.addEventListener('click', createChannel)

const placeAlert = (infoToPlace) => {
    popUp.style.display = "block";
    const popUpBody = document.getElementById('popUpBody');
    popUpBody.insertAdjacentText('afterbegin', infoToPlace);
}

const closePopUp = document.getElementById('closePopUp');
closePopUp.addEventListener('click', () => {
    popUp.style.display = "none";
    const popUpBody = document.getElementById('popUpBody');
    popUpBody.textContent = "";
})

//const editChannelButton = document.getElementById('editChannelButton');


const updateChannel = (event) => {
    popUp.style.display = "block";
    const popUpTitle = document.getElementById('popUpTitle')
    popUpTitle.textContent = ''
    popUpTitle.insertAdjacentText('afterbegin', "Edit Channel")

    const popUpBodyContent = document.getElementById('popUpBodyContent');
    popUpBodyContent.textContent = ''
    
    const channelFormTemplate = document.getElementById('updateChannelFormTemplate');
    const channelForm = channelFormTemplate.cloneNode(true);
    channelForm.removeAttribute('id')
    popUpBodyContent.appendChild(channelForm);
    channelForm.addEventListener('submit', (event) => {
        event.preventDefault()
        console.log(CHANNELSELECTED)
        const channelName = event.target[0].value
        const channelDescription = event.target[1].value
        const payload = JSON.stringify({
            name: channelName,
            description: channelDescription || "No Description"
        })
        put(`/channel/${CHANNELSELECTED}`, payload, TOKEN)
            .then((result) => {
                popUp.style.display = "none";
                openChannel("updateChannel");
            }
            )
    })
}



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

const openChannel = (event) => {
    let channelId
    if (event != "updateChannel") {
        channelId = event.target.id
    }
    else {
        channelId = CHANNELSELECTED
    }
    CHANNELSELECTED = channelId;
    const channelMessages = get(`/message/${channelId}?start=0`, TOKEN)
    channelMessages
        .then((result) => {
            console.log(result)
            const table = document.getElementById('messagesTable');
            table.textContent='';
            const channelHead = document.getElementById('channelHead');
            channelHead.textContent = '';
            const messages = result.messages

            get(`/channel/${channelId}`, TOKEN)
                .then((result) => {
                    console.log(result)

                    const headerRow = document.createElement('tr');
                    headerRow.setAttribute('id', 'headerRow')
                    const description = document.createElement('td');
                    const channelName = document.createElement('td');
                    const state = document.createElement('td');
                    const creationDate = document.createElement('td');
                    const creator = document.createElement('td');
                    const editChannel = document.createElement('td');
                    channelHead.appendChild(headerRow);
                    
                    channelName.insertAdjacentText('afterbegin', result.name);
                    state.insertAdjacentText('afterbegin', result.private? "Private" : "Public");
                    creationDate.insertAdjacentText('afterbegin', result.createdAt);
                    creator.insertAdjacentText('afterbegin', result.creator);
                    description.insertAdjacentText('afterbegin', result.description);
                    const editChannelButtonTemplate  = document.getElementById('editChannelButtonTemplate');
                    const editChannelButton = editChannelButtonTemplate.cloneNode(true);
                    editChannelButton.removeAttribute('id');
                    editChannelButton.setAttribute('id','editChannelButton')
                    editChannel.appendChild(editChannelButton);
                    headerRow.appendChild(channelName);
                    headerRow.appendChild(state);
                    headerRow.appendChild(creationDate);
                    headerRow.appendChild(creator);
                    headerRow.appendChild(description);
                    headerRow.appendChild(editChannel);
                    editChannelButton.style.display = "block";
                    editChannelButton.addEventListener('click', updateChannel )
                    for (let x of messages)
                    {
                        let tr1 =  document.createElement('tr');
                        let td1 = document.createElement('td');
                        tr1.appendChild(td1);

                        tr1.setAttribute('id', x.sender)
                        td1.setAttribute('colspan', 2)
                        td1.insertAdjacentText('afterbegin', x.sender);

                        let tr2 =  document.createElement('tr');
                        let tdDate = document.createElement('td');
                        tdDate.insertAdjacentText('afterbegin', x.sentAt);
                        tr2.appendChild(tdDate);

                        let tdMessage = document.createElement('td');
                        tdMessage.insertAdjacentText('afterbegin', x.message);
                        tr2.appendChild(tdMessage);
                        tr2.setAttribute('id', x.id)

                    
                        table.appendChild(tr1);
                        table.appendChild(tr2);
                    }
                    table.style.display ="block"
            })
        })
}


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
                
                
                if(x.members.includes(USERID) || x.private == 'false'){
                    channel.removeAttribute('id')
                    channel.setAttribute('id', x.id)
                    channel.insertAdjacentText('afterbegin', x.name);
                    if (x.private == false){
                        channel.insertAdjacentText('afterbegin', "public ");                      
                    }
                    if (x.private == true ){
                        channel.insertAdjacentText('afterbegin', "private ");                      
                    }
                   
                    channels.appendChild(channel);
                    channel.addEventListener('click', openChannel)
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

