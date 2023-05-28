import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';


@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() { }
  secretKey = 'clent-info-central-2023-secret-key-siva';

  encrypt(dataStr: string) {
    return CryptoJS.AES.encrypt(dataStr, this.secretKey).toString();

  }

  decrypt(ciphertext: string) {
    return CryptoJS.AES.decrypt(ciphertext, this.secretKey).toString(CryptoJS.enc.Utf8)
  }
}
