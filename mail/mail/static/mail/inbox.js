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

  // on form submit call
  document.querySelector('#compose-email').onsubmit = () => {
    
    // Saves email content in form into an object to pass into sendEmail function
    const email = {
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    };

    sendEmail(email)

    // Prevents form from submitting automatically 
    return false;
  };
}


function sendEmail(email) {
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
      // If successful, load user's sent inbox
      if (!result.error) {
        load_mailbox('sent')
      } 
      else {
        document.querySelector('#compose-result').innerHTML = result.error;
        document.querySelector('#compose-result').style.display = 'block';
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
  

    // generate div for each email
    emails.forEach(email => {
        
      const emaildiv = document.createElement('div');
      emaildiv.className = email['read'] ? "email-list-item-read" : "email-list-item-unread";
      emaildiv.innerHTML = `
        <span class="sender col-3"> <b>${email['sender']}</b> </span>
        <span class="subject col-6"> ${email['subject']} </span>
        <span class="timestamp col-3"> ${email['timestamp']} </span>
      `;

      if (emails.length === 0) {
        const noResults = document.createElement('div');
        noResults.innerHTML = "You have 0 messages.";
        document.getElementById("emails-view").appendChild(noResults);
      }

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

// function load_mailbox(mailbox) {
  
//   // Show the mailbox and hide other views
//   document.querySelector('#emails-view').style.display = 'block';
//   document.querySelector('#compose-view').style.display = 'none';
//   document.querySelector('#email-view').style.display = 'none';

//   // Show the mailbox name
//   const emailview = document.querySelector('#emails-view');
//   emailview.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

//   // retrieve emails
//   retrieveEmails(mailbox);

// }

// async function retrieveEmails(mailbox) {
  
//   // retrieves email json data
//   const emails = await emailAPICall(mailbox);

//   // update HTML if there are no emails
//   if (emails.length === 0) {
//     const noResults = document.createElement('div');
//     noResults.innerHTML = "You have 0 messages.";
//     document.getElementById("emails-view").appendChild(noResults);
//   }

//   // generate div for each email
//   emails.forEach(email => {
      
//     const emaildiv = document.createElement('div');
//     emaildiv.className = email['read'] ? "email-list-item-read" : "email-list-item-unread";
//     emaildiv.innerHTML = `
//       <span class="sender col-3"> <b>${email['sender']}</b> </span>
//       <span class="subject col-6"> ${email['subject']} </span>
//       <span class="timestamp col-3"> ${email['timestamp']} </span>
//     `;

//     // Make unread emails bold
//     if (mailbox === "inbox" && email.read == false) {
//       emaildiv.classList.add('font-weight-bold');
//     }
//     // Read emails in Inbox turn to grey
//     if (mailbox === "inbox" && email.read == true) {
//       emaildiv.style.backgroundColor = '#f1f2f3';
//     } 

//     // Calls OpenEmail function when email is clicked
//     emaildiv.addEventListener('click', function () {
//       open_email(email, mailbox);
//     },)

//     // Adds email HTML to the mailbox webpage
//     document.getElementById("emails-view").appendChild(emaildiv);

// });

// }

// Fetches email JSON data for given mailbox
// async function emailAPICall(mailbox) {
//   const response = await fetch(`/emails/${mailbox}`);
//   const emailData = await response.json();
//   return emailData;
// }

function open_email(email, mailbox) {
  // Mark as read if unread
  if (!email.read) {
    read_email(email)
  }
  // Gets email HTML
  // id = email['id']
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
      <ul class="list-group">
        <li class="list-group-item"><b>From:</b> <span>${email['sender']}</span></li>
        <li class="list-group-item"><b>To: </b><span>${email['recipients']}</span></li>
        <li class="list-group-item"><b>Subject:</b> <span>${email['subject']}</span</li>
        <li class="list-group-item"><b>Time:</b> <span>${email['timestamp']}</span></li>
      </ul>
      <p class="m-2">${email['body']}</p>
    `;

    // create reply button & append to DOMContentLoaded
    const reply = document.createElement('button');
    reply.className = "btn-primary m-1";
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
    archiveButton.className = "btn-primary m-1";
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
    readButton.className = "btn-secondary m-1";
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


  

