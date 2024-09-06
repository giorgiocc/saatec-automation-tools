const { Builder, By, until } = require('selenium-webdriver');
const axios = require('axios');
const { faker } = require('@faker-js/faker');
const sendLog = require('../../../scripts/sendLog');

async function runRegistrationTest() {
  let driver = await new Builder()
    .forBrowser('chrome')
    .build();

  try {
    let randomFirstName = faker.person.firstName();
    let randomLastName = faker.person.lastName();
    let randomPassword = generatePassword();
    let { email, domain } = await getTempEmail();

    await sendLog(`Generated Password: ${randomPassword}`, sessionId);
    await sendLog(`Temporary Email: ${email}@${'rteet.com'}`, sessionId);

    await driver.get('https://cihtwebqa.procloud.org.uk/register/basic');

    await driver.manage().window().maximize();

    await driver.wait(until.elementLocated(By.id('Title')), 15000);

    try {
      let popupCloseButton = await driver.findElement(By.css('.eupopup-closebutton'));
      await popupCloseButton.click();
    } catch (err) {
      await sendLog('Cookies popup not found or already closed.', sessionId);
    }

    let titleDropdown = await driver.findElement(By.id('Title'));
    await titleDropdown.click();

    let options = await titleDropdown.findElements(By.css('option'));
    let randomOption = options[Math.floor(Math.random() * options.length)];
    await randomOption.click();

    await driver.findElement(By.id('Firstname')).sendKeys(randomFirstName);
    await driver.findElement(By.id('Lastname')).sendKeys(randomLastName);
    await driver.findElement(By.id('Email')).sendKeys(`${email}@${'rteet.com'}`);
    await driver.findElement(By.id('ConfirmEmail')).sendKeys(`${email}@${'rteet.com'}`);
    await driver.findElement(By.id('Password')).sendKeys(randomPassword);
    await driver.findElement(By.id('ConfirmPassword')).sendKeys(randomPassword);




    let passwordStrengthLabel = await driver.findElement(By.css('.password-info > label')).getText();
    await sendLog(`${passwordStrengthLabel}`, sessionId);

    if (!passwordStrengthLabel.includes('100%')) {
      await sendLog('Error: Password does not meet all the required conditions.', sessionId);
    }
    await driver.findElement(By.css('.alphOption:nth-child(3)')).click();

    await driver.findElement(By.css('.alphOption:nth-child(6)')).click();

    await driver.findElement(By.css('.row:nth-child(11) .LabelArrow')).click();

    await driver.findElement(By.name('actionButton')).click();

    let messageId = await getMessageId(email, 'rteet.com');
    let confirmationLink = await getEmailContent(email, domain, messageId);

    await driver.get(confirmationLink);

    await sendLog(`Confirmation link opened successfully`, sessionId);

    await driver.findElement(By.id('Username')).sendKeys(`${email}@${'rteet.com'}`);
    await driver.findElement(By.id('Password')).sendKeys(randomPassword);

    let button = await driver.findElement(By.css('.btn'));
    await driver.executeScript("arguments[0].click();", button);

    await sendLog('Logged in successfully.', sessionId);

    await driver.findElement(By.css('.btn-primary:nth-child(3)')).click();

    await waitForPostcodeInput(driver);

    let postcode = await getRandomPostcode();
    await sendLog(`Generated Postcode: ${postcode}`, sessionId);

    await driver.findElement(By.id('Postcode')).sendKeys(postcode);
    await driver.findElement(By.css('.search-postcode')).click();

    await driver.wait(until.elementLocated(By.css('.valid')), 15000);

    let postcodeOptions = await driver.findElements(By.css('.valid > option'));
    let randomOptionIndex = Math.floor(Math.random() * postcodeOptions.length);
    await postcodeOptions[randomOptionIndex].click();

    await driver.findElement(By.css('.btn-primary:nth-child(3)')).click();

  } catch (err) {
    console.error('Error during form submission:', err);
  } finally {
    await sendLog('Test completed', sessionId);
  }
}

const sessionId = process.argv[2]; 

function generatePassword(minLength = 8, maxLength = 100) {
  const lowerCase = 'abcdefghijklmnopqrstuvwxyz';
  const upperCase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const specialChars = '!@#$%^&*_+":?';

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;

  let password = [
    lowerCase.charAt(Math.floor(Math.random() * lowerCase.length)),
    upperCase.charAt(Math.floor(Math.random() * upperCase.length)),
    numbers.charAt(Math.floor(Math.random() * numbers.length)),
    specialChars.charAt(Math.floor(Math.random() * specialChars.length)),
  ];

  const allChars = lowerCase + upperCase + numbers + specialChars;
  for (let i = password.length; i < length; i++) {
    password.push(allChars.charAt(Math.floor(Math.random() * allChars.length)));
  }

  return password.sort(() => Math.random() - 0.5).join('');
}



async function getTempEmail() {
  try {
    const response = await axios.get('https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=1');
    const emailWithDomain = response.data[0];
    const [email, domain] = emailWithDomain.split('@');
    return { email, domain };
  } catch (error) {
    await sendLog(`Error fetching temporary email: ${error}`, sessionId);
    throw error;
  }
}

async function getMessageId(email, domain) {
  try {
    const response = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${email}&domain=${'rteet.com'}`);
    if (response.data.length === 0) {
      throw new Error('No messages found.');
    }
    return response.data[0].id;
  } catch (error) {
    await sendLog(`${error}`, sessionId);
    throw error;
  }
}

async function getEmailContent(email, domain, messageId) {
  try {
    const response = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${email}&domain=${'rteet.com'}&id=${messageId}`);

    if (!response.data || !response.data.htmlBody) {
      throw new Error('No content found.');
    }

    const messageHtml = response.data.htmlBody;

    const linkMatch = messageHtml.match(/href="([^"]+)"/);
    if (linkMatch && linkMatch[1]) {
      return linkMatch[1];
    } else {
      throw new Error('No confirmation link found.');
    }
  } catch (error) {
    await sendLog(`Error fetching email content: ${error}`, sessionId);
    throw error;
  }
}

async function getRandomPostcode() {
  try {
    const response = await axios.get('https://api.postcodes.io/random/postcodes');
    return response.data.result.postcode;
  } catch (error) {
    await sendLog(`Error fetching postcode: ${error}`, sessionId);
    throw error;
  }
}
async function waitForPostcodeInput(driver) {
  try {
    await driver.wait(until.elementLocated(By.id('Postcode')), 15000);
  } catch (error) {
    await sendLog(`Error locating postcode input: ${error}`, sessionId);
    throw error;
  }
}

runRegistrationTest().catch(async (error) => {
  await sendLog(`Test failed: ${error.message}`, sessionId);
});

