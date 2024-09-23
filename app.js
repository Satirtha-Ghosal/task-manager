const express = require('express');
const app = express();

const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const cookie = require('cookie-parser');
const ejs = require('ejs');

//read database
let tasks;

fs.readFile('./tasks.json', 'utf8', (err, data) => {

    try {
        tasks = JSON.parse(data);
        console.log(tasks);
    }
    catch (err) {
        console.log(err);
    }
})


//middlewares

app.use(express.static(path.join(__dirname, 'static')));
app.use(express.urlencoded({ extended: true }));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(cookie());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store');
    next();
});


//login/signup page handling
app.get('/', (req, res) => {
    if (req.cookies.currentUser) {
        res.redirect('/tasks');
    }
    else {
        res.render('login.ejs');
    }

})



//login
app.post('/login', (req, res) => {

    let username = req.body.username;
    let password = req.body.password;


    let auth = false;

    tasks.users.forEach(element => {
        if ((element.username === username) && (element.password === password)) {
            auth = true;
            return;
        }
    });

    if (auth === true) {
        res.cookie('currentUser', username, {
            httpOnly: true,
            secure: false,
            maxAge: 2 * 24 * 60 * 60 * 1000 //2 days
        });

        res.redirect('/tasks')
    }

    else {
        res.redirect('/');
    }

})


//signup
app.post('/signup', (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    const new_user = {
        "username": username,
        "password": password,
        "category": [
            "Coding",
            "Shopping",
            "Work"],
        "tasks": []
    }

    tasks.users.push(new_user);

    fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), 'utf-8', (err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    })
})



//tasks page
app.get('/tasks', (req, res) => {

    let currentUser = req.cookies.currentUser;

    if (currentUser) {
        let temp = tasks.users.filter(element => {
            return (element.username == currentUser);
        });

        res.render('task', { data: temp[0], currentStatus: req.body.status, category: null });
    }

    else {
        res.redirect('/');
    }
})



//add task
app.post('/tasks', (req, res) => {

    let currentUser = req.cookies.currentUser;


    let desc = req.body.task;
    let cat = req.body.cat;
    let deadline = req.body.deadline;
    let priority = req.body.priority;


    let id = 1;
    tasks.users.forEach(element => {
        if (element.username === currentUser) {
            element.tasks.forEach(info => {
                if (id == info.id) {
                    id++;
                }
                else {
                    return;
                }
            })

            let new_task = {
                "description": desc,
                "deadline": deadline,
                "category": cat,
                "priority": priority,
                "status": false,
                "id": id
            }

            element.tasks.push(new_task);

        }
    })

    fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), 'utf-8', (err) => {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect('/tasks');
        }
    })

})


//edit task

app.put(`/tasks/id/:id`, (req, res) => {

    let currentUser = req.cookies.currentUser;

    let desc = req.body.task;
    let cat = req.body.cat;
    let deadline = req.body.deadline;
    let priority = req.body.priority;


    const { id } = req.params;

    console.log(id);
    console.log(priority)

    tasks.users.forEach(element => {
        if (element.username === currentUser) {
            element.tasks.forEach(info => {
                if (info.id == id) {
                    info.description = desc;
                    info.category = cat;
                    info.deadline = deadline;
                    info.priority = priority;
                }
            })
        }
    });

    fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), 'utf-8', (err) => {
        if (err) {
            res.status(404).send("error");
        }
        else {
            res.redirect('/tasks');
        }
    })
})



//delete task

app.delete(`/tasks/id/:id`, (req, res) => {

    let currentUser = req.cookies.currentUser;

    const { id } = req.params;

    tasks.users.forEach(element => {
        if (element.username === currentUser) {
            element.tasks.forEach((info, index) => {
                if (info.id == id) {
                    element.tasks.splice(index, 1);
                }
            })
        }
    });

    fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), 'utf-8', (err) => {
        if (err) {
            res.status(404).send("error");
        }
        else {
            res.redirect('/tasks');
        }
    })
});


//filter category

app.get(`/tasks/category/v1`, (req, res) => {

    let { cat } = req.query;
    let currentUser = req.cookies.currentUser;

    if (currentUser) {

        if (cat != 'All') {

            let temp = tasks.users.filter(element => {
                return ((element.username == currentUser));
            });

            let filteredTasks = temp[0].tasks.filter(task => task.category === cat);

            let result = [{
                username: temp[0].username,
                password: temp[0].password,
                category: temp[0].category,
                tasks: filteredTasks
            }];

            temp = result;

            res.render('task', { data: temp[0], currentStatus: req.body.status, category: cat });

        }

        else {
            res.redirect('/tasks');
        }
    }

    else {
        res.redirect('/');
    }

});


//filter status

app.get(`/tasks/status/v1`, (req, res) => {

    console.log(req.query.status);

    let status;
    if (req.query.status == 'Pending') {
        status = false;
    }
    else if (req.query.status == 'Complete') {
        status = true;
    }
    else {
        status = 'All';
    }

    let currentUser = req.cookies.currentUser;

    if (currentUser) {

        if (status != 'All') {

            let temp = tasks.users.filter(element => {
                return ((element.username == currentUser));
            });

            let filteredTasks = temp[0].tasks.filter(task => task.status === status);

            let result = [{
                username: temp[0].username,
                password: temp[0].password,
                category: temp[0].category,
                tasks: filteredTasks
            }];

            temp = result;

            if (status !== 'All') {
                res.render('task', { data: temp[0], currentStatus: req.query.status, category: null });
            }
            else {
                res.render('task', { data: temp[0] });
            }


        }

        else {
            res.redirect('/tasks');
        }
    }

    else {
        res.redirect('/');
    }

});


//change task completion status

app.put('/tasks/changedstatus', (req, res) => {

    let currentUser = req.cookies.currentUser;

    let id = req.body.id;
    let status = req.body.status;

    tasks.users.forEach(element => {
        if (element.username === currentUser) {
            element.tasks.forEach((info, index) => {
                if (info.id == id) {
                    console.log(status);
                    info.status = status;
                }
            })
        }
    });

    fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), 'utf-8', (err) => {
        if (err) {
            res.status(404).send("error");
        }
        else {
            res.redirect('/tasks');
        }
    })

})


//add category

app.post('/add-category', (req, res) => {

    let currentUser = req.cookies.currentUser;
    let category = req.body.category;

    tasks.users.forEach(element => {
        if (element.username === currentUser) {
            element.category.push(category);
            return;
        }
    });

    fs.writeFile('tasks.json', JSON.stringify(tasks, null, 2), 'utf-8', (err) => {
        if (err) {
            res.status(404).send("error");
        }
        else {
            res.redirect('/tasks');
        }
    })

})


//logout

app.get('/logout', (req, res) => {
    res.clearCookie('currentUser', { path: '/' });

    res.redirect('/');
})


app.listen(8800);