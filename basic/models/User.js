module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User', {
    name: DataTypes.STRING,
    email: {type: DataTypes.STRING, unique: true},
    pin: DataTypes.STRING,
    id: {type: DataTypes.INTEGER, autoIncrement: true, primaryKey:true}
  }, {});
}
