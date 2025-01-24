<?php




namespace App\Http\Controllers;

use App\Models\Cohorte;
use App\Models\Apprenant; // Importez la classe Apprenant

use Illuminate\Http\Request;

class CohorteController extends Controller
{
    // Récupérer la liste de toutes les cohortes
    public function index()
    {
        $cohortes = Cohorte::all();
        return response()->json($cohortes);
    }

    // Créer une nouvelle cohorte
    public function store(Request $request)
    {
        // Validation des données envoyées
        $request->validate([
            'nom' => 'required|string|max:255',  // Le nom doit être requis et être une chaîne de caractères
            'description' => 'nullable|string',
            'responsable_cohorte' => 'required|string|max:255',
            'nombre_personnes' => 'required|integer',
            'date_debut' => 'required|date',
            'date_fin' => 'required|date',
            'heure_entree' => 'required|date_format:H:i',
            'heure_sortie' => 'required|date_format:H:i',
        ]);
    
        // Vérification si une cohorte avec le même nom existe déjà
        $existingCohorte = Cohorte::where('nom', $request->nom)->first();
    
        if ($existingCohorte) {
            // Si une cohorte avec ce nom existe déjà, renvoyer un message d'erreur
            return response()->json([
                'error' => 'Le nom de cohorte que vous avez saisi existe déjà.',
            ], 400);  // 400 : Bad Request
        }
    
        // Création de la cohorte dans la base de données si le nom est unique
        $cohorte = Cohorte::create([
            'nom' => $request->nom,
            'description' => $request->description,
            'responsable_cohorte' => $request->responsable_cohorte,
            'nombre_personnes' => $request->nombre_personnes,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'heure_entree' => $request->heure_entree,
            'heure_sortie' => $request->heure_sortie,
        ]);
    
        // Retourner une réponse JSON avec la cohorte créée
        return response()->json($cohorte, 201);  // 201 : Created
    }
    

    // Afficher une cohorte spécifique
    public function show($id)
    {
        $cohorte = Cohorte::find($id);

        if (!$cohorte) {
            return response()->json(['message' => 'Cohorte not found'], 404);
        }

        return response()->json($cohorte);
    }

  // Mettre à jour une cohorte existante
public function update(Request $request, $id)
{
    // Recherche de la cohorte à mettre à jour
    $cohorte = Cohorte::find($id);  // Utilisez "Cohorte" ici

    // Si la cohorte n'existe pas, retourner un message d'erreur
    if (!$cohorte) {
        return response()->json(['message' => 'Cohorte not found'], 404);
    }

    // Validation des données envoyées pour la mise à jour
    $request->validate([
        'nom' => 'required|string|max:255',
        'responsable_cohorte' => 'required|string|max:255',
        'nombre_personnes' => 'required|integer',
        'description' => 'nullable|string|max:500',
        'date_debut' => 'required|date',
        'date_fin' => 'required|date',
        'heure_entree' => 'required|date_format:H:i',
        'heure_sortie' => 'required|date_format:H:i',
    ]);

    // Mise à jour des données de la cohorte
    $cohorte->update([
        'nom' => $request->nom,
        'responsable_cohorte' => $request->responsable_cohorte,
        'nombre_personnes' => $request->nombre_personnes,
        'description' => $request->description,
        'date_debut' => $request->date_debut,
        'date_fin' => $request->date_fin,
        'heure_entree' => $request->heure_entree,
        'heure_sortie' => $request->heure_sortie,
    ]);

    // Retourner la réponse avec la cohorte mise à jour
    return response()->json($cohorte);
}

    
    // Supprimer une cohorte
    public function destroy($id)
    {
        $cohorte = Cohorte::find($id);

        if (!$cohorte) {
            return response()->json(['message' => 'Cohorte not found'], 404);
        }

        $cohorte->delete();

        return response()->json(['message' => 'Cohorte deleted successfully']);
    }

    // Supprimer plusieurs cohortes en une seule requête
    public function bulkDelete(Request $request)
    {
        $ids = $request->ids;  // Attendez-vous à ce que les IDs soient passés en tableau

        if (empty($ids)) {
            return response()->json(['message' => 'No cohorte IDs provided'], 400);
        }

        Cohorte::whereIn('id', $ids)->delete();

        return response()->json(['message' => 'Cohortes deleted successfully']);
    }



    public function listerApprenantsParCohorte($cohorte_id)
{
    // Récupérer la cohorte en question
    $cohorte = Cohorte::find($cohorte_id);

    // Vérifier si la cohorte existe
    if (!$cohorte) {
        return response()->json(['message' => 'Cohorte introuvable'], 404);
    }

    // Récupérer tous les apprenants associés à cette cohorte
    $apprenants = Apprenant::where('cohorte_id', $cohorte_id)->get();

    // Vérifier s'il y a des apprenants dans cette cohorte
    if ($apprenants->isEmpty()) {
        return response()->json(['message' => 'Aucun apprenant trouvé dans cette cohorte'], 404);
    }

    // Retourner les apprenants
    return response()->json([
        'cohorte' => $cohorte,
        'apprenants' => $apprenants
    ]);
}

}