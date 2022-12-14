document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  console.log("attemping default load of mailbox")
  // By default, load the inbox
  load_mailbox('inbox');
  console.log("passed through default load of mailbox")
  });

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  // Remove any validation messages
  document.querySelector('#compose-error').innerHTML = '';
  document.querySelector('#compose-error').style.display = 'none';

  // on form submit call
  document.querySelector('#compose-email').onsubmit = () => {
    
    // Saves email content in form into an object to pass into send_email function
    const email = {
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    };

    send_email(email)

    // Prevents form from submitting automatically 
    return false;
  };
}


function send_email(email) {
  // Post email to API route
    fetch('/emails' , {
      method: 'POST',
      body: JSON.stringify({
        recipients: email.recipients,
        subject: email.subject,
        body: email.body
      })
    })
    .then(response => response.json())
    .then(result => {
      console.log("result is:")
      console.log(result)
      // If successful, load user's sent inbox
      if (!result.error) {
        load_mailbox('sent')
      } 
      else {
        document.querySelector('#compose-error').innerHTML = result.error;
        document.querySelector('#compose-error').style.display = 'block';
      }
    })
    .catch(error => {
      console.error(error);
    })
}
  
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#email-view').style.display = 'none';

  // Show the mailbox name
  const emailview = document.querySelector('#emails-view');
  emailview.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  fetch('/emails/' + mailbox)
  .then(response => response.json())
  .then(emails => {
  // update HTML if there are no emails
  
    let temp = emails;
    if (temp.length == 0) {
      const noEmails = document.createElement('div');
      noEmails.innerHTML = "You have no messages.";
      document.getElementById("emails-view").appendChild(noEmails);
    }
    // generate div for each email
    emails.forEach(email => {
        
      const emaildiv = document.createElement('div');
      emaildiv.className = 'card';
      emaildiv.innerHTML = `
      <p class="sender col-6 mt-2"> From: ${email['sender']}</p>
      <p class="subject col-6"> Subject: ${email['subject']}</p>
      <p class="timestamp col-3"> ${email['timestamp']}</p>
      `;

      // Make unread emails bold
      if (mailbox === "inbox" && email.read == false) {
        emaildiv.classList.add('font-weight-bold');
      }
      // Read emails in Inbox turn to grey
      if (mailbox === "inbox" && email.read == true) {
        emaildiv.style.backgroundColor = '#f1f2f3';
      } 

      // Calls OpenEmail function when email is clicked
      emaildiv.addEventListener('click', function () {
        open_email(email, mailbox);
      },)

      // Adds email HTML to the mailbox webpage
      document.getElementById("emails-view").appendChild(emaildiv);

  });
})
}

function open_email(email) {
  // Mark as read if unread
  if (!email.read) {
    read_email(email)
  }
  load_email(email)
}

// Marks email as read
function read_email(email) {
  fetch(`/emails/${email.id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  });
}
 


function load_email(email) {
  fetch('/emails/' + email['id'])
  .then(response => response.json())
  .then(email => {

    // show email and hide other views
    document.querySelector('#emails-view').style.display = 'none';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#email-view').style.display = 'block';

    // display email
    const view = document.querySelector('#email-view');

    view.innerHTML = `
    <div class="d-flex justify-content-between flex-wrap">
    <h5 class="text-wrap">${email['subject']}</h5>
    <small class="align-self-center text-muted text-right"><em>${email['timestamp']}</em></small>
    </div>

    <div class="d-flex justify-content-between py-3 pt-md-2 border-bottom flex-wrap">
      <div>
        <p>From: <b> ${email.sender}</b><br>
        <p>To: <b> ${email.recipients}</b><br>
      </div>
    </div>

    <div class="pt-1" style="white-space: pre-line">
      ${email['body']}
    </div>
  `;

    // create reply button & append to DOMContentLoaded
    const reply = document.createElement('button');
    reply.className = "btn btn-primary btn-outline mt-2 mr-2";
    reply.innerHTML = "Reply";
    reply.addEventListener('click', function() {
      compose_email();

      // populate fields with information from email
      document.querySelector('#compose-recipients').value = email['sender'];
      let subject = email['subject'];
      console.log(subject.split(" ", 1)[0]);
      if (subject.split(" ", 1)[0] != "Re:") {
        subject = "Re: " + subject;
      }
      document.querySelector('#compose-subject').value = subject;

      let body = `
        On ${email['timestamp']}, ${email['sender']} wrote: ${email['body']}
      `;
      document.querySelector('#compose-body').value = body;

    });

    view.appendChild(reply);

    // create archive button & append to DOM
    const archiveButton = document.createElement('button');
    archiveButton.className = "btn btn-primary btn-outline mt-2 mr-2";
    archiveButton.innerHTML = !email['archived'] ? 'Archive' : 'Unarchive';
    archiveButton.addEventListener('click', function() {
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ archived : !email['archived'] })
      })
      .then(response => load_mailbox('inbox'))
    });
    view.appendChild(archiveButton);

    // create mark as unread button & append to DOM
    const readButton = document.createElement('button');
    readButton.className = "btn btn-outline-dark mt-2 mr-2";
    readButton.innerHTML = "Mark as Unread"
    readButton.addEventListener('click', function() {
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ read : false })
      })
      .then(response => load_mailbox('inbox'))
    })
    view.appendChild(readButton);

    // mark this email as read
    if (!email['read']) {
      fetch('/emails/' + email['id'], {
        method: 'PUT',
        body: JSON.stringify({ read : true })
      })
    }
  });
}


  

