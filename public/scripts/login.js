const options = document.getElementById('options');
const finish = document.getElementById('as');
const form = document.getElementById('show-form');
const user_name = document.getElementById('user-name');
const password = document.getElementById('password');
const invalid_username = document.getElementById('correction');
let as;

function clickType(event) {
    if (event.target.tagName=='LI') {
        as = event.target.textContent;
        form.style.display="flex";
        finish.childNodes[3].textContent=as;
        finish.childNodes[3].style.display="inline";
        options.style.display="none";
    }
}

async function verify(event) {
    event.preventDefault();
    const enteredUserName = user_name.value;
    const enteredPassword = password.value;
    const data = {
        as: as,
        UserName: enteredUserName,
        Password: enteredPassword
    }
    const response = await fetch('/login', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    
    const resData = await response.json();
    if (resData.loggedIn) {
        window.location = '/issueComplaint';
    } else {
        invalid_username.style.display = 'block';
    }
}

options.addEventListener('click',clickType);
form.addEventListener('submit',verify);