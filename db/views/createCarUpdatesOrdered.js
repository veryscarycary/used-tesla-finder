const sequelize = require('../sequelize.js');

const createCarUpdatesOrderedView = () => {
  const createViewQuery = `
CREATE VIEW car_updates_ordered AS
SELECT car_vin, price, created_at, updated_at, id FROM public.car_updates
ORDER BY car_vin DESC, created_at DESC;
`;

  sequelize
    .query(createViewQuery)
    .then(() => {
      console.log('View "car_updates_ordered" created successfully');
    })
    .catch((error) => {
      console.error('Error creating view:', error);
    });
};

module.exports = createCarUpdatesOrderedView;