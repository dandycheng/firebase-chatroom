const header = document.getElementsByTagName('header')[0]
const main = document.getElementsByTagName('main')[0]
const exportChat = document.getElementById('export-chat')
const modal = document.getElementById('modal')
const overlay = document.getElementById('overlay')
const overlayModalWrapper = document.getElementById('overlay-modal-wrapper')
const logOutBtn = document.getElementById('logOutBtn')



const showModal = (placeholderText,btnText) =>{
	 modal.innerHTML = `
			<form class='h-100 d-flex flex-column justify-content-center'>
				<div id='modal-content' class='form-group d-flex flex-column'>
				<label>${placeholderText}</label>
					<input type='text' max=15 class='form-control w-100 m-3' spellcheck='false'>
                       <p id='export-chat-response' class='text-danger invisible'>Room Id does not exist</p>
					<button class='btn btn-primary' id='submitRoomNameBtn'>${btnText}</button>
				</div>
			</form>
		`,
	roomInput = document.querySelector('#modal-content > input')

	overlayModalWrapper.classList.remove('d-none')
	overlayModalWrapper.classList.add('d-flex')

    document.getElementById('submitRoomNameBtn').onclick = e =>{
        e.preventDefault()
        getChatData(roomInput.value)
    }
    document.body.onkeyup = e =>{
        if(e.keyCode === 27 && !overlay.className.includes('d-none'))
            overlayModalWrapper.classList.add('d-none')
	}
    roomInput.focus()
}
document.body.onload = () => {
    main.style.paddingTop = `${header.clientHeight + 30}px`
}

function getChatData(roomId){
    let roomDataLink = `http://localhost:8080/rooms/${roomId}`
    let exportChatResponseMsg = document.getElementById('export-chat-response')
    fetch(roomDataLink)
        .then(function(response){
            if(response.status === 200){
                window.open(roomDataLink)
                exportChatResponseMsg.classList.add('invisible')
            }
            else
                exportChatResponseMsg.classList.remove('invisible')
        })
}


exportChat.onclick = () => showModal('Enter room ID','Export chat')
overlay.onclick = () => {
	overlayModalWrapper.classList.remove('d-flex')
	overlayModalWrapper.classList.add('d-none')
}
logOutBtn.onclick = () =>{
    firebase.auth().signOut()
        .then(()=>{window.location.replace('../login.html')})
}

