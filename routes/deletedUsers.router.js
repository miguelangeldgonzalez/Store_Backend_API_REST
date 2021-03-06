const express = require('express');
const passport = require('passport');

const { getDeletedUsersSchema, deleteDeletedUserSchema } = require('../schemas/deletedUser.schema');
const validatorHandler = require('../middlewares/validator.handler');
const { checkAdminRole } = require('../middlewares/auth.handler');
const DeletedUsers = require('../services/deletedUsers.service');

const service = new DeletedUsers;
const router = express.Router();

router.get('/', 
    passport.authenticate('jwt', {session: false}),
    checkAdminRole(),
    validatorHandler(getDeletedUsersSchema, 'query'),
    async (req, res, next) => {
        const rta = await service.findAll(req.query);
        res.json(rta)
    }
)

router.delete('/',
    passport.authenticate('jwt', {session: false}),
    checkAdminRole(),
    validatorHandler(deleteDeletedUserSchema, 'body'),
    async (req, res, next) => {
        try{
            await service.delete(req.body.id);
            res.json({
                message: "User deleted"
            })
        } catch (error) {
            next(error)
        }
    }
)

module.exports = router;