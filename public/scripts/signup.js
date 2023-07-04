const options = document.getElementById('options');
const fac = document.getElementById('fac-type');
const staff = document.getElementById('staff-type');
const l_regno = document.getElementById('l-regno');
const regno = document.getElementById('regno');
const l_batch = document.getElementById('l-batch');
const batch = document.getElementById('batch');
const l_faculty = document.getElementById('l-faculty');
const faculty = document.getElementById('faculty');
const l_type = document.getElementById('l-type');
const admin = document.getElementById('admin-type');
const l_room = document.getElementById('l-room-no');
const room = document.getElementById('room-no');
const l_hostel = document.getElementById('l-hostel');
const hostel = document.getElementById('hostel');
const form = document.getElementById('show-form');
const finish = document.getElementById('as');
const Uname = document.getElementById('name');
const user_name = document.getElementById('user-name');
const password = document.getElementById('password');
const correction = document.getElementById('correction');
const create_acc = document.getElementById('create-acc');
let as;

function clickType(event) {
    if (event.target.tagName=='LI') {
        as = event.target.textContent;
        form.style.display="flex";
        finish.childNodes[3].textContent=as;
        finish.childNodes[3].style.display="inline";
        options.style.display="none";
        if (as==="Student") {
            l_regno.style.display = "block";
            regno.style.display = "block";
            l_batch.style.display = "block";
            batch.style.display = "block";
            l_faculty.style.display = "block";
            faculty.style.display = "grid";
            l_room.style.display = "block";
            room.style.display = "block";
            l_hostel.style.display = "block";
            hostel.style.display = "block";
        }
        else if (as==="Faculty Member") {
            l_faculty.style.display = "block";
            faculty.style.display = "grid";
            l_type.style.display = "block";
            fac.style.display = "grid"; 
        } else if (as==="Staff") {
            l_type.style.display = "block";
            staff.style.display = "grid";
        } else if (as==="Administrator") {
            l_type.style.display = "block";
            admin.style.display = "grid";
        }
    }
}

function batchShow(event) {
    if (event.target.value==="advisor") {
        l_batch.style.display = "block";
        batch.style.marginBottom = "2rem";
        fac.style.marginBottom = "2rem";
        batch.style.display = "block";
    } else {
        l_batch.style.display = "none";
        batch.style.display = "none";
    }
}

function hostelShow(event) {
    if (event.target.value==="warden") {
        l_hostel.style.display = "block";
        hostel.style.display = "block";
    } else {
        l_hostel.style.display = "none";
        hostel.style.display = "none";
    }
}

async function saveData(event) {
    event.preventDefault();
    correction.style.display = 'none';
    const enteredName = Uname.value;
    const enteredUserName = user_name.value;
    const enteredPassword = password.value;
    if (as==="Student") {
        const enteredRegno = regno.value;
        const enteredRoomNo = room.value;
        const enteredHostel = hostel.value;
        const enteredBatch = document.querySelector('input[name="batch"]:checked').value;
        const enteredFaculty = document.querySelector('input[name="fac"]:checked').value;
        let studentData = { RegNo: enteredRegno, Name: enteredName, Faculty: enteredFaculty, Batch: enteredBatch, RoomNo: enteredRoomNo, 
            Hostel: enteredHostel, UserName: enteredUserName, Password: enteredPassword };
        const response = await fetch('/signup/student', {
            method: 'POST',
            body: JSON.stringify(studentData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const resData = await response.json();
        console.log(resData);
        if (resData.added==false) {
            correction.style.display = 'block';
        } else {
            create_acc.style.display = 'block';
            form.reset();
            form.style.display = 'none';
        }
    }
    else if (as==="Faculty Member") {
        const enteredFacType = document.querySelector('input[name="faculty"]:checked').value;
        const enteredFaculty = document.querySelector('input[name="fac"]:checked').value;
        let facultyData = { Name: enteredName, Faculty: enteredFaculty, FacType: enteredFacType, UserName: enteredUserName, Password: enteredPassword };
        if (enteredFacType==="advisor") {
            const enteredBatch = document.querySelector('input[name="batch"]:checked').value;
            facultyData.Batch = enteredBatch;
        }
        const response = await fetch('/signup/faculty', {
            method: 'POST',
            body: JSON.stringify(facultyData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const resData = await response.json();
        if (resData.added==false) {
            correction.style.display = 'block';
        } else {
            create_acc.style.display = 'block';
            form.reset();
            form.style.display = 'none';
        }
    }
    else if (as==="Staff") {
        const enteredStaffType = document.querySelector('input[name="staff"]:checked').value;
        let staffData = { Name: enteredName,  StaffType: enteredStaffType, UserName: enteredUserName, Password: enteredPassword };
        if (enteredStaffType==="warden") {
            const enteredHostel = hostel.value;
            staffData.Hostel = enteredHostel;
        }
        const response = await fetch('/signup/staff', {
            method: 'POST',
            body: JSON.stringify(staffData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const resData = await response.json();
        if (resData.added==false) {
            correction.style.display = 'block';
        } else {
            create_acc.style.display = 'block';
            form.reset();
            form.style.display = 'none';
        }
    }
    else if (as==="Administrator") {
        const enteredAdminType = document.querySelector('input[name="admin"]:checked').value;
        let adminData = { Name: enteredName, AdminType: enteredAdminType, UserName: enteredUserName, Password: enteredPassword };
        const response = await fetch('/signup/admin', {
            method: 'POST',
            body: JSON.stringify(adminData),
            headers: {
                'Content-Type': 'application/json'
            }
        })
        const resData = await response.json();
        if (resData.added==false) {
            correction.style.display = 'block';
        } else {
            create_acc.style.display = 'block';
            form.reset();
            form.style.display = 'none';
        }
    }
}

options.addEventListener('click',clickType);
fac.addEventListener('click',batchShow);
staff.addEventListener('click',hostelShow);
form.addEventListener('submit',saveData);