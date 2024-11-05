const { Builder, By, until } = require('selenium-webdriver');
const axios = require('axios');
const { faker } = require('@faker-js/faker');
const sendLog = require('../../../scripts/sendLog');

async function runGAFTARegistrationTest() {
  let driver = await new Builder().forBrowser('chrome').build();

  try {
    let randomFirstName = faker.person.firstName();
    let randomLastName = faker.person.lastName();
    let randomPassword = generatePassword();
    let { email, domain } = await getTempEmail();

    await sendLog(`Generated Password: ${randomPassword}`, sessionId);
    await sendLog(`Temporary Email: ${email}@${domain}`, sessionId);

    await driver.get('https://gafta-qa.protechwebdev.co.uk/registration/register');
    await driver.manage().window().maximize();

    await driver.wait(until.elementLocated(By.id('Title')), 15000);

    let titleDropdown = await driver.findElement(By.id('Title'));
    await titleDropdown.click();
    let options = await titleDropdown.findElements(By.css('option'));
    let randomOption = options[Math.floor(Math.random() * options.length)];
    await randomOption.click();

    await driver.findElement(By.id('Firstname')).sendKeys(randomFirstName);
    await driver.findElement(By.id('Lastname')).sendKeys(randomLastName);


    let countryDropdown = await driver.findElement(By.id('Country'));
    await countryDropdown.click();
    let countryOptions = await countryDropdown.findElements(By.css('option'));
    let randomCountry = countryOptions[Math.floor(Math.random() * countryOptions.length)];
    await randomCountry.click();

    await driver.findElement(By.id('Email')).sendKeys(`${email}@${domain}`);

    await driver.findElement(By.id('Password')).sendKeys(randomPassword);
    await driver.findElement(By.id('ConfirmPassword')).sendKeys(randomPassword);


    await driver.executeScript("window.scrollBy(0, 500);");
    await driver.executeScript("window.scrollBy(0, 500);");

    let element = await driver.findElement(By.id('chbox'));
    await driver.executeScript("arguments[0].scrollIntoView(true);", element);
    await driver.executeScript("window.scrollBy(0, 500);");
    

    await driver.sleep(2000);
    let checkbox = await driver.findElement(By.id('chbox'));
    await checkbox.click();

    await driver.sleep(2000);
    let nextButton = await driver.findElement(By.css('.btn'));
    await nextButton.click();
    
    await driver.sleep(5000);
    
    let messageId = await getMessageId(email, domain);
    let confirmationLink = await getEmailContent(email, domain, messageId);

    await driver.get(confirmationLink);

    await sendLog(`Confirmation link opened successfully`, sessionId);

    await driver.findElement(By.id('Username')).sendKeys(`${email}@${domain}`);
    await driver.findElement(By.id('Password')).sendKeys(randomPassword);
    let loginButton = await driver.findElement(By.css('.btn'));
    await driver.executeScript("arguments[0].click();", loginButton);

    await driver.executeScript("window.scrollBy(0, 500);");
    
    let scrolldown = await driver.findElement(By.id('Country'));
    await driver.executeScript("arguments[0].scrollIntoView(true);", scrolldown);
    
    let countrySecondDropdown = await driver.findElement(By.id('Country'));
    await countrySecondDropdown.click(); 

    await driver.wait(until.elementsLocated(By.css('#Country option')), 15000);

    let secondOptions = await driver.findElements(By.css('#Country option'));

    options = options.filter(option => option.getAttribute('value') !== '');
    let SecondRandomOption = options[Math.floor(Math.random() * secondOptions.length)];

    await SecondRandomOption.click();


  } catch (err) {
    console.error('Error during form submission:', err);
  } finally {
    await sendLog('Gafta test finished, check results', sessionId);
  }
}

const sessionId = process.argv[2];

function generatePassword(minLength = 8, maxLength = 30) {
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
    sendLog(response);
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
    const response = await axios.get(`https://www.1secmail.com/api/v1/?action=getMessages&login=${email}&domain=${domain}`);
    sendLog(response);

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
    const response = await axios.get(`https://www.1secmail.com/api/v1/?action=readMessage&login=${email}&domain=${domain}&id=${messageId}`);

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



runGAFTARegistrationTest().catch(async (error) => {
  await sendLog(`Test failed: ${error.message}`, sessionId);
});
