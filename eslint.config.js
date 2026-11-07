import js from '@eslint/js';
import globals from 'globals';

export default [
  {ignores:['dist/**','node_modules/**','test-results/**','.agents/**']},
  js.configs.recommended,
  {files:['src/**/*.js'],languageOptions:{globals:globals.browser}},
  {files:['scripts/**/*.mjs','tests/**/*.js','*.js'],languageOptions:{globals:{...globals.browser,...globals.node}}},
  {files:['**/*.{js,mjs}'],rules:{
    'no-unused-vars':['error',{argsIgnorePattern:'^_',caughtErrors:'none',ignoreRestSiblings:true}],
  }},
];
