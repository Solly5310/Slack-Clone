import {get, post, put, del} from './services.js'
import { popUpSetUp, getTime } from './utils.js';
import {TOKEN, USERID, setUpMainPage} from './main.js'

let CHANNELSELECTED

const submitEditProfile = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const payload = {}
    for (var pair of formData.entries()) {
        if (pair[0] == "name" || pair[0] == "email" || pair[0] == 'bio' || pair[0] == "password")
            payload[pair[0]] = pair[1]
    }
    console.log(payload)
    put(`/user`, JSON.stringify(payload), TOKEN)
        .then((result) => {
            console.log(result)
            popUp.style.display = "none";
            openChannel("updateChannel");
        })

}

const editProfile = (e) => {
    e.preventDefault()
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "Edit Profile")
    console.log("edit profile")
    const editProfileTemplate = document.getElementById('editProfileTemplate');
    const editProfile = editProfileTemplate.cloneNode(true);
    editProfile.removeAttribute('id');
    editProfile.style.display = "block";
    
  
    const nameActivateCheckbox = editProfile.children[2]
    console.log(nameActivateCheckbox)

    nameActivateCheckbox.addEventListener('change', (e) => {
        const nameInput = editProfile.children[1]
        if (e.target.checked) {
            nameInput.disabled = false;
        } else {
            nameInput.disabled = true;
        }
    })

    const emailActivateCheckbox = editProfile.children[6]
    emailActivateCheckbox.addEventListener('change', (e) => {
        const emailInput = editProfile.children[5]
        if (e.target.checked) {
            emailInput.disabled = false;
        } else {
            emailInput.disabled = true;
        }
    })

    const bioActivateCheckbox = editProfile.children[10]
    bioActivateCheckbox.addEventListener('change', (e) => {
        console.log("checked")
        const bioInput = editProfile.children[9]
        if (e.target.checked) {
            bioInput.disabled = false;
        } else {
            bioInput.disabled = true;
        }
    })

    const showPasswordCheckbox = editProfile.children[14];
    showPasswordCheckbox.addEventListener('change', (e) => {
        const password = document.getElementById('passwordInput');
        if (showPasswordCheckbox.checked) {

            password.setAttribute('type', 'text')
        } else {
            password.setAttribute('type', 'password')
        }
    })

    const passwordActivateChecbkox = editProfile.children[16]
    passwordActivateChecbkox.addEventListener('change', (e) => {
        const password = document.getElementById('passwordInput')
        if (e.target.checked) {
            password.disabled = false;
        } else {
            password.disabled = true;
        }
    })
    editProfile.addEventListener('submit', submitEditProfile)
    popUpBody.appendChild(editProfile)

}

const renderProfile = (e)=>{
    e.preventDefault()

    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "User Profile")
    const userId = e.target.id == "profileImage" ?  USERID: e.target.id
    get(`/user/${userId}`, TOKEN)
        .then((result) => {
            console.log(result)
            const userProfileTemplate =  document.getElementById('userProfileTemplate')
            const userProfile = userProfileTemplate.cloneNode(true);

            userProfile.removeAttribute('id')
            userProfile.setAttribute('class', 'userProfile')
            const userName = userProfile.firstElementChild;
            userName.insertAdjacentText('beforeend', result.name)
            const userEmail = userName.nextElementSibling;
            userEmail.insertAdjacentText('beforeend', result.email)
            const userBio = userEmail.nextElementSibling;
            userBio.insertAdjacentText('beforeend', result.bio? result.bio : "No Bio")
            const userImage = userBio.nextElementSibling;
            userImage.setAttribute('src', result.image)

            popUpBody.appendChild(userProfile)
            console.log(userId)
            console.log(USERID)
            if (userId == USERID) {
                const editProfileButton = document.createElement('button');
                editProfileButton.insertAdjacentText('afterbegin', 'Edit Profile')
                editProfileButton.setAttribute('class', 'btn btn-primary')
                popUpBody.appendChild(editProfileButton);
                editProfileButton.style.display = "block";
                editProfileButton.addEventListener('click', editProfile)
            }
        })
}
const renderMessages = (messages, table) => {
    for (let x of messages){
        get(`/user/${x.sender}`, TOKEN)
            .then((result) =>   {
                let tr1 =  document.createElement('tr');
                let td1 = document.createElement('td');
                tr1.appendChild(td1);
                
                let tr2 =  document.createElement('tr');

                tr1.setAttribute('id', x.sender)
                
                td1.insertAdjacentText('afterbegin', result.name);
                td1.setAttribute('id', x.sender)
                td1.setAttribute('class', 'userName')
                td1.addEventListener('click', renderProfile)
                
                
                let tdDate = document.createElement('td');
                tdDate.insertAdjacentText('afterbegin', getTime(x.sentAt));
                tr2.appendChild(tdDate);
                tdDate.setAttribute('class', 'dateRow')
                let tdMessage = document.createElement('td');
                x.edited ?  tdMessage.insertAdjacentText('afterbegin', `${x.message} (Edited ${getTime(x.editedAt)})`) :  tdMessage.insertAdjacentText('afterbegin', x.message)
                
                let pinButton;
                if (x.pinned) {
                
                    pinButton = document.createElement('button');
                    pinButton.insertAdjacentText('afterbegin', 'Unpin');
                    pinButton.setAttribute('id', x.id)
                    pinButton.addEventListener('click', unpinMessage)
                    pinButton.setAttribute('class', "btn btn-danger pinButton")
                }
                else {
                    pinButton = document.createElement('button');
                    pinButton.insertAdjacentText('afterbegin', 'Pin');
                    pinButton.setAttribute('id', x.id)
                    pinButton.addEventListener('click', pinMessage)
                    pinButton.setAttribute('class', "btn btn-primary pinButton")
                }
                tdMessage.appendChild(pinButton);

                tr2.appendChild(tdMessage);
                tr2.setAttribute('id', x.id)
                if (x.sender == USERID) {
                    const tdEditMessage = document.createElement('td');
                    const editMessageButtonTemplate = document.getElementById('editMessageButtonTemplate');
                    const editMessageButton = editMessageButtonTemplate.cloneNode(true);
                    editMessageButton.style.display = "block";
                    editMessageButton.removeAttribute('id');
                    tdEditMessage.appendChild(editMessageButton);
                    tr1.appendChild(tdEditMessage);
                    td1.setAttribute('colspan', 1)
                    editMessageButton.setAttribute('id', x.id)
                    editMessageButton.addEventListener('click', editMessage)
                }
                else {
                    td1.setAttribute('colspan', 2)
                }
                table.appendChild(tr1);
                table.appendChild(tr2);
            
            
            
            
            
            
            } )
    }
}


const editMessage = (e) => {
    e.preventDefault()
    const [popUpTitle, popUpBody] = popUpSetUp();
    const editMessageFormTemplate = document.getElementById('editMessageFormTemplate');
    const editMessageForm = editMessageFormTemplate.cloneNode(true);
    editMessageForm.removeAttribute('id')
    popUpBody.appendChild(editMessageForm);
    popUpTitle.insertAdjacentText('afterbegin', "Edit Message")

    const deleteButton = editMessageForm.lastElementChild;
    editMessageForm.addEventListener('submit', (event) => {
        event.preventDefault()
        const message = event.target[0].value
        const payload = JSON.stringify({
            message: message
        })
        const messageId = e.target.id
        put(`/message/${CHANNELSELECTED}/${messageId}`, payload, TOKEN)
            .then((result) => {
                popUp.style.display = "none";
                openChannel("updateChannel");
            }) 
    })

    deleteButton.addEventListener('click', (event) => {
        event.preventDefault()
        const messageId = e.target.id
        del(`/message/${CHANNELSELECTED}/${messageId}`, TOKEN)
            .then((result) => {
                popUp.style.display = "none";
                openChannel("updateChannel");
            }
        )
    })

    
}

const createChannel = (event) => {
    event.preventDefault();
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "Create Channel")

    const channelFormTemplate = document.getElementById('createChannelFormTemplate');
    const channelForm = channelFormTemplate.cloneNode(true);
    channelForm.removeAttribute('id')
    popUpBody.appendChild(channelForm);

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

const removeMemberFromChannel = (event) => {
    post(`/channel/${CHANNELSELECTED}/leave`, JSON.stringify({}), TOKEN)
        .then((result) => {
            const table = document.getElementById('messagesTable');
            table.textContent='';
            const channelHead = document.getElementById('channelHead');
            channelHead.textContent = '';
            setUpMainPage(true)})

}

const pinMessage =(e) => {
    e.preventDefault()
    const messageId = e.target.id
    post(`/message/pin/${CHANNELSELECTED}/${messageId}`, JSON.stringify({}), TOKEN)
        .then((result) => {
            openChannel("updateChannel")
        }
    )
}

const unpinMessage =(e) => {
    e.preventDefault()
    const messageId = e.target.id
    post(`/message/unpin/${CHANNELSELECTED}/${messageId}`, JSON.stringify({}), TOKEN)
        .then((result) => {
            openChannel("updateChannel")
        }
    )
}

const openChannel = (event) => {
    let channelId
    if (typeof event == 'number')
    {
        console.log("yes")
        channelId = event
    }
    else if (event != "updateChannel") {
        channelId = event.target.id
    }
    else {
        channelId = CHANNELSELECTED
    }
    CHANNELSELECTED = channelId;
    console.log(CHANNELSELECTED)
    const channelMessages = get(`/message/${channelId}?start=0`, TOKEN)
    channelMessages
        .then((result) => {
            const table = document.getElementById('messagesTable');
            table.textContent='';
            const channelHead = document.getElementById('channelHead');
            channelHead.textContent = '';
            const messages = result.messages

            get(`/channel/${channelId}`, TOKEN)
                .then((result) => {

                    const headerRow = document.createElement('tr');
                    headerRow.setAttribute('id', 'headerRow')
                    
                    console.log(result)
                    // here we need to consider if the user is part of the channel
                    //so this is when he is
                    console.log(USERID)
                    if (result.members.includes(USERID)) {
                        const description = document.createElement('td');
                        const channelName = document.createElement('td');
                        const state = document.createElement('td');
                        const creationDate = document.createElement('td');
                        const creator = document.createElement('td');

                        channelHead.appendChild(headerRow);

                        channelName.insertAdjacentText('afterbegin', result.name);
                        state.insertAdjacentText('afterbegin', result.private? "Private" : "Public");
                        creationDate.insertAdjacentText('afterbegin', result.createdAt);
                        creator.insertAdjacentText('afterbegin', result.creator);
                        description.insertAdjacentText('afterbegin', result.description);

                        headerRow.appendChild(channelName);
                        headerRow.appendChild(state);
                        headerRow.appendChild(creationDate);
                        headerRow.appendChild(creator);
                        headerRow.appendChild(description);


                        const editChannel = document.createElement('td');
                        const editChannelButtonTemplate  = document.getElementById('editChannelButtonTemplate');
                        const editChannelButton = editChannelButtonTemplate.cloneNode(true);
                        headerRow.appendChild(editChannel);
                        editChannelButton.style.display = "block";
                        editChannelButton.addEventListener('click', updateChannel )
            
                        editChannelButton.removeAttribute('id');
                        editChannelButton.setAttribute('id','editChannelButton')
                        editChannel.appendChild(editChannelButton);
                        
                        const leaveChannel = document.createElement('td');
                        headerRow.appendChild(leaveChannel);
                        const leaveChannelButtonTemplate = document.getElementById('leaveChannelButtonTemplate');
                        const leaveChannelButton = leaveChannelButtonTemplate.cloneNode(true);
                        leaveChannelButton.style.display = "block";
                        leaveChannelButton.removeAttribute('id');
                        leaveChannelButton.setAttribute('id', 'leaveChannelButton')
                        leaveChannel.appendChild(leaveChannelButton);
                        leaveChannelButton.addEventListener('click', removeMemberFromChannel)
                        }

                        const pinnedMessages = messages.filter((message) => message.pinned)
                        const unpinnedMessages = messages.filter((message) => !message.pinned)
                        console.log(pinnedMessages)
                        console.log(unpinnedMessages)
                        const test = new Promise ((resolve, reject) => {
                            return resolve(renderMessages(pinnedMessages, table))
                        })
                        test.then((result) => {renderMessages(unpinnedMessages, table)})

                        
                        table.style.display ="block"
                        const container = document.getElementById('container');
                        container.style.display = "flex"
            })
        })
}

const updateChannel = (event) => {
    
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "Edit Channel")
    const channelFormTemplate = document.getElementById('updateChannelFormTemplate');
    const channelForm = channelFormTemplate.cloneNode(true);
    channelForm.removeAttribute('id')
    popUpBody.appendChild(channelForm);
    channelForm.addEventListener('submit', (event) => {
        event.preventDefault()
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


const joinChannel = (event) => {
    event.preventDefault();

    const channelID = event.target.id;
    CHANNELSELECTED = channelID

    const [popUpTitle, popUpBody] = popUpSetUp();
    const joinChannelButtonTemplate = document.getElementById('joinChannelButtonTemplate');
    const joinChannelButton = joinChannelButtonTemplate.cloneNode(true);
    joinChannelButton.removeAttribute('id');
    joinChannelButton.setAttribute('id', 'joinChannelButton')
    popUpBody.appendChild(joinChannelButton);
    joinChannelButton.addEventListener('click', (event) => {
        post(`/channel/${channelID}/join`, JSON.stringify({}), TOKEN)
        .then((result) => {
            popUp.style.display = "none";
            setUpMainPage(true)
            openChannel('updateChannel')
        })
    })
}

document.getElementById("messageInput").addEventListener("submit", function(event) {
    event.preventDefault()
    const message = event.target[0].value
    if (message.trim().length ===0) {
        return;
    }
    const payload = JSON.stringify({
        message: message
    })

    post(`/message/${CHANNELSELECTED}`, payload, TOKEN)
        .then(() => {
            openChannel('updateChannel')
        })
})




export {createChannel, openChannel, updateChannel,renderProfile, joinChannel, removeMemberFromChannel}