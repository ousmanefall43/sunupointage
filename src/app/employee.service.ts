import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private apiUrl = 'http://127.0.0.1:8000/api/utilisateurs'; // URL de base de l'API

  constructor(private http: HttpClient) {}

  // Récupérer tous les employés
  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/users`);
  }

  getUserById(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/users/${id}`);
  }

  // Mettre à jour un employé
  updateEmployee(employee: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/users/${employee._id}`, employee);
  }

  // Créer un utilisateur
  createUser(userData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/ajout/users`, userData);
  }
}