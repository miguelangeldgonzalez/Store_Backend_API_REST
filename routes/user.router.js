const express = require('express');
const boom = require('@hapi/boom');
const passport = require('passport');

const UserService = require('./../services/user.service.js');
const { uploadHandler } = require('../middlewares/upload.handler');
const validatorHandler = require('./../middlewares/validator.handler.js');
const { checkSameOrAdminRole, checkAdminRole } = require('../middlewares/auth.handler.js');

const { createUserSchema, 
        getUserSchema, 
        updateUserSchema, 
        getEditUserSchema } = require('../schemas/user.schema.js');

const router = express.Router();
const service = new UserService();

//Delete Profile Photo
router.delete('/delete_profile_image', 
    passport.authenticate('jwt', {session: false}),
    checkSameOrAdminRole(),
    async (req, res, next) => {
        let id = req.user.sub;

        if(req.user.role == 'admin'){
            if(req.body.id) id = req.body.id;
        }

        try{
            const rta = await service.deleteProfilePhoto(id);
            if (rta) res.status(200).json({ message: "Image deleted correctly" });
        } catch (error) {
            next(error);
        }
    }
)

//Load Profile Photo
router.post('/upload_profile_image',
    passport.authenticate('jwt', {session: false}),
    uploadHandler(),
    async (req, res, next) => {
        try{
            if(req.files.length < 0) throw boom.badRequest('No image sent');

            const rta = await service.loadProfileImage(req.files[0], req.user.sub);
            if (rta) res.status(201).json({ 
                message: "Image loaded correctly",
                image: `http://localhost:3000/public/profile_photos/${req.user.sub}.png` 
            });
        } catch (error) {
            next(error)
        }
    }
)

//Create user
router.post('/', 
    validatorHandler(createUserSchema, 'body'),
    async (req, res, next) => {
        try{
            const data = req.body;
            const rta = await service.create(data);
            res.status(201).json(rta);
        } catch (error) {
            next(error);
        }
    }
)

//Get all users
router.get('/',
    passport.authenticate('jwt', {session: false}),
    checkAdminRole(),
    validatorHandler(getUserSchema, 'params'),
    async (req, res, next) => {
        try{
            const rta = await service.findAll(req.query);
            res.status(200).json(rta);
        } catch (error) {
            next(error);
        }
    }
)

//Get user by id
router.get('/:id',
    passport.authenticate('jwt', {session: false}),
    checkAdminRole(),
    validatorHandler(getUserSchema, 'params'),
    async (req, res) => {
        const id = req.params.id;
        const rta = await service.findById(id);
        res.status(200).json(rta);
    }
);

//Edit user
router.patch('/',
    passport.authenticate('jwt', { session: false}),
    validatorHandler(updateUserSchema, 'body'),
    async (req, res, next) => {
        let id = req.user.sub;

        if(req.user.role == 'admin'){
            if(req.body.id) id = req.body.id;
        }

        try{
            const rta = await service.update(id, req.body);
            res.status(200).json(rta);
            return rta;
        }catch(error){
            next(error);
        }
    }
);

//Delete user
router.delete('/',
    passport.authenticate('jwt', {session: false}),
    checkSameOrAdminRole(),
    validatorHandler(getUserSchema, 'query'),
    async (req, res, next) => {
        const id = req.query.id == undefined ? req.user.sub : req.query.id;

        try {
            const rta = await service.delete(id);
            res.status(200).json({
                message: "Deleted"
            })
        } catch(error){
            next(error);
        }
    }
);

module.exports = router;