module.exports = {
  credential: {
    cert: jest.fn(() => 'mocked_cert_function'),
  },
  initializeApp: jest.fn(),
  auth: jest.fn(() => ({
    getUser: jest.fn(() => Promise.resolve({ uid: 'mockUid' })),
  })),
  firestore: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          exists: true,
          data: jest.fn(() => ({ data: 'mockData' })),
        })),
        update: jest.fn(() => Promise.resolve('mockUpdate')),
        set: jest.fn(() => Promise.resolve('mockSet')),
      })),
      where: jest.fn(() => ({
        get: jest.fn(() => Promise.resolve({
          empty: true,
          docs: [{ id: 'mockDocId' }],
        })),
      })),
      get: jest.fn(() => Promise.resolve({
        docs: [
          {
            id: 'mockDocId',
            data: jest.fn(() => ({ data: 'mockData' })),
          },
        ],
      })),
      add: jest.fn(() => Promise.resolve({
        id: 'mockDocId',
      })),
    })),
  })),
};
