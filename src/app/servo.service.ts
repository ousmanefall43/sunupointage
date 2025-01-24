import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ServoService {
  private apiUrl = 'http://localhost:5000/api/servo'; // URL de votre API

  constructor(private http: HttpClient) {}

  setServoAngle(angle: number): Observable<any> {
    // Envoyer la commande à l'API
    return this.http.post(`${this.apiUrl}/set-angle`, { angle });
  }
}
