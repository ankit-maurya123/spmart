const Contact = require('../Model/contact.jsx');
const Subscriber = require('../Model/subscriber.jsx');

// POST /api/contact — save a contact message
exports.submitContact = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const contact = await Contact.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      message: message.trim(),
    });

    res.status(201).json({ message: 'Message received. We will get back to you soon.', contact });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/contact — admin: list all contact messages (newest first)
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.status(200).json(contacts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/contact/subscribe — newsletter signup
exports.subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({ error: 'Email is required.' });
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      return res.status(400).json({ error: 'Invalid email address.' });
    }

    const normalized = email.toLowerCase().trim();
    const existing = await Subscriber.findOne({ email: normalized });
    if (existing) {
      return res.status(200).json({ message: 'You are already subscribed.', subscriber: existing });
    }

    const subscriber = await Subscriber.create({ email: normalized });
    res.status(201).json({ message: 'Subscribed successfully.', subscriber });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
