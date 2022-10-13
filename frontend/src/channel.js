import {get, post, put} from './services.js'
import { popUpSetUp, getTime } from './utils.js';
import {TOKEN, USERID, setUpMainPage} from './main.js'

let CHANNELSELECTED


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
    console.log(event)
    post(`/channel/${CHANNELSELECTED}/leave`, JSON.stringify({}), TOKEN)
        .then((result) => console.log(result))
        .then((result) => {
            const table = document.getElementById('messagesTable');
            table.textContent='';
            const channelHead = document.getElementById('channelHead');
            channelHead.textContent = '';
            setUpMainPage(true)})

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
                    
                    
                    // here we need to consider if the user is part of the channel
                    //so this is when he is

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

                        for (let x of messages)
                        {
                            get(`/user/${x.sender}`, TOKEN)
                                .then((result) =>   {
                                    console.log(result)
                                    let tr1 =  document.createElement('tr');
                                    let td1 = document.createElement('td');
                                    tr1.appendChild(td1);
        
                                    tr1.setAttribute('id', x.sender)
                                    td1.setAttribute('colspan', 2)
                                    td1.insertAdjacentText('afterbegin', result.name);
                                    
                                    let tr2 =  document.createElement('tr');
                                    let tdDate = document.createElement('td');
                                    tdDate.insertAdjacentText('afterbegin', getTime(x.sentAt));
                                    tr2.appendChild(tdDate);
                                    tdDate.setAttribute('class', 'dateRow')
                                    let tdMessage = document.createElement('td');
                                    tdMessage.insertAdjacentText('afterbegin', x.message);
                                    tr2.appendChild(tdMessage);
                                    tr2.setAttribute('id', x.id)
        
                                
                                    table.appendChild(tr1);
                                    table.appendChild(tr2);
                                
                                
                                
                                
                                
                                
                                } )

                            
                        }
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


const joinChannel = (event) => {
    event.preventDefault();

    const channelID = event.target.id;
    CHANNELSELECTED = channelID
    console.log(channelID)
    const [popUpTitle, popUpBody] = popUpSetUp();
    const joinChannelButtonTemplate = document.getElementById('joinChannelButtonTemplate');
    const joinChannelButton = joinChannelButtonTemplate.cloneNode(true);
    joinChannelButton.removeAttribute('id');
    joinChannelButton.setAttribute('id', 'joinChannelButton')
    popUpBody.appendChild(joinChannelButton);
    joinChannelButton.addEventListener('click', (event) => {
        console.log("clicked")
        console.log(channelID)
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

    console.log(CHANNELSELECTED)
    post(`/message/${CHANNELSELECTED}`, payload, TOKEN)
        .then(result => console.log(result))
        .then(() => {
            openChannel('updateChannel')
        })
})


export {createChannel, openChannel, updateChannel, joinChannel, removeMemberFromChannel}