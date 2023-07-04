const ratings = document.getElementsByClassName('rating');
async function checkRating(event) {
    console.log(event.target);
    console.log(JSON.stringify({complaint_id: event.path[2].id, satisfaction: event.path[0].id}))
    for (let i = 0;i<5;i++) {
        event.path[1].children[i].classList.remove('checked');
    }
    for (let i = 0;i<event.path[0].id;i++) {
        event.path[1].children[i].classList.add('checked');
    }
    await fetch('/checkRating', {
        method: 'POST',
        body: JSON.stringify({complaint_id: event.path[2].id, satisfaction: event.path[0].id}),
        headers: {
            'Content-Type': 'application/json'
        }
    })
}
for (let rating of ratings) {
    rating.addEventListener('click',checkRating);
}


