import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.addColumn("Queues", "startWork", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Queues", "endWork", {
        type: DataTypes.STRING,
        allowNull: true
      }),
      queryInterface.addColumn("Queues", "absenceMessage", {
        type: DataTypes.TEXT,
        allowNull: true
      })
    ]);
  },

  down: (queryInterface: QueryInterface) => {
    return Promise.all([
      queryInterface.removeColumn("Queues", "startWork"),
      queryInterface.removeColumn("Queues", "endWork"),
      queryInterface.removeColumn("Queues", "absenceMessage")
    ]);
  }
};
