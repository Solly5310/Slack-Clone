import {get, post, put, del} from './services.js'
import { popUpSetUp, getTime, compareNames } from './utils.js';
import {TOKEN, USERID, setUpMainPage} from './main.js'
import {fileToDataUrl} from './helpers.js'

let CHANNELSELECTED
let imagesCarousel = []
let usersNotInChannelDefined = []

//Checks for users not in a channel
const getUsersNotInChannel = () => {
    get(`/channel/${CHANNELSELECTED}`, TOKEN)
    .then((channelResult) => {
        get(`/user`, TOKEN)
            .then((userResult) => {
            const usersInChannel = channelResult.members
            const usersInApp = userResult.users.map((user) => user.id)
            let usersNotInChannel = usersInApp.filter((user) => !usersInChannel.includes(user))
        for (let userId of usersNotInChannel) {
            get(`/user/${userId}`, TOKEN)
                .then((user) => {
                    usersNotInChannelDefined.push({userName: user.name, user: userId})
                })
         }
        })
    })
}


// This enables the ability to rotate between images
const renderImageCarousel = (imagePos) => {
    let imageRotation = imagePos
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "Image")
    const image = document.createElement('img');
    image.setAttribute('class', 'messageImageViewed')
    image.setAttribute('src', imagesCarousel[imageRotation])
    image.setAttribute('alt', 'imageFromUser')
    popUpBody.appendChild(image)

    if (imageRotation > 0) {
        const leftButton = document.createElement('button');
        leftButton.insertAdjacentText('afterbegin', '⬅')
        leftButton.setAttribute('class', 'btn btn-primary')
        popUpBody.appendChild(leftButton);
        leftButton.addEventListener('click', (e) => {
            e.preventDefault();
            image.setAttribute('src', imagesCarousel[--imageRotation])
            renderImageCarousel(imageRotation)
        })
    }
    if (imageRotation < imagesCarousel.length - 1) {
        const rightButton = document.createElement('button');
        rightButton.insertAdjacentText('afterbegin', '➡️')
        rightButton.setAttribute('class', 'btn btn-primary')
        popUpBody.appendChild(rightButton);
        rightButton.addEventListener('click', (e) => {
            e.preventDefault();
            image.setAttribute('src', imagesCarousel[++imageRotation])
            renderImageCarousel(imageRotation)
        })
    }
}

//This will count how many reacts are for each particular emoji for each particular message
const countReacts = (reacts, emojiType) => {
    let count = 0;
    let userAddedEmoji = false
    for (let react of reacts) {
        if (react.react === emojiType) {
            count += 1;
        }
        if (react.user === USERID && react.react === emojiType) {
            userAddedEmoji = true;
        }
    }
    return [count, userAddedEmoji];
}

//Ability to add or remove an emoji
const addOrRemoveEmoji = (event) => {
    event.preventDefault();
    const addedEmoji = event.target.id
    const emojiType = event.target.className
    const messageId = event.target.parentElement.children[0].id
    if (addedEmoji == 'false') {
        post(`/message/react/${CHANNELSELECTED}/${messageId}`, JSON.stringify({react: emojiType}), TOKEN)
            .then(
                (result) => {
                    openChannel("updateChannel")
                }
            )
    } else {
        post(`/message/unreact/${CHANNELSELECTED}/${messageId}`, JSON.stringify({react: emojiType}), TOKEN)
            .then((result) => {
                openChannel("updateChannel")
            })
    }
    
}

    
//Invite users to a specific channel
const inviteUsersToChannel = (e) => {
    e.preventDefault()   
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "Invite Users")

    //This is a global variable that needs to be sorted, before we bring up the invite users to channel pop-up
    usersNotInChannelDefined = usersNotInChannelDefined.sort(compareNames)
    const inviteUsersForm = document.createElement('form');
    inviteUsersForm.setAttribute('id', 'inviteUsersForm')

    //sorting each user by their name and then adding them to the form
    for (let x of usersNotInChannelDefined) {
        const userCheckbox = document.createElement('input');
        const userLabel = document.createElement('label');
        userCheckbox.setAttribute('type', 'checkbox')
        userCheckbox.setAttribute('name', x.userName)
        userCheckbox.setAttribute('value', x.user)
        userLabel.insertAdjacentText('afterbegin', x.userName)
        userLabel.setAttribute('class', "form-check-label")
        const seperator = document.createElement('div')
        seperator.appendChild(userCheckbox)
        seperator.appendChild(userLabel)
        inviteUsersForm.appendChild(seperator)
    }

    const submitButton = document.createElement('button');
    submitButton.setAttribute('class', 'btn btn-primary');
    submitButton.insertAdjacentText('afterbegin', "Submit");
    submitButton.addEventListener('click', (e) => {
        e.preventDefault();
        //submission of invitations to selected users
        const formData = new FormData(inviteUsersForm);
        console.log(inviteUsersForm)
        
        let objectiveCount = 0
        for (var pair of formData.entries()){
            objectiveCount += 1
        }
        let count = 0
        console.log(objectiveCount)
        for (var pair of formData.entries()) {
            const payload = {}
            payload['userId'] = 1 * pair[1]
            console.log(payload)
            post(`/channel/${CHANNELSELECTED}/invite`, JSON.stringify(payload), TOKEN)
            .then((result) => {
                count++
                // only once the last call has been made, do we update the channel
                if (count === objectiveCount) {
                    openChannel("updateChannel")
                }
            })
        
        }

        popUp.style.display = "none";

    })
    popUpBody.appendChild(inviteUsersForm)
    popUpBody.appendChild(submitButton)
}

//This will allow the user to add a a image for their profile photo
const uploadImage = (e) => {
    e.preventDefault()
    const sendingImage = e.target.id == 'sendImage' ? true : false
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', sendingImage? 'Send Image':"Update Profile Image")
    const uploadImageTemplate = document.getElementById('uploadImageTemplate');
    const uploadImage = uploadImageTemplate.cloneNode(true);
    uploadImage.removeAttribute('id');
    uploadImage.style.display = "block";
    popUpBody.appendChild(uploadImage);
    const fileInput = uploadImage.children[1];
    fileInput.addEventListener('change', (e) => {
       const file = e.target.files[0];
        fileToDataUrl(file)
            .then((dataUrl) => {
                const imagePreview = uploadImage.children[2];
                imagePreview.style.display = "block";
                imagePreview.setAttribute('src', dataUrl)
                const submitImageButton = document.createElement('button');
                submitImageButton.insertAdjacentText('afterbegin', "Submit")
                submitImageButton.setAttribute('class', 'btn btn-primary')
                submitImageButton.addEventListener('click', (e) => {
                    e.preventDefault()
                 
                    const payload = JSON.stringify({
                        image: dataUrl
                    })

                    if (sendingImage) {
                        post(`/message/${CHANNELSELECTED}`, payload, TOKEN)
                            .then((result) => {
                                popUp.style.display = "none";
                                openChannel("updateChannel")
                            })
                    }
                    else {
                    put('/user', payload, TOKEN)
                        .then((result) => {
                            popUp.style.display = "none";
                            setUpMainPage(true);
                            CHANNELSELECTED ? openChannel('updateChannel') : null
                        })
                    }
                })
                uploadImage.appendChild(submitImageButton)
            })

    })
}

//Function that runs to contact backend and update a profile
const submitEditProfile = (e) => {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const payload = {}

    for (var pair of formData.entries()) {
        if (pair[0] == "name" || pair[0] == "email" || pair[0] == 'bio' || pair[0] == "password")
            payload[pair[0]] = pair[1]
    }

    put(`/user`, JSON.stringify(payload), TOKEN)
        .then((result) => {

            popUp.style.display = "none";
            openChannel("updateChannel");
        })

}


const editProfile = (e) => {
    e.preventDefault()
    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "Edit Profile")

    const editProfileTemplate = document.getElementById('editProfileTemplate');
    const editProfile = editProfileTemplate.cloneNode(true);
    editProfile.removeAttribute('id');
    editProfile.style.display = "block";
    const nameActivateCheckbox = editProfile.children[2]
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

//Obtains user profile information and displays it
const renderProfile = (e)=>{
    e.preventDefault()

    const [popUpTitle, popUpBody] = popUpSetUp();
    popUpTitle.insertAdjacentText('afterbegin', "User Profile")
    const userId = e.target.id == "profileImage" ?  USERID: e.target.id
    get(`/user/${userId}`, TOKEN)
        .then((result) => {

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

            const usersection = userBio.nextElementSibling;
            const userImage = usersection.firstElementChild;

  
            userImage.setAttribute('src', result.image || './src/stock.jpg')

            popUpBody.appendChild(userProfile)
          
            if (userId == USERID) {
                const editProfileButton = document.createElement('button');
                editProfileButton.insertAdjacentText('afterbegin', 'Edit Profile')
                editProfileButton.setAttribute('class', 'btn btn-primary')
                popUpBody.appendChild(editProfileButton);
                editProfileButton.style.display = "block";
                editProfileButton.addEventListener('click', editProfile)

                const uploadImageButton = document.createElement('button');
                uploadImageButton.insertAdjacentText('afterbegin', 'Edit DP')
                uploadImageButton.setAttribute('class', 'btn btn-primary')
                popUpBody.appendChild(uploadImageButton);
                uploadImageButton.style.display = "block";
                uploadImageButton.addEventListener('click', uploadImage)
            }
        })
}

//Renders messages for the specific channel
const renderMessages = (messages, table) => {
    imagesCarousel = []
    for (let x of messages){
        let tr1 =  document.createElement('tr');
        let td1 = document.createElement('td');
        let td2 = document.createElement('td');
        let tr2 =  document.createElement('tr');
        tr1.appendChild(td1);
        tr1.appendChild(td2);
        table.appendChild(tr1);
        table.appendChild(tr2);
        
        get(`/user/${x.sender}`, TOKEN)
            .then((result) =>   {
             
               
                let image = document.createElement('img');
                image.setAttribute('src', result.image || './src/stock.jpg')
                image.setAttribute('class', 'profileImageMessenger')
                image.setAttribute('alt', 'userDisplayImage')
                td1.appendChild(image)
                tr1.setAttribute('id', x.sender)

                td2.insertAdjacentText('afterbegin', result.name);
                td2.setAttribute('id', x.sender)
                td2.setAttribute('class', 'userName')
                td2.addEventListener('click', renderProfile)
                
                
                let tdDate = document.createElement('td');
                tdDate.insertAdjacentText('afterbegin', getTime(x.sentAt));
                tr2.appendChild(tdDate);
                tdDate.setAttribute('class', 'dateRow')
                let tdMessage = document.createElement('td');
                //if the message is sent by the user logged in, they can edit the messages
                if (x.sender == USERID) {
                    const editMessageButtonTemplate = document.getElementById('editMessageButtonTemplate');
                    const editMessageButton = editMessageButtonTemplate.cloneNode(true);

                    editMessageButton.removeAttribute('id');
                    tdMessage.appendChild(editMessageButton);
                    if(x.image) {
                        editMessageButton.setAttribute('id', `${x.id} i`)
                    } else {
                        editMessageButton.setAttribute('id', x.id)
                    }

                    editMessageButton.addEventListener('click', editMessage)
                
                }
                let pinButton;
                //Adding the ability to pin messages
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
                // emoji setting up
                const smileEmoji = document.createElement('span');
                smileEmoji.setAttribute('class', 'smileEmoji')
                smileEmoji.insertAdjacentText('afterbegin', '  😀')
                tdMessage.appendChild(smileEmoji);
   
                const loveEmoji = document.createElement('span');
                loveEmoji.insertAdjacentText('afterbegin', '  ❤️')
                loveEmoji.setAttribute('class', 'loveEmoji')
                tdMessage.appendChild(loveEmoji);

                const laughEmoji = document.createElement('span');
                laughEmoji.insertAdjacentText('afterbegin', '  😂')
                laughEmoji.setAttribute('class', 'laughEmoji')
                tdMessage.appendChild(laughEmoji);

                const [smileReacts, userAddedSmileEmoji] = countReacts(x.reacts, 'smileEmoji')
                const [loveReacts, userAddedloveEmoji] = countReacts(x.reacts, 'loveEmoji')
                const [laughReacts, userAddedlaughEmoji] = countReacts(x.reacts, 'laughEmoji')
                // depending on the number of reacts, the title of the emoji has that number of emojis added
                if (smileReacts)
                {
                    const smile = '😀 '
                    const titleText = smile.repeat(smileReacts)
                    smileEmoji.setAttribute('title',titleText)
                }
                else {
                    smileEmoji.setAttribute('title', 'No smile emojis')
                }

                if (loveReacts)
                {
                    const love = '😍 '
                    const titleText = love.repeat(loveReacts)
                    loveEmoji.setAttribute('title', titleText)
                }
                else {
                    loveEmoji.setAttribute('title', 'No love emojis')
                }

                if (laughReacts)
                {
                    const laugh = '😂 '
                    const titleText = laugh.repeat(laughReacts)
                    laughEmoji.setAttribute('title',titleText)
                }
                else {
                    laughEmoji.setAttribute('title', 'No laugh emojis')
                }

                smileEmoji.setAttribute('id', userAddedSmileEmoji)
                loveEmoji.setAttribute('id', userAddedloveEmoji)
                laughEmoji.setAttribute('id', userAddedlaughEmoji)
                smileEmoji.addEventListener('click', addOrRemoveEmoji)
                loveEmoji.addEventListener('click', addOrRemoveEmoji)
                laughEmoji.addEventListener('click', addOrRemoveEmoji)
                if (x.message) {
                 x.edited ?  tdMessage.insertAdjacentText('beforeend', `${x.message} (Edited ${getTime(x.editedAt)})`) :  tdMessage.insertAdjacentText('beforeend', x.message)
                } else {
                    // We know need to consider the modal view as well
                    // A user should be able to selec the image thumbnail and view the image in a modal
                    // In addition the photos are on rotation
                    let messageImage = document.createElement('img')
                    imagesCarousel.push(x.image)
                    messageImage.setAttribute('src', x.image)
                    messageImage.setAttribute('class', 'messageImage')
                    messageImage.setAttribute('alt', "image from user")
                    tdMessage.appendChild(messageImage)
                    const imagePosition = imagesCarousel.length - 1;
                    messageImage.addEventListener('click', (e) => {
                        e.preventDefault();
                        renderImageCarousel(imagePosition)
                      
                    })
                }
                tr2.appendChild(tdMessage);
                tr2.setAttribute('id', x.id)      
                
                loveEmoji.addEventListener('click', () => {console.log("click")})
            } )
    }
}

// function to edit a message
const editMessage = (e) => {
    e.preventDefault()
    const [popUpTitle, popUpBody] = popUpSetUp();
    const editMessageFormTemplate = document.getElementById('editMessageFormTemplate');
    const editMessageForm = editMessageFormTemplate.cloneNode(true);
    editMessageForm.removeAttribute('id')
    const imageCheck = e.target.id.includes('i')
    console.log(imageCheck)
    imageCheck ? popUpTitle.insertAdjacentText('afterbegin', "Delete Image") : popUpTitle.insertAdjacentText('afterbegin', "Edit Message") 
    if (!imageCheck)  {
    popUpBody.appendChild(editMessageForm);
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
    }

    
      
    const deleteButton = editMessageForm.lastElementChild;
    imageCheck ? popUpBody.append(deleteButton) : null
    
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

//Used to create channels that appear on sidebar
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

// function used to make a member leave a channel
const removeMemberFromChannel = (event) => {
    post(`/channel/${CHANNELSELECTED}/leave`, JSON.stringify({}), TOKEN)
        .then((result) => {
            const table = document.getElementById('messagesTable');
            table.textContent='';
            const channelHead = document.getElementById('channelHead');
            channelHead.textContent = '';
            setUpMainPage(true)})

}

// pin message function
const pinMessage =(e) => {
    e.preventDefault()
    const messageId = e.target.id
    post(`/message/pin/${CHANNELSELECTED}/${messageId}`, JSON.stringify({}), TOKEN)
        .then((result) => {
            openChannel("updateChannel")
        }
    )
}

//unpine Message function
const unpinMessage =(e) => {
    e.preventDefault()
    const messageId = e.target.id
    post(`/message/unpin/${CHANNELSELECTED}/${messageId}`, JSON.stringify({}), TOKEN)
        .then((result) => {
            openChannel("updateChannel")
        }
    )
}






//Functiont that is used to open a channel when logged in, or when you open a different channel etc
const openChannel = (event) => {
    //Used to validate if this is as a result of user interaction, on when the user logs in initially
    let channelId
    if (typeof event == 'number') {
        channelId = event
    }
    else if (event != "updateChannel") {
        channelId = event.target.id
    }
    else {
        channelId = CHANNELSELECTED
    }
    CHANNELSELECTED = channelId;
    //We need to run this before the invite users component
    usersNotInChannelDefined = []
    getUsersNotInChannel()
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
                    // here we need to consider if the user is part of the channel
                    // If they are then they get access to the channel details
                    if (result.members.includes(USERID)) {
                        const description = document.createElement('th');
                        channelHead.appendChild(headerRow);
                        const channelInfoButton = document.createElement('button');
                        channelInfoButton.setAttribute('id', 'channelInfoButton')
                        channelInfoButton.setAttribute('class', 'btn btn-primary')
                        channelInfoButton.textContent = "Channel Info"
                        channelInfoButton.addEventListener('click', ()=> {
                            const [popUpTitle, popUpBody] = popUpSetUp();
                            popUpTitle.insertAdjacentText('afterbegin', "Channel Info")
                            const channelInfoTemplate = document.getElementById('channelInfoTemplate');
                            const channelInfo = channelInfoTemplate.cloneNode(true);
                            channelInfo.removeAttribute('id')
                            channelInfo.setAttribute('id', 'channelInfo')
                            channelInfo.style.display = "block"
                            popUpBody.appendChild(channelInfo);
                            channelInfo.firstElementChild.textContent = `Channel Name: ${result.name}`;
                            channelInfo.children[0].textContent = `Description: ${result.description}`;
                            channelInfo.children[1].textContent = result.private ? 'Channel Status: 🔒 private' : '🔓 public';
                            channelInfo.children[2].textContent = `Creaation Date ${getTime(result.createdAt)}`;
                            get(`/user/${result.creator}`, TOKEN)
                                .then(
                                    (result) => {
                                        channelInfo.children[3].textContent = `Creator: ${result.name}`
                                    }
                                )
                        })
                        description.appendChild(channelInfoButton);
                        headerRow.appendChild(description);
                        const editChannel = document.createElement('th');
                        const editChannelButtonTemplate  = document.getElementById('editChannelButtonTemplate');
                        const editChannelButton = editChannelButtonTemplate.cloneNode(true);
                        headerRow.appendChild(editChannel);
                        editChannelButton.style.display = "block";
                        editChannelButton.addEventListener('click', updateChannel )

                        editChannelButton.removeAttribute('id');
                        editChannelButton.setAttribute('id','editChannelButton')
                        editChannel.appendChild(editChannelButton);
                        
                        const leaveChannel = document.createElement('th');
                        headerRow.appendChild(leaveChannel);
                        const leaveChannelButtonTemplate = document.getElementById('leaveChannelButtonTemplate');
                        const leaveChannelButton = leaveChannelButtonTemplate.cloneNode(true);
                        leaveChannelButton.style.display = "block";
                        leaveChannelButton.removeAttribute('id');
                        leaveChannelButton.setAttribute('id', 'leaveChannelButton')
                        leaveChannel.appendChild(leaveChannelButton);
                        leaveChannelButton.addEventListener('click', removeMemberFromChannel)

                        const inviteUsers = document.createElement('th');
                        headerRow.appendChild(inviteUsers);
                        const inviteUsersButtonTemplate = document.getElementById('inviteUsersButtonTemplate');
                        const inviteUsersButton = inviteUsersButtonTemplate.cloneNode(true);
                        inviteUsersButton.style.display = "block";
                        inviteUsersButton.removeAttribute('id');
                        inviteUsersButton.setAttribute('id', 'inviteUsersButton')
                        inviteUsers.appendChild(inviteUsersButton);
                        inviteUsers.addEventListener('click', inviteUsersToChannel)
                        }

                        const pinnedMessages = messages.filter((message) => message.pinned)
                        const unpinnedMessages = messages.filter((message) => !message.pinned)
                        //messages are rendered here, we first apply to pinned messages
                        //The problem with this is that, the for loop continues and will resolve before all of the messages are there
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
    //Here we update a channel with new name and description information
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

//Function used for the user to join a channel
const joinChannel = (event) => {
    let channelId
    if (typeof event == 'number')
    {

        channelId = event
        CHANNELSELECTED = channelId
    }
    else {
        event.preventDefault()
        channelId = event.target.id;
    }
    const [popUpTitle, popUpBody] = popUpSetUp();
    const joinChannelButtonTemplate = document.getElementById('joinChannelButtonTemplate');
    const joinChannelButton = joinChannelButtonTemplate.cloneNode(true);
    joinChannelButton.removeAttribute('id');
    joinChannelButton.setAttribute('id', 'joinChannelButton')
    popUpBody.appendChild(joinChannelButton);
    joinChannelButton.addEventListener('click', (event) => {
        post(`/channel/${channelId}/join`, JSON.stringify({}), TOKEN)
        .then((result) => {
            popUp.style.display = "none";
            setUpMainPage(true)
            openChannel('updateChannel')
        })
    })
}

//Event listener for the user to send a message, verifiying if it is not empty space
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

//Additional upload image functionality
document.getElementById('sendImage').addEventListener('click', uploadImage)

export {createChannel, openChannel, updateChannel,renderProfile, joinChannel, removeMemberFromChannel}