const add_task = document.getElementById('add-task-btn');
const cancel_task = document.getElementById('cancel-task');
const submit_task = document.getElementById('submit-task');
const add_category = document.getElementById('add-category-btn')
const cancel_category_form = document.getElementById('cancel-category');
const task_fill_form = document.getElementsByClassName('form-bg')[0];
const task_edit_form = document.getElementsByClassName('form-bg')[1];
const add_category_form = document.getElementsByClassName('form-bg')[2];

const open_add_category_form = ()=>{
    add_category_form.style.display = 'block';
}

const cancel_add_category_form = () =>{
    add_category_form.style.display = 'none';
}

const open_add_task_form = ()=>{
    task_fill_form.style.display = 'block';
}

const cancel_add_task_form = ()=>{
    document.getElementById('add-task-form').reset();
    task_fill_form.style.display = 'none';
}

const  edit_task_form = (e)=>{

    task_edit_form.style.display = 'block';
    
    let desc = e.target.closest('.task-row').children[1].innerText;
    let category = e.target.closest('.task-row').children[2].innerText;
    let deadline = e.target.closest('.task-row').children[3].innerText;
    let priority = e.target.closest('.task-row').children[4].innerText;


    document.getElementById('hidden-task-id').value = e.target.closest('.task-row').getAttribute('data-id');
    document.getElementById('edit-task-desc').value = desc;
    document.getElementById('edit-task-cat').value = category;
    document.getElementById('edit-task-deadline').value = deadline;
    document.getElementById('edit-task-priority').value = priority;

    
}

const cancel_edit_task_form = () =>{
    document.getElementById('edit-task-form').reset();
    task_edit_form.style.display = 'none';
}



//send put request for editing tasks

const edit_task_form_request = (e)=>{

    e.preventDefault();

    let id = document.getElementById('hidden-task-id').value;
    let task = document.getElementById('edit-task-desc').value;
    let cat = document.getElementById('edit-task-cat').value;
    let deadline = document.getElementById('edit-task-deadline').value;
    let priority = document.getElementById('edit-task-priority').value;


    fetch(`/tasks/id/${id}`,{
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            task: document.getElementById('edit-task-desc').value,
            cat: document.getElementById('edit-task-cat').value,
            deadline: document.getElementById('edit-task-deadline').value,
            priority: document.getElementById('edit-task-priority').value
        })

    }).then(async response =>{
        if(response.redirected){
            window.location.href = response.url;
        }
    });

}



//send delete request for deleting tasks

const delete_task_request = (e)=>{

    let id = e.target.closest('.task-row').getAttribute('data-id');

    fetch(`/tasks/id/${id}`,{
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        }

    }).then(async response =>{
        if(response.redirected){
            window.location.href = response.url;
        }
    });

}


//send get request for getting tasks of partcular category
const change_category = (e) => {

    let cat = e.target.innerText;

    fetch(`/tasks/category/v1?cat=${cat}`)
    .then(async response =>{
        if(response.ok){
            window.location.href = response.url;
        }
        if(response.redirected){
            window.location.href = response.url;
        }

        Array.from(document.getElementsByClassName('category-opt')).forEach(element => {
            element.classList.remove('category-on')
        })
    
        e.target.classList.add('category-on');
    });

    

}


//send get request for getting tasks of partcular category
const change_status = (e) => {

    let status = e.target.innerText;

    fetch(`/tasks/status/v1?status=${status}`)
    .then(async response =>{
        if(response.ok){
            window.location.href = response.url;
        }
        if(response.redirected){
            window.location.href = response.url;
        }
    }).then(data =>{
        Array.from(document.getElementsByClassName('status-opt')).forEach(element => {
            element.classList.remove('status-on');
        })
    
        e.target.classList.add('status-on');
    })
}


//check completion of task
const completion_task = (e) =>{
    fetch('/tasks/changedstatus',{
        method:'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body:JSON.stringify({
            status: e.target.checked,
            id: e.target.closest('.task-row').getAttribute('data-id')
        })
    }).then(async response =>{
        if(response.redirected){
            window.location.href = response.url;
        }
    });
}


//event listener for checking completion status
Array.from(document.getElementsByClassName('task-completion')).forEach(element => {
    element.addEventListener('click',completion_task);
})


//event listener for selecting status
Array.from(document.getElementsByClassName('status-opt')).forEach(element => {
    element.addEventListener('click',change_status);
})


//event listener for selecting category
Array.from(document.getElementsByClassName('category-opt')).forEach(element => {
    element.addEventListener('click',change_category);
})


//event listener for delete task button
Array.from(document.getElementsByClassName('del-btn')).forEach(element => {
    element.addEventListener('click',delete_task_request);
});


//event listener for submitting edit task form
document.getElementById('submit-edit-task').addEventListener('click',edit_task_form_request);


//event listener for edit task button
Array.from(document.getElementsByClassName('edit-btn')).forEach(element => {
    element.addEventListener('click',edit_task_form);
});


//event listener for cancelling edit task form
document.getElementById('cancel-edit').addEventListener('click',cancel_edit_task_form);


//event listener for add task button
add_task.addEventListener('click',open_add_task_form);


//event listener for cancelling add task form
cancel_task.addEventListener('click',cancel_add_task_form);

//event listener for add category button
add_category.addEventListener('click',open_add_category_form);

//event listener for cancel add category form
cancel_category_form.addEventListener('click',cancel_add_category_form);

//strikethrough completed task
Array.from(document.getElementsByClassName('task-status')).forEach(element=>{
    if(element.innerText == 'Completed'){
        element.closest('.task-row').children[1].style.textDecoration = 'line-through';
        element.closest('.task-row').children[2].style.textDecoration = 'line-through';
        element.closest('.task-row').children[3].style.textDecoration = 'line-through';
    }
})

//logout
document.getElementById('logout-btn').addEventListener('click', ()=>{
    fetch('/logout')
    .then(async response =>{
        if(response.ok){
            
        }
        if(response.redirected){
            window.location.href = response.url;
        }
    });

})