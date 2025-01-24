<?php

namespace App\Http\Controllers;

use App\Models\Utilisateur;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\Pointage;
use MongoDB\BSON\ObjectId; // Importation de la classe ObjectId


class UtilisateurController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);
    
        try {
            // Vérifier si l'utilisateur existe
            $utilisateur = Utilisateur::where('email', $request->email)->first();
    
            if (!$utilisateur || !Hash::check($request->password, $utilisateur->password)) {
                return response()->json(['message' => 'Identifiants incorrects.'], 401);
            }
    
            // Générer un token API
            $token = bin2hex(random_bytes(32));
    
            // Sauvegarder le token dans l'utilisateur
            $utilisateur->api_token = hash('sha256', $token);
            $utilisateur->save();
    
            return response()->json([
                'message' => 'Connexion réussie.',
                'token' => $token,
                'utilisateur' => $utilisateur,
            ]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la connexion.', 'error' => $e->getMessage()], 500);
        }
    }
    
    // Afficher tous les utilisateurs
    public function index()
    {
        $utilisateurs = Utilisateur::all();
        return response()->json($utilisateurs);
    }

    // Créer un nouvel utilisateur
    public function store(Request $request)
    {
        $request->validate([
            'nom' => 'required|string|max:255',
            'prenom' => 'required|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:15',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'email' => 'required|email|unique:utilisateurs,email',
            'password' => 'nullable|string|min:6',
            'role' => 'required|string|in:employe,apprenant', // Limité à ces deux rôles
            'departement' => 'nullable|string|max:255', // Optionnel pour vigiles
            'cohorte' => 'nullable|string|max:255', // Optionnel pour apprenants
        ]);

        try {
            $utilisateur = new Utilisateur();
            $utilisateur->nom = $request->nom;
            $utilisateur->prenom = $request->prenom;
            $utilisateur->adresse = $request->adresse;
            $utilisateur->telephone = $request->telephone;

            // Gestion de l'upload de la photo
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('photos', 'public');
                $utilisateur->photo = $path;
            }

            $utilisateur->email = $request->email;
            $utilisateur->password = Hash::make($request->password);
            $utilisateur->role = $request->role;

            // Affecter les champs spécifiques (par exemple, départements ou cohortes selon le contexte)
            $utilisateur->departement = $request->departement;
            $utilisateur->cohorte = $request->cohorte;

            $utilisateur->save();

            return response()->json(['message' => 'Utilisateur créé avec succès.', 'utilisateur' => $utilisateur], 201);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la création de l\'utilisateur.', 'error' => $e->getMessage()], 500);
        }
    }

    public function uploadCSV(Request $request)
    {
        // Validation du fichier CSV
        $request->validate([
            'file' => 'required|mimes:csv,txt|max:10240', // 10MB maximum
        ]);

        // Récupérer le fichier
        $file = $request->file('file');

        // Si vous souhaitez stocker le fichier temporairement
        $path = $file->storeAs('csv_uploads', $file->getClientOriginalName());

        // Vous pouvez soit lire et traiter le fichier directement, soit utiliser Laravel Excel pour traiter le CSV
        // Exemple avec Laravel Excel (assurez-vous d'avoir installé la dépendance)
        Excel::import(new ApprenantsImport, storage_path('app/' . $path));

        // Après le traitement, vous pouvez supprimer le fichier si nécessaire
        Storage::delete($path);

        return response()->json(['message' => 'Fichier CSV importé avec succès.']);
    }
    // Méthode register mise à jour
    public function register(Request $request)
    {
        return $this->store($request); // Utilise la logique déjà définie dans la méthode store
    }

      // Méthode pour récupérer un utilisateur spécifique par ID
      public function show($id)
      {
          try {
              // Convertir l'ID en ObjectId si nécessaire
              $objectId = new ObjectId($id);
              $utilisateur = Utilisateur::find($objectId);
  
              if (!$utilisateur) {
                  return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
              }
  
              return response()->json($utilisateur);
          } catch (\Exception $e) {
              return response()->json(['message' => 'Erreur lors de la récupération de l\'utilisateur.', 'error' => $e->getMessage()], 500);
          }
      }


    
    public function listerPointages()
    {
        try {
            // Récupérer tous les pointages triés par date décroissante
            $pointages = Pointage::orderBy('date', 'desc')->get();
    
            // Formatage des données et calcul du statut
            $pointagesFormates = $pointages->map(function ($pointage) {
                // Calculer le statut en fonction des horaires de pointage
                $status = 'Absent'; // Valeur par défaut
                $color = 'red'; // Valeur par défaut pour couleur (rouge pour Absent)
    
                // Vérifier si firstTime et secondTime existent
                if ($pointage->firstTime) {
                    $firstTime = strtotime($pointage->firstTime);
                    $startWorkTime = strtotime('08:00:00'); // Heure limite pour être "Présent"
                    
                    if ($firstTime > $startWorkTime) {
                        $status = 'Retard'; // Si pointage avant 08h00, il est en retard
                        $color = 'orange'; // Couleur orange pour Retard
                    } else {
                        $status = 'Présent'; // Si pointage après 08h00, il est présent
                        $color = 'green'; // Couleur verte pour Présent
                    }
                }
    
                return [
                    'nom' => $pointage->nom ?? '', // Vérification pour éviter les valeurs nulles
                    'prenom' => $pointage->prenom ?? '', // Vérification pour éviter les valeurs nulles
                    'date' => $pointage->date,
                    'firstTime' => $pointage->firstTime,
                    'secondTime' => $pointage->secondTime,
                    'status' => $status, // Le statut calculé
                    'color' => $color,   // La couleur en fonction du statut
                ];
            });
    
            return response()->json($pointagesFormates);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Erreur lors de la récupération des pointages.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
    
    
    // Mettre à jour un utilisateur
    public function update(Request $request, $id)
    {
        $request->validate([
            'nom' => 'nullable|string|max:255',
            'prenom' => 'nullable|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:15',
            'photo' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'email' => 'nullable|email|unique:utilisateurs,email,' . $id,
            'password' => 'nullable|string|min:6',
            'role' => 'nullable|string|in:administrateur,vigile',
            'departement' => 'nullable|string|max:255',
            'cohorte' => 'nullable|string|max:255',
        ]);

        try {
            $utilisateur = Utilisateur::find($id);

            if (!$utilisateur) {
                return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
            }

            if ($request->filled('nom')) $utilisateur->nom = $request->nom;
            if ($request->filled('prenom')) $utilisateur->prenom = $request->prenom;
            if ($request->filled('adresse')) $utilisateur->adresse = $request->adresse;
            if ($request->filled('telephone')) $utilisateur->telephone = $request->telephone;

            // Gestion de l'upload de la photo
            if ($request->hasFile('photo')) {
                $path = $request->file('photo')->store('photos', 'public');
                $utilisateur->photo = $path;
            }

            if ($request->filled('email')) $utilisateur->email = $request->email;
            if ($request->filled('password')) $utilisateur->password = Hash::make($request->password);
            if ($request->filled('role')) $utilisateur->role = $request->role;

            $utilisateur->departement = $request->departement;
            $utilisateur->cohorte = $request->cohorte;

            $utilisateur->save();

            return response()->json(['message' => 'Utilisateur mis à jour avec succès.', 'utilisateur' => $utilisateur]);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la mise à jour.', 'error' => $e->getMessage()], 500);
        }
    }
    public function updatePointage(Request $request, $id)
{
    // Validation des données reçues
    $request->validate([
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'date' => 'required|date',
        'firstTime' => 'nullable|string',
        'secondTime' => 'nullable|string',
        'utilisateur_id' => 'required|exists:utilisateurs,_id', // Validation de l'utilisateur_id
    ]);

    // Recherche du pointage par utilisateur_id et date
    $pointage = Pointage::where('utilisateur_id', $request->utilisateur_id)
                        ->where('date', $request->date)
                        ->first();

    if (!$pointage) {
        return response()->json([
            'message' => 'Pointage non trouvé pour cet utilisateur à cette date.',
        ], 404);
    }

    // Mise à jour des champs du pointage
    $pointage->nom = $request->nom;
    $pointage->prenom = $request->prenom;
    $pointage->firstTime = $request->firstTime;
    $pointage->secondTime = $request->secondTime;

    // Sauvegarder les modifications dans la base de données
    $pointage->save();

    return response()->json([
        'message' => 'Pointage mis à jour avec succès.',
        'pointage' => $pointage
    ]);
}


    
    // Supprimer un utilisateur
    public function destroy($id)
    {
        try {
            $utilisateur = Utilisateur::find($id);

            if (!$utilisateur) {
                return response()->json(['message' => 'Utilisateur non trouvé.'], 404);
            }

            $utilisateur->delete();

            return response()->json(['message' => 'Utilisateur supprimé avec succès.']);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Erreur lors de la suppression.', 'error' => $e->getMessage()], 500);
        }
    }
}
