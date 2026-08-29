const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');
const {
    addContact,
    removeContact,
    getContacts,
    toggleFavorite,
    updateContact
} = require('../controllers/contactController');

const router = express.Router();

router.use(protect);

router.post(
    '/',
    [body('contactId').notEmpty().withMessage('contactId is required')],
    validate,
    addContact
);
router.get('/', getContacts);
router.put('/:contactId', updateContact);
router.put('/:contactId/favorite', toggleFavorite);
router.delete('/:contactId', removeContact);

module.exports = router;
