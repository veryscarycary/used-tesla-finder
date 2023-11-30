const sequelize = require('../sequelize.js');

const createDailyPriceChangeTrendGraph = () => {
  const createViewQuery = `
CREATE VIEW daily_price_change_trend_graph AS
SELECT car_updates.price - lag(car_updates.price) OVER (PARTITION BY car_updates.car_vin ORDER BY car_updates.updated_at) AS avg_price_update,
  date_trunc('DAY'::text, car_updates.updated_at) AS updated_at
FROM car_updates
GROUP BY car_updates.price, car_updates.updated_at, car_updates.car_vin
ORDER BY (date_trunc('DAY'::text, car_updates.updated_at)) DESC;
`;

  sequelize
    .query(createViewQuery)
    .then(() => {
      console.log('View "daily_price_change_trend_graph" created successfully');
    })
    .catch((error) => {
      console.error('Error creating view:', error);
    });
};

module.exports = createDailyPriceChangeTrendGraph;
