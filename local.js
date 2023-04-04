const form = document.getElementById('login-form');
const message = document.getElementById("message");

form.addEventListener('submit', async (e) => {

    e.preventDefault();
    // get user name and passowrd
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    // attemp the login
    const response = await fetch('/account/login/'+username+'/'+password, );

    if (response.ok) {
        // redirect to homepage
        window.location.href = '/home.html';
    } else {
        message.textContent("Cannot Login with that info")
        }
    });
    const createForm = document.getElementById('create-form');
    const createMessage = document.getElementById('createMessage');

    createForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const username = document.getElementById('createUsername').value;
      const password = document.getElementById('createPassword').value;

      // send a POST request to the server to create the user
      const response = await fetch('/add/user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        document.getElementById("createUsername").value ="";
        document.getElementById("createPassword").value ="";
        alert("User Created");
      } else {
        const error = await response.json();
        alert(error.message);
      }
    });