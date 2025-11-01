import { QueryInterface } from "sequelize";

module.exports = {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.sequelize.query(
      'ALTER TABLE `Queues` ADD COLUMN `workDays` JSON NULL DEFAULT NULL'
    );
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.removeColumn("Queues", "workDays");
  }
};