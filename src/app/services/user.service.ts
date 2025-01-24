import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root', // Fournir le service dans la racine de l'application
})
export class UserService {
  private baseUrl = 'http://localhost:8000/api/utilisateurs'; // Base URL de votre API

  constructor(private http: HttpClient) {}

  // Récupérer les employés
  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/employees`);
  }

  // Récupérer les apprenants
  getLearners(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/learners`);
  }

  // Ajouter un utilisateur
  addUser(user: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/users`, user);
  }

  // Modifier un utilisateur
  updateUser(userId: string, user: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/users/${userId}`, user);
  }

  // Supprimer un utilisateur
  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/users/${userId}`);
  }
}
