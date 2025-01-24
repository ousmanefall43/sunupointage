<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Utilisateur; // Importez correctement le modèle Utilisateur
use Illuminate\Support\Facades\Hash;

class UtilisateurSeeder extends Seeder
{
    /**
     * Seed the application's database with utilisateurs.
     */
    public function run()
    {
        // Employés
        for ($i = 1; $i <= 5; $i++) {
            Utilisateur::create([
                'nom' => "Employe{$i}",
                'prenom' => "Prenom{$i}",
                'adresse' => "Adresse{$i}",
                'telephone' => "77123456{$i}",
                'email' => "employe{$i}@example.com",
                'password' => Hash::make('password123'),
                'role' => 'employe',
                'departement' => "Departement{$i}",
            ]);
        }

        // Apprenants
        for ($i = 1; $i <= 5; $i++) {
            Utilisateur::create([
                'nom' => "Apprenant{$i}",
                'prenom' => "Prenom{$i}",
                'adresse' => "Adresse{$i}",
                'telephone' => "76123456{$i}",
                'email' => "apprenant{$i}@example.com",
                'password' => Hash::make('password123'),
                'role' => 'apprenant',
                'cohorte' => "Cohorte{$i}",
            ]);
        }
    }
}
