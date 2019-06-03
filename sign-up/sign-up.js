const signUpWrapper = document.getElementById('sign-up-wrapper')
const validation = document.getElementsByClassName('validation')
const errorMsg = document.getElementById('error-msg')
const signUpBtn = document.getElementById('sign-up-btn')
const usernameInput = document.getElementById('username')
const emailInput = document.getElementById('email')
const passwdInput = document.getElementById('passwd')
const confirmPasswdInput = document.getElementById('confirm-passwd')

document.body.onload = () => signUpWrapper.style.transform = 'translate(0)';

signUpBtn.onclick = e =>{
	let validated = false
	for(let x of validation){
		if(x.value.length > 0){
			if(passwdInput.value.length < 6 || passwdInput.value !== confirmPasswdInput.value){
				errorMsg.textContent = (passwdInput.value.length < 6) ? 'Password must be at least 6 characters long' : 'Password does not match'
				errorMsg.classList.remove('invisible')
				validated = false
			}else
				validated = true
		}
	}
	if(validated){
		e.preventDefault()
		errorMsg.classList.add('invisible')
		try{
			// Sign up
			firebase.auth()
					.createUserWithEmailAndPassword(emailInput.value,passwdInput.value)
					.then(() => getSuccessMsg())
					.catch(err => getErrorMsg())
					
			// Get uid
			firebase.auth().signInWithEmailAndPassword(emailInput.value,passwdInput.value)
				.then(function(){
					let userData = {
						username:usernameInput.value,
						userId:firebase.auth().currentUser.uid,
						email:emailInput.value
					}
					firebase.auth().signOut()
					fetch(`http://localhost:8080/signUp?userId=${userData.userId}&username=${userData.username}&email=${userData.email}`,{method:'POST'})
					.then(response =>{
						if(response === 200)
							window.location = '../login.html'
					})
				})
		}catch{
		}
		function getErrorMsg(){
			errorMsg.textContent = 'This email is already registered'
			errorMsg.classList.remove('invisible')
			errorMsg.classList.remove('text-success')
			errorMsg.classList.add('text-danger')
		}
		function getSuccessMsg(){
			errorMsg.textContent = 'Registration successful'
			errorMsg.classList.remove('text-danger')
			errorMsg.classList.remove('invisible')
			errorMsg.classList.add('text-success')
		}
	}
}