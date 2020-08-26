#!/usr/bin/env node

const readlineSync = require('readline-sync');
const nodeMailer = require('nodemailer');
const md = require('markdown-it')({ html: true });
const argv = require('minimist')(process.argv.slice(2));
const fs = require('fs');

const username = require('os').userInfo().username;

// define the mail and password
if (argv.config === true) {
  const email = readlineSync.question('Your Email: ');
  const password = readlineSync.question('Your Password: ', {
    hideEchoBack: true,
  });

  data = `{
    "email": "${email}",
    "password": "${password}"
}`;

  fs.writeFileSync(`/home/${username}/.postmail.json`, data, 'utf8');
} else {

  // define global configs to send mail
  
  if (argv.emails != undefined && argv.subject != undefined) {
    const settings = JSON.parse(
      fs.readFileSync(`/home/${username}/.postmail.json`),
    );

    var transporter = nodeMailer.createTransport({
      service: 'gmail',
      auth: {
        user: settings.email,
        pass: settings.password,
      },
    });
    
    // use the plain text mail
    if (argv.message != undefined) {
      var mailOptions = {
        from: settings.email,
        to: argv.emails,
        subject: argv.subject,
        text: argv.message,
      };
    }
    
    // use the markdown mail
    else {
      if (argv.file != undefined) {
        const file = fs.readFileSync(argv.file, 'utf8');
        const htmlMessage = md.render(file);
        var mailOptions = {
          from: settings.email,
          to: argv.emails,
          subject: argv.subject,
          html: htmlMessage,
        };
      }
    }

    // send mail
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log('Email sent: ' + info.response);
      }
    });
  }
}
