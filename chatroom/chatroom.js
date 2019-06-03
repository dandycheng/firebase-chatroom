const header = document.getElementsByTagName('header')[0]
const main = document.getElementsByTagName('main')[0]
const chatArea = document.getElementById('chat-area')
const chatInteractiveArea = document.getElementById('chat-interactive-area')
const chatTextbox = document.getElementById('chat-textbox')
const endChat = document.getElementById('end-chat')
const exportChat = document.getElementById('export-chat')
const sendBtn = document.getElementById('send-btn')
const logOutBtn = document.getElementById('log-out-btn')
let userData,chatroomData,msgIndex

// return firebase.auth() promise
const auth = ()=> firebase.auth()


// Initialize Chatroom data
database.ref('rooms').once('value')
    .then(async sn =>{
        for(let x of Object.keys(sn.val())){
            if(sn.val()[x].participants.includes(auth().currentUser.uid))
                chatroomData = await sn.val()[x]
        }
    })
    .then(()=>{
        database.ref(`rooms/${Array.isArray(chatroomData.participants) ? chatroomData.participants[0] : chatroomData.participants}/messages`).on('child_added',
            sn => {
                // Initialize messages on load
                generateChatBubble(sn.val().author,sn.val().authorDisplayName,sn.val().content,sn.val().author !== auth().currentUser.uid,true)
            })
    })
    .then(()=>{
        // Intialize user data
        firebase.firestore().collection('users').doc(auth().currentUser.uid).get()
            .then(function(sn){
                userData = sn.data()
                Object.freeze(userData)
                console.log(userData)
            })
    })


    
// Adjust main contents' components' sizing / position
const adjustMainContent = () => {
    main.style.height = `${document.body.clientHeight - header.clientHeight}px` 
    chatInteractiveArea.style.height = `${document.body.clientHeight - header.clientHeight - chatArea.clientHeight - 20}px`
    chatTextbox.focus()
}


document.body.onload = () => adjustMainContent()
document.body.onresize = () => adjustMainContent()

/*
    generateChatBubble()
        - Appends new chat bubble to the chat area

    parameters
        - authorDisplayName (string)
        - content (string) --> message content entered in chat textarea
        - isRespondent (boolean) --> controls chat bubble adjustment (moved to the left if true)
*/
const generateChatBubble = (author,authorDisplayName,content,isRespondent,isFetch = false) =>{
    const date = new Date()

    // To generate unique id for unique messages, ensuring changes are made to the particular chat bubble

    let randomNum = Math.random()
    randomNum *= Math.pow(10,randomNum.toString().length)
    
    let chatBubbleposition = (isRespondent) ? 'chat-bubble-left' : 'chat-bubble-right'
    let userIconOrder = (isRespondent) ? 'order-1' : 'order-3'
    let chatBubbleMsg = 
        `
        <div class='d-flex flex-column mt-4'>
            <p class='text-white ${(isRespondent) ? "text-left" : "text-right"} p-1'>${authorDisplayName}</p>
            <div class='d-flex ${(isRespondent) ? "justify-content-start" : "justify-content-end"}'>
                <div class='chat-bubble-wrapper d-flex flex-column ${chatBubbleposition} order-2'>
                   <div class='chat-bubble bg-primary'>
                        <p id='${randomNum}' class='p-3 m-0 text-white'></p>
                    </div>
                    <span class='${(isRespondent) ? "timestamp-left" : "timestamp-right"} mt-2 position-relative badge badge-light'>${date.toLocaleString()}</span>
                </div>
                <div class='user-icon rounded-circle bg-light ${userIconOrder}'></div>
            </div>
        </div>
        `
        
    chatArea.innerHTML += chatBubbleMsg

    let thisChatBubble = document.getElementById(randomNum)

    // Prevents HTML tags to be inserted into chat bubble manually 
    // (i.e. typing "<a href='#'>Hello</a>" into the chat will create an anchor in the chat bubble)
    thisChatBubble.innerText = content
    chatTextbox.innerText = ''
    chatArea.scrollBy(0,chatArea.clientHeight + chatArea.scrollHeight) // Scroll to latest message

    const userChatroom = `rooms/${Array.isArray(chatroomData.participants) ? chatroomData.participants[0] : chatroomData.participants}`
    let msgObj = {
        authorDisplayName:userData.username,
        author:author,
        timestamp:date.getTime(),
        content:content
    }

    // Update to realtime db (Messaging)
    if(!isFetch){
        database.ref(`${userChatroom}/messages`).once('value')
        .then(snapshot => {
            msgIndex = (snapshot.val() ===  null) ? 0 : Object.keys(snapshot.val()).length
            if(chatroomData.state === 'active' && msgIndex >= 0){
                database.ref(`${userChatroom}/messages`).child(msgIndex).set(msgObj)
            }
        })
    }
}

exportChat.onclick = () => {
    const userChatroom = `rooms/${chatroomData.joinId}`
    const chatroomDataLink = `http://localhost:8080/${userChatroom}`
    fetch(chatroomDataLink)
        .then(function(response){
            if(response.status === 200)
                window.open(chatroomDataLink)
        })
}

chatTextbox.onkeydown = e => {
    if(e.keyCode !== 116){
        (chatTextbox.innerText.length > 500 && e.keyCode !== 8) && (e.preventDefault()) // Limit message length

        // Prevents placement of space and "\n" when there are no non-whitespace content
        // keyCode 13 -> Enter, keyCode 32 -> Space
        if((e.keyCode === 13 || e.keyCode === 32) && chatTextbox.innerText.length !== 0){
            if(!e.shiftKey && e.keyCode === 13){
                e.preventDefault() // Prevent showing "\n" placement before sending
                sendBtn.click()
            }
        }
        // Remove text formatting (i.e. when pasting an anchor tag)
        const removeTextFormatting = setTimeout(()=>{chatTextbox.textContent = chatTextbox.textContent},0)
        setTimeout(()=>{clearInterval(removeTextFormatting)},10)
        chatTextbox.focus()
    }
}

sendBtn.onclick = () => {
    if(chatTextbox.innerText.length > 0){
        generateChatBubble(auth().currentUser.uid,userData.username,chatTextbox.innerText.trim(),false)
        let latestMsg = document.querySelector('#chat-area > div:last-of-type')
        latestMsg.parentNode.removeChild(latestMsg)
    }
}
logOutBtn.onclick = () =>{
    auth().signOut()
        .then(()=>{window.location.replace('../login.html')})
}
