

function startSeleniumTest() {
    fetch('/start-selenium-test')
      .then(response => response.text())
      .then(message => {
        console.log(message);
      })
      .catch(error => {
        console.error('Error:', error);
      });
  }
  