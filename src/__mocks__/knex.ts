const select = jest.fn().mockReturnThis();
const from = jest.fn().mockReturnThis();
const where = jest.fn().mockReturnThis();
const insert = jest.fn();
const returning = jest.fn().mockReturnThis();
const first = jest.fn();
const transaction = jest.fn();

const mockKnex = jest.fn(() => ({
  select,
  from,
  where,
  insert,
  returning,
  first,
  transaction,
}));

export default mockKnex;
