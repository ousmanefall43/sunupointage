<?php

namespace App\Models;

use Laravel\Sanctum\HasApiTokens;
use MongoDB\Laravel\Eloquent\Model;
use Illuminate\Support\Facades\Hash;

class Utilisateur extends Model
{
    use HasApiTokens; // Ajout du trait pour la gestion des jetons API

    protected $connection = 'mongodb'; // Spécifiez que vous utilisez MongoDB
    protected $collection = 'utilisateurs'; // Nom de la collection MongoDB

    // Attributs qui peuvent être massivement assignés
    protected $fillable = [
        'nom',
        'prenom',
        'adresse',
        'telephone',
        'email',
        'password',
        'role', // Par exemple : 'administrateur' ou 'vigile'
        'departement', // Spécifique aux employeurs
        'cohorte', // Spécifique aux apprenants
        'api_token', // Token pour l'authentification via API
    ];

    // Les champs de type date pour MongoDB
    protected $dates = ['created_at', 'updated_at'];

    /**
     * Boot du modèle : gestion de la création automatique du mot de passe
     */
    protected static function boot()
    {
        parent::boot();

        // Hash du mot de passe lors de la création
        static::creating(function ($user) {
            if (!empty($user->password)) {
                $user->password = Hash::make($user->password);
            }
        });

        // Hash du mot de passe lors de la mise à jour
        static::updating(function ($user) {
            if (!empty($user->password) && $user->isDirty('password')) {
                $user->password = Hash::make($user->password);
            }
        });
    }

    /**
     * Masquer certains champs sensibles lors des réponses JSON
     */
    protected $hidden = [
        'password',
        'api_token', // Masquez le token dans les réponses JSON
    ];
}
