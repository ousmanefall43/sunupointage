<?php

namespace App\Http\Controllers;

use App\Models\Employe; 
use App\Models\Departement; // Assurez-vous que vous importez le bon modèle
use Illuminate\Http\Request;

class DepartementController extends Controller 
{
   // Récupérer la liste de tous les départements
    public function index()
    {
        $departments = Departement::all();  // Utilisez "Departement" ici
        return response()->json($departments);
    }

    // Récupérer la liste de tous les départements avec leurs employés associés
   

    public function employes()
    {
        // Récupérer tous les départements avec les employés associés
        $departments = Departement::with('employes')->get();  // Utilisez "with('employes')" ici
        
        // Retourner la réponse en JSON
        return response()->json($departments);
    }
    
    // Créer un nouveau département
    public function store(Request $request)
    {
        // Validation des données envoyées
        $request->validate([
            'name' => 'required|string|max:255',  // Le nom doit être requis et être une chaîne de caractères
            'responsable_departement' => 'required|string|max:255',
            'nombre_personne' => 'required|integer',
            'description' => 'nullable|string|max:500',
            'annee' => 'required|integer',
            'heure_entree' => 'required|date_format:H:i',
            'heure_sortie' => 'required|date_format:H:i',
        ]);
    
        // Vérification si un département avec le même nom existe déjà
        $existingDepartment = Departement::where('name', $request->name)->first();
    
        if ($existingDepartment) {
            // Si un département avec ce nom existe déjà, renvoyer un message d'erreur
            return response()->json([
                'error' => 'Le nom du département que vous avez saisi existe déjà.',
            ], 400);  // 400 : Bad Request
        }
    
        // Création du département dans la base de données si le nom est unique
        $department = Departement::create([
            'name' => $request->name,
            'responsable_departement' => $request->responsable_departement,
            'nombre_personne' => $request->nombre_personne,
            'description' => $request->description,
            'annee' => $request->annee,
            'heure_entree' => $request->heure_entree,
            'heure_sortie' => $request->heure_sortie,
        ]);
    
        // Retourner une réponse JSON avec le département créé
        return response()->json($department, 201);  // 201 : Created
    }
    

    // Afficher un département spécifique
    public function show($id)
    {
        // Recherche du département par son ID
        $department = Departement::find($id);  // Utilisez "Departement" ici

        // Si le département n'est pas trouvé, retourner un message d'erreur
        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        // Retourner le département trouvé
        return response()->json($department);
    }

    // Mettre à jour un département existant
    public function update(Request $request, $id)
    {
        // Recherche du département à mettre à jour
        $department = Departement::find($id);  // Utilisez "Departement" ici

        // Si le département n'existe pas, retourner un message d'erreur
        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        // Validation des données envoyées pour la mise à jour
        $request->validate([
            'name' => 'required|string|max:255',
            'responsable_departement' => 'required|string|max:255',
            'nombre_personne' => 'required|integer',
            'description' => 'nullable|string|max:500',
            'annee' => 'required|integer',
            'heure_entree' => 'required|date_format:H:i',
            'heure_sortie' => 'required|date_format:H:i',
        ]);

        // Mise à jour des données du département
        $department->update([
            'name' => $request->name,
            'responsable_departement' => $request->responsable_departement,
            'nombre_personne' => $request->nombre_personne,
            'description' => $request->description,
            'annee' => $request->annee,
            'heure_entree' => $request->heure_entree,
            'heure_sortie' => $request->heure_sortie,
        ]);

        // Retourner la réponse avec le département mis à jour
        return response()->json($department);
    }

    // Supprimer un département
    public function destroy($id)
    {
        // Recherche du département à supprimer
        $department = Departement::find($id);  // Utilisez "Departement" ici

        // Si le département n'existe pas, retourner un message d'erreur
        if (!$department) {
            return response()->json(['message' => 'Department not found'], 404);
        }

        // Suppression du département
        $department->delete();

        // Retourner une réponse de succès
        return response()->json(['message' => 'Department deleted successfully']);
    }

    // Supprimer plusieurs départements en une seule requête
    public function bulkDelete(Request $request)
    {
        // Récupérer les IDs des départements à supprimer
        $ids = $request->ids;  // Attendez-vous à ce que les IDs soient passés en tableau

        // Vérifier que des IDs ont été fournis
        if (empty($ids)) {
            return response()->json(['message' => 'No department IDs provided'], 400);
        }

        // Suppression des départements dont les IDs sont dans la liste
        Departement::whereIn('id', $ids)->delete();  // Utilisez "id" et non "_id" pour MongoDB

        // Retourner une réponse de succès
        return response()->json(['message' => 'Departments deleted successfully']);
    }


      // Lister les employés d'un département
      public function listByDepartement($departementId)
      {
          // Récupérer les employés appartenant au département donné
          $employes = Employe::where('departement_id', $departementId)
              ->with('departement')  // Charger les informations du département
              ->get();
  
          // Vérifier si des employés ont été trouvés
          if ($employes->isEmpty()) {
              return response()->json([
                  'message' => 'Aucun employé trouvé pour ce département.'
              ], 404);
          }
  
          // Retourner les employés avec les informations du département
          return response()->json([
              'message' => 'Employés récupérés avec succès',
              'employes' => $employes
          ], 200);
      }
}
