const header = document.getElementsByTagName('header')[0]
const main = document.getElementsByTagName('main')[0]
const joinRoomBtn = document.getElementById('join-room')
const newRoomBtn = document.getElementById('new-room')
const modal = document.getElementById('modal')
const overlay = document.getElementById('overlay')
const overlayModalWrapper = document.getElementById('overlay-modal-wrapper')
const logOutBtn = document.getElementById('logOutBtn')



const showModal = (placeholderText,btnText) =>{
	 modal.innerHTML = `
			<form class='h-100 d-flex flex-column justify-content-center'>
				<div id='modal-content' class='form-group d-flex flex-column'>
				<label>${placeholderText}</label>
					<input type='text' max=15 class='form-control w-100 m-3'>
                       <p id='room-creation-response' class='text-success invisible'>Room created</p>
					<button class='btn btn-primary' id='submitRoomNameBtn'>${btnText}</button>
				</div>
			</form>
		`,
	roomInput = document.querySelector('#modal-content > input')

	overlayModalWrapper.classList.remove('d-none')
	overlayModalWrapper.classList.add('d-flex')

    document.getElementById('submitRoomNameBtn').onclick = e =>{
        e.preventDefault()
        if(roomInput.value.length !== 0){
            if(btnText.includes('Create'))
                createRoom()
            else
                joinRoom(roomInput.value)
        }
    }
    document.body.onkeyup = e =>{
        if(e.keyCode === 27 && !overlay.className.includes('d-none'))
            overlayModalWrapper.classList.add('d-none')
	}
    roomInput.focus()
}

const createRoom = () =>{
    database.ref(`rooms/${firebase.auth().currentUser.uid}`).set({
        roomName:roomInput.value,
        user:firebase.auth().currentUser.email,
        username:firebase.User.name,
        state:'active',
        joinId:firebase.auth().currentUser.uid.substr(20), // A substring from chatroom hosting user's ID
        participants:[firebase.auth().currentUser.uid]
    })
        .then(()=>{document.getElementById('room-creation-response').classList.remove('invisible')})
        .then(()=>{setTimeout(()=>{window.open('../chatroom/chatroom.html')},1000)})
}

const joinRoom = joinId =>{
    const userId = firebase.auth().currentUser.uid
    database.ref('rooms').once('value')
        .then(sn =>{
                let snapshot = sn.val()
                console.log(snapshot)
                for(let x of Object.keys(snapshot)){
                    if(snapshot[x].joinId === joinId){
                        // Merge current participants list
                        let participantsList = snapshot[x].participants
                        console.log(participantsList)
                        console.log(`rooms/${x}/participants`)
                        if(!participantsList.includes(userId)){
                            participantsList.push(userId)
                            database.ref(`rooms/${x}/participants`).update(participantsList)
                        }
                    }
                }
        })
        .then(()=>{window.open('../chatroom/chatroom.html')})
}

document.body.onload = () => {
    main.style.paddingTop = `${header.clientHeight + 30}px`
}


joinRoomBtn.onclick = () => showModal('Enter room ID','Join room')

newRoomBtn.onclick = () => showModal('Enter a room name','Create room')
overlay.onclick = () => {
	overlayModalWrapper.classList.remove('d-flex')
	overlayModalWrapper.classList.add('d-none')
}
logOutBtn.onclick = () =>{
    firebase.auth().signOut()
        .then(()=>{window.location.replace('../login.html')})
}

