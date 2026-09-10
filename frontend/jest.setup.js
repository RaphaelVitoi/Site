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
