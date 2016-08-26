var router = require('express').Router();
var Promise = require('bluebird');
var models = require('../db').models;
var User = models.User;
var Department = models.Department;

module.exports = router;

router.post('/', function(req, res, next){
  User.create({ name: req.body.name })
    .then(function(){
      res.redirect('/customers');
    })
    .catch(next);
});

router.put('/:id', function(req, res, next){
  User.createEmployee(req.params.id)
  .then(function(user){
    res.redirect('/departments/' + user.departmentId);
  })
  .catch(next);
});

router.delete('/:id', function(req, res, next){
  User.destroy({ where: { id: req.params.id }})
    .then(function(){
      res.redirect('/customers');
    })
    .catch(next);
});


router.get('/', function(req, res, next){
  User.getCustomersViewModel()
    .then(function(viewModel){
      res.render('customers', viewModel);
    })
    .catch(next);
});
