const sequelize = require('../sequelize.js');

const createLowestPriceView = () => {
  const createViewQuery = `
CREATE VIEW car_historical_lowest_price AS
SELECT
  c.vin,
  c.odometer,
  c.year,
  MIN(cu.price) AS historical_lowest_price,
  COALESCE(EXTRACT(EPOCH FROM c.date_removed - c.date_added) / 86400, NULL) AS days_in_inventory,
  AVG(avg_price_update) AS avg_price_update,
  c.model,
  c.trim,
  c.color,
  c.interior,
  c.wheels,
  c.seat_layout,
  c.has_fsd,
  c.has_acceleration_boost,
  c.was_damaged,
  c.city,
  c.state,
  c.store_name,
  c.transportation_fee,
  c.original_in_customer_garage_date,
  c.date_added,
  c.date_removed
FROM
  cars c
JOIN
  car_updates cu ON c.vin = cu.car_vin
LEFT JOIN (
  SELECT
    cu.car_vin,
    cu.price - LAG(cu.price) OVER (PARTITION BY cu.car_vin ORDER BY cu.created_at) AS avg_price_update
  FROM
    car_updates cu
) AS avg_price_update_subquery ON cu.car_vin = avg_price_update_subquery.car_vin
GROUP BY
  c.vin, c.model, c.trim, c.color, c.year, c.odometer, c.interior,
  c.wheels, c.seat_layout, c.has_fsd, c.has_acceleration_boost, c.was_damaged,
  c.city, c.state, c.store_name, c.transportation_fee, c.original_in_customer_garage_date,
  c.date_added, c.date_removed;
`;

  sequelize
    .query(createViewQuery)
    .then(() => {
      console.log('View "car_historical_lowest_price" created successfully');
    })
    .catch((error) => {
      console.error('Error creating view:', error);
    });
};

module.exports = createLowestPriceView;