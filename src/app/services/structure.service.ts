import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class StructureService {

  private apiUrlDepartements = 'http://localhost:8000/api/departements';  // URL de l'API Laravel pour les départements
  private apiUrlCohortes = 'http://localhost:8000/api/cohortes';      // URL de l'API Laravel pour les cohortes

  constructor(private http: HttpClient) { }

 // Récupérer tous les départements
getDepartements(): Observable<any> {
    return this.http.get(`${this.apiUrlDepartements}/list`);
  }
  
  // Ajouter un nouveau département
  addDepartement(departement: any): Observable<any> {
    return this.http.post(`${this.apiUrlDepartements}/create`, departement);
  }
  
  // Modifier un département
  updateDepartement(id: number, departement: any): Observable<any> {
    return this.http.put(`${this.apiUrlDepartements}/update/${id}`, departement);
  }
  
  // Supprimer un département
  deleteDepartement(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlDepartements}/delete/${id}`);
  }
  
  // Supprimer plusieurs départements
  bulkDeleteDepartements(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrlDepartements}/bulk-delete`, { ids });
  }
  
  // Récupérer tous les cohortes
  getCohortes(): Observable<any> {
    return this.http.get(`${this.apiUrlCohortes}/list`);
  }
  
  // Ajouter une nouvelle cohorte
  addCohorte(cohorte: any): Observable<any> {
    return this.http.post(`${this.apiUrlCohortes}/create`, cohorte);
  }
  
  // Modifier une cohorte
  updateCohorte(id: number, cohorte: any): Observable<any> {
    return this.http.put(`${this.apiUrlCohortes}/update/${id}`, cohorte);
  }
  
  // Supprimer une cohorte
  deleteCohorte(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrlCohortes}/delete/${id}`);
  }
  
  // Supprimer plusieurs cohortes
  bulkDeleteCohortes(ids: number[]): Observable<any> {
    return this.http.post(`${this.apiUrlCohortes}/bulk-delete`, { ids });
  }


  getEmployesByDepartement(departementId: number) {
    return this.http.get<any>(`${this.apiUrlDepartements}/${departementId}/employes`);

    
  }

   // Récupérer les apprenants par cohorte
   listerApprenantsParCohorte(cohorteId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrlCohortes}/${cohorteId}/apprenants`);
  }


  addApprenant(newItem: any) {
    // L'URL doit commencer par 'http://localhost:8000'
    return this.http.post('http://localhost:8000/api/apprenant/create', newItem);  // Utilisez votre API pour ajouter un apprenant
  }
  
  addEmploye(newItem: any) {
    // L'URL doit commencer par 'http://localhost:8000'
    return this.http.post('http://localhost:8000/api/employe/create', newItem);  // Utilisez votre API pour ajouter un employé
  }
  
    
  
}  