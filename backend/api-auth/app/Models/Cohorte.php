<?php

namespace App\Models;



use MongoDB\Laravel\Eloquent\Model as Eloquent; // Importez le bon modÃ¨le MongoDB


class Cohorte extends Eloquent
{
    protected $connection = 'mongodb';

    
    protected $fillable = [
        'nom',
        'description',
        'responsable_cohorte',
        'nombre_personnes',
        'date_debut',
        'date_fin',
        'heure_entree',
        'heure_sortie',
    ];

    public function apprenants()
    {
        return $this->hasMany(Apprenant::class, 'cohorte_id', '_id');
    }
    
    
}