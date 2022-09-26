#!/usr/bin/env node

'use strict';

const { writeFile, mkdir } = require('node:fs/promises'),
  { userAgents } = require('./userAgents.json'),
  { isURL, isDirectory } = require('bucky.js'),
  _package = require('./package.json'),
  inquirer = require('inquirer'),
  Puppeteer = require('puppeteer');
  
class Print {
  constructor() {}
  
  async start() {
    const answers = await inquirer.prompt([
      {
        name: 'url',
        type: 'input',
        message: 'Enter the url of the website you want to capture the screen:',
        validate(answer) {
          if (!isURL(answer)) return 'This is not a valid url!';
          return true;
        }
      }, {
        name: 'fullPage',
        type: 'confirm',
        message: 'You want to capture the entire screen:',
        default: false
      }
    ]);
    
    if (!this?.browser) this.browser = await Puppeteer.launch();
    
    const page = !this.browser.pages.length
      ? await this.browser.newPage()
      : this.browser.pages[0];
      
    await page.setUserAgent(this.userAgent);
    await page.goto(answers.url);
    await this.screenshot(page, answers);
    
    inquirer.prompt([{
      name: 'restart',
      type: 'confirm',
      message: 'Do you want to perform one more operation:',
      default: false
    }]).then(({ restart }) => restart ? this.start() : process.exit());
  }
  
  get userAgent() {
    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }
  
  async screenshot(page, answers) {
    try {
      const image = await page.screenshot({ type: 'png', fullPage: !!answers.fullPage });
      if (!isDirectory('~/uploads')) await mkdir('~/uploads', { recursive: true });
      await writeFile(
        `~/uploads/${(new URL(answers.url)).hostname}.png`,
        image, { encoding: null }
      );
    } catch(err) {
      console.log(err);
    }
  }
}

new Print().start();