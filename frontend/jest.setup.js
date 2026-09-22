require('@testing-library/jest-dom');

if (typeof Blob !== 'undefined' && !Blob.prototype.text) {
  Blob.prototype.text = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '');
      reader.onerror = () => reject(reader.error ?? new Error('Erro ao ler arquivo'));
      reader.readAsText(this); // NOSONAR
    });
  };
}

if (typeof File !== 'undefined' && !File.prototype.text) {
  File.prototype.text = Blob.prototype.text;
}

if (typeof Blob !== 'undefined' && !Blob.prototype.arrayBuffer) {
  Blob.prototype.arrayBuffer = function () {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(reader.error ?? new Error('Erro ao ler arquivo'));
      reader.readAsArrayBuffer(this); // NOSONAR
    });
  };
}

if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = Blob.prototype.arrayBuffer;
}

/*
 * SOTA GOLD: Polyfill Response para ambiente jsdom.
 * Node 24 expõe Response/Fetch como globals nativos, mas jest-environment-jsdom
 * v30 não herda estes globals no contexto de teste. O logger.test.ts usa
 * new Response(null, { status: 200 }) nos mocks do fetch; sem polyfill, o
 * logger registra console.error espúrio ao tentar processar a resposta.
 * Segue o mesmo padrão de polyfill já usado para Blob.text / File.arrayBuffer.
 */
if (typeof globalThis.Response === 'undefined') {
  globalThis.Response = /** @class */ (function () {
    function ResponseImpl(body, init) {
      var opts = init || {};
      this._body = body;
      this.status = typeof opts.status === 'number' ? opts.status : 200;
      this.statusText = opts.statusText || '';
      this.ok = this.status >= 200 && this.status < 300;
      this.type = 'default';
      this.headers = opts.headers || {};
    }
    ResponseImpl.prototype.text = function () { return Promise.resolve(''); };
    ResponseImpl.prototype.json = function () { return Promise.resolve(null); };
    ResponseImpl.prototype.arrayBuffer = function () { return Promise.resolve(new ArrayBuffer(0)); };
    ResponseImpl.prototype.clone = function () { return this; };
    return ResponseImpl;
  })();
}

