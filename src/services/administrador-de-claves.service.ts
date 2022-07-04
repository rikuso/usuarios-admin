import {injectable, /* inject, */ BindingScope} from '@loopback/core';
var generatePassword = require('password-generator');
var CryptoJS = require('crypto-js');
@injectable({scope: BindingScope.TRANSIENT})
export class AdministradorDeClavesService {
  constructor(/* Add @inject to inject parameters */) {}

  /*
   * Add service methods here
   */
  GenerarClave() {
    let claveAleatoria = generatePassword(8, false);
    return claveAleatoria;
  }

  Cifrar(text: string) {
    let textoCifrado = CryptoJS.MD5(text).toString();
    return textoCifrado;
  }
}
