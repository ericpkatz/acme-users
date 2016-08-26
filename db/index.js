var Sequelize = require('sequelize');
var Promise = require('bluebird');

var db = new Sequelize(process.env.DATABASE_URL, {
  logging: false
});

var User = db.define('user', {
  name: Sequelize.STRING
}, {
  classMethods: {
    createCustomer: function(id){
      return User.findById(id)
        .then(function(user){
          user.departmentId = null;
          return user.save();
        })
    },
    createEmployee: function(id){
      return Promise.all([
        User.findById(id),
        Department.getDefault()
      ])
      .spread(function(user, defaultDepartment){
        user.departmentId = defaultDepartment.id;
        return user.save();
      })
    },
    getCustomersViewModel: function(){
      return Promise.all([
        Department.getDefault(),
        User.findAll({
          where: { departmentId: null }
        })
      ])
      .spread(function(defaultDepartment, customers){
        return {
          customers: customers,
          defaultDepartment: defaultDepartment,
          mode: 'customers',
          title: 'Customers'
        }
      });
    },
    findEmployees: function(departmentId){
      return User.findAll({
        where: { departmentId: departmentId }
      });
    }
  }
});

var Department = db.define('department', {
  name: Sequelize.STRING,
  isDefault: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  }
}, {
  instanceMethods: {
    setDefault: function(){
      var newDefault = this;
      newDefault.isDefault = true;
      return Department.getDefault()
        .then(function(current){
          current.isDefault = false;
          return current.save();
        })
        .then(function(){
          return newDefault.save();
        });
    }
  },
  classMethods: {
    remove: function(id){
      return User.destroy({ where: { departmentId: id }})
        .then(function(){
          return Department.destroy({ where: { id: id }});
        })
    },
    getDepartmentViewModel: function(id){
      return Promise.all([
        Department.findById(id, { include: [ User] }),
        Department.findAll({ order: [ [ 'isDefault', 'DESC' ]]}),
        Department.getDefault()
      
      ])
      .spread(function(department, departments, defaultDepartment){
        return {
          department: department,
          departments: departments,
          defaultDepartment: defaultDepartment,
          mode: 'departments',
          title: 'Department ' + department.name
        }
      });
    },
    getDefault: function(){
      return this.findOne({
        where: { isDefault: true }
      })
      .then(function(department){
        if(department)
          return department;
        return Department.create({
          name: 'Accounting',
          isDefault: true
        });
      })
    }
  }
});

User.belongsTo(Department);
Department.hasMany(User);

function sync(){
  return db.sync({force: true});
}

function seed(){
  return User.destroy({ where: {} })
    .then(function(){
      return Department.destroy({ where: {} });
    })
    .then(function(){
      return Promise.all([
          User.create({ name: 'Moe' }),
          User.create({ name: 'Larry' }),
          Department.getDefault(),
          Department.create({ name: 'Engineering' })
      ]);
    });

}

module.exports = {
  seed: seed,
  sync: sync,
  models: {
    User: User,
    Department: Department 
  }
}
