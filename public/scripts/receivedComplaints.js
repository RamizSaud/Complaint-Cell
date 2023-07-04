const btns = document.getElementsByClassName('complete');

async function updateComplete(event) {
    await fetch('/completeTask', {
        method: 'POST',
        body: JSON.stringify({complaint_id: event.path[1].id}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    event.path[0].classList.add('completed');
    event.path[0].classList.remove('complete');
    event.path[0].textContent = 'Complaint Resolved';
}

for (let btn of btns) {
    btn.addEventListener('click', updateComplete);
}

