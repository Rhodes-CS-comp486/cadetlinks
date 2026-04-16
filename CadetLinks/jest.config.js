module.exports = {
  preset: 'jest-expo',
  testMatch: ['**/Tests/**/*Testing.ts?(x)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native|@react-navigation|expo(nent)?|@expo(nent)?/.*|expo-modules-core|@expo-google-fonts/.*|react-native-svg|firebase)/)',
  ],
};
