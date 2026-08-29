const Contact = require('../models/Contact');
const User = require('../models/User');

// @desc    Add a user to my contacts
// @route   POST /api/contacts
// @body    { contactId, nickname? }
// @access  Private
const addContact = async (req, res, next) => {
    try {
        const { contactId, nickname } = req.body;

        if (String(contactId) === String(req.user._id)) {
            return res.status(400).json({ error: 'You cannot add yourself as a contact.' });
        }

        const targetUser = await User.findById(contactId);
        if (!targetUser || targetUser.isDeleted) {
            return res.status(404).json({ error: 'User not found.' });
        }

        const existing = await Contact.findOne({ owner: req.user._id, contact: contactId });
        if (existing) {
            return res.status(400).json({ error: 'This user is already in your contacts.' });
        }

        const contact = await Contact.create({ owner: req.user._id, contact: contactId, nickname });
        const populated = await contact.populate('contact', 'name avatar phoneNumber email isOnline lastSeen about');

        res.status(201).json(populated);
    } catch (error) {
        next(error);
    }
};

// @desc    Remove a contact
// @route   DELETE /api/contacts/:contactId
// @access  Private
const removeContact = async (req, res, next) => {
    try {
        const deleted = await Contact.findOneAndDelete({ owner: req.user._id, contact: req.params.contactId });
        if (!deleted) return res.status(404).json({ error: 'Contact not found.' });
        res.status(200).json({ message: 'Contact removed.' });
    } catch (error) {
        next(error);
    }
};

// @desc    Get my contacts, optionally filtered by search text or favorites-only
// @route   GET /api/contacts?search=&favoritesOnly=true
// @access  Private
const getContacts = async (req, res, next) => {
    try {
        const { search, favoritesOnly } = req.query;

        const filter = { owner: req.user._id };
        if (favoritesOnly === 'true') filter.isFavorite = true;

        let contacts = await Contact.find(filter)
            .populate('contact', 'name avatar phoneNumber email isOnline lastSeen about')
            .sort({ isFavorite: -1, createdAt: -1 });

        if (search) {
            const q = search.toLowerCase();
            contacts = contacts.filter(
                (c) =>
                    c.contact?.name?.toLowerCase().includes(q) ||
                    (c.nickname && c.nickname.toLowerCase().includes(q)) ||
                    c.contact?.phoneNumber?.includes(search) ||
                    c.contact?.email?.toLowerCase().includes(q)
            );
        }

        res.status(200).json(contacts);
    } catch (error) {
        next(error);
    }
};

// @desc    Toggle favorite status on a contact
// @route   PUT /api/contacts/:contactId/favorite
// @access  Private
const toggleFavorite = async (req, res, next) => {
    try {
        const contact = await Contact.findOne({ owner: req.user._id, contact: req.params.contactId });
        if (!contact) return res.status(404).json({ error: 'Contact not found.' });

        contact.isFavorite = !contact.isFavorite;
        await contact.save();

        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

// @desc    Update a contact's local nickname
// @route   PUT /api/contacts/:contactId
// @access  Private
const updateContact = async (req, res, next) => {
    try {
        const { nickname } = req.body;
        const contact = await Contact.findOneAndUpdate(
            { owner: req.user._id, contact: req.params.contactId },
            { nickname },
            { new: true }
        ).populate('contact', 'name avatar phoneNumber email isOnline lastSeen about');

        if (!contact) return res.status(404).json({ error: 'Contact not found.' });
        res.status(200).json(contact);
    } catch (error) {
        next(error);
    }
};

module.exports = { addContact, removeContact, getContacts, toggleFavorite, updateContact };
