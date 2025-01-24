<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use App\Models\Departement;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use League\Csv\Reader; // Importation de la classe Reader


class EmployeController extends Controller
{
   // Créer un employé
public function create(Request $request)
{
    // Vérifier si l'email existe déjà
    $existingEmail = Employe::where('email', $request->email)->first();
    if ($existingEmail) {
        return response()->json(['message' => 'Cet email est déjà utilisé.'], 400);
    }

    // Vérifier si le téléphone existe déjà
    $existingPhone = Employe::where('telephone', $request->telephone)->first();
    if ($existingPhone) {
        return response()->json(['message' => 'Ce numéro de téléphone est déjà attribué.'], 400);
    }

    // Vérifier si le card_id existe déjà
    $existingCardId = Employe::where('card_id', $request->card_id)->first();
    if ($existingCardId) {
        return response()->json(['message' => 'Ce card_id est déjà utilisé.'], 400);
    }

    // Valider les données de l'employé
    $validated = $request->validate([
        'nom' => 'required|string|max:255',
        'prenom' => 'required|string|max:255',
        'email' => 'required|email|unique:employees,email',
        'telephone' => 'required|string|max:9|unique:employees,telephone',
        'adresse' => 'required|string|max:255',
        'matricule' => 'nullable|string', // Généré automatiquement si vide
        'photo' => 'nullable|file|mimes:jpeg,png,jpg,gif|max:2048', // Validation de la photo
        'fonction' => 'required|string|max:255',
        'departement_id' => 'required|exists:departements,_id', // Vérification avec _id du département
        'card_id' => 'nullable|string|unique:employees,card_id',
        'role' => 'required|string|in:admin,utilisateur',
        'password' => 'required|string|min:8',
    ]);

    // Vérifier si le département existe
    $departement = Departement::find($validated['departement_id']);
    if (!$departement) {
        return response()->json(['message' => 'Département non trouvé.'], 404);
    }

    // Générer le matricule si non fourni
    if (empty($validated['matricule'])) {
        $validated['matricule'] = Employe::generateMatricule();
    }

    // Si une photo est envoyée, il est possible de la stocker
    $photoPath = null;
    if ($request->hasFile('photo')) {
        // Vérifier si le fichier est valide
        $photoPath = $request->file('photo')->store('photos', 'public'); // Stocker dans 'public' (storage)
    }

    // Hacher le mot de passe
    $validated['password'] = Hash::make($validated['password']);

    // Créer l'employé
    $employe = Employe::create([
        'nom' => $validated['nom'],
        'prenom' => $validated['prenom'],
        'email' => $validated['email'],
        'telephone' => $validated['telephone'],
        'adresse' => $validated['adresse'],
        'matricule' => $validated['matricule'],
        'fonction' => $validated['fonction'],
        'departement_id' => $validated['departement_id'], // Lien avec le département
        'role' => $validated['role'],
        'photo' => $validated['photo'], // Si la photo n'existe pas, la valeur est nulle
        'password' => $validated['password'],
    ]);

    $employe->load('departement');  // Charge la relation departement

     
    return response()->json(['message' => 'Employé créé avec succès', 'employe' => $employe], 201);
}

    // Mettre à jour un employé
    public function update(Request $request, $id)
    {
        $employe = Employe::findOrFail($id);

        // Vérification si l'email est unique
        $existingEmail = Employe::where('email', $request->email)
                                ->where('id', '!=', $employe->id)
                                ->first();
        if ($existingEmail) {
            return response()->json(['message' => 'Cet email est déjà utilisé.'], 400);
        }

        // Vérification si le téléphone est unique
        $existingPhone = Employe::where('telephone', $request->telephone)
                                ->where('id', '!=', $employe->id)
                                ->first();
        if ($existingPhone) {
            return response()->json(['message' => 'Ce numéro de téléphone est déjà attribué.'], 400);
        }

        // Validation des données
        $validated = $request->only([
            'nom', 'email', 'telephone', 'adresse', 'fonction', 'departement',  'role', 'prenom'
        ]);

     
        // Mise à jour de l'employé
        $employe->update($validated);

        // Rafraîchissement de l'employé pour récupérer les données actuelles
        $employe->refresh();

        return response()->json(['message' => 'Employé mis à jour avec succès', 'employe' => $employe], 200);
    }

    // Lister tous les employés
    public function list(Request $request)
    {
        $employees = Employe::query();

        if ($request->has('is_active')) {
            $employees->where('is_active', $request->is_active);
        }

        return response()->json($employees->get(), 200);
    }

    // Afficher un employé par ID
    public function show($id)
    {
        $employe = Employe::find($id);

        if (!$employe) {
            return response()->json(['message' => 'Employé non trouvé'], 404);
        }

        return response()->json($employe, 200);
    }

    // Bloquer un ou plusieurs employés
    public function block(Request $request)
    {
        // Valider les identifiants (peut être un tableau ou une valeur unique)
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:employes,id',
        ]);

        // Bloquer les employés
        Employe::whereIn('id', $validated['ids'])->update(['is_active' => false]);

        return response()->json(['message' => 'Employé(s) bloqué(s) avec succès'], 200);
    }

    // Bloquer un employé
    public function blockOne($id)
    {
        $employe = Employe::find($id);

        if (!$employe) {
            return response()->json(['message' => 'Employé non trouvé'], 404);
        }

        $employe->update(['is_active' => false]);

        return response()->json(['message' => 'Employé bloqué avec succès', 'employe' => $employe], 200);
    }

    // Supprimer un ou plusieurs employés
    public function delete(Request $request)
    {
        // Valider les identifiants (peut être un tableau ou une valeur unique)
        $validated = $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'required|exists:employes,id',
        ]);

        // Supprimer les employés
        Employe::whereIn('id', $validated['ids'])->delete();

        return response()->json(['message' => 'Employé(s) supprimé(s) avec succès'], 200);
    }

    // Supprimer un employé
    public function deleteOne($id)
    {
        $employe = Employe::find($id);

        if (!$employe) {
            return response()->json(['message' => 'Employé non trouvé'], 404);
        }

        $employe->delete();

        return response()->json(['message' => 'Employé supprimé avec succès'], 200);
    }





    public function importCsv(Request $request)
{
    // Validation pour accepter uniquement un fichier CSV
    $request->validate([
        'file' => 'required|file|mimes:csv,txt|max:2048', // Validation pour CSV
    ]);

    // Récupérer le fichier téléchargé
    $file = $request->file('file');

    // Lire le fichier CSV
    $csv = Reader::createFromPath($file->getRealPath(), 'r');
    $csv->setHeaderOffset(0); // Utiliser la première ligne comme en-tête

    $records = $csv->getRecords(); // Récupérer toutes les lignes

    // Variables pour suivre les employés ajoutés et ignorés
    $addedEmployes = [];
    $ignoredEmployes = [];

    // Parcourir les enregistrements CSV et insérer les employés dans la base de données
    foreach ($records as $record) {
        // Vérification de l'existence du département et de la validité des données
        $departement = Departement::find($record['departement_id']);
        if (!$departement) {
            $ignoredEmployes[] = $record['email']; // Ajouter à la liste des ignorés si le département est invalide
            continue;
        }

        $result = $this->createEmploye($record);

        if ($result === 'duplicate') {
            // Si un doublon est détecté, ajouter à la liste des ignorés
            $ignoredEmployes[] = $record['email']; // Utiliser un identifiant unique comme l'email
        } else {
            // Si l'employé a été ajouté avec succès, l'ajouter à la liste des ajoutés
            $addedEmployes[] = $record['email'];
        }
    }

    // Message à retourner
    $message = 'Importation terminée.';
    if (!empty($ignoredEmployes)) {
        $message .= ' Les employés suivants ont été ignorés en raison de doublons ou d\'erreurs : ' . implode(', ', $ignoredEmployes);
    }

    if (!empty($addedEmployes)) {
        $message .= ' Les employés suivants ont été ajoutés : ' . implode(', ', $addedEmployes);
    }

    return response()->json([
        'message' => $message,
        'added_employes' => $addedEmployes,
        'ignored_employes' => $ignoredEmployes
    ], 201);
}

private function createEmploye($data)
{
    // Vérifier si un employé avec le même email ou téléphone existe déjà
    $existingEmail = Employe::where('email', $data['email'])->first();
    if ($existingEmail) {
        return 'duplicate';
    }

    $existingPhone = Employe::where('telephone', $data['telephone'])->first();
    if ($existingPhone) {
        return 'duplicate';
    }

    // Générer un matricule unique
    $matricule = $this->generateMatricule();

    // Valider les données de l'employé
    $validated = [
        'nom' => $data['nom'],
        'prenom' => $data['prenom'],
        'email' => $data['email'],
        'telephone' => $data['telephone'],
        'adresse' => $data['adresse'],
        'photo' => $data['photo'] ?? null, // Validation de la photo
        'role' => $data['role'] ?? 'employe', // Utiliser 'employe' par défaut si aucun rôle n'est fourni
        'departement_id' => $data['departement_id'],
        'fonction' => $data['fonction'],
        'matricule' => $matricule,
        'is_active' => true, // L'employé sera actif par défaut
    ];

    // Créer l'employé
    Employe::create([
        'nom' => $validated['nom'],
        'prenom' => $validated['prenom'],
        'email' => $validated['email'],
        'telephone' => $validated['telephone'],
        'adresse' => $validated['adresse'],
        'photo' => $validated['photo'],
        'role' => $validated['role'],
        'departement_id' => $validated['departement_id'],
        'fonction' => $validated['fonction'],
        'matricule' => $validated['matricule'],
        'is_active' => $validated['is_active'],
    ]);

    return 'added';
}

private function generateMatricule()
{
    $year = date('Y');  // L'année actuelle
    $randomNumber = rand(1000, 9999);  // Nombre aléatoire à 4 chiffres

    return 'EMP' . $year . $randomNumber; // Format : EMP20231234
}
}