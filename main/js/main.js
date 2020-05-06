"user strict"

const link = document.getElementById('logout-link');

link.addEventListener('click', function(e) {
  fetch("/logout", {
    method: "POST",
    headers: {"Content-Type": "application/json"}
  }).catch( err => {
      console.log(err);
  });
});

