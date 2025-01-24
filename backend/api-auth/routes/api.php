<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\UtilisateurController;
use App\Http\Controllers\CohorteController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\ApprenantController;
use App\Http\Controllers\DepartementController;





Route::get('utilisateurs', [UtilisateurController::class, 'index']);
Route::post('utilisateurs', [UtilisateurController::class, 'store']);
Route::get('utilisateurs/{id}', [UtilisateurController::class, 'show']);
Route::put('utilisateurs/{id}', [UtilisateurController::class, 'update']);
Route::delete('utilisateurs/{id}', [UtilisateurController::class, 'destroy']);
Route::get('/pointages', [UtilisateurController::class, 'listerPointages']);
Route::post('/utilisateurs/upload-csv', [UtilisateurController::class, 'uploadCSV']);
Route::put('/pointages/{id}', [UtilisateurController::class, 'updatePointage']);



// Inscription et connexion
Route::post('register', [UtilisateurController::class, 'register']);
Route::post('login', [UtilisateurController::class, 'login']);

// Route pour vérifier l'utilisateur connecté
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
Route::middleware('auth.token')->group(function () {
    Route::get('/protected-route', function () {
        return response()->json(['message' => 'Access granted']);
    });
});




    // Routes des départements
    Route::prefix('departements')->group(function () {
        Route::get('/list', [DepartementController::class, 'index']);  // Liste des départements
        Route::post('/create', [DepartementController::class, 'store']);  // Créer un département
        Route::get('/{department}', [DepartementController::class, 'show']);  // Afficher un département spécifique
        Route::put('/update/{department}', [DepartementController::class, 'update']);  // Mettre à jour un département
        Route::delete('/delete/{department}', [DepartementController::class, 'destroy']);  // Supprimer un département
        Route::post('/bulk-delete', [DepartementController::class, 'bulkDelete']);  // Supprimer plusieurs départements
        Route::get('/employes', [DepartementController::class, 'employes']);  // Liste des départements
        Route::get('/{departementId}/employes', [DepartementController::class, 'listByDepartement']);


    });

    // Routes des cohortes
    Route::prefix('cohortes')->group(function () {
        Route::get('/list', [CohorteController::class, 'index']);  // Liste de toutes les cohortes
        Route::post('/create', [CohorteController::class, 'store']);  // Créer une nouvelle cohorte
        Route::get('/{cohorte}', [CohorteController::class, 'show']);  // Afficher une cohorte spécifique
        Route::put('/update/{cohorte}', [CohorteController::class, 'update']);  // Modifier une cohorte
        Route::delete('/delete/{cohorte}', [CohorteController::class, 'destroy']);  // Supprimer une cohorte
        Route::post('/bulk-delete', [CohorteController::class, 'bulkDelete']);  // Supprimer plusieurs cohortes en une seule requête
        Route::get('/{cohorte_id}/apprenants', [CohorteController::class, 'listerApprenantsParCohorte']);  // Afficher une cohorte spécifique

    });

    // Routes des employés
    Route::prefix('employe')->group(function () {
        Route::post('/create', [EmployeController::class, 'create']);  // Créer un employé
        Route::put('/update/{id}', [EmployeController::class, 'update']);  // Modifier un employé
        Route::get('/show/{id}', [EmployeController::class, 'show']);  // Afficher un employé par ID
        Route::get('/list', [EmployeController::class, 'list']);  // Lister tous les employés
        Route::post('/block', [EmployeController::class, 'block']);  // Bloquer plusieurs employés
        Route::post('/block/{id}', [EmployeController::class, 'blockOne']);  // Bloquer un employé
        Route::delete('/delete', [EmployeController::class, 'delete']);  // Supprimer plusieurs employés
        Route::delete('/delete/{id}', [EmployeController::class, 'deleteOne']);  // Supprimer un employé
        Route::post('/import', [EmployeController::class, 'importCsv']);  // Importer des employés depuis un fichier CSV
    });

    // Routes des apprenants
    Route::prefix('apprenant')->group(function () {
        Route::post('/create', [ApprenantController::class, 'create']);  // Créer un apprenant
        Route::put('/update/{id}', [ApprenantController::class, 'update']);  // Modifier un apprenant
        Route::get('/show/{id}', [ApprenantController::class, 'show']);  // Afficher un apprenant par ID
        Route::get('/list', [ApprenantController::class, 'list']);  // Lister tous les apprenants
        Route::post('/block', [ApprenantController::class, 'block']);  // Bloquer plusieurs apprenants
        Route::post('/block/{id}', [ApprenantController::class, 'blockOne']);  // Bloquer un apprenant
        Route::delete('/delete', [ApprenantController::class, 'delete']);  // Supprimer plusieurs apprenants
        Route::delete('/delete/{id}', [ApprenantController::class, 'deleteOne']);  // Supprimer un apprenant
        Route::post('/import/{cohorteId}', [ApprenantController::class, 'importCsv']);
    });
