<?php

namespace App\Models;

use MongoDB\Laravel\Eloquent\Model as Eloquent; // Importez le bon modèle MongoDB

class Employe extends Eloquent
{
    protected $connection = 'mongodb';

    protected $fillable = [
        'nom',
        'prenom',
        'email',
        'telephone',
        'adresse',
        'photo',
        'fonction',
        'departement_id',
        'card_id',
        'matricule',
        'role',
        'password',
        'is_active',
    ];

    protected $hidden = [
        'password',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    // Fonction pour générer un matricule unique
    public static function generateMatricule()
    {
        $year = date('Y');  // L'année actuelle
        $randomNumber = rand(1000, 9999);  // Nombre aléatoire à 4 chiffres

        // Créer le matricule avec le format "EM-année-aléatoire"
        return 'EMP' . $year . $randomNumber;
    }

    public function departement()
    {
        return $this->belongsTo(Departement::class, 'departement_id', '_id');
    }
}