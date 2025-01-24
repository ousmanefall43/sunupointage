<?php
namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent;

class Apprenant extends Eloquent
{
    protected $connection = 'mongodb';  // Spécifie que le modèle utilise MongoDB

    // Définir les champs modifiables dans la base de données
    protected $fillable = [
        'nom',
        'prenom',
        'photo',
        'email',
        'adresse',
        'telephone',
        'cohorte_id' , // Assurez-vous que 'cohorte_id' est un ObjectId valide
        'matricule',
        'password',
        'role',
        'card_id',
        'is_active',
    ];

    // Masquer les champs sensibles comme le mot de passe
    protected $hidden = [
        'password',
    ];

    // Spécifier les types de données pour certains champs
    protected $casts = [
        'is_active' => 'boolean',  // Si vous avez un champ `is_active` pour l'état de l'apprenant
    ];

    // Fonction pour générer un matricule unique
    public static function generateMatricule()
    {
        do {
            $year = date('Y');
            $randomNumber = rand(1000, 9999);
            $matricule = 'AP' . $year . $randomNumber;
        } while (self::where('matricule', $matricule)->exists());
    
        return $matricule;
    }
    public function cohorte()
    {
        return $this->belongsTo(Cohorte::class, 'cohorte_id', '_id');
    }
    

}
