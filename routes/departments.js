var router = require('express').Router();
var models = require('../db').models;
var Department = models.Department;
var User = models.User;
var Promise = require('bluebird');

module.exports = router;

router.post('/', function(req, res, next){
  Department.create({ name: req.body.name })
    .then(function(department){
      res.redirect('/departments/' + department.id);
    })
    .catch(next);
});

router.delete('/:id', function(req, res, next){
  Department.remove(req.params.id)
  .then(function(){
    res.redirect('/');
  })
  .catch(next);
});

router.post('/:id/employees', function(req, res, next){
  User.create({
    departmentId: req.params.id,
    name: req.body.name
  })
  .then(function(user){
    res.redirect('/departments/' + req.params.id);
  })
  .catch(next);
});

router.delete('/:departmentId/employees/:id', function(req, res, next){
  User.destroy({
    where: { id: req.params.id }
  })
  .then(function(){
    res.redirect('/departments/' + req.params.departmentId);
  })
  .catch(next);
});

router.put('/:departmentId/employees/:id', function(req, res, next){
  User.createCustomer(req.params.id)
    .then(function(user){
      res.redirect('/customers');
    })
    .catch(next);
});

router.put('/:id', function(req, res, next){
  Department.findById(req.params.id)
    .then(function(department){
      return department.setDefault();
    })
    .then(function(department){
      res.redirect('/departments/' + req.params.id);
    })
    .catch(next);

});

router.get('/:id', function(req, res, next){
  Department.getDepartmentViewModel(req.params.id)
    .then(function(viewModel){
      res.render('departments', viewModel);
    })
    .catch(next);
});
