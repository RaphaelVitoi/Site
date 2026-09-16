// ESLint so governa frontend/, que tem config propria (frontend/eslint.config.mjs) e e
// encontrada primeiro pela busca a partir do arquivo. Fora dele nao ha regra declarada;
// sem este arquivo o editor falha com "Could not find config file" em todo JS/TS da raiz.
export default [{ ignores: ['**/*'] }];
