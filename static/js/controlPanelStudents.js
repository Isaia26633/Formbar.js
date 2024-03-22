// makes student elements

function buildOption(value, text, selected = false) {
    let option = document.createElement('option')
    option.value = value
    option.selected = selected
    option.textContent = text
    return option
}
var userBreak = []
var rooms;

function buildStudent(room, studentData) {
    console.log(
        'studentData', studentData,
        'currentUser', currentUser
    );

    if (studentData.classPermissions < currentUser.classPermissions) {
        newStudent = document.createElement("details");
        newStudent.classList.add("student");
        let studentElement = document.createElement("summary");
        studentElement.innerText = studentData.username;
        let space = document.createElement('span')
        space.textContent = ' '
        studentElement.appendChild(space)
        for (let eachResponse in room.poll.responses) {
            if (eachResponse == studentData.pollRes.buttonRes) {
                studentElement.style.color = room.poll.responses[eachResponse].color
            }
        }
        if (studentData.help) {
            let helpDisplay = document.createElement('span')
            helpDisplay.textContent = `❗`
            studentElement.appendChild(helpDisplay)
            let help = document.createElement('p')
            help.setAttribute('id', 'help')
            help.textContent = 'sent help ticket'
            if (studentData.help.reason) {
                let helpReason = document.createElement('p')
                helpReason.textContent = `reason ${studentData.help.reason} `
                help.appendChild(helpReason)
            }
            let helpTimeDisplay = document.createElement('p')
            helpTimeDisplay.textContent = `at ${studentData.help.time.hours}:${studentData.help.time.minutes}:${studentData.help.time.seconds} `
            help.appendChild(helpTimeDisplay)
            let deleteTicketButton = document.createElement('button')
            deleteTicketButton.classList.add('quickButton')
            deleteTicketButton.dataset.studentName = studentData.username
            deleteTicketButton.onclick = (event) => {
                deleteTicket(event.target)
            }
            deleteTicketButton.textContent = 'Delete Ticket'
            help.appendChild(deleteTicketButton)
            newStudent.appendChild(help)
            let lineBreak = document.createElement('br')
        }
        if (studentData.break) {
            let helpDisplay = document.createElement('span')
            helpDisplay.textContent = `⏱`
            studentElement.appendChild(helpDisplay)
        }
        // if (studentData.pollRes) {
        // 	let pollDisplay = document.createElement('span')
        // 	pollDisplay.textContent = (studentData.pollRes.buttonRes || studentData.pollRes.textRes || studentData.pollRes.pollTextRes)
        // 	studentElement.appendChild(pollDisplay)
        // }
        newStudent.appendChild(studentElement);
        let permissionSwitch = document.createElement("select");
        permissionSwitch.setAttribute("name", "permSwitch");
        permissionSwitch.setAttribute("class", "permSwitch");
        permissionSwitch.setAttribute("data-username", studentData.username);
        permissionSwitch.onchange = (event) => {
            socket.emit('classPermChange', event.target.dataset.username, Number(event.target.value))
        }

        permissionSwitch.add(buildOption(
            TEACHER_PERMISSIONS,
            'Teacher',
            studentData.classPermissions == TEACHER_PERMISSIONS
        ))
        permissionSwitch.add(buildOption(
            MOD_PERMISSIONS,
            'Mod',
            studentData.classPermissions == MOD_PERMISSIONS
        ))
        permissionSwitch.add(buildOption(
            STUDENT_PERMISSIONS,
            'Student',
            studentData.classPermissions == STUDENT_PERMISSIONS
        ))
        permissionSwitch.add(buildOption(
            GUEST_PERMISSIONS,
            'Guest',
            studentData.classPermissions == GUEST_PERMISSIONS
        ))

        let toggleDialog = document.createElement('button')
        toggleDialog.textContent = 'Tags'
        toggleDialog.addEventListener('click', function () {
            studentTags.showModal()
        })

        let studentTags = document.createElement('dialog');
        studentTags.innerHTML = '<p>' + studentData + '</p>';
        let closeButton = document.createElement('button');
        closeButton.textContent = 'Save';
        let newTagButton = document.createElement('button');
        newTagButton.textContent = 'New Tag';
        let newTagForm = document.createElement('form');
        newTagForm.setAttribute('hidden', true);
        //newTagButton.appendChild(newTagForm);
        let newTagTextBox = document.createElement('input');
        newTagTextBox.setAttribute('type', 'text');
        newTagTextBox.setAttribute('hidden', true);
        newTagForm.appendChild(newTagTextBox);
        let newTagSaveButton = document.createElement('button');
        newTagSaveButton.textContent = 'Save Tag';
        newTagSaveButton.setAttribute('hidden', true);
        newTagForm.appendChild(newTagSaveButton);
        let tagForm = document.createElement('form');
        tagForm.setAttribute('id', studentData.username + "tags");
        for (let i = 0; i < room.tagNames.length; i++) {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = `checkbox${room.tagNames[i]}`;
            checkbox.value = room.tagNames[i];
            if (studentData.tags != null && studentData.tags != undefined) {
                studentData.tags.split(",").forEach(tag => {
                    if (tag == room.tagNames[i]) {
                        checkbox.checked = true;
                    }
                })
            };
            let label = document.createElement('label');
            label.textContent = room.tagNames[i];
            label.setAttribute('for', `checkbox${i}`);

            tagForm.appendChild(checkbox);
            tagForm.appendChild(label);
            tagForm.appendChild(document.createElement('br'));
        }
        studentTags.appendChild(tagForm)
        document.body.appendChild(studentTags)
        closeButton.addEventListener('click', function () {
            studentData.tags = ''
            var allTags = ''
            let checkboxForm = document.getElementById(studentData.username + 'tags')
            let checkboxes = checkboxForm.getElementsByTagName('input')
            for (let i = 0; i < checkboxes.length; i++) {
                let checkbox = checkboxes[i]
                // Check if the checkbox is checked
                if (checkbox.type === 'checkbox') {
                    if (checkbox.checked) {
                        // Add the checkbox value to the studentData.tags array
                        allTags += checkbox.value + ', '
                    }
                }
            }
            studentData.tags = allTags.split(', ')
            studentData.tags.pop()
            studentData.tags.sort()
            socket.emit('saveTags', studentData.id, studentData.tags, studentData.username)
            studentTags.close()
        })

        newTagButton.addEventListener('click', function () {
            newTagForm.removeAttribute('hidden');
            newTagTextBox.removeAttribute('hidden');
            newTagSaveButton.removeAttribute('hidden');
            newTagButton.setAttribute('hidden', true);
        });

        newTagSaveButton.addEventListener('click', function () {
            newTagButton.removeAttribute('hidden');
            socket.emit('newTag', newTagTextBox.value);
        })

        studentTags.appendChild(newTagButton);
        studentTags.appendChild(newTagForm);

        // Create a checkbox for the student
        let studentCheckbox = document.createElement("input");
        studentCheckbox.type = "checkbox";
        studentCheckbox.id = "checkbox_" + studentData.username;
        studentCheckbox.name = "studentCheckbox";
        studentCheckbox.addEventListener("contextmenu", function () {
            event.preventDefault();
            studentCheckbox.indeterminate = !studentCheckbox.indeterminate
        })



        newStudent.appendChild(studentCheckbox)
        studentTags.appendChild(closeButton)
        newStudent.appendChild(toggleDialog)
        newStudent.appendChild(permissionSwitch)
        newStudent.append(' ')
        let banStudentButton = document.createElement('button')
        banStudentButton.className = 'banStudent quickButton'
        banStudentButton.setAttribute('data-user', studentData.username)
        banStudentButton.textContent = 'Ban User'
        banStudentButton.onclick = (event) => {
            socket.emit('classBanUser', studentData.username)
        }
        newStudent.appendChild(banStudentButton)
        let kickUserButton = document.createElement('button')
        kickUserButton.className = 'kickUser quickButton'
        kickUserButton.setAttribute('data-userid', studentData.username)
        kickUserButton.onclick = (event) => {
            socket.emit('classKickUser', studentData.username)
        }
        kickUserButton.textContent = 'Kick User'
        newStudent.appendChild(kickUserButton)
    }
    else {
        newStudent = document.createElement("div");
        let studentElement = document.createElement("p");
        studentElement.innerText = studentData.username;
        newStudent.appendChild(studentElement);
    }
    newStudent.setAttribute('id', `student-${studentData.username}`);
    if (studentData.break == true) {
        userBreak.push(studentData.username)
        let breakText = document.createElement('p')
        breakText.textContent += 'taking a break'
        newStudent.appendChild(breakText)
    }
    else if (studentData.break) {
        let breakDiv = document.createElement('div')
        breakDiv.setAttribute('id', 'break')
        let breakNeeded = document.createElement('p')
        breakNeeded.textContent = 'Needs a break'
        breakDiv.appendChild(breakNeeded)
        let breakReason = document.createElement('p')
        breakReason.textContent = `Reason: ${studentData.break} `
        breakDiv.appendChild(breakReason)
        let breakApprove = document.createElement('button')
        breakApprove.classList.add('quickButton')
        breakApprove.onclick = () => { approveBreak(true, studentData.username) }
        breakApprove.textContent = 'Approve'
        breakDiv.appendChild(breakApprove)
        let breakDeny = document.createElement('button')
        breakDeny.classList.add('quickButton')
        breakDeny.onclick = () => { approveBreak(false, studentData.username) }
        breakDeny.textContent = 'Deny'
        breakDiv.appendChild(breakDeny)
        newStudent.appendChild(breakDiv)
        let lineBreak = document.createElement('br')
        newStudent.appendChild(lineBreak)
    }
    if (studentData.pollTextRes) {
        let pollTextResponse = document.createElement('p')
        pollTextResponse.textContent = `Poll Text: ${studentData.pollRes.textRes} `
        newStudent.appendChild(pollTextResponse)
    }
    if (studentData.pollRes.buttonRes) {
        let pollResponse = document.createElement('p')
        pollResponse.textContent = `Poll: ${studentData.pollRes.buttonRes} `
        for (let eachResponse in room.poll.responses) {
            if (eachResponse == studentData.pollRes.buttonRes) {
                pollResponse.style.color = room.poll.responses[eachResponse].color
            }
        }
        newStudent.appendChild(pollResponse)
    }
    if (studentData.pollRes.textRes) {
        let textResponse = document.createElement('p')
        textResponse.textContent = `Text Response: ${studentData.pollRes.textRes}`
        newStudent.appendChild(textResponse)
    }

    return newStudent
}

// filters and sorts students
function filterSortChange() {
    let userOrder = Object.keys(allRoom.students)
    for (let username of userOrder) {
        document.getElementById(`student-${username}`).style.display = ''
    }

    // filter by help
    for (let username of userOrder.slice()) {
        let studentElement = document.getElementById(`student-${username}`);
        if (
            (filter.help == 1 && !allRoom.students[username].help) ||
            (filter.help == 2 && allRoom.students[username].help)
        ) {
            studentElement.style.display = 'none'
            userOrder.pop(username)
        }
    }

    // filter by break
    for (let username of userOrder.slice()) {
        let studentElement = document.getElementById(`student-${username}`);
        if (
            (filter.break == 1 && !allRoom.students[username].break) ||
            (filter.break == 2 && allRoom.students[username].break)
        ) {
            studentElement.style.display = 'none'
            userOrder.pop(username)
        }
    }
    // filter by poll
    for (let username of userOrder.slice()) {
        let studentElement = document.getElementById(`student-${username}`);
        if (
            (filter.polls == 1 && (
                !allRoom.students[username].pollRes.buttonRes && !allRoom.students[username].pollRes.textRes)
            ) ||
            (filter.polls == 2 &&
                (allRoom.students[username].pollRes.buttonRes || allRoom.students[username].pollRes.textRes)
            )
        ) {
            studentElement.style.display = 'none'
            userOrder.pop(username)
        }
    }
    // sort by name
    if (sort.name == 1) {
        userOrder.students = userOrder.sort()
    } else if (sort.name == 2) {
        userOrder.students = userOrder.sort().reverse()
    }

    // sort by help time
    if (sort.helpTime == 1) {
        userOrder.sort((a, b) => {
            let studentA = allRoom.students[a]
            let studentB = allRoom.students[b]

            if (studentA.help && studentB.help) {
                const dateA = new Date()
                dateA.setHours(studentA.help.time.hours)
                dateA.setMinutes(studentA.help.time.minutes)
                dateA.setSeconds(studentA.help.time.seconds)
                const dateB = new Date()
                dateB.setHours(studentB.help.time.hours)
                dateB.setMinutes(studentB.help.time.minutes)
                dateB.setSeconds(studentB.help.time.seconds)
                if (dateA < dateB) {
                    return -1
                }
            }
            else if (studentA.help) return -1
        })
    }

    // sort by poll
    if (sort.polls == 1) {
        userOrder.sort((a, b) => {
            let studentA = allRoom.students[a]
            let studentB = allRoom.students[b]

            if (studentA.pollRes.textRes && studentB.pollRes.textRes) {
                return studentA.pollRes.textRes.localeCompare(studentB.pollRes.textRes)
            } else if (studentA.pollRes.textRes) return -1
            else if (studentB.pollRes.textRes) return 1
            if (studentA.pollRes.buttonRes && studentB.pollRes.buttonRes) {
                return studentA.pollRes.buttonRes.localeCompare(studentB.pollRes.buttonRes)
            } else if (studentA.pollRes.buttonRes) return -1
            else if (studentB.pollRes.buttonRes) return 1
        })
    } else if (sort.polls == 2) {
        userOrder.sort((a, b) => {
            let studentA = allRoom.students[a]
            let studentB = allRoom.students[b]

            if (studentA.pollRes.textRes && studentB.pollRes.textRes) {
                return studentB.pollRes.textRes.localeCompare(studentA.pollRes.textRes)
            } else if (studentA.pollRes.textRes) return 1
            else if (studentB.pollRes.textRes) return -1
            if (studentA.pollRes.buttonRes && studentB.pollRes.buttonRes) {
                return studentB.pollRes.buttonRes.localeCompare(studentA.pollRes.buttonRes)
            } else if (studentA.pollRes.buttonRes) return 1
            else if (studentB.pollRes.buttonRes) return -1
        })
    }

    // //sort by permissions
    if (sort.permissions == 1) {
        userOrder.sort((a, b) => allRoom.students[b].classPermissions - allRoom.students[a].classPermissions)
    } else if (sort.permissions == 2) {
        userOrder.sort((a, b) => allRoom.students[a].classPermissions - allRoom.students[b].classPermissions)
    }

    for (let i = 0; i < userOrder.length; i++) {
        document.getElementById(`student-${userOrder[i]}`).style.order = i
    }
}

function makeLesson() {
    let learningObj = document.getElementById('learningObj')
    let dueAssigns = document.getElementById('dueAssigns')
    socket.emit('lessonStart', learningObj.value)
    alert('Lesson Created')
}

// sets filters
for (let filterElement of document.getElementsByClassName('filter')) {
    filterElement.onclick = (event) => {
        let filterElement = event.target;
        filter[filterElement.id] += 1
        if (filter[filterElement.id] > 2) {
            filter[filterElement.id] = 0
        }
        if (filter[filterElement.id] == 0) filterElement.classList.remove('pressed')
        else filterElement.classList.add('pressed')
        filterElement.textContent = FilterState[filterElement.id][filter[filterElement.id]]
        filterSortChange()
    }
}

// sets sorts
for (let sortElement of document.getElementsByClassName('sort')) {
    sortElement.onclick = (event) => {
        let sortElement = event.target

        for (let sortType of Object.keys(sort)) {
            if (sortType != sortElement.id) {
                sort[sortType] = 0
                let otherSortElements = document.querySelector('.sort#' + sortType)
                if (otherSortElements) {
                    otherSortElements.classList.remove('pressed')
                    otherSortElements.textContent = SortState[sortType][sort[sortType]]
                }
            }
        }
        sort[sortElement.id] += 1
        if (sortElement.id == 'helpTime' && sort[sortElement.id] > 1) {
            sort[sortElement.id] = 0
        }
        else if (sort[sortElement.id] > 2) {
            sort[sortElement.id] = 0
        }
        if (sort[sortElement.id] == 0) sortElement.classList.remove('pressed')
        else sortElement.classList.add('pressed')
        sortElement.textContent = SortState[sortElement.id][sort[sortElement.id]]
        filterSortChange()
    }
}

function deleteTicket(e) {
    socket.emit('deleteTicket', e.dataset.studentName)
}

function doStep(id) {
    alert('Step ' + id + ' activated')
    socket.emit('doStep', id)
}

function makeLesson() {
    let learningObj = document.getElementById('learningObj')
    let dueAssigns = document.getElementById('dueAssigns')
    socket.emit('lessonStart', learningObj.value)
    alert('Lesson Created')
}

function approveBreak(breakApproval, username) {
    socket.emit('approveBreak', breakApproval, username)
}