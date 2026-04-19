jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('firebase/storage', () => ({
  deleteObject: jest.fn(() => Promise.resolve()),
  getDownloadURL: jest.fn(() => Promise.resolve('https://example.com/mock-file')),
  ref: jest.fn((_storage, path) => ({ path })),
  uploadBytes: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/database', () => ({
  ref: jest.fn((_db, path) => ({ path })),
  onValue: jest.fn((_refObj, callback) => {
    callback({ val: () => null, exists: () => false });
    return jest.fn();
  }),
  get: jest.fn(() => Promise.resolve({ val: () => null, exists: () => false })),
  set: jest.fn(() => Promise.resolve()),
  remove: jest.fn(() => Promise.resolve()),
  update: jest.fn(() => Promise.resolve()),
}));

jest.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve({ user: { uid: 'mock-uid' } })),
}));

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    Ionicons: ({ name }) => React.createElement(Text, null, `icon-${name}`),
  };
});

jest.mock('expo-checkbox', () => {
  const React = require('react');
  const { View } = require('react-native');
  return ({ value, onValueChange }: any) =>
    React.createElement(View, {
      testID: 'mock-checkbox',
      value,
      onValueChange,
    });
});
