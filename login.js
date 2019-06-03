const emailInput = document.getElementById('email-input')
const passwdInput = document.getElementById('passwd-input')
const loginBtn = document.getElementById('login-btn')
const errorMsg = document.getElementById('error-msg')

loginBtn.onclick = e =>{
	e.preventDefault();
    firebase.auth().signInWithEmailAndPassword(emailInput.value,passwdInput.value)
        .then(()=>{
                firebase.auth().onAuthStateChanged(user =>{
                    if(user)
                        fetch(`http://localhost:8080/login?userId=${firebase.auth().currentUser.uid}`)
                            .then(response => response.text())
                            .then(data => {
                                if(!data.includes('localhost'))
                                    window.location += data
                                else
                                    window.location = data
                            })
                })
        })
        .catch(function (error){
            errorMsg.textContent = {
                'auth/invalid-email': (!/\w+@\w+.\w+/g.test(emailInput) && (emailInput.value.length && passwdInput.value.length > 0)) ? 'Invalid email format' : 'Fields cannot be empty',
                'auth/wrong-password':'Incorrect email or password',
                'auth/user-not-found':'Incorrect email or password'
            }[error.code]
            errorMsg.classList.add('d-block')
            errorMsg.classList.remove('invisible')
        })
}

for(let x of document.getElementsByTagName('input')){
    function removeErrMsg(){
        errorMsg.classList.add('invisible')
        errorMsg.classList.remove('d-block')
    }
    x.addEventListener('focus',removeErrMsg)
    x.addEventListener('keydown',removeErrMsg)
}
