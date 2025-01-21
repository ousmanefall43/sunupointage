import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Cette ligne permet au service d'être accessible dans toute l'application
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(user: { email: string, password: string }): Observable<any> {
    return this.http.post('http://localhost:8000/api/login', user); // Exemple d'API de login
  }
}
