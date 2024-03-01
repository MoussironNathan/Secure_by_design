const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sanitizeHtml = require('sanitize-html');
const cors = require('cors');
const rateLimit = require("express-rate-limit");
require('dotenv').config();

const app = express();
const port = 3000;

const rateLimiterUsingThirdParty = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hrs in milliseconds
    max: 3,
    message: 'You have exceeded the 100 requests in 24 hrs limit!',
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(rateLimiterUsingThirdParty);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

function test_intregrity(last_name, first_name, email, phone, cleanedMessage) {
    const isValidLastName = (last_name) => {
        const lastNameRegex = /^[a-zA-Z]+(?:[-\s'][a-zA-Z]+)*$/;
        return lastNameRegex.test(last_name);
    };

    const isValidFirstName = (first_name) => {
        const firstNameRegex = /^[a-zA-Z]+(?:[-\s'][a-zA-Z]+)*$/;
        return firstNameRegex.test(first_name);
    };

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const isValidPhone = (phone) => {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone);
    };
    console.log(last_name, first_name, email, phone, cleanedMessage,
        isValidLastName(last_name), isValidFirstName(first_name), isValidEmail(email), isValidPhone(phone));

    return cleanedMessage || isValidLastName(last_name)
        || isValidFirstName(first_name) || isValidEmail(email)
        || isValidPhone(phone);
}


// Gestion de la soumission du formulaire
app.post('/send', (req, res) => {
    const { last_name, first_name, email, phone, message } = req.body;

    const cleanMessage = (message) => {
        return sanitizeHtml(message, {
            allowedTags: [],
            allowedAttributes: {}
        });
    };
    const cleanedMessage = cleanMessage(message);

    if(!test_intregrity(last_name, first_name, email, phone, cleanedMessage)){
        return res.status(400).send('Veuillez vérifier les champs fournis.');
    }

    // Configurer le service de messagerie
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_PASS
        }
    });

    // Configurer le message
    const mailOptions = {
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: 'Nouveau message depuis le formulaire de contact Secu-By-Design',
        text: `Nom: ${last_name}\nPrénom: ${first_name}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${cleanedMessage}`
    };

    // Envoyer l'email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500).send('Erreur lors de l\'envoi de l\'email.');
        } else {
            res.send({"resp": 'Email envoyé avec succès.'});
            console.log(info.response);
        }
    });
});

// Démarrer le serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});
