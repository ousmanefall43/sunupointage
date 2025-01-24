import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-card-management',
  templateUrl: './card-management.component.html',
  styleUrls: ['./card-management.component.css'],
  standalone: true,
  imports: [SidebarComponent,CommonModule],
  providers: [],
})
export class CardManagementComponent implements OnInit {
  employees: any[] = [];
  paginatedEmployees: any[] = [];
  loading = true;
  selectedEmployee: any = null;

  currentPage = 1;
  pageSize = 10;
  totalPages = 0;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.fetchEmployees();
  }

  fetchEmployees(): void {
    this.authService.getUsers().subscribe({
      next: (data: any[]) => {
        this.employees = data;
        this.loading = false;
        this.totalPages = Math.ceil(this.employees.length / this.pageSize);
        this.updatePaginatedEmployees();
      },
      error: (err: any) => {
        console.error('Erreur lors du chargement des utilisateurs', err);
        this.loading = false;
      }
    });
  }

  updatePaginatedEmployees(): void {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.paginatedEmployees = this.employees.slice(startIndex, endIndex);
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePaginatedEmployees();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePaginatedEmployees();
    }
  }

  openAssignCard(utilisateursId: string): void {
    if (!utilisateursId) {
      console.error('Employee ID is undefined or null');
      return;
    }

    this.router.navigate(['/assign-card', utilisateursId]).then(() => {
      console.log('Navigation successful');
    }).catch((err) => {
      console.error('Navigation error:', err);
    });
  }
}
