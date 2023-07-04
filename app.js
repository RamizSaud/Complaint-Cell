const path = require("path");
const express = require("express");
const db = require("./data/database").db;
const mysql = require("./data/database").mysql;
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);

const app = express();

const connection = mysql.createPool({
  host: "localhost",
  port: 3306,
  user: "root",
  password: "Mramizsaud98%",
  database: "cell",
});
const sessionStore = new MySQLStore({}, connection);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "super-secret",
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
  })
);

app.use(async function (req, res, next) {
  if (req.session.user) {
    if (req.session.user.type !== "student") {
      res.locals.userType = req.session.user.type;
    }
    if (req.session.user.type == "admin") {
      const [result] = await db.query(
        "SELECT type FROM admin WHERE admin_id = ?",
        [req.session.user.id]
      );
      if (result[0].type == "rector") {
        res.locals.rector = "rector";
      }
    }
  }
  next();
});

app.get("/", function (req, res) {
  res.render("main");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.get("/signup", function (req, res) {
  res.render("signup");
});

app.post("/signup/student", async function (req, res) {
  const data = [
    req.body.RegNo,
    req.body.Name,
    req.body.Batch,
    req.body.RoomNo,
    req.body.Faculty,
    req.body.Hostel,
    req.body.UserName,
    req.body.Password,
  ];
  const [result] = await db.query(
    "SELECT student_username FROM student WHERE student_username=?",
    [req.body.UserName]
  );
  if (result[0]) {
    return res.json({ message: "Student already exists", added: false });
  }
  await db.query(
    "INSERT INTO student (regno,name,batch,room_no,faculty,hostel,student_username,student_password) VALUES (?)",
    [data]
  );
  res.json({ message: "Student data added!", added: true });
});

app.post("/signup/faculty", async function (req, res) {
  const data = [
    req.body.Name,
    req.body.Faculty,
    req.body.FacType,
    req.body.UserName,
    req.body.Password,
  ];
  const [result] = await db.query(
    "SELECT faculty_username FROM faculty_member WHERE faculty_username=?",
    [req.body.UserName]
  );
  if (result[0]) {
    return res.json({ message: "faculty member already exists", added: false });
  }
  await db.query(
    "INSERT INTO faculty_member (name,faculty,type,faculty_username,faculty_password) VALUES (?)",
    [data]
  );
  if (req.body.Batch) {
    const [result] = await db.query(
      "SELECT faculty_id FROM faculty_member WHERE name=? AND faculty=? AND type=? AND faculty_username=? AND faculty_password=?",
      data
    );
    await db.query("INSERT INTO advisor (advisor_id,batch) VALUES (?,?)", [
      result[0].faculty_id,
      req.body.Batch,
    ]);
  }
  res.json({ message: "Faculty member data added!", added: true });
});

app.post("/signup/staff", async function (req, res) {
  const data = [
    req.body.Name,
    req.body.StaffType,
    req.body.UserName,
    req.body.Password,
  ];
  const [result] = await db.query(
    "SELECT staff_username FROM staff WHERE staff_username=?",
    [req.body.UserName]
  );
  if (result[0]) {
    return res.json({ message: "Staff already exists", added: false });
  }
  await db.query(
    "INSERT INTO staff (name,type,staff_username,staff_password) VALUES (?)",
    [data]
  );
  if (req.body.Hostel) {
    const [result] = await db.query(
      "SELECT staff_id FROM staff WHERE name=? AND type=? AND staff_username=? AND staff_password=?",
      data
    );
    await db.query("INSERT INTO warden (warden_id,hostel) VALUES (?,?)", [
      result[0].staff_id,
      req.body.Hostel,
    ]);
  }
  res.json({ message: "Staff data added!", added: true });
});

app.post("/signup/admin", async function (req, res) {
  const data = [
    req.body.Name,
    req.body.AdminType,
    req.body.UserName,
    req.body.Password,
  ];
  const [result] = await db.query(
    "SELECT admin_username FROM admin WHERE admin_username=?",
    [req.body.UserName]
  );
  if (result[0]) {
    return res.json({ message: "Admin already exists", added: false });
  }
  await db.query(
    "INSERT INTO admin (name,type,admin_username,admin_password) VALUES (?)",
    [data]
  );
  res.json({ message: "Admin data added!", added: true });
});

app.post("/login", async function (req, res) {
  let result;
  let userType;
  if (req.body.as === "Student") {
    [result] = await db.query(
      "SELECT student_id as id,student_username as user_name FROM student WHERE student_username=? AND student_password=?",
      [req.body.UserName, req.body.Password]
    );
    userType = "student";
  } else if (req.body.as === "Faculty Member") {
    [result] = await db.query(
      "SELECT faculty_id as id,faculty_username as user_name FROM faculty_member WHERE faculty_username=? AND faculty_password=?",
      [req.body.UserName, req.body.Password]
    );
    userType = "faculty_member";
  } else if (req.body.as === "Staff") {
    [result] = await db.query(
      "SELECT staff_id as id,staff_username as user_name FROM staff WHERE staff_username=? AND staff_password=?",
      [req.body.UserName, req.body.Password]
    );
    userType = "staff";
  } else if (req.body.as === "Administrator") {
    [result] = await db.query(
      "SELECT admin_id as id,admin_username as user_name FROM admin WHERE admin_username=? AND admin_password=?",
      [req.body.UserName, req.body.Password]
    );
    userType = "admin";
  }
  if (result[0]) {
    req.session.user = {
      id: result[0].id,
      user_name: result[0].user_name,
      type: userType,
    };
    req.session.isAuthenticated = true;
    req.session.save(function () {
      res.json({ message: "Logged In", loggedIn: true });
    });
  } else {
    res.json({ message: "User Denied", loggedIn: false });
  }
});

app.get("/issueComplaint", function (req, res) {
  if (!req.session.isAuthenticated) {
    return res.status(401).render("<h1>NOT Auth</h1>");
  }
  res.render("issueComplaint");
});

app.get("/receivedComplaints", async function (req, res) {
  const query = `
    SELECT co.*, DATE_FORMAT(co.start_time,"%M %d %Y") AS start_date, DATE_FORMAT(co.end_time,"%M %d %Y") AS end_date, s.regno AS regno,s.name, NULL as type
    FROM cell.complaint co 
    INNER JOIN cell.casts c 
    ON co.complaint_id = c.complaint_id
    INNER JOIN cell.student s
    ON c.sender_id = s.student_id
    WHERE c.receiver_type = ? AND c.receiver_id = ${req.session.user.id} AND c.sender_type = 'student'
    UNION
    SELECT co.*, DATE_FORMAT(co.start_time,"%M %d %Y") AS start_date, DATE_FORMAT(co.end_time,"%M %d %Y") AS end_date, NULL AS regno,s.name, s.type AS type
    FROM cell.complaint co 
    INNER JOIN cell.casts c 
    ON co.complaint_id = c.complaint_id
    INNER JOIN cell.staff s
    ON c.sender_id = s.staff_id
    WHERE c.receiver_type = ? AND c.receiver_id = ${req.session.user.id} AND c.sender_type = 'staff'
    UNION
    SELECT co.*, DATE_FORMAT(co.start_time,"%M %d %Y") AS start_date, DATE_FORMAT(co.end_time,"%M %d %Y") AS end_date, NULL AS regno,s.name, s.type AS type
    FROM cell.complaint co 
    INNER JOIN cell.casts c 
    ON co.complaint_id = c.complaint_id
    INNER JOIN cell.admin s
    ON c.sender_id = s.admin_id
    WHERE c.receiver_type = ? AND c.receiver_id = ${req.session.user.id} AND c.sender_type = 'admin'
    UNION
    SELECT co.*, DATE_FORMAT(co.start_time,"%M %d %Y") AS start_date, DATE_FORMAT(co.end_time,"%M %d %Y") AS end_date, NULL AS regno,s.name, s.type AS type
    FROM cell.complaint co 
    INNER JOIN cell.casts c 
    ON co.complaint_id = c.complaint_id
    INNER JOIN cell.faculty_member s
    ON c.sender_id = s.faculty_id
    WHERE c.receiver_type = ? AND c.receiver_id = ${req.session.user.id} AND c.sender_type = 'faculty_member'
    ORDER BY status DESC
    `;
  const [complaints] = await db.query(query, [
    req.session.user.type,
    req.session.user.type,
    req.session.user.type,
    req.session.user.type,
  ]);
  res.render("receivedComplaints", { complaints: complaints });
});

app.get("/sentComplaints", async function (req, res) {
  const query = `
    SELECT co.*, DATE_FORMAT(co.start_time,"%M %d %Y") AS start_date, DATE_FORMAT(co.end_time,"%M %d %Y") AS end_date,r.name, r.faculty as faculty, r.type
    FROM cell.complaint co 
    INNER JOIN cell.casts c 
    ON co.complaint_id = c.complaint_id
    INNER JOIN cell.faculty_member r
    ON c.receiver_id = r.faculty_id
    WHERE c.receiver_type = 'faculty_member'  AND c.sender_id = ${req.session.user.id} AND c.sender_type = ?
    UNION
    SELECT co.*, DATE_FORMAT(co.start_time,"%M %d %Y") AS start_date, DATE_FORMAT(co.end_time,"%M %d %Y") AS end_date,r.name, NULL as faculty, r.type
    FROM cell.complaint co 
    INNER JOIN cell.casts c 
    ON co.complaint_id = c.complaint_id
    INNER JOIN cell.staff r
    ON c.receiver_id = r.staff_id
    WHERE c.receiver_type = 'staff' AND c.sender_id = ${req.session.user.id} AND c.sender_type = ?
    UNION
    SELECT co.*, DATE_FORMAT(co.start_time,"%M %d %Y") AS start_date, DATE_FORMAT(co.end_time,"%M %d %Y") AS end_date,r.name, NULL as faculty, r.type
    FROM cell.complaint co 
    INNER JOIN cell.casts c 
    ON co.complaint_id = c.complaint_id
    INNER JOIN cell.admin r
    ON c.receiver_id = r.admin_id
    WHERE c.receiver_type = 'admin' AND c.sender_id = ${req.session.user.id} AND c.sender_type = ?
    `;
  const [complaints] = await db.query(query, [
    req.session.user.type,
    req.session.user.type,
    req.session.user.type,
  ]);
  res.render("sentComplaints", { complaints: complaints });
});

app.get("/logout", function (req, res) {
  req.session.user = null;
  req.session.isAuthenticated = false;
  res.redirect("/");
});

app.post("/getTypes", async function (req, res) {
  let result;
  if (req.body.user_type == "faculty_member") {
    [result] = await db.query("SELECT * FROM faculty_member WHERE type=?", [
      req.body.type_val,
    ]);
  } else if (req.body.user_type == "staff") {
    [result] = await db.query("SELECT * FROM staff WHERE type=?", [
      req.body.type_val,
    ]);
  } else if (req.body.user_type == "admin") {
    [result] = await db.query("SELECT * FROM admin WHERE type=?", [
      req.body.type_val,
    ]);
  }
  res.json({ types_data: result });
});

app.post("/issueComplaint", async function (req, res) {
  await db.query(
    "INSERT INTO complaint (subject,detail,urgency,status) VALUES (?,?,?,?)",
    [req.body.subject, req.body.detail, req.body.urgency, "not complete"]
  );
  const [com_id] = await db.query(
    "SELECT complaint_id FROM complaint WHERE subject=? AND detail=? AND urgency=?",
    [req.body.subject, req.body.detail, req.body.urgency]
  );
  await db.query(
    "INSERT INTO casts (complaint_id,sender_id,receiver_id,sender_type,receiver_type) VALUES (?,?,?,?,?)",
    [
      com_id[0].complaint_id,
      req.session.user.id,
      req.body.id,
      req.session.user.type,
      req.body.receiverType,
    ]
  );
  res.json({ message: "Sent" });
});

app.get("/dashboard", async function (req, res) {
  const [total_complaints] = await db.query(
    "SELECT COUNT(DISTINCT complaint_id) AS total_complaints FROM cell.complaint"
  );
  const [pending_complaints] = await db.query(
    `SELECT COUNT(DISTINCT complaint_id) AS pending_complaints FROM cell.complaint WHERE status='not complete'`
  );
  const [resolved_complaints] = await db.query(
    `SELECT COUNT(Distinct complaint_id) AS resolved_complaints FROM cell.complaint WHERE status='complete'`
  );
  const [avg_sat] = await db.query(`
    SELECT c.receiver_type, AVG(co.satisfaction) AS satisfaction
    FROM cell.complaint co INNER JOIN cell.casts c
    ON co.complaint_id = c.complaint_id
    GROUP BY c.receiver_type
    `);
  const [per_rec] = await db.query(`
    SELECT c.receiver_type, COUNT(*) AS counts
    FROM cell.complaint co INNER JOIN cell.casts c
    ON co.complaint_id = c.complaint_id
    GROUP BY c.receiver_type
    `);
  const [per_sen] = await db.query(`
    SELECT c.sender_type, COUNT(*) AS counts
    FROM cell.complaint co INNER JOIN cell.casts c
    ON co.complaint_id = c.complaint_id
    GROUP BY c.sender_type
    `);
  const [per_ur] = await db.query(`
    SELECT co.urgency, COUNT(*) as counts
    FROM cell.complaint co
    GROUP BY co.urgency
    `);
  const [per_day] = await db.query(`
    SELECT DATE_FORMAT(start_time,'%d %M %Y') as day, COUNT(*) as queries_launched
    FROM cell.complaint 
    WHERE MONTH(start_time) = MONTH(CURRENT_DATE())
    GROUP BY day(start_time)
    `);
  const [per_mon] = await db.query(`
    SELECT DATE_FORMAT(start_time,'%M') as month, COUNT(*) as queries_launched
    FROM cell.complaint 
    WHERE YEAR(start_time) = YEAR(CURRENT_DATE())
    GROUP BY MONTH(start_time)
    `);
  res.render("dashboard", {
    total_complaints: total_complaints[0],
    pending_complaints: pending_complaints[0],
    resolved_complaints: resolved_complaints[0],
    avg_sat: avg_sat,
    per_rec: per_rec,
    per_sen: per_sen,
    per_ur: per_ur,
    per_day: per_day,
    per_mon: per_mon,
  });
});

app.post("/completeTask", async function (req, res) {
  await db.query(
    "UPDATE complaint SET status = ?, end_time = CURRENT_TIMESTAMP() WHERE complaint_id = ?",
    ["complete", req.body.complaint_id]
  );
  res.json({ message: "completed!" });
});

app.post("/checkRating", async function (req, res) {
  await db.query(
    "UPDATE complaint SET satisfaction = ? WHERE complaint_id = ?",
    [req.body.satisfaction, req.body.complaint_id]
  );
  res.json({ message: "checked!" });
});

app.get("/showVisualization", async function (req, res) {
  const [avg_sat] = await db.query(`
    SELECT c.receiver_type, AVG(co.satisfaction) AS satisfaction
    FROM cell.complaint co INNER JOIN cell.casts c
    ON co.complaint_id = c.complaint_id
    GROUP BY c.receiver_type
    `);
  const [per_rec] = await db.query(`
    SELECT c.receiver_type, COUNT(*) AS counts
    FROM cell.complaint co INNER JOIN cell.casts c
    ON co.complaint_id = c.complaint_id
    GROUP BY c.receiver_type
    `);
  const [per_sen] = await db.query(`
    SELECT c.sender_type, COUNT(*) AS counts
    FROM cell.complaint co INNER JOIN cell.casts c
    ON co.complaint_id = c.complaint_id
    GROUP BY c.sender_type
    `);
  const [per_ur] = await db.query(`
    SELECT co.urgency, COUNT(*) as counts
    FROM cell.complaint co
    GROUP BY co.urgency
    `);
  const [per_day] = await db.query(`
    SELECT DATE_FORMAT(start_time,'%d %M %Y') as day, COUNT(*) as queries_launched
    FROM cell.complaint 
    WHERE MONTH(start_time) = MONTH(CURRENT_DATE())
    GROUP BY day(start_time)
    `);
  const [per_mon] = await db.query(`
    SELECT DATE_FORMAT(start_time,'%M') as month, COUNT(*) as queries_launched
    FROM cell.complaint 
    WHERE YEAR(start_time) = YEAR(CURRENT_DATE())
    GROUP BY MONTH(start_time)
    `);
  res.json({
    avg_sat: avg_sat,
    per_rec: per_rec,
    per_sen: per_sen,
    per_ur: per_ur,
    per_day: per_day,
    per_mon: per_mon,
  });
});

app.listen(3000);
