const type = document.getElementById('type');
const fac = document.getElementById('faculty');
const staff = document.getElementById('staff');
const admin = document.getElementById('admin');
const options = document.getElementById('options-aval');
const form = document.getElementById('c-form');

function changeOptions(event) {
    const value = event.target.value
    if (value==="faculty_member") {
        fac.style.display = 'block';
        staff.style.display = 'none';
        admin.style.display = 'none';
    } else if (value==="admin") {
        fac.style.display = 'none';
        staff.style.display = 'none';
        admin.style.display = 'block';
    } else if (value==="staff") {
        fac.style.display = 'none';
        staff.style.display = 'block';
        admin.style.display = 'none';
    }
}

async function checkType(event) {
    event.preventDefault();
    const UserValue = type.value;
    const typeValue = event.target.value;
    const data = {
        user_type: UserValue,
        type_val: typeValue
    }
    const response = await fetch('/getTypes', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    })
    const resData = await response.json();
    if (UserValue=='faculty_member') {
        options.innerHTML = ``;
        for (let t_data of resData.types_data) {
            options.innerHTML = options.innerHTML + `
            <section class="desc" id=${t_data.faculty_id}>
                <h3>${t_data.name}</h3>
                <h3>${t_data.type}</h3>
                <h3>${t_data.faculty}</h3>
            </section>
            `;
        }
    } else if (UserValue=='staff') {
        options.innerHTML = ``;
        for (let t_data of resData.types_data) {
            options.innerHTML = options.innerHTML + `
            <section class="desc" id=${t_data.staff_id}>
                <h3>${t_data.name}</h3>
                <h3>${t_data.type}</h3>
            </section>
            `;
        }
    } else if (UserValue=='admin') {
        options.innerHTML = ``;
        for (let t_data of resData.types_data) {
            options.innerHTML = options.innerHTML + `
            <section class="desc" id=${t_data.admin_id}>
                <h3>${t_data.name}</h3>
                <h3>${t_data.type}</h3>
            </section>
            `;
        }
    }
}

function checked(event) {
    if (event.target.tagName=="H3") {
        for (i of options.children) {
            if ('checked'==i.classList[1]) {
                i.classList.remove('checked');
            }
        }
        event.target.parentNode.classList.add('checked');
    }
    else if (event.target.tagName=="SECTION") {
        for (i of options.children) {
            if ('checked'==i.classList[1]) {
                i.classList.remove('checked');
            }
        }
        event.target.classList.add('checked');
    }
}

async function getComplaint(event) {
    event.preventDefault();
    const subject = document.getElementById('subject').value;
    const detail = document.getElementById('detail').value;
    const urgency = document.querySelector('input[name="urgent"]:checked').value;
    const com_sent = document.getElementById('com-sent');
    const form_con = document.getElementById('form-con');
    const val = type.value;
    const complaintData = {
        subject: subject,
        detail: detail,
        urgency: urgency,
        receiverType: val,
    }
    if (val=='faculty_member') {
        complaintData['type'] = fac.value;
    }
    else if (val=='staff') {
        complaintData['type'] = staff.value;
    }
    else if (val=='admin') {
        complaintData['type'] = admin.value;
    }
    for (i of options.children) {
        if (i.classList[1]=='checked') {
            complaintData['id'] = i.id;
            break;
        }
    }
    const response = await fetch('/issueComplaint', {
        method: 'POST',
        body: JSON.stringify(complaintData),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    const resData = await response.json();
    if (resData.message=='Sent') {
        form_con.style.display = 'none';
        document.getElementById('main-f').style.height = '85vh';
        com_sent.style.display = 'block';
    }
}

type.addEventListener('change',changeOptions);
fac.addEventListener('change',checkType);
staff.addEventListener('change',checkType);
admin.addEventListener('change',checkType);
options.addEventListener('click',checked);
form.addEventListener('submit',getComplaint);